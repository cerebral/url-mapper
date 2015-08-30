var Router = require('../index');

module.exports = {
  setUp: function(callback) {
    global.location = {
      origin: 'http://localhost/',
      search: ''
    };
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
      '*':                    routeCallback
    };
    callback();
  },

  tearDown: function (callback) {
    delete global.location;
    delete this.callbackInput;
    callback();
  },

  routeToHome: function (test) {
    Router('/', this.routes);
    test.equals(this.callbackInput.path, '/');
    test.deepEqual(this.callbackInput.params, {});
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getId: function (test) {
    Router('/foo/99', this.routes);
    test.equals(this.callbackInput.path, '/foo/99');
    test.deepEqual(this.callbackInput.params, { id: '99' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getIdAndGuid: function (test) {
    Router('/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294', this.routes);
    test.equals(this.callbackInput.path, '/foo/99/baz/ad8b0483-9642-479a-a234-fb0bf21cb294');
    test.deepEqual(this.callbackInput.params, { id: '99', guid: 'ad8b0483-9642-479a-a234-fb0bf21cb294' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  getUrlEncodedParams: function (test) {
    Router('/encode/test%40test.com/766b8ba4ccfdaf60d0925b', this.routes);
    test.equals(this.callbackInput.path, '/encode/test%40test.com/766b8ba4ccfdaf60d0925b');
    test.deepEqual(this.callbackInput.params, { email: 'test@test.com', hash: '766b8ba4ccfdaf60d0925b' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  catchAll: function (test) {
    Router('/missing', this.routes);
    test.equals(this.callbackInput.path, '/missing');
    test.deepEqual(this.callbackInput.params, { '0': '/missing' });
    test.deepEqual(this.callbackInput.query, {});
    test.done();
  },

  parseQueryString: function(test) {
    global.location.search = '?current_practice_user_uid%5B%5D=ce5c6f1040bc4ad2b9469669c0850046&' +
      'urgent%5B%5D=true&urgent%5B%5D=false&complete%5B%5D=true&complete%5B%5D=false&completed_at_gte=&' +
      'completed_at_lte=&due_date_gte=&due_date_lte=&patient_name=&patient_guid=&practice_user_uid=&' +
      'preset=dueToday&careteam_practice_user_uids=&search_term='
    Router('/foo', this.routes);
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
  }
};
