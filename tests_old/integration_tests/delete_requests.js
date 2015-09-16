'use strict';
require('../bootstrap');
var Highrise = require('../../lib/connector');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var config = require('config');

describe('HighriseConnector #delete', function () {
  this.timeout(500000);
  describe('valid connection to delete company', function () {
    var response;
    var connector;
    before(function (done) {
      connector = new Highrise({
        apiToken: config.apiToken, 
        domain: config.domain
      });
      connector.post('companies.xml', {company: {name: "My Test Company"}})
        .then(function(res) {
          response = connector.delete('companies/' + res.company.id[0]._ + '.xml');
          done();
          return;
        });
    });
    it('returns expected json', function () {
      return expect(response.then(function (json) {
        return json;
      }).catch(function(err) {
        console.log("error", err);
      })).to.become({});
    });
  });
});
