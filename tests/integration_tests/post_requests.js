'use strict';
require('../bootstrap');
var Highrise = require('../../lib/connector');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var config = require('config');

var newCompany_json = {
  company: {
    name: "Let's go sail a boat PTY LTD"
  }
};
var newCompany_xml = '<company><name>Let\'s go sail a boat PTY LTD</name></company>';

describe('HighriseConnector #post', function () {
  this.timeout(500000);
  describe('valid connection to post company with json object', function () {
    var response;
    var connector;
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.post('companies.xml', newCompany_json);
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.company.name[0];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become(newCompany_json.company.name);
    });
  });
  
  describe('valid connection to post company with xml', function () {
    var response;
    var connector;
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.post('companies.xml', newCompany_xml);
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.company.name[0];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become(newCompany_json.company.name);
    });
  });
});
