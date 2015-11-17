'use strict';
var URLON = require('URLON');
var pathToRegexp = require('path-to-regexp');
var omit = require('lodash/object/omit');

module.exports = function urlMapper (options) {
  var cache = {};
  options = options || {};

  function compileRoute (route) {
    var re;
    var compiled;
    var keys = [];

    if (!cache[route]) {
      re = pathToRegexp(route, keys);
      compiled = pathToRegexp.compile(route);

      cache[route] = {
        parse: function (url) {
          var path = url;
          var result = {};

          if (~path.indexOf('?')) {
            result = URLON.parse(path.split(/\?(.+)/)[1]);
            path = path.split('?')[0];
          }

          var match = re.exec(path);
          if (!match) return null;

          for (var i = 1; i < match.length; ++i) {
            var key = keys[i - 1];
            var value = match[i];
            if (value !== undefined || !(hasOwnProperty.call(result, key.name))) {
              result[key.name] = value;
            }
          }

          return result;
        },

        stringify: function (values) {
          keys.forEach(function(key) {
            if (typeof values[key.name] != 'string') throw new Error('only strings for path');
          });
          var path = compiled(values);
          var query = omit(values, keys.map(function(key){ return key.name }));
          var queryString = '';

          if (Object.keys(query).length) {
            queryString = '?' + URLON.stringify(query);
          }

          return path + queryString;
        }
      };
    }

    return cache[route];
  }

  function map(url, routes, callback) {
    for (var route in routes) {
      var compiled = compileRoute(route);
      var values = compiled.parse(url);
      if (values) {
        var match = routes[route];

        return {
          route: route,
          match: match,
          values: values
        };
      }
    }
  }

  function parse (route, url) {
    return compileRoute(route).parse(url || '');
  }

  function stringify (route, values) {
    return compileRoute(route).stringify(values || {});
  }

  return {
    parse: parse,
    stringify: stringify,
    map: map
  };
};
