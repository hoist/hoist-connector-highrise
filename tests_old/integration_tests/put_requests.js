'use strict';
require('../bootstrap');
var Highrise = require('../../lib/connector');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var config = require('config');

describe('HighriseConnector #put', function () {
  
  this.timeout(500000);
  describe('valid connection to post person with json object', function () {
    var response;
    var connector;
    var data = {person: {"last-name" : "TestName"}};
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.put('people/227913545.xml', data);
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.person['last-name'][0];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become('TestName');
    });
  });
  
  describe('valid connection to post client with xml', function () {
    var response;
    var connector;
    var data = '<person><last-name>TestName2</last-name></person>';
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.put('people/227913545.xml', data);
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.person['last-name'][0];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become('TestName2');
    });
  });
});
