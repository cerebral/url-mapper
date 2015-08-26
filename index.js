'use strict';
var utils = require('./src/utils.js');

module.exports = function (url, routes) {

    // This logic should probably be better, has to Handle
    // /#/foo, #/foo, /foo, /foo/, /#/foo/, #/foo/
    var path = url.replace(location.origin, '').replace('#', '').replace('#', '').split('');
    if (path.length > 1 && path[path.length - 1] === '/') {
      path.pop();
    }
    if (path[0] === '/' && path[1] === '/') {
      path.shift();
    }
    path = path.join('');
    console.log(path);
    var route = utils.findMatchingRoute(routes, path);
    var params = utils.parseParams(route, path);

    routes[route]({
      path: path,
      params: params
    });

};
