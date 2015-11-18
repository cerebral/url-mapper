'use strict';
var mapper = require('./mapper');
var URLON = require('URLON');
var pathToRegexp = require('path-to-regexp');

function compileRoute (route, options, cache) {
  var re;
  var compiled;
  var keys = [];

  if (!cache[route]) {
    re = pathToRegexp(route, keys);
    keys = keys.map(function(key){ return key.name.toString() });
    compiled = pathToRegexp.compile(route);

    cache[route] = {
      parse: function (url) {
        var path = url;
        var result = {};

        if (~path.indexOf('#')) {
          path = path.split('#')[0];
        }

        if (~path.indexOf('?')) {
          if (options.query) {
            var queryString = '_' + path.split(/\?(.+)/)[1];
            result = URLON.parse(queryString);
          }
          path = path.split('?')[0];
        }

        var match = re.exec(path);
        if (!match) return null;

        for (var i = 1; i < match.length; ++i) {
          var key = keys[i - 1];
          var value = decodeURIComponent(match[i]);
          if (value[0] === ':') {
            result[key] = URLON.parse(value);
          } else {
            result[key] = value;
          }
        }

        return result;
      },

      stringify: function (values) {
        var pathParams = {};
        var queryParams = {}

        Object.keys(values).forEach(function(key) {
          if (~keys.indexOf(key)) {
            switch (typeof values[key]) {
              case 'boolean':
              case 'number':
                pathParams[key] = URLON.stringify(values[key]);
                break;

              case 'object':
                throw new Error('URL Mapper - objects are not allowed to be stringified as part of path');

              default:
                pathParams[key] = values[key];
            }
          } else {
            queryParams[key] = values[key];
          }
        });

        var path = compiled(pathParams);
        var queryString = '';

        if (options.query) {
          if (Object.keys(queryParams).length) {
            queryString = '?' + URLON.stringify(queryParams).slice(1);
          }
        }

        return path + queryString;
      }
    };
  }

  return cache[route];
}

module.exports = function urlMapper (options) {
  return mapper(compileRoute, options);
};
