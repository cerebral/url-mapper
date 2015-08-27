# url-mapper
Take a URL and map to functions, parsing params

```js
import route from 'url-mapper';

const someFunc = function (data) {
  data // {path: '/foo', params: {id: '123'}, query: {foo: 'bar'}
};

route(location.origin + '/foo/123', {
  '/foo/:id': someFunc
});
```
url-mapper passes an object representing the parsed URL to your route callbacks. Given the URL `http://www.bigapp.com/foo/123?bar=baz` and a matching route `/foo/:id`, your callbacks will receive:
```js
{
  path: '/foo',
  params: {id: 123},
  query: {bar: 'baz'}
}
```

This library allows you to take a url and map it to functions. It allows dynamic segments. You can pass a full url or just the path. It's not a full routing solution and is designed to be used with other libraries to map urls to functions.
