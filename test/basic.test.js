var test = require('tape');
var data = require('./data');
var RTree = require('../lib');
test('RTree Creation', function(t) {
  var rt = new RTree();
  t.plan(2);
  data[0].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  t.equals(rt.search({
    x: 0,
    y: 0,
    w: 10600,
    h: 10600
  }).length, 1000, 'Insert 1k Objects');
  data[1].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  t.equals(rt.search({
    x: 0,
    y: 0,
    w: 10600,
    h: 10600
  }).length, 2000, 'Insert 1k more Objects');
});
