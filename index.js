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

  // TODO: Normalize URL without using location.origin
  if (~url.indexOf('//')) {
    url = url.replace('//', '~'); // To split correctly on next line we replace protocol
    var splitUrl = url.split('/');
    splitUrl.shift(); // Remove http://www.example.com
    url = '/' + splitUrl.join('/'); // Bring it back together
  }

  // This logic should probably be better, has to Handle
  // /#/foo, #/foo, /foo, /foo/, /#/foo/, #/foo/
  var path = url.replace('#', '').replace('#', '').split('');
  if (path.length > 1 && path[path.length - 1] === '/') {
    path.pop();
  }
  if (path[0] === '/' && path[1] === '/') {
    path.shift();
  }
  path = path.join('');

  var params = {};
  var route = {};
  var queryString = null;

  if (~path.indexOf('?')) {
    queryString = path.split('?')[1];
    path = path.split('?')[0];
  }

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
      var query = queryString ? qs.parse(queryString) : {};

      routes[route]({
        url: url,
        path: path,
        params: params,
        query: query
      });
      break;
    }
  }

};
