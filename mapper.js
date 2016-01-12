module.exports = function mapper (compileFn, options) {
  if (typeof compileFn !== 'function') throw new Error('URL Mapper - function to compile a route expected as first argument')

  options = options || {}
  var cache = {}

  function getCompiledRoute (route) {
    if (!cache[route]) {
      cache[route] = compileFn(route, options)
    }

    return cache[route]
  }

  function parse (route, url) {
    if (arguments.length < 2) throw new Error('URL Mapper - parse method expects 2 arguments')
    return getCompiledRoute(route).parse(url)
  }

  function stringify (route, values) {
    if (arguments.length < 2) throw new Error('URL Mapper - stringify method expects 2 arguments')
    return getCompiledRoute(route).stringify(values)
  }

  function map (url, routes) {
    if (arguments.length < 2) throw new Error('URL Mapper - map method expects 2 arguments')
    for (var route in routes) {
      var compiled = getCompiledRoute(route)
      var values = compiled.parse(url)
      if (values) {
        var match = routes[route]

        return {
          route: route,
          match: match,
          values: values
        }
      }
    }
  }

  return {
    parse: parse,
    stringify: stringify,
    map: map
  }
}
