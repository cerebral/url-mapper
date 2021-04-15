/* eslint-env jest */

var Mapper = require('../mapper')
var urlMapper = require('../index')

describe('mapper', function () {
  var parse = jest.fn()
  var stringify = jest.fn()
  var compileFn = jest.fn(function compileFn (route, options, cache) {
    parse.mockImplementation(function (url) {
      // match if url starts with route without colon
      // 'url' matches ':url'
      // 'url2' matches ':url'
      // 'url' does not matches ':url2'
      if (url.slice(0, route.length - 1) === route.slice(1)) return { route: route, url: url }
    })
    return {
      parse: parse,
      stringify: stringify
    }
  })

  it('should return object with expected methods', function () {
    var mapper = Mapper(compileFn)

    expect(typeof mapper.parse).toBe('function')
    expect(typeof mapper.stringify).toBe('function')
    expect(typeof mapper.map).toBe('function')
  })

  it('should throw if compileFn was not provided', function () {
    var options = {}

    expect(function () {
      Mapper(compileFn)
      Mapper(compileFn, options)
    }).not.toThrow()

    expect(function () {
      Mapper()
    }).toThrow()

    expect(function () {
      Mapper(options)
    }).toThrow()
  })

  describe('parse', function () {
    it('should pass route and options arguments to compileFn and its parse method', function () {
      var options = {}
      var mapper = Mapper(compileFn, options)
      mapper.parse('route', 'url')
      expect(compileFn).toBeCalledWith('route', options)
      expect(parse).toBeCalledWith('url')
    })

    it('should throw on missing arguments', function () {
      var mapper = Mapper(compileFn)

      expect(function () {
        mapper.parse('route')
      }).toThrow()

      expect(function () {
        mapper.parse()
      }).toThrow()
    })
  })

  describe('stringify', function () {
    it('should pass route and options arguments to compileFn and its stringify method', function () {
      var options = {}
      var object = {}
      var mapper = Mapper(compileFn, options)

      mapper.stringify('route', object)
      expect(compileFn).toBeCalledWith('route', options)
      expect(stringify).toBeCalledWith(object)
    })

    it('should throw on missing arguments', function () {
      var mapper = Mapper(compileFn)

      expect(function () {
        mapper.stringify('route')
      }).toThrow()

      expect(function () {
        mapper.stringify()
      }).toThrow()
    })
  })

  describe('map', function () {
    it('should pass route and options arguments to compileFn', function () {
      var options = {}
      var routes = {
        ':url': {}
      }
      var mapper = Mapper(compileFn, options)

      mapper.map('url', routes)
      expect(compileFn).toBeCalledWith(':url', options)
    })

    it('should return matched route and parsed values', function () {
      var routes = {
        ':url1': 'match1',
        ':url2': 'match2'
      }
      var mapper = Mapper(compileFn)

      expect(mapper.map('url1', routes)).toEqual({
        route: ':url1',
        match: 'match1',
        values: {
          route: ':url1',
          url: 'url1'
        }
      })

      expect(mapper.map('url2', routes)).toEqual({
        route: ':url2',
        match: 'match2',
        values: {
          route: ':url2',
          url: 'url2'
        }
      })
    })

    it('should return only first matched route and parsed values', function () {
      var routes = {
        ':url': 'match1',
        ':url1': 'match2'
      }
      var mapper = Mapper(compileFn)

      expect(mapper.map('url11', routes)).toEqual({
        route: ':url',
        match: 'match1',
        values: {
          route: ':url',
          url: 'url11'
        }
      })
    })

    it('should throw on missing arguments', function () {
      var mapper = Mapper(compileFn)

      expect(function () {
        mapper.map('url')
      }).toThrow()

      expect(function () {
        mapper.map()
      }).toThrow()
    })
  })
})

