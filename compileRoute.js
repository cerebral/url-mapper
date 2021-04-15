'use strict'
var URLON = require('urlon')
var pathToRegexp = require('path-to-regexp')

function getKeyName(key) {
  return key.name.toString()
}

// loose escaping for segment part
// see: https://github.com/pillarjs/path-to-regexp/pull/75
function encodeSegment(str) {
  return encodeURI(str).replace(/[/?#'"]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

function compileRoute(route, options) {
  var re
  var compiled
  var keys = []
  var querySeparator = options.querySeparator || '?'

  re = pathToRegexp(route, keys)
  keys = keys.map(getKeyName)
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
          var queryString = '$' + path.slice(path.indexOf(querySeparator) + querySeparator.length)
          result = URLON.parse(queryString)
        }
        path = path.split(querySeparator)[0]
      }

      var match = re.exec(path)
      if (!match) return null

      for (var i = 1; i < match.length; ++i) {
        var key = keys[i - 1]
        var value = match[i] && decodeURIComponent(match[i])
        result[key] = value && value[0] === ':' ? URLON.parse(value) : value
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
              if (values[key]) {
                throw new Error(
                  'URL Mapper - objects are not allowed to be stringified as part of path'
                )
              } else {
                // null
                pathParams[key] = URLON.stringify(values[key])
              }
              break

            default:
              pathParams[key] = values[key]
          }
        } else {
          queryParams[key] = values[key]
        }
      })

      var path = compiled(pathParams, { encode: encodeSegment })
      var queryString = ''

      if (options.query) {
        if (Object.keys(queryParams).length) {
          queryString = URLON.stringify(queryParams).slice(1)
        }
      }

      return path + (queryString ? querySeparator + queryString : '')
    },
  }
}

module.exports = compileRoute
