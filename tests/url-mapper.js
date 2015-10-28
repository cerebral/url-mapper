var Router = require('../index');

module.exports = {
  setUp: function(callback) {
    self = this;
    this.callbackInput = {};
    var routeCallback = function (input) {
      self.callbackInput = input;
    };
    this.routes = {
      '/':                    routeCallback,
      '/foo':                 routeCallback,
      '/foo/:id':             routeCallback,
      '/foo/:id/baz':         routeCallback,
      '/foo/:id/baz/:guid':   routeCallback,
      '/encode/:email/:hash': routeCallback,
      '/query':               routeCallback,
      '*':                    routeCallback
    };
    callback();
  },

  tearDown: function (callback) {
    delete this.callbackInput;
    callback();
  },

  routeToHome: function (test) {
    test.equals(Router('/', this.routes), '/');
    test.equals(this.callbackInput.url, '/');
    test.equals(this.callbackInput.path, '/');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getId: function (test) {
    test.equals(Router('/foo/99', this.routes), '/foo/:id');
    test.equals(this.callbackInput.url, '/foo/99');
    test.equals(this.callbackInput.path, '/foo/99');
    test.deepEqual(this.callbackInput.params, { id: '99' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getIdAndGuid: function (test) {
    test.equals(Router('/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294', this.routes), '/foo/:id/baz/:guid');
    test.equals(this.callbackInput.url, '/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294');
    test.equals(this.callbackInput.path, '/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294');
    test.deepEqual(this.callbackInput.params, { id: '99', guid: 'ad8b0483-9642-479a-a234-fb0bf21cb294' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getUrlEncodedParams: function (test) {
    test.equals(Router('/encode/test%40test.com/766b8ba4ccfdaf60d0925b', this.routes), '/encode/:email/:hash');
    test.equals(this.callbackInput.url, '/encode/test%40test.com/766b8ba4ccfdaf60d0925b');
    test.equals(this.callbackInput.path, '/encode/test%40test.com/766b8ba4ccfdaf60d0925b');
    test.deepEqual(this.callbackInput.params, { email: 'test@test.com', hash: '766b8ba4ccfdaf60d0925b' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeQuery: function (test) {
    test.equals(Router('/query?foo=bar', this.routes), '/query');
    test.equals(this.callbackInput.url, '/query?foo=bar');
    test.equals(this.callbackInput.path, '/query');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {foo: 'bar'});
    test.done();
  },

  routeQueryWithEndingSlash: function (test) {
    test.equals(Router('/query/?foo=bar', this.routes), '/query');
    test.equals(this.callbackInput.url, '/query/?foo=bar');
    test.equals(this.callbackInput.path, '/query/');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {foo: 'bar'});
    test.done();
  },

  routeFullUrl: function (test) {
    test.equals(Router('http://www.example.com/foo', this.routes), '/foo');
    test.equals(this.callbackInput.url, '/foo');
    test.equals(this.callbackInput.path, '/foo');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeHashUrl: function (test) {
    test.equals(Router('http://www.example.com/#/foo', this.routes), '/foo');
    test.equals(this.callbackInput.url, '/#/foo');
    test.equals(this.callbackInput.path, '/foo');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeEndingSlash: function (test) {
    test.equals(Router('http://www.example.com/#/foo', this.routes), '/foo');
    test.equals(this.callbackInput.url, '/#/foo');
    test.equals(this.callbackInput.path, '/foo');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  routeEndingSlashHash: function (test) {
    test.equals(Router('http://www.example.com/#/foo/', this.routes), '/foo');
    test.equals(this.callbackInput.url, '/#/foo/');
    test.equals(this.callbackInput.path, '/foo');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  catchAll: function (test) {
    test.equals(Router('/missing', this.routes), '*');
    test.equals(this.callbackInput.url, '/missing');
    test.equals(this.callbackInput.path, '/missing');
    test.deepEqual(this.callbackInput.params, { '0': '/missing' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  parseQueryString: function(test) {
    var query = '?current_practice_user_uid%5B%5D=ce5c6f1040bc4ad2b9469669c0850046&' +
      'urgent%5B%5D=true&urgent%5B%5D=false&complete%5B%5D=true&complete%5B%5D=false&completed_at_gte=&' +
      'completed_at_lte=&due_date_gte=&due_date_lte=&patient_name=&patient_guid=&practice_user_uid=&' +
      'preset=dueToday&careteam_practice_user_uids=&search_term='
    test.equals(Router('/foo' + query, this.routes), '/foo');
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
    test.done();
  }
};
