# url-mapper
Two way `URL` <==> `route(params)` converter with mapper.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![bitHound Score][bithound-image]][bithound-url]
[![Commitizen friendly][commitizen-image]][commitizen-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]
[![js-standard-style][standard-image]][standard-url]

## Installation

`npm install url-mapper --save`

## Usage

### Overview

The main purpose of `url-mapper` is to match given `URL` to one of the `routes`.
It will return the matched route (key and associated value) and parsed parameters.
You can associate anything you want with route: function, React component or just plain object.

`url-mapper` is helpful when creating router packages for frameworks or can be used as router itself.
It allows you to outsource working with a url (mapping, parsing, stringifying) and concentrate on wiring up things related to your favorite framework.

### Example

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Mapper from 'url-mapper';
import { CoreApp, ComponentA, ComponentB, Component404 } from './components';

const urlMapper = Mapper();

var matchedRoute = urlMapper.map('/bar/baz/:42', { // routable part of url
  '/foo/:id': ComponentA,
  '/bar/:list/:itemId': ComponentB,
  '*': Component404
});

if (matchedRoute) {
  const Component = matchedRoute.match; // ComponentB
  const props = matchedRoute.values; // { list: 'baz', itemId: 42 }

  ReactDOM.render(
    <CoreApp>
      <Component {...props} />
    </CoreApp>
  );
}
```

See [`cerebral-router`](https://github.com/cerebral/cerebral-router) as an example of building your own router solution on top of `url-mapper`.
Also see [example at Tonic Sandbox](https://tonicdev.com/npm/url-mapper) to try it right in your browser.

## API

### Main module

At top level the `url-mapper` module exports a factory which returns default implementation of an `URL` <==> `route(params)` converter.

#### Factory
##### Usage

```js
var urlMapper = require('url-mapper');
var mapper = urlMapper(options);
```

##### Arguments

<table>
  <tr>
    <th>Param</th><th>Type</th><th>Details</th>
  </tr>
  <tr>
    <td>options</th><td><code>Object</code></td>
    <td>Options passed to converter.
      <table>
        <tr>
          <th>Property</th><th>Type</th><th>Details</th>
        </tr>
        <tr>
          <td>query</td><td><code>Boolean</code></td>
          <td>Enables converting values not defined in route as query in URL Object Notation</td>
        </tr>
        <tr>
          <td>querySeparator</td><td><code>String</code></td>
          <td>String used to separate query from routable part. Default <code>'?'</code>.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

##### Returns

`Object` - Object with `parse`, `stringify` and `map` methods.

Returned methods deals with Express-style route definitions and cleaned routable part of url (without origin, base path, leading hash symbol).

Params defined in route are mapped to the same named properties in the `values` Object with help of `path-to-regexp` module.
It is safe to pass Numbers and Booleans as well as Strings as path parameteres.
The original type would be preserved while parsing back stringified one.

By default, the query part is ignored.
Query part params are mapped to the same named properties in `values` Object if `{ query: true }` option was passed to factory.
Conversion of the query part is made with help of `URLON` module. Therefore, it can accept any JSON serializable value.

Hash part is ignored at all if any present.
You still can manage your routes in `location.hash` but don't provide `#` symbol before routable part.

#### `parse` method

##### Usage

`mapper.parse(route, url)`;

##### Arguments

Param | Type     | Details
------|----------|--------
route | `String` | Express style route definition
url   | `String` | Routable part of url

##### Returns

`Object` - values parsed from `url` with given `route`.

Path parsed using `path-to-regexp` module, tweaked to support `Boolean` and `Number`.
Query part parsed with `URLON` module if { query: true } option was passed to factory.

#### `stringify` method

##### Usage

`mapper.stringify(route, values)`;

##### Arguments

Param  | Type     | Details
-------|----------|--------
route  | `String` | Express style route definition
values | `Object` | Object used to populate parameters in route definition

##### Returns

`String` - values stringified to `url` with given `route`.

Properties defined in route are stringified to path part using `path-to-regexp` module, tweaked to support `Boolean` and `Number`.
Properties not defined in route are stringified to query part using `URLON` module if { query: true } option was passed to factory.

#### `map` method

##### Usage

`mapper.map(url, routes)`;

##### Arguments

Param  | Type     | Details
-------|----------|--------
url    | `String` | Routable part of url
routes | `Object` | Routes to map url with

##### Returns

`Object` - Object representing matched route with properties:

Property  | Type     | Details
----------|----------|--------
route     | `String` | Matched `route` defined as key in `routes`
match     | `Any`    | Value from `routes` associated with matched `route`
values    | `Object` | Values parsed from given `url` with matched `route`

### Matcher

Custom converting algoritms could be implemented by providing a custom compile function.
If you don't like default route definition format or converting algorithms, feel free to make your own.

#### Factory
##### Usage

```js
var urlMapper = require('url-mapper/mapper');
var mapper = urlMapper(compileFn, options);
```

##### Arguments

Param     | Type       | Details
----------|------------|--------
compileFn | `Function` | Function used by mapper to "compile" a route.
options   | `Any`      | `Optional`. Passed to `compileFn` as second argument.

For each route mapper would call `compileFn(route, options)` and cache result internally.
`compileFn` should return `parse(url)` and `stringify(values)` methods for any given route.
See [default implementation](/compileRoute.js) for reference.

##### Returns

`Object` - Object with `parse(route, url)`, `stringify(route, values)` and `map(url, routes)` methods.

These methods will use cached methods returned by `compileFn` for given routes.

[npm-image]: https://img.shields.io/npm/v/url-mapper.svg?style=flat
[npm-url]: https://npmjs.org/package/url-mapper
[travis-image]: https://img.shields.io/travis/cerebral/url-mapper.svg?style=flat
[travis-url]: https://travis-ci.org/cerebral/url-mapper
[coveralls-image]: https://img.shields.io/coveralls/cerebral/url-mapper.svg?style=flat
[coveralls-url]: https://coveralls.io/r/cerebral/url-mapper?branch=master
[bithound-image]: https://www.bithound.io/github/cerebral/url-mapper/badges/score.svg
[bithound-url]: https://www.bithound.io/github/cerebral/url-mapper
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
