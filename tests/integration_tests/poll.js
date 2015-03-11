'use strict';
var config = require('config');
var Poll = require('../../lib/poll');
require('../bootstrap');
var BBPromise = require('bluebird');
var expect = require('chai').expect;
var Model = require('hoist-model');
var mongoose = BBPromise.promisifyAll(Model._mongoose);
var SubscriptionController = require('../fixtures/subscription_controller');

describe.skip('Poll Integration', function () {
  before(function () {
    return mongoose.connectAsync(config.get('Hoist.mongo.db'))
      .then(function() {
        BBPromise.all([
          Model.ConnectorSetting.removeAsync({}),
          Model.Application.removeAsync({}),
          Model.Organisation.removeAsync({}),
          Model.Bucket.removeAsync({}),
          Model.Subscription.removeAsync({})
        ]);
      });
  });
  after(function () {
    return mongoose.disconnectAsync();
  });
  describe('with a Private connector', function () {
    describe('with no lastPolled for each endpoint', function () {
      var _app, _bucket, _subscription, _conn, _person;
      describe('with results from Highrise', function () {
        var _response;
        this.timeout(600000);
        before(function (done) {
          BBPromise.all([
            new Model.Organisation({
              _id: 'orgId',
              name: 'test org',
              slug: 'org'
            }).saveAsync(),
            new Model.Application({
              _id: 'appId',
              organisation: 'orgId',
              name: 'test app',
              apiKey: 'apiKey',
              slug: 'app',
              maxExecutors: 1,
              currentExecutors: 0
            }).saveAsync()
            .then(function (app) {
              _app = app[0];
            }),
            new Model.ConnectorSetting({
              _id: 'ConnectorSettingIdPrivate',
              settings: {
                apiToken: config.apiToken, 
                domain: config.domain
              },
              environment: 'test',
              key: 'connectorKey',
              application: 'appId',
              name: 'connectorName'
            }).saveAsync()
            .then(function (conn) {
              _conn = conn[0];
            }),
            new Model.Subscription({
              _id: 'subscriptionId',
              connector: 'connectorKey',
              application: 'appId',
              environment: 'test',
              endpoints: ['people']
            }).saveAsync()
            .then(function (subscription) {
              _subscription = new SubscriptionController(subscription[0]);
            }),
            new Model.Bucket({
              _id: 'bucketId',
              application: 'appId',
              environment: 'test'
            }).saveAsync()
            .then(function (bucket) {
              _bucket = bucket[0];
            })
          ]).then(function () {
            _subscription.eventEmitter.on('done', function () {
              _response = 'done';
              done();
            });
            _subscription.eventEmitter.on('connectorKey:person:new', function (person) {
              _person = person;
            });
            return new Poll(_app.toObject(), _subscription, _conn);
          }).catch(function (err) {
            console.log('error', err, err.stack);
          });
        });
        after(function () {
          return BBPromise.all([
            Model.ConnectorSetting.removeAsync({}),
            Model.Application.removeAsync({}),
            Model.Organisation.removeAsync({}),
            Model.Bucket.removeAsync({}),
            Model.Subscription.removeAsync({})
          ]);
        });
        it('emits done event', function () {
          expect(_response)
            .to.eql('done');
        });
        it('emits a connectorKey:person:new event', function () {
           /* jshint -W030 */
          expect(_person).to.exist;
          /* jshint +W030 */
        });
      });
    });
  });
  describe('with a Public connector', function () {
    describe('with no lastPolled for each endpoint', function () {
      var _app, _bucket, _subscription, _bouncerToken, _conn;
      describe('with results from Highrise', function () {
        var _response;
        this.timeout(600000);
        before(function (done) {
          BBPromise.all([
            new Model.Organisation({
              _id: 'orgId',
              name: 'test org',
              slug: 'org'
            }).saveAsync(),
            new Model.Application({
              _id: 'appId',
              organisation: 'orgId',
              name: 'test app',
              apiKey: 'apiKey',
              slug: 'app',
              maxExecutors: 1,
              currentExecutors: 0
            }).saveAsync()
            .then(function (app) {
              _app = app[0];
            }),
            new Model.ConnectorSetting({
              _id: 'ConnectorSettingId',
              settings: {
                authType: 'Public',
                clientId: config.clientId,
                clientSecret: config.clientSecret
              },
              environment: 'test',
              key: 'connectorKey',
              application: 'appId',
              name: 'connectorName'
            }).saveAsync()
            .then(function (conn) {
              _conn = conn[0];
            }),
            new Model.Subscription({
              _id: 'subscriptionId',
              connector: 'connectorKey',
              application: 'appId',
              environment: 'test',
              endpoints: ['people']
            }).saveAsync()
            .then(function (subscription) {
              _subscription = new SubscriptionController(subscription[0]);
            }),
            new Model.BouncerToken({
              _id: 'bouncerTokenId',
              eventId: 'eventId4',
              application: 'appId',
              environment: 'test',
              bucketId: 'bucketId',
              connectorKey: 'connectorName',
              connectorType: 'hoist-connector-highrise',
              key: 'PRkBiadcRCTyldLnoMIZQEALBzx6ja2Q',
              state: {
                AccessTokenSecret: 'OUORKUDBOZ1KRD1DEL5OQHY8ZEWRZX',
                AccessToken: 'NQDQSMA3YSYA1F1DKYRBAM9FQEJ8MY'
              }
            }).saveAsync()
            .then(function (bouncerToken) {
              _bouncerToken = bouncerToken[0];
            }),
            new Model.Bucket({
              _id: 'bucketId',
              application: 'appId',
              environment: 'test'
            }).saveAsync()
            .then(function (bucket) {
              _bucket = bucket[0];
            })
          ]).then(function () {
            _subscription.eventEmitter.on('done', function () {
              _response = 'done';
              done();
            });
            return new Poll(_app.toObject(), _subscription, _conn, _bouncerToken.toObject());
          }).catch(function (err) {
            console.log('error', err);
          });
        });
        after(function () {
          return BBPromise.all([
            Model.ConnectorSetting.removeAsync({}),
            Model.Application.removeAsync({}),
            Model.BouncerToken.removeAsync({}),
            Model.Organisation.removeAsync({}),
            Model.Bucket.removeAsync({}),
            Model.Subscription.removeAsync({})
          ]);
        });
        it('emits done event', function () {
          expect(_response).to.eql('done');
        });
      });
    });
  });
});