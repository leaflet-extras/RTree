var test = require('tape');
var data = require('./data');
var RTree = require('../lib');
test('JSON', function(t) {
  var rt = new RTree();
  data[1].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  data[0].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  var fromJson;
  t.plan(2);
  try {
    fromJson = rt.toJSON();
    JSON.parse(fromJson);
    t.pass('able to parse json');
  } catch (e) {
    t.fail('unable to parse json');
  }
  t.deepEqual(rt.getTree(), RTree.fromJSON(fromJson).getTree(), 'should work the other way');
});