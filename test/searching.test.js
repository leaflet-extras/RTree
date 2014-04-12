var test = require('tape');
var data = require('./data');
var RTree = require('../lib');
test('RTree Searching', function(t) {
  var rt = new RTree();
  data[0].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  data[1].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  t.plan(2);
  var i = 1000;
  var len = 0;
  var bounds;
  while (i > 0) {
    bounds = {
      x: -(Math.random() * 10000 + 501),
      y: -(Math.random() * 10000 + 501),
      w: (Math.random() * 500),
      h: (Math.random() * 500)
    };
    len += rt.search(bounds).length;
    i--;
  }
  t.equals(len, 0, '1k Out-of-Bounds Searches');
  i = 1000;
  len = 0;
  while (i > 0) {
    bounds = {
      x: (Math.random() * 10000),
      y: (Math.random() * 10000),
      w: (Math.random() * 500),
      h: (Math.random() * 500)
    };
    len += rt.search(bounds).length;
    i--;
  }
  t.notEqual(len, 0, '1k In-Bounds Searches');
});