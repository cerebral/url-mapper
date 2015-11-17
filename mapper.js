module.exports = function mapper (compileFn, options) {
  options = options || {};
  var cache = {};

  function parse (route, url) {
    return compileFn(cache, route, options).parse(url || '');
  }

  function stringify (route, values) {
    return compileFn(cache, route, options).stringify(values || {});
  }

  function map(url, routes, callback) {
    for (var route in routes) {
      var compiled = compileFn(cache, route, options);
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

  return {
    parse: parse,
    stringify: stringify,
    map: map
  };
};
