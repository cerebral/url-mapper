# url-mapper
Take a URL and map to functions, parsing params

```js
import route from 'url-mapper';

const someFunc = function (data) {
  data // {url: '/foo/123?foo=bar', path: '/foo', params: {id: '123'}, query: {foo: 'bar'}}
};

const notFoundFunc = function (data) { };

route(location.origin + '/foo/123', {
  '/foo/:id': someFunc,
  '*': notFoundFunc
});
```
**url-mapper** passes an object representing the parsed URL to your route callbacks. Given the URL `http://www.bigapp.com/foo/123?bar=baz` and a matching route `/foo/:id`, your callbacks will receive:
```js
{
  url: '/foo/123?bar=baz',
  path: '/foo/123',
  params: {id: 123},
  query: {bar: 'baz'}
}
```

This library just allows you to map a url to a function. It allows dynamic segments and you can pass a full url or just the path. It's designed to be used with other libraries to manage URLs in your applications.
