'use strict';
var qs = require('qs');
var pathtoRegexp = require('path-to-regexp');
var cache = {};

function isMatch(re, path, keys) {
  var match = re.exec(decodeURIComponent(path));
  if (!match) { return null; }

  var params = {};

  for (var i = 1; i < match.length; ++i) {
    var key = keys[i - 1];
    var value = decodeURIComponent(match[i].replace(/\+/g, ' '));
    if (value !== undefined || !(hasOwnProperty.call(params, key.name))) {
      params[key.name] = value;
    }
  }

  return params;
}

module.exports = function (url, routes) {

  var path = url;

  var params = {};
  var route = {};
  var hash = null;
  var queryString = null;
  var matchedRoute;

  if (~path.indexOf('#')) {
    hash = path.split(/#(.+)/)[1];
    path = path.split('#')[0];
  }

  if (~path.indexOf('?')) {
    queryString = path.split(/\?(.+)/)[1];
    path = path.split('?')[0];
  }

  for (route in routes) {
    if (!cache[route]) {
      var keys = [];
      var re = pathtoRegexp(route, keys)
      cache[route] = {
        keys: keys,
        re: re
      }
    }
    params = isMatch(cache[route].re, path, cache[route].keys);
    if (params) {
      var query = queryString ? qs.parse(queryString) : {};

      routes[route]({
        url: url,
        path: path,
        hash: hash || '',
        params: params,
        query: query
      });

      matchedRoute = route;
      break;
    }
  }

  return matchedRoute;

};
