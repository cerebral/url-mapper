var utils             = require('../src/utils');
var findMatchingRoute = utils.findMatchingRoute;
var match             = utils.match;
var parseParams       = utils.parseParams;
var parseQueryString  = utils.parseQueryString;

module.exports = {
  setUp: function(callback) {
    this.routes = {
      '/':                  function(arg){ return 'rootCallback ' + arg; },
      '/foo':               function(arg){ return 'fooCallback ' + arg; },
      '/foo/:id':           function(arg){ return 'fooIdCallback ' + arg; },
      '/foo/:id/baz':       function(arg){ return 'fooIdBazCallback ' + arg; },
      '/foo/:id/baz/:guid': function(arg){ return 'fooIdBazGuidCallback ' + arg; }
    };
    callback();
  },

  findMatchingRoute: function(test) {
    var activeRoute = findMatchingRoute(this.routes, '/foo/123');
    test.equal(activeRoute, '/foo/:id');

    test.done();
  },

  match: function(test) {
    // data
    var routesFixture = {
      '/': '/',
      '/foo': '/foo',
      '/foo/bar': '/foo/bar',
      '/foo/:id': '/foo/123',
      '/foo/:id/baz': '/foo/123/baz',
      '/foo/:id/baz/:guid': '/foo/123/baz/abc'
    };
    var routes = Object.keys(routesFixture);

    // assertion helper
    function assertMatch(route, pathname, nonMatchingRoutes) {
      test.ok(match(route, pathname));

      nonMatchingRoutes.forEach(function(route, pathname) {
        test.ok(!match(route, pathname));
      });
    }

    // test
    routes.forEach(function(route) {
      var mutableRoutes  = routes.slice()
      var index          = mutableRoutes.indexOf(route);
      var routeUnderTest = mutableRoutes.splice(index, 1).shift();
      var pathname       = routesFixture[route];

      assertMatch(routeUnderTest, pathname, mutableRoutes);
    });

    test.done();
  },

  parseParams: function(test) {
    var nestedParams = parseParams('/foo/:id/baz/:guid', '/foo/123/baz/abc');
    var rootParams   = parseParams('/', '/');
    var fooParams    = parseParams('/foo', '/foo');

    test.deepEqual(nestedParams, {id: '123', guid: 'abc'});
    test.deepEqual(rootParams, {});
    test.deepEqual(fooParams, {});

    test.done();
  },

  parseQueryString: function(test) {
    var queryString = 'current_practice_user_uid%5B%5D=ce5c6f1040bc4ad2b9469669c0850046&' +
                      'urgent%5B%5D=true&urgent%5B%5D=false&complete%5B%5D=true&complete%5B%5D=false&completed_at_gte=&' +
                      'completed_at_lte=&due_date_gte=&due_date_lte=&patient_name=&patient_guid=&practice_user_uid=&' +
                      'preset=dueToday&careteam_practice_user_uids=&search_term='
    var parsedObject = {
      current_practice_user_uid:   [ 'ce5c6f1040bc4ad2b9469669c0850046' ],
      urgent:                      [ 'true', 'false' ],
      complete:                    [ 'true', 'false' ],
      completed_at_gte:            '',
      completed_at_lte:            '',
      due_date_gte:                '',
      due_date_lte:                '',
      patient_name:                '',
      patient_guid:                '',
      practice_user_uid:           '',
      preset:                      'dueToday',
      careteam_practice_user_uids: '',
      search_term:                 '' }

    test.deepEqual(parseQueryString(queryString), parsedObject);
    test.done();
  }
};