describe('urlMapper', function () {
  describe('without query support', function () {
    it('should parse url without query', function () {
      var mapper = urlMapper()

      expect(mapper.parse('/:foo/:bar', '/bar/baz')).toEqual({
        foo: 'bar',
        bar: 'baz'
      })
    })

    it('should parse url ignoring query', function () {
      var mapper = urlMapper()

      expect(mapper.parse('/:foo/:bar', '/bar/baz?query')).toEqual({
        foo: 'bar',
        bar: 'baz'
      })
    })

    it('should parse url ignoring hash', function () {
      var mapper = urlMapper()

      expect(mapper.parse('/:foo/:bar', '/bar/baz#hash')).toEqual({
        foo: 'bar',
        bar: 'baz'
      })
    })

    it('should not parse if url does not matches to route', function () {
      var mapper = urlMapper()

      expect(mapper.parse('/:foo/:bar', '/bar')).toBeNull()
    })

    it('should stringify object using only params defined in route', function () {
      var mapper = urlMapper()

      expect(mapper.stringify('/:foo/:bar', {
        foo: 'bar',
        bar: 'baz',
        baz: 'foo',
        qux: {}
      })).toEqual('/bar/baz')
    })

    it('should parse stringified object with booleans and numbers as params defined in route', function () {
      var mapper = urlMapper()
      var object = {
        foo: true,
        bar: false,
        baz: 42,
        qux: null
      }
      // URLON-like notation
      var url = '/:true/:false/:42/:null'

      expect(mapper.stringify('/:foo/:bar/:baz/:qux', object)).toEqual(url)
      expect(mapper.parse('/:foo/:bar/:baz/:qux', url)).toEqual(object)
    })

    it('should properly escape unsafe symbols in segments', function () {
      var mapper = urlMapper()
      var object = {
        foo: 'foo/?#\'"bar'
      }

      var url = '/foo%2F%3F%23%27%22bar'

      expect(mapper.stringify('/:foo', object)).toEqual(url)
      expect(mapper.parse('/:foo', url)).toEqual(object)
    })

    it('should throw if property mapped to a part of path is object', function () {
      var mapper = urlMapper()

      expect(function () {
        mapper.stringify('/:foo', {
          foo: {},
          bar: 'baz',
          baz: 'foo'
        })
      }).toThrow()
    })
  })

  describe('with query support', function () {
    it('should parse url without query', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.parse('/:foo/:bar', '/bar/baz')).toEqual({
        foo: 'bar',
        bar: 'baz'
      })
    })

    it('should parse url with qs-like query', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.parse('/:foo/:bar', '/bar/baz?baz=foo')).toEqual({
        foo: 'bar',
        bar: 'baz',
        baz: 'foo'
      })
    })

    it('should parse url ignoring hash', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.parse('/:foo/:bar', '/bar/baz#hash')).toEqual({
        foo: 'bar',
        bar: 'baz'
      })

      expect(mapper.parse('/:foo/:bar', '/bar/baz?baz=foo#hash')).toEqual({
        foo: 'bar',
        bar: 'baz',
        baz: 'foo'
      })
    })

    it('should not parse if url does not matches to route', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.parse('/:foo/:bar', '/bar')).toBeNull()
    })

    it('should stringify object without query', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.stringify('/:foo/:bar', {
        foo: 'bar',
        bar: 'baz'
      })).toEqual('/bar/baz')
    })

    it('should not stringify undefined query params', function () {
      var mapper = urlMapper({ query: true })

      expect(mapper.stringify('/:foo', {
        foo: 'bar',
        bar: undefined
      })).toEqual('/bar')
    })

    it('should parse stringified object including params not defined in route', function () {
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
      expect(mapper.parse('/:foo', mapper.stringify('/:foo', object))).toEqual(object)
    })

    it('should allow custom query separator', function () {
      var mapper = urlMapper({ query: true, querySeparator: '#' })
      expect(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' })).toEqual('/bar#bar=baz')
      expect(mapper.parse('/:foo', '/bar#bar=baz')).toEqual({ foo: 'bar', bar: 'baz' })

      mapper = urlMapper({ query: true, querySeparator: '@' })
      expect(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' })).toEqual('/bar@bar=baz')
      expect(mapper.parse('/:foo', '/bar@bar=baz')).toEqual({ foo: 'bar', bar: 'baz' })

      mapper = urlMapper({ query: true, querySeparator: '@@' })
      expect(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' })).toEqual('/bar@@bar=baz')
      expect(mapper.parse('/:foo', '/bar@@bar=baz')).toEqual({ foo: 'bar', bar: 'baz' })

      mapper = urlMapper({ query: true, querySeparator: '#@' })
      expect(mapper.stringify('/:foo', { foo: 'bar', bar: 'baz' })).toEqual('/bar#@bar=baz')
      expect(mapper.parse('/:foo', '/bar#@bar=baz')).toEqual({ foo: 'bar', bar: 'baz' })
    })

    it('should parse optional paramters as undefined', function () {
      var mapper = urlMapper()

      expect(mapper.parse('/:foo/:bar?', '/bar/')).toEqual({
        foo: 'bar',
        bar: undefined
      })
    })
  })
})
