var urlMapper = require('url-mapper')({ query: true })

var object = {
  foo: 'bar',
  bar: true,
  baz: {
    foo: false,
    bar: 2,
    baz: ['foo', 'bar', 'baz', true, false, undefined, null],
    qux: '',
    quux: null,
    garply: undefined,
  },
}

var url = urlMapper.stringify('/:foo', object)
console.log(url)

var parsed = urlMapper.parse('/:foo', url)
console.log(parsed)

var mapped = urlMapper.map(url, {
  '/:foo': 'one',
  '/:foo/bar': 'two',
})
console.log(mapped)
