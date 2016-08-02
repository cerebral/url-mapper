'use strict'
var URLON = require('urlon')
var pathToRegexp = require('path-to-regexp')

function compileRoute (route, options) {
  var re
  var compiled
  var keys = []
  var querySeparator = options.querySeparator || '?'

  re = pathToRegexp(route, keys)
  keys = keys.map(function (key) { return key.name.toString() })
  compiled = pathToRegexp.compile(route)

  return {
    parse: function (url) {
      var path = url
      var result = {}

      if (~path.indexOf('#') && !~querySeparator.indexOf('#')) {
        path = path.split('#')[0]
      }

      if (~path.indexOf(querySeparator)) {
        if (options.query) {
          var queryString = '_' + path.slice(path.indexOf(querySeparator) + querySeparator.length)
          result = URLON.parse(queryString)
        }
        path = path.split(querySeparator)[0]
      }

      var match = re.exec(path)
      if (!match) return null

      for (var i = 1; i < match.length; ++i) {
        var key = keys[i - 1]
        var value = match[i] && decodeURIComponent(match[i])
        if (value && value[0] === ':') {
          result[key] = URLON.parse(value)
        } else {
          result[key] = value
        }
      }

      return result
    },

    stringify: function (values) {
      var pathParams = {}
      var queryParams = {}

      Object.keys(values).forEach(function (key) {
        if (~keys.indexOf(key)) {
          switch (typeof values[key]) {
            case 'boolean':
            case 'number':
              pathParams[key] = URLON.stringify(values[key])
              break

            case 'object':
              throw new Error('URL Mapper - objects are not allowed to be stringified as part of path')

            default:
              pathParams[key] = values[key]
          }
        } else {
          if (typeof values[key] !== 'undefined') queryParams[key] = values[key]
        }
      })

      var path = compiled(pathParams)
      var queryString = ''

      if (options.query) {
        if (Object.keys(queryParams).length) {
          queryString = querySeparator + URLON.stringify(queryParams).slice(1)
        }
      }

      return path + queryString
    }
  }
}

module.exports = compileRoute
