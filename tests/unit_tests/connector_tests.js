'use strict';
require('../bootstrap');
var Highrise = require('../../lib/connector');
var sinon = require('sinon');
var BBPromise = require('bluebird');
var expect = require('chai').expect;
var requestPromise = require('request-promise');
var config = require('config');
var errors = require('hoist-errors');

describe('HighriseConnector', function () {
  var connector;
  before(function () {
    connector = new Highrise({
      apiToken: config.apiToken, 
      domain: config.domain
    });
  });
  describe('#get', function () {
    describe('with no queryParams', function () {
      var response = {};
      var result;
      before(function () {
        sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
        result = connector.get('people.xml');
      });
      after(function () {
        connector.request.restore();
      });
      it('calls #request', function () {
        expect(connector.request)
          .to.have.been.calledWith('GET', 'people.xml', undefined);
      });
    });
    describe('with queryParams', function () {
      var response = {};
      var result;
      var queryParams = {
        query: 'query'
      };
      before(function () {
        sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
        result = connector.get('people.xml', queryParams);
      });
      after(function () {
        connector.request.restore();
      });
      it('calls #request', function () {
        expect(connector.request)
          .to.have.been.calledWith('GET', 'people.xml', queryParams);
      });
    });
  });
  describe('#post', function() {
    describe('with no data', function () {
      it('rejects', function () {
        expect(function () {
          connector.post('/path');
        }).to.throw(errors.connector.request.InvalidError);
      });
    });
    describe('with data', function () {
      var response = {};
      var result;
      var data = {
        query: 'query'
      };
      before(function () {
        sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
        result = connector.post('people.xml', data);
      });
      after(function () {
        connector.request.restore();
      });
      it('calls #request', function () {
        expect(connector.request)
          .to.have.been.calledWith('POST', 'people.xml', null, data);
      });
    });
  });
  describe('#put', function() {
    describe('with no data', function () {
      it('rejects', function () {
        expect(function () {
          connector.put('/path');
        }).to.throw(errors.connector.request.InvalidError);
      });
    });
    describe('with data', function () {
      var response = {};
      var result;
      var data = {
        query: 'query'
      };
      before(function () {
        sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
        result = connector.put('people.xml', data);
      });
      after(function () {
        connector.request.restore();
      });
      it('calls #request', function () {
        expect(connector.request)
          .to.have.been.calledWith('PUT', 'people.xml', null, data);
      });
    });
  });
  describe('#delete', function () {
    var response = {};
    var result;
    before(function () {
      sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
      result = connector.delete('people/id.xml');
    });
    after(function () {
      connector.request.restore();
    });
    it('calls #request', function () {
      expect(connector.request)
        .to.have.been.calledWith('DELETE', 'people/id.xml', undefined, undefined);
    });
  });
  describe('#request', function () {
    describe('GET', function () {
      describe('with no queryParams', function () {
        var response = {
          body: 'body'
        };
        var options = {
          method: 'GET',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('GET', '/people.xml');
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });

      describe('with queryParams object', function () {
        var response = {
          body: 'body'
        };
        var queryParams = {
          query: 'query'
        };
        var options = {
          method: 'GET',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?query=' + queryParams.query,
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        }
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('GET', 'people.xml', queryParams);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });

      describe('with queryParams in path', function () {
        var response = {
          body: 'body'
        };
        var options = {
          method: 'GET',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?query=query',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('GET', 'people.xml?query=query');
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });

      describe('with queryParams in path and object', function () {
        var response = {
          body: 'body'
        };
        var queryParams = {
          query: 'query'
        };
        var options = {
          method: 'GET',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?querypath=querypath&query=' + queryParams.query + '',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('GET', 'people.xml?querypath=querypath', queryParams);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
      describe('with duplicate queryParams in path and object', function () {
        var response = {
          body: 'body'
        };
        var queryParams = {
          query: 'query'
        };
        var options = {
          method: 'GET',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?query=' + queryParams.query + '',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('GET', 'people.xml?query=queryfalse', queryParams);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper correctly', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
    });
    describe('POST', function () {
      describe('with xml string', function () {
        var response = {
          body: 'body'
        };
        var data = '<person><first-name>Sam</first-name></person>';
        var options = {
          method: 'POST',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml',
          body: data,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('POST', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
      describe('with json string', function () {
        var response = {
          body: 'body'
        };
        var data = '{"person":{"first-name":"John"}}';
        var xml = '<person><first-name>John</first-name></person>';
        var options = {
          method: 'POST',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml',
          body: xml,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('POST', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
      describe('with object', function () {
        var response = {
          body: 'body'
        };
        var data = {person:{'first-name':"John"}};
        var xml = '<person><first-name>John</first-name></person>';
        var options = {
          method: 'POST',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml',
          body: xml,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('POST', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
    });
    describe('PUT', function () {
      describe('with xml string', function () {
        var response = {
          body: 'body'
        };
        var data = '<person><first-name>John</first-name></person>';
        var options = {
          method: 'PUT',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?reload=true',
          body: data,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('PUT', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
      describe('with json string', function () {
        var response = {
          body: 'body'
        };
        var data = '{"person":{"first-name":"John"}}';
        var xml = '<person><first-name>John</first-name></person>';
        var options = {
          method: 'PUT',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?reload=true',
          body: xml,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('PUT', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
      describe('with object', function () {
        var response = {
          body: 'body'
        };
        var data = {person:{'first-name':"John"}};
        var xml = '<person><first-name>John</first-name></person>';
        var options = {
          method: 'PUT',
          resolveWithFullResponse: true,
          uri: 'https://' + config.apiToken + ':X@' + config.domain + '.highrisehq.com/people.xml?reload=true',
          body: xml,
          contentType: 'application/xml',
          headers: {
            'Content-Type': "application/xml",
            'User-Agent': "Hoist Integration (support@hoist.io)"
          }
        };
        var result;
        before(function () {
          sinon.stub(connector, 'requestPromiseHelper').returns(BBPromise.resolve(response));
          sinon.stub(connector.parser, 'parseStringAsync').returns(BBPromise.resolve());
          result = connector.request('PUT', 'people.xml', null, data);
        });
        after(function () {
          connector.requestPromiseHelper.restore();
          connector.parser.parseStringAsync.restore();
        });
        it('calls requestPromiseHelper', function () {
          expect(connector.requestPromiseHelper)
            .to.have.been.calledWith(options);
        });
        it('calls parser.parseStringAsync', function () {
          expect(connector.parser.parseStringAsync)
            .to.have.been.calledWith(response.body);
        });
      });
    });
    describe('with no path', function () {
      it('rejects', function () {
        expect(function () {
          connector.request();
        }).to.throw(errors.connector.request.InvalidError);
      });
    });
  });
  
});
