'use strict';
var mapper = require('./mapper');
var URLON = require('URLON');
var pathToRegexp = require('path-to-regexp');
var omit = require('lodash/object/omit');

function compileRoute (cache, route, options) {
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
          if (options.query) result = URLON.parse(path.split(/\?(.+)/)[1]);
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
        var queryString = '';

        if (options.query) {
          var query = omit(values, keys.map(function(key){ return key.name }));

          if (Object.keys(query).length) {
            queryString = '?' + URLON.stringify(query);
          }
        }

        return path + queryString;
      }
    };
  }

  return cache[route];
}

module.exports = function urlMapper (options) {
  return mapper(options.compileFn || compileRoute, omit(options, 'compileFn'));
};
