'use strict';
var _ = require('lodash');
var Connector = require('./connector');
var logger = require('hoist-logger');
var apiLimit = 500; // actual daily limit is 1000, have it lower to allow for other api calls
var BBPromise = require('bluebird');
var moment = require('moment');
var errors = require('hoist-errors');
var APILimitReachedError = errors.create({
  name: 'APILimitReachedError'
});
var ConnectorRequiresAuthorizationError = errors.create({
  name: 'ConnectorRequiresAuthorizationError'
});


var endpointSingulars = {
  "people": "person",
  "companies": "company"
};

function HighrisePoller(context) {
  logger.debug(context, 'constructed poller');
  this.context = context;
  this.connector = new Connector(context.settings);
}
HighrisePoller.prototype = {
  assertCanPoll: function () {
    return BBPromise.try(function () {
      var frequency = 24 * 60 * this.context.subscription.endpoints.length / apiLimit;
      if (this.context.subscription.get('lastPolled') > moment().subtract(frequency, 'minutes').utc().format()) {
        throw new APILimitReachedError();
      }
      if (this.context.settings.authType !== 'Private' && !(this.context.authorization)) {
        throw new ConnectorRequiresAuthorizationError();
      }
    }, [], this);
  },
  pollSubscription: function () {
    return BBPromise.try(function () {
        return this.assertCanPoll();
      }, [], this)
      .bind(this)
      .then(function () {
        this.context.subscription.set('lastPolled', moment.utc().format());
      }).then(function () {

        if (this.context.authorization) {
          logger.info('setting auth');
          this.connector.authorize(this.context.authorization);
        } else {
          logger.info('no auth to set');
        }
      })
      .then(function () {
        logger.info('generating pollEndpoing promises');
        return _.map(this.context.subscription.endpoints, _.bind(this.pollEndpoint, this));
      }).then(function (pollPromises) {
        logger.info('settling promises');
        return BBPromise.settle(pollPromises);
      })
      .then(function () {
        logger.info('done with poll');
      }).catch(function (err) {
        logger.error(err, 'polling error');
        logger.alert(err);
      });

  },
  pollEndpoint: function (endpoint) {
    var singularEndpointName = endpointSingulars[endpoint];
    var _lastPoll = this.context.subscription.get(endpoint) ? this.context.subscription.get(endpoint).lastPolled : null;

    logger.info("Singular Endpoint Name", singularEndpointName);
    logger.info("Last Poll", _lastPoll);

    var extraQueryParams = _lastPoll ? {
      since: 'yyyymmddhhmmss'
    } : {};
    var formattedEndpoint = '/' + endpoint + '.xml';
    logger.info({
      formattedEndpoint: formattedEndpoint,
      extraQueryParams: extraQueryParams
    }, 'polling endpoint');
    var timeNow = moment.utc().format();
    var get = this.connector.get(formattedEndpoint, extraQueryParams);
    return get
      .bind(this)
      .then(function (results) {
        logger.debug({
          results: results,
          endpoint: endpoint
        }, 'got results from endpoint');
        return this.handleResults(results, endpoint, singularEndpointName, _lastPoll, timeNow);
      }).catch(function (err) {
        logger.error(err);
      });
  },
  handleResults: function (results, endpoint, singularEndpointName, _lastPoll, timeNow) {
    var self = this;
    logger.debug({
      Results: results,
      Endpoint: endpoint,
      singularEndpointName: singularEndpointName,
      LastPoll: _lastPoll,
      TimeNow: timeNow
    }, "handling results");
    var entities = results[endpoint][singularEndpointName];
    if (!entities) {
      logger.warn('no results');
      return BBPromise.resolve();
    }
    logger.debug({
      entities: entities
    }, "pre mapping");
    var mappedResults = _.map(entities, function (result) {
      return {
        result: result,
        endpoint: endpoint,
        singularEndpointName: singularEndpointName,
        lastPoll: _lastPoll,
        connectorKey: self.connectorKey
      };
    });
    return BBPromise.settle(_.map(mappedResults, _.bind(this.raiseEvent, this)))
      .bind(this)
      .then(function () {
        this.context.subscription.set(endpoint, {
          lastPolled: timeNow
        });
      }).catch(function (err) {
        logger.error(err);
      });
  },
  raiseEvent: function (result) {
    logger.debug({
      result: result
    }, 'raising event');
    return this.checkIfNew(result)
      .bind(this)
      .then(function (isNew) {
        var eventName = result.connectorKey + ":" + result.singularEndpointName.toLowerCase() + (isNew ? ':new' : ':modified');
        logger.info({
          eventName: eventName
        }, 'raising event');
        return this.emit(eventName, result.result);
      });
  },
  checkIfNew: function (result) {
    var isNew = false;
    if (result.result['created-at'][0]._ && moment(result.result['created-at'][0]._).isAfter(result.lastPoll)) {
      isNew = true;
    }
    var meta = this.context.subscription.get(result.endpoint);
    meta = meta || {};
    meta.ids = meta.ids || [];
    if (result.result.id[0]._ && meta.ids.indexOf(result.result.id[0]._) === -1) {
      meta.ids.push(result.result.id[0]._);
      this.context.subscription.set(result.endpoint, {
        ids: meta.ids
      });
    }
    return BBPromise.resolve(isNew);
  }
};
module.exports = function (context, raiseCallback) {
  var poller = new HighrisePoller(context);
  poller.emit = raiseCallback;
  return poller.pollSubscription();
};
