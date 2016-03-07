'use strict'
var mapper = require('./mapper')
var compileRoute = require('./compileRoute')

module.exports = function urlMapper (options) {
  return mapper(compileRoute, options)
}
