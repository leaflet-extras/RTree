var test = require('tape');
var RTree = require('../lib');
test('RTree Searching for exact point', function(t) {
  var rt = new RTree();
  t.plan(1);
  var data = [];
  for(var i = 0; i < 1000; i++) {
    data[i] = {x: Math.random() * 10, y: Math.random() * 10, w: 0, h: 0};
    rt.insert(data[i], {});
  }

  var len = 0;
  var bounds;
  for(var i = 0; i < 1000; i++) {
    bounds = {
      x: data[i].x,
      y: data[i].y,
      w: 0,
      h: 0
    };
    len += rt.search(bounds).length;
  }
  t.equal(len, 1000, '1k In-Bounds Searches');
});
