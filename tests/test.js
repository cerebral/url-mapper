var Mapper = require('../mapper')
var urlMapper = require('../index')

module.exports = {
  mapper: {
    setUp: function (cb) {
      var self = this

      this.compileFn = function compileFn (route, options, cache) {
        self.compileFnArgs = arguments

        return {
          parse: function (url) {
            self.parseArgs = arguments
            // match if url starts with route without colon
            // 'url' matches ':url'
            // 'url2' matches ':url'
            // 'url' does not matches ':url2'
            if (url.slice(0, route.length - 1) === route.slice(1)) return { route: route, url: url }
          },
          stringify: function (object) {
            self.stringifyArgs = arguments
          }
        }
      }

      cb()
    },

    'should return object with expected methods': function (test) {
      var mapper = Mapper(this.compileFn)

      test.equals(typeof mapper.parse, 'function')
      test.equals(typeof mapper.stringify, 'function')
      test.equals(typeof mapper.map, 'function')

      test.done()
    },

    'should throw if compileFn was not provided': function (test) {
      var compileFn = this.compileFn
      var options = {}

      test.doesNotThrow(function () {
        Mapper(compileFn)
        Mapper(compileFn, options)
      })

      test.throws(function () {
        Mapper()
      })

      test.throws(function () {
        Mapper(options)
      })

      test.done()
    },

    parse: {
      'should pass route and options arguments to compileFn and its parse method': function (test) {
        var options = {}
        var mapper = Mapper(this.compileFn, options)

        mapper.parse('route', 'url')
        test.equals(this.compileFnArgs[0], 'route')
        test.equals(this.compileFnArgs[1], options)
        test.equals(this.parseArgs[0], 'url')

        test.done()
      },

      'should throw on missing arguments': function (test) {
        var mapper = Mapper(this.compileFn)

        test.throws(function () {
          mapper.parse('route')
        })

        test.throws(function () {
          mapper.parse()
        })

        test.done()
      }
    },

    stringify: {
      'should pass route and options arguments to compileFn and its stringify method': function (test) {
        var options = {}
        var object = {}
        var mapper = Mapper(this.compileFn, options)

        mapper.stringify('route', object)
        test.equals(this.compileFnArgs[0], 'route')
        test.equals(this.compileFnArgs[1], options)
        test.equals(this.stringifyArgs[0], object)

        test.done()
      },

      'should throw on missing arguments': function (test) {
        var mapper = Mapper(this.compileFn)

        test.throws(function () {
          mapper.stringify('route')
        })

        test.throws(function () {
          mapper.stringify()
        })

        test.done()
      }
    },

    map: {
      'should pass route and options arguments to compileFn': function (test) {
        var options = {}
        var routes = {
          ':url': {}
        }
        var mapper = Mapper(this.compileFn, options)

        mapper.map('url', routes)
        test.equals(this.compileFnArgs[0], ':url')
        test.equals(this.compileFnArgs[1], options)

        test.done()
      },

      'should return matched route and parsed values': function (test) {
        var routes = {
          ':url1': 'match1',
          ':url2': 'match2'
        }
        var mapper = Mapper(this.compileFn)

        test.deepEqual(mapper.map('url1', routes), {
          route: ':url1',
          match: 'match1',
          values: {
            route: ':url1',
            url: 'url1'
          }
        })

        test.deepEqual(mapper.map('url2', routes), {
          route: ':url2',
          match: 'match2',
          values: {
            route: ':url2',
            url: 'url2'
          }
        })

        test.done()
      },

      'should return only first matched route and parsed values': function (test) {
        var routes = {
          ':url': 'match1',
          ':url1': 'match2'
        }
        var mapper = Mapper(this.compileFn)

        test.deepEqual(mapper.map('url11', routes), {
          route: ':url',
          match: 'match1',
          values: {
            route: ':url',
            url: 'url11'
          }
        })

        test.done()
      },

      'should throw on missing arguments': function (test) {
        var mapper = Mapper(this.compileFn)

        test.throws(function () {
          mapper.map('url')
        })

        test.throws(function () {
          mapper.map()
        })

        test.done()
      }
    }
  },

  urlMapper: {
    'without query support': {
      'should parse url without query': function (test) {
        var mapper = urlMapper()

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz'), {
          foo: 'bar',
          bar: 'baz'
        })

        test.done()
      },

      'should parse url ignoring query': function (test) {
        var mapper = urlMapper()

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz?query'), {
          foo: 'bar',
          bar: 'baz'
        })

        test.done()
      },

      'should parse url ignoring hash': function (test) {
        var mapper = urlMapper()

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz#hash'), {
          foo: 'bar',
          bar: 'baz'
        })

        test.done()
      },

      'should not parse if url does not matches to route': function (test) {
        var mapper = urlMapper()

        test.equals(mapper.parse('/:foo/:bar', '/bar'), null)

        test.done()
      },

      'should stringify object using only params defined in route': function (test) {
        var mapper = urlMapper()

        test.equal(mapper.stringify('/:foo/:bar', {
          foo: 'bar',
          bar: 'baz',
          baz: 'foo',
          qux: {}
        }), '/bar/baz')

        test.done()
      },

      'should parse stringified object with booleans and numbers as params defined in route': function (test) {
        var mapper = urlMapper()
        var object = {
          foo: true,
          bar: false,
          baz: 42
        }
        // URLON-like notation
        var url = '/%3Atrue/%3Afalse/%3A42'

        test.equal(mapper.stringify('/:foo/:bar/:baz', object), url)
        test.deepEqual(mapper.parse('/:foo/:bar/:baz', url), object)

        test.done()
      },

      'should throw if property mapped to a part of path is object': function (test) {
        var mapper = urlMapper()

        test.throws(function () {
          mapper.stringify('/:foo', {
            foo: {},
            bar: 'baz',
            baz: 'foo'
          })
        })

        test.done()
      }
    },

    'with query support': {
      'should parse url without query': function (test) {
        var mapper = urlMapper({ query: true })

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz'), {
          foo: 'bar',
          bar: 'baz'
        })

        test.done()
      },

      'should parse url with qs-like query': function (test) {
        var mapper = urlMapper({ query: true })

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz?baz=foo'), {
          foo: 'bar',
          bar: 'baz',
          baz: 'foo'
        })

        test.done()
      },

      'should parse url ignoring hash': function (test) {
        var mapper = urlMapper({ query: true })

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz#hash'), {
          foo: 'bar',
          bar: 'baz'
        })

        test.deepEqual(mapper.parse('/:foo/:bar', '/bar/baz?baz=foo#hash'), {
          foo: 'bar',
          bar: 'baz',
          baz: 'foo'
        })

        test.done()
      },

      'should not parse if url does not matches to route': function (test) {
        var mapper = urlMapper({ query: true })

        test.equals(mapper.parse('/:foo/:bar', '/bar'), null)

        test.done()
      },

      'should stringify object without query': function (test) {
        var mapper = urlMapper({ query: true })

        test.equal(mapper.stringify('/:foo/:bar', {
          foo: 'bar',
          bar: 'baz'
        }), '/bar/baz')

        test.done()
      },

      'should not stringify undefined query params': function (test) {
        var mapper = urlMapper({ query: true })

        test.equal(mapper.stringify('/:foo', {
          foo: 'bar',
          bar: undefined
        }), '/bar')

        test.done()
      },

      'should parse stringified object including params not defined in route': function (test) {
        var mapper = urlMapper({ query: true })
        var object = {
          foo: 'bar',
          bar: true,
          baz: {
            foo: true,
            bar: 2,
            baz: ['foo', 'bar', 'baz'],
            e: ''
          }
        }

        // we do not test which url it stringified to
        // but if you are curious:
        // '/bar?bar:true&baz_foo:true&bar:2&baz@=foo&=bar&=baz;&e='
        test.deepEqual(mapper.parse('/:foo', mapper.stringify('/:foo', object)), object)

        test.done()
      },

      'should allow custom query separator': function (test) {
        var mapper = urlMapper({ query: true, querySeparator: '#' })
        test.equal(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' }), '/bar#bar=baz')
        test.deepEqual(mapper.parse('/:foo', '/bar#bar=baz'), { foo: 'bar', bar: 'baz' })

        mapper = urlMapper({ query: true, querySeparator: '@' })
        test.equal(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' }), '/bar@bar=baz')
        test.deepEqual(mapper.parse('/:foo', '/bar@bar=baz'), { foo: 'bar', bar: 'baz' })

        mapper = urlMapper({ query: true, querySeparator: '@@' })
        test.equal(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' }), '/bar@@bar=baz')
        test.deepEqual(mapper.parse('/:foo', '/bar@@bar=baz'), { foo: 'bar', bar: 'baz' })

        mapper = urlMapper({ query: true, querySeparator: '#@' })
        test.equal(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' }), '/bar#@bar=baz')
        test.deepEqual(mapper.parse('/:foo', '/bar#@bar=baz'), { foo: 'bar', bar: 'baz' })

        test.done()
      },

      'should parse optional paramters as undefined': function (test) {
        var mapper = urlMapper()

        test.deepEqual(mapper.parse('/:foo/:bar?', '/bar/'), {
          foo: 'bar',
          bar: undefined
        })

        test.done()
      }
    }
  }
}
