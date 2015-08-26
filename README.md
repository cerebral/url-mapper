# url-mapper
Take a URL and map to functions, parsing params

```js
import route from 'url-mapper';

const someFunc = function (data) {
  data // {path: '/foo', params: {id: '123'}}
};

route(location.origin + '/foo/123', {
  '/foo/:id': someFunc
});
```

This library allows you to take a url and map it to functions. It allows dynamic segments. You can pass a full url or just the path. To be used with other libraries to map urls to functions.
