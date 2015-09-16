'use strict';
require('../bootstrap');
var Highrise = require('../../lib/connector');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var config = require('config');

describe('HighriseConnector #get', function () {
  this.timeout(500000);
  describe('valid connection to get people with domain in settings', function () {
    var response;
    var connector;
    var expectedResponse = require(path.resolve(__dirname, '../fixtures/responses/get_person.json'));
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.get('people/227913545.xml');
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.person['first-name'][0];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become(expectedResponse.person['first-name']);
    });
  });
  describe('valid connection to get people with query', function () {
    var response;
    var connector;
    var expectedResponse = require(path.resolve(__dirname, '../fixtures/responses/get_cpo.json'));
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.get('people.xml', {title:'CPO'});
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.people.person[0]['first-name'];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become(expectedResponse.people.person[0]['first-name']);
    });
  });
  describe('valid connection to get people with query in path', function () {
    var response;
    var connector;
    var expectedResponse = require(path.resolve(__dirname, '../fixtures/responses/get_cpo.json'));
    before(function () {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      response = connector.get('people.xml?title=CPO');
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json.people.person[0]['first-name'];
      }).catch(function(err) {
        console.log("error", err);
      })).to.become(expectedResponse.people.person[0]['first-name']);
    });
  });
});
