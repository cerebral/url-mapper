var urlMapper = require('../index')();
var URLON = require('URLON');

module.exports = {
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
