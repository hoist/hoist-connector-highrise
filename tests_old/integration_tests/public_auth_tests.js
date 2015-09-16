'use strict';
var Connector = require('../../lib/connector');
var fs = require('fs');
var path = require('path');
var BBPromise = require('bluebird');
var config = require('config');

describe.skip('Public Auth', function () {
  var connector;
  before(function () {
    connector = new Connector({
      authType: 'Public',
      clientId: config.get('clientId'),
      clientSecret: config.get('clientSecret')
    });
  });
  this.timeout(50000);
  describe('initial bounce', function () {
    before(function () {
      var bounce = {
        get: function () {
          return undefined;
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      return connector.receiveBounce(bounce);
    });
    it('should do some redirect', function () {
      
    });
  });
  describe('second bounce', function () {
    before(function () {
      /*jshint camelcase: false */
      var bounce = {
        query: {
          code: 'ad2a9661'
        },
        get: function (key) {
          if (key === 'requestToken') {
            return true;
          }
          return undefined;
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      return connector.receiveBounce(bounce).catch(function (err) {
        console.log(err);
      });
    });
    it('should do some redirect', function () {

    });
  });
  describe('get people', function () {
    before(function () {
      var auth = {
        accessToken: 'BAhbByIBuXsiYXBpX2RlYWRib2x0IjoiZjc3ZGM0NzVhMDg2YzE5YzkyMDA0OTI5ZDhjYmVjZDkiLCJjbGllbnRfaWQiOiJmMTQ5Njc4ZDdkMGQ2ZGUxZDEyOWVjNzgxMWUzMWQ3ZWViMDE0MzI0IiwiZXhwaXJlc19hdCI6IjIwMTUtMDMtMjVUMDE6NTk6MzNaIiwidXNlcl9pZHMiOlsyNDA5NjQzOSwyNDQ4NDQzOV0sInZlcnNpb24iOjF9dToJVGltZQ0hyxzAlzEb7g==--418dee9996df837fb369b3d6866e9001663cd07f',
        expiresIn: '1209600',
        accounts: [
        {
            "name": "Hoist",
            "id": 2837910,
            "product": "highrise",
            "href": "https://hoist2.highrisehq.com"
        }]
      };
      var bounce = {
        get: function (key) {
          return auth[key];
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function (key, value) {
          console.log('set',arguments);
          auth[key] = value;
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      connector.authorize(bounce);
      return connector.get('people.xml').then(function () {
        console.log(arguments);
      }).catch(function (err) {
        console.log(err, err.stack);
      });
    });
    it('should', function () {

    });
  });
});
