'use strict';
var BBPromise = require('bluebird');
var requestPromise = require('request-promise');
var xml2js = require('xml2js');
var js2xml = require('jsontoxml');
var baseUrl = '.highrisehq.com';
var logger = require('hoist-logger');
var url = require('url');
var _ = require('lodash');
var errors = require('hoist-errors');
var OAuth = require('oauth').OAuth2;

function HighriseConnector(settings) {
  logger.info({
    settings: settings
  }, 'constructed highrise-connector');
  this.settings = settings;
  this.parser = BBPromise.promisifyAll(new xml2js.Parser({
    explicitArray: true,
    ignoreAttrs: false,
    async: true
  }));
  this.auth = new OAuth(
    settings.clientId,
    settings.clientSecret,
    'https://launchpad.37signals.com/', 
    'authorization/new',
    'authorization/token'
  );
  this.auth.getOAuthAccessTokenAsync = BBPromise.promisify(this.auth.getOAuthAccessToken);

}

HighriseConnector.prototype.get = function (url, queryParams) {
  logger.info('inside hoist-connector-highrise.get');
  return this.request('GET', url, queryParams);
};

HighriseConnector.prototype.getAccounts = function() {
  if(this.settings.accounts !== null) {
    return this.settings.accounts;
  } else {
    return [];
  }
};

HighriseConnector.prototype.setAccount = function(accountId) {
  _.each(this.settings.accounts, function(a) {
    if(a.id === accountId) {
      this.settings.account = a;
    }
  });
  return this.settings.account;
};

HighriseConnector.prototype.post = function (url, data) {
  logger.info('inside hoist-connector-highrise.post');
  if(!data){
    throw new errors.connector.request.InvalidError('no data specified in post');
  }
  return this.request('POST', url, null, data);
};

HighriseConnector.prototype.put = function (url, data) {
  logger.info('inside hoist-connector-highrise.put');
  if(!data){
    throw new errors.connector.request.InvalidError('no data specified in put');
  }
  return this.request('PUT', url, null, data);
};

HighriseConnector.prototype.delete = function (url, queryParams, data) {
  logger.info('inside hoist-connector-highrise.delete');
  return this.request('DELETE', url, queryParams, data);
};

HighriseConnector.prototype.request = function request(method, path, queryParams, data) {
  if(!path){
    throw new errors.connector.request.InvalidError('no path specified');
  }
  
  logger.info({
    method: method,
    path: path
  }, 'inside hoist-connector-highrise.request');
  
  path = path[path.length -1] === '/'? path.slice(0, -1) : path;
  var parsedUrl = url.parse(path, true);
  parsedUrl.search = null;
  if(method === "PUT") {
    queryParams = queryParams || {};
    queryParams.reload = true;
  }

  if(queryParams) {
    parsedUrl.query = _.extend(parsedUrl.query, queryParams);
  }

  path = url.format(parsedUrl);
  
  var domain;
  if(this.settings.authType === "Public") {
    //Public, uses the account url
    domain = this.settings.account ? this.settings.account.href : this.settings.accounts[0].href;
  } else {
    //Private, uses an apiTokena nd domain
    domain = "https://" + this.settings.apiToken + ":X@" + this.settings.domain + baseUrl + "/";
  }
  
  var uri = url.resolve(domain, path);
  var options = {
    uri : uri,
    method : method,
    resolveWithFullResponse: true,
    headers: {
      "User-Agent" : "Hoist Integration (support@hoist.io)",
      "Content-Type" : "application/xml"
    }
  };
  if(this.settings.accessToken) {
    options.headers.Authorization = "Bearer " + this.settings.accessToken;
  }
  
  if(method === 'POST' || method === 'PUT') {
    if(typeof data === 'string'){
      try{
        JSON.parse(data);
        data = js2xml(data);
      } catch (e) {} // not json so just pass through
    } else if (typeof data === 'object') {
      data = js2xml(data);
    }
    options.body = data;
    options.contentType = 'application/xml';
  }

  var self = this;
  return this.requestPromiseHelper(options)
    .then(function(request) {
      if(method === "DELETE" && request.statusCode === 200) {
        return {};
      }
      logger.info({
        xml: request.body
      }, 'got response from request');
      return self.parser.parseStringAsync(request.body);
    });
};

HighriseConnector.prototype.requestPromiseHelper = function requestPromiseHelper (options) {
  return requestPromise(options);
};

HighriseConnector.prototype.receiveBounce = function receiveBounce (bounce) {
  logger.info(this.settings);
  if(this.settings.authType === 'Public') {
    if(bounce.get('requestToken')) {
      /* Second hit */
      return this.auth.getOAuthAccessTokenAsync(bounce.query.code, 
        {
          type:'web_server', 
          /*jshint camelcase: false */
          redirect_uri:'https://bouncer.hoist.io/bounce'
        })
        .then(function(accessToken) {
          return bounce.set('accessToken', accessToken[0])
            .then(function() {
              /*jshint camelcase: false */
              return bounce.set('expiresIn', accessToken[2].expires_in);
            })
            .then(function() {
              return requestPromise.get({
                uri: 'https://launchpad.37signals.com/authorization.json',
                headers: {
                  "User-Agent" : "Hoist Integration (support@hoist.io)",
                  "Authorization" : "Bearer " + accessToken[0],
                  "Content-Type" : "application/json"
                }
              }).then(function(res) {
                var saveAccounts = [];
                res = JSON.parse(res);
                _.each(res.accounts, function(a) {
                  if(a.product === 'highrise') {
                    saveAccounts.push(a);
                  }
                });
                if(saveAccounts.length === 0) {
                  throw new errors.connector.request.InvalidError('user has no highrise accounts');
                } else {
                  return bounce.set('accounts', saveAccounts);
                }
              });
            });
        });
    } else {
      /* First hit */
      /*jshint camelcase: false */
      return bounce.set('requestToken', true)
        .bind(this)
        .then(function() {
          bounce.redirect(this.auth.getAuthorizeUrl({scope:'all', type: 'web_server', response_type:'web_server', redirect_uri:'https://bouncer.hoist.io/bounce'}));
        });
    }
  }
  bounce.done();
};

HighriseConnector.prototype.authorize = function (authorization) {
  this.authorization = authorization;
  this.settings.accessToken = authorization.get('accessToken');
  this.settings.accounts = authorization.get('accounts');
};

module.exports = HighriseConnector;
