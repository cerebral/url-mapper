var Mapper = require('../mapper');
var urlMapper = require('../index')({
  query: true
});

module.exports['mapper'] = {
  setUp: function (cb) {
    var self = this;

    this.compileFn = function compileFn (route, options, cache) {
      self.compileFnArgs = arguments;

      return {
        parse: function (url) {
          self.parseArgs = arguments;
          // match if url starts with route without colon
          // 'url' matches ':url'
          // 'url2' matches ':url'
          // 'url' does not matches ':url2'
          if (url.slice(0, route.length - 1) === route.slice(1)) return { route: route, url: url };
        },
        stringify: function (object) {
          self.stringifyArgs = arguments;
        }
      };
    };

    cb();
  },

  'should return object with expected methods': function (test) {
    var mapper = Mapper(this.compileFn);

    test.equals(typeof mapper.parse, 'function');
    test.equals(typeof mapper.stringify, 'function');
    test.equals(typeof mapper.map, 'function');

    test.done();
  },

  'should throw if compileFn was not provided': function (test) {
    var compileFn = this.compileFn;
    var options = {};

    test.doesNotThrow(function(){
      Mapper(compileFn);
      Mapper(compileFn, options);
    });

    test.throws(function(){
      Mapper();
    });

    test.throws(function(){
      Mapper(options);
    });

    test.done();
  },

  parse: {
    'should pass right arguments to compileFn and its parse method': function (test) {
      var options = {};
      var mapper = Mapper(this.compileFn, options);

      mapper.parse('route', 'url');
      test.equals(this.compileFnArgs[0], 'route');
      test.equals(this.compileFnArgs[1], options);
      test.deepEqual(this.compileFnArgs[2], {});
      test.equals(this.parseArgs[0], 'url');

      test.done();
    },

    'should reuse cache between calls': function (test) {
      var mapper = Mapper(this.compileFn);

      mapper.parse('route', 'url');
      var cache = this.compileFnArgs[2];
      delete this.compileFnArgs;

      mapper.parse('route2', 'url2');
      test.equals(this.compileFnArgs[0], 'route2');
      test.equals(this.compileFnArgs[2], cache);
      test.equals(this.parseArgs[0], 'url2');

      test.done();
    },

    'should throw on missing arguments': function (test) {
      var mapper = Mapper(this.compileFn);

      test.throws(function(){
        mapper.parse('route');
      });

      test.throws(function(){
        mapper.parse();
      });

      test.done();
    }
  },

  stringify: {
    'should pass right arguments to compileFn and its stringify method': function (test) {
      var options = {};
      var object = {};
      var mapper = Mapper(this.compileFn, options);

      mapper.stringify('route', object);
      test.equals(this.compileFnArgs[0], 'route');
      test.equals(this.compileFnArgs[1], options);
      test.deepEqual(this.compileFnArgs[2], {});
      test.equals(this.stringifyArgs[0], object);

      test.done();
    },

    'should reuse cache between calls': function (test) {
      var object = {};
      var object2 = {};
      var mapper = Mapper(this.compileFn);

      mapper.stringify('route', object);
      var cache = this.compileFnArgs[2];
      delete this.compileFnArgs;

      mapper.stringify('route2', object2);
      test.equals(this.compileFnArgs[0], 'route2');
      test.equals(this.compileFnArgs[2], cache);
      test.equals(this.stringifyArgs[0], object2);

      test.done();
    },

    'should throw on missing arguments': function (test) {
      var mapper = Mapper(this.compileFn);

      test.throws(function(){
        mapper.stringify('route');
      });

      test.throws(function(){
        mapper.stringify();
      });

      test.done();
    }
  },

  map: {
    'should pass right arguments to compileFn': function (test) {
      var options = {};
      var routes = {
        ':url': {}
      };
      var mapper = Mapper(this.compileFn, options);

      mapper.map('url', routes);
      test.equals(this.compileFnArgs[0], ':url');
      test.equals(this.compileFnArgs[1], options);
      test.deepEqual(this.compileFnArgs[2], {});

      test.done();
    },

    'should reuse cache between calls': function (test) {
      var options = {};
      var routes = {
        ':url': {},
        ':url2': {}
      };
      var mapper = Mapper(this.compileFn, options);

      mapper.map('url', routes);
      var cache = this.compileFnArgs[2];
      delete this.compileFnArgs;

      mapper.map('url2', routes);
      test.deepEqual(this.compileFnArgs[2], cache);

      test.done();
    },

    'should return matched route and parsed values': function (test) {
      var routes = {
        ':url1': 'match1',
        ':url2': 'match2'
      };
      var mapper = Mapper(this.compileFn);

      test.deepEqual(mapper.map('url1', routes), {
        route: ':url1',
        match: 'match1',
        values: {
          route: ':url1',
          url: 'url1'
        }
      });

      test.deepEqual(mapper.map('url2', routes), {
        route: ':url2',
        match: 'match2',
        values: {
          route: ':url2',
          url: 'url2'
        }
      });

      test.done();
    },

    'should return only first matched route and parsed values': function (test) {
      var routes = {
        ':url': 'match1',
        ':url1': 'match2'
      };
      var mapper = Mapper(this.compileFn);

      test.deepEqual(mapper.map('url11', routes), {
        route: ':url',
        match: 'match1',
        values: {
          route: ':url',
          url: 'url11'
        }
      });

      test.done();
    },

    'should throw on missing arguments': function (test) {
      var mapper = Mapper(this.compileFn);

      test.throws(function(){
        mapper.map('url');
      });

      test.throws(function(){
        mapper.map();
      });

      test.done();
    }
  },

};

module.exports['url-mapper'] = {
  parse: function(test) {
    var values = {foo: 'bar', bar: { foo: true, bar: 2, baz: ['foo', 'bar', 'baz'], e:''}};
    test.deepEqual(urlMapper.parse('/:foo', urlMapper.stringify('/:foo', values)), values);
    test.throws(function(){
      urlMapper.stringify('/:bar', values);
    });
    test.done();
  },

  map: function(test) {
    urlMapper.map('/bar', {'/:foo': function(){ test.ok(true)}}).match();
    test.done();
  }

};
