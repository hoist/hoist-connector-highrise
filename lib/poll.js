'use strict';
var _ = require('lodash');
var Connector = require('./connector');
var logger = require('hoist-logger');
var apiLimit = 500;  // actual daily limit is 1000, have it lower to allow for other api calls
var BBPromise = require('bluebird');
var moment = require('moment');
var Authorization = require('./authorization');

var endpointSingulars = {
  "people" : "person",
  "companies" : "company"
};

function HighrisePoller(app, subscription, connector, bouncerToken) {
  logger.info(connector.key, 'inside highrise-poll-constructor');
  this.app = app;
  this.subscription = subscription;
  this.bouncerToken = bouncerToken || null;
  this.connectorKey = connector.key;
  this.connector = new Connector(connector.settings);
}
HighrisePoller.prototype = {
  pollSubscription: function () {
    var frequency = 24 * 60 * this.subscription.endpoints.length / apiLimit;
    if (this.subscription.get('lastPolled') > moment().subtract(frequency, 'minutes').utc().format()) {
      return BBPromise.resolve(this.subscription.eventEmitter.emit('done'));
    } else {
      this.subscription.set('lastPolled', moment.utc().format());
    }
    logger.info(this.connectorKey, 'inside highrise-poll-#pollSubscription before pollEndpoint');
    if (this.connector.settings.authType === 'Public') {
      this.bouncerToken = new Authorization(this.bouncerToken);
      this.connector.authorize(this.bouncerToken);
    }
    return BBPromise.settle(_.map(this.subscription.endpoints, _.bind(this.pollEndpoint, this)))
      .bind(this)
      .then(function (returnedPromises) {
        logger.info(returnedPromises, 'inside highrise-poll #pollSubscription before done');
        //deal with promises with isFulfilled/isRejected depending on result from xero
        return this.subscription.eventEmitter.emit('done', returnedPromises);
      }).catch(function (err) {
        logger.info('polling error', err, err.stack);
      });
  },
  pollEndpoint: function (endpoint) {
    var singularEndpointName = endpointSingulars[endpoint];
    var _lastPoll = this.subscription.get(endpoint) ? this.subscription.get(endpoint).lastPolled : null;

    console.log("Singular Endpoint Name", singularEndpointName);
    console.log("Last Poll", _lastPoll);

    var extraQueryParams = _lastPoll ? {
      since: 'yyyymmddhhmmss'
    } : {};
    var formattedEndpoint = '/' + endpoint + '.xml';
    logger.info(this.connectorKey, 'inside highrise-poll-#pollEndpoint before get');
    var timeNow = moment.utc().format();
    var get = this.connector.get(formattedEndpoint, extraQueryParams);
    return get
      .bind(this)
      .then(function (results) {
        logger.info(results, 'inside highrise-poll-#pollEndpoint after get');
        return this.handleResults(results, endpoint, singularEndpointName, _lastPoll, timeNow);
      }).catch(function (err) {
        logger.info('Error', err, err.stack);
      });
  },
  handleResults: function (results, endpoint, singularEndpointName, _lastPoll, timeNow) {
    var self = this;
    console.log("Results");
    console.log(results);
    console.log("Endpoint: ", endpoint);
    console.log("singularEndpointName: ", singularEndpointName);
    console.log("Last Poll", _lastPoll);
    console.log("Time Now", timeNow);

    if (!results[endpoint][singularEndpointName]) {
      console.log('eee');
      return BBPromise.resolve();
    }
    console.log("pre mapping", results[endpoint][singularEndpointName]);
    var mappedResults = _.map(results[endpoint][singularEndpointName], function (result) {
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
      .then(function (promises) {
        return this.subscription.set(endpoint, {
          lastPolled: timeNow
        }).bind(this).then(function (updatedSubscription) {
          this.subscription = updatedSubscription;
          return promises;
        });
      }).catch(function (err) {
        logger.info('Error ', err, err.stack);    
      });
  },
  raiseEvent: function (result) {
    logger.info(result, 'inside poll-highrise-raiseEvent');
    return this.checkIfNew(result)
      .bind(this)
      .then(function(isNew) {
        var eventName = result.connectorKey + ":" + result.singularEndpointName.toLowerCase() + (isNew ? ':new' : ':modified');
        logger.info(eventName, 'inside poll-highrise-before-emitting');
        return this.subscription.eventEmitter.emit(eventName, result.result);
      });
  },
  checkIfNew: function (result) {
    var isNew = false;
    if (result.result['created-at'][0]._ && moment(result.result['created-at'][0]._).isAfter(result.lastPoll)) {
      isNew = true;
    }
    var meta = this.subscription.get(result.endpoint);
    meta = meta || {};
    meta.ids = meta.ids || [];
    if (result.result.id[0]._ && meta.ids.indexOf(result.result.id[0]._) === -1) {
      meta.ids.push(result.result.id[0]._);
      return this.subscription.set(result.endpoint, {
          ids: meta.ids
        }).bind(this).then(function (updatedSubscription) {
          this.subscription = updatedSubscription;
          return true;
        });
    }
    return BBPromise.resolve(isNew);
  }
};
module.exports = function (app, subscription, connector, bouncerToken) {
  var poller = new HighrisePoller(app, subscription, connector, bouncerToken);
  return poller.pollSubscription();
};