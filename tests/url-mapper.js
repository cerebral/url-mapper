var Router = require('../index');

module.exports = {
  setUp: function(callback) {
    self = this;
    this.callbackInput = {};

    var createRouteCallback = function(result){
      return function (input) {
        self.callbackInput = input;
        return result;
      };
    };

    this.routeResults = {
      '/': Symbol('/'),
      '/foo': Symbol('/foo'),
      '/foo/:id': Symbol('/foo/:id'),
      '/foo/:id/baz': Symbol('/foo/:id/baz'),
      '/foo/:id/baz/:guid': Symbol('/foo/:id/baz/:guid'),
      '/encode/:email/:hash': Symbol('/encode/:email/:hash'),
      '/query': Symbol('/query'),
      '*': Symbol('*')
    };

    this.routes = {
      '/':                    createRouteCallback(this.routeResults['/']),
      '/foo':                 createRouteCallback(this.routeResults['/foo']),
      '/foo/:id':             createRouteCallback(this.routeResults['/foo/:id']),
      '/foo/:id/baz':         createRouteCallback(this.routeResults['/foo/:id/baz']),
      '/foo/:id/baz/:guid':   createRouteCallback(this.routeResults['/foo/:id/baz/:guid']),
      '/encode/:email/:hash': createRouteCallback(this.routeResults['/encode/:email/:hash']),
      '/query':               createRouteCallback(this.routeResults['/query']),
      '*':                    createRouteCallback(this.routeResults['*']),
    };
    callback();
  },

  tearDown: function (callback) {
    delete this.callbackInput;
    callback();
  },

  routeResult: function(test){
    var result = Symbol('result');
    var routes = {
      '/existing': function(){
        return result;
      }
    };
    test.equals(Router('/existing', routes), result);
    test.equals(Router('/missing', routes), undefined);

    test.done();
  },

  routeToHome: function (test) {
    test.equals(Router('/', this.routes), this.routeResults['/']);
    test.equals(this.callbackInput.url, '/');
    test.equals(this.callbackInput.path, '/');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getId: function (test) {
    test.equals(Router('/foo/99', this.routes), this.routeResults['/foo/:id']);
    test.equals(this.callbackInput.url, '/foo/99');
    test.equals(this.callbackInput.path, '/foo/99');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, { id: '99' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getIdAndGuid: function (test) {
    test.equals(Router('/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294', this.routes), this.routeResults['/foo/:id/baz/:guid']);
    test.equals(this.callbackInput.url, '/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294');
    test.equals(this.callbackInput.path, '/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, { id: '99', guid: 'ad8b0483-9642-479a-a234-fb0bf21cb294' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getUrlEncodedParams: function (test) {
    test.equals(Router('/encode/test%40test.com/766b8ba4ccfdaf60d0925b', this.routes), this.routeResults['/encode/:email/:hash']);
    test.equals(this.callbackInput.url, '/encode/test%40test.com/766b8ba4ccfdaf60d0925b');
    test.equals(this.callbackInput.path, '/encode/test%40test.com/766b8ba4ccfdaf60d0925b');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, { email: 'test@test.com', hash: '766b8ba4ccfdaf60d0925b' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeQuery: function (test) {
    test.equals(Router('/query?foo=bar', this.routes), this.routeResults['/query']);
    test.equals(this.callbackInput.url, '/query?foo=bar');
    test.equals(this.callbackInput.path, '/query');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {foo: 'bar'});
    test.done();
  },

  routeQueryWithEndingSlash: function (test) {
    test.equals(Router('/query/?foo=bar', this.routes), this.routeResults['/query']);
    test.equals(this.callbackInput.url, '/query/?foo=bar');
    test.equals(this.callbackInput.path, '/query/');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {foo: 'bar'});
    test.done();
  },

  routeHash: function(test) {
    test.equals(Router('/foo#bar', this.routes), this.routeResults['/foo']);
    test.equals(this.callbackInput.url, '/foo#bar');
    test.equals(this.callbackInput.path, '/foo');
    test.equals(this.callbackInput.hash, 'bar');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeQueryWithHash: function (test) {
    test.equals(Router('/query?foo=bar#baz', this.routes), this.routeResults['/query']);
    test.equals(this.callbackInput.url, '/query?foo=bar#baz');
    test.equals(this.callbackInput.path, '/query');
    test.equals(this.callbackInput.hash, 'baz');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {foo: 'bar'});
    test.done();
  },

  catchAll: function (test) {
    test.equals(Router('/missing', this.routes), this.routeResults['*']);
    test.equals(this.callbackInput.url, '/missing');
    test.equals(this.callbackInput.path, '/missing');
    test.equals(this.callbackInput.hash, '');
    test.deepEqual(this.callbackInput.params, { '0': '/missing' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  parseQueryString: function(test) {
    var query = '?current_practice_user_uid%5B%5D=ce5c6f1040bc4ad2b9469669c0850046&' +
      'urgent%5B%5D=true&urgent%5B%5D=false&complete%5B%5D=true&complete%5B%5D=false&completed_at_gte=&' +
      'completed_at_lte=&due_date_gte=&due_date_lte=&patient_name=&patient_guid=&practice_user_uid=&' +
      'preset=dueToday&careteam_practice_user_uids=&search_term='
    test.equals(Router('/foo' + query, this.routes), this.routeResults['/foo']);
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

    test.deepEqual(this.callbackInput.query, parsedObject);
    test.done();
  },

  missed: function(test) {
    var routes = {
      '/existing': function(){
        test.ok(false);
      }
    };
    test.equals(Router('/missing', routes), undefined);
    test.deepEqual(this.callbackInput, {});
    test.done();
  }
};
