'use strict';
var qs = require('qs');
var pathtoRegexp = require('path-to-regexp');
var location = window.history.location || window.location;
var cache = {};

if (!location.origin) {
  location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
}

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

  // This logic should probably be better, has to Handle
  // /#/foo, #/foo, /foo, /foo/, /#/foo/, #/foo/
  var path = url.replace(location.origin, '').replace('#', '').replace('#', '').split('');
  if (path.length > 1 && path[path.length - 1] === '/') {
    path.pop();
  }
  if (path[0] === '/' && path[1] === '/') {
    path.shift();
  }
  path = path.join('');

  var params = {};
  var route = {};
  for (route in routes) {
    if (!cache[route]) {
      var keys = [];
      var re = pathtoRegexp(route === '*' ? '(.*)' : route, keys)
      cache[route] = {
        keys: keys,
        re: re
      }
    }
    params = isMatch(cache[route].re, path, cache[route].keys);
    if (params) {
      var queryString = location.search;
      var query = queryString ? qs.parse(queryString.substr(1)) : {};

      routes[route]({
        path: path,
        params: params,
        query: query
      });
      break;
    }
  }

};
