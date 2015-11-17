'use strict';
var mapper = require('./mapper');
var URLON = require('URLON');
var pathToRegexp = require('path-to-regexp');
var omit = require('lodash/object/omit');

function compileRoute (route, options, cache) {
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
            result[key.name] = URLON.parse(value);
          } else {
            result[key.name] = value;
          }
        }

        return result;
      },

      stringify: function (values) {
        var params = Object.create(values);

        keys.forEach(function(key) {
          switch (typeof params[key.name]) {
            case 'boolean':
            case 'number':
              params[key.name] = URLON.stringify(params[key.name]);
              break;

            case 'object':
              throw new Error('URL Mapper - objects are not allowed to be stringified as part of path');
          }
        });
        var path = compiled(params);
        var queryString = '';

        if (options.query) {
          var query = omit(params, keys.map(function(key){ return key.name }));

          if (Object.keys(query).length) {
            queryString = '?' + URLON.stringify(query).slice(1);
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
