var urlMapper = require('url-mapper')({ query: true })

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

var url = urlMapper.stringify('/:foo', object)
console.log(url)

var parsed = urlMapper.parse('/:foo', url)
console.log(parsed)

var mapped = urlMapper.map(url, {
  '/:foo': 'one',
  '/:foo/bar': 'two'
})
console.log(mapped)
