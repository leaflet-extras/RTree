var test = require('tape');
var data = require('./data');
var RTree = require('../lib');
test('RTree Deletion 1', function(t) {
  var rt = new RTree();
  data[0].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  data[1].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  var bounds = {
    x: 5000,
    y: 0,
    w: 5500,
    h: 10500
  };
  var expect = rt.search(bounds);
  var rslt = rt.remove(bounds).map(function(a) {
    return a.leaf;
  });
  t.plan(1);


  expect.forEach(function(a) {
    if(!~rslt.indexOf(a)) {
      t.fail('didn\'t include it');
    }
  });
  var rslt2 = rt.remove({
    x: 0,
    y: 0,
    w: 5000,
    h: 10500
  });
  t.equals((rslt2.length + rslt.length), 2000, 'got them all');
});
test('RTree Deletion 2', function(t) {
  var rt = new RTree();
  data[1].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  data[0].forEach(function(v) {
    rt.insert(v[0], v[1]);
  });
  var bounds = {
    x: 5000,
    y: 0,
    w: 5500,
    h: 10500
  };
  var expect = rt.search(bounds);
  var rslt = rt.remove(bounds).map(function(a) {
    return a.leaf;
  });
  t.plan(1);
  expect.forEach(function(a) {
    if(!~rslt.indexOf(a)) {
      t.fail('didn\'t include it');
    }
  });
  var rslt2 = rt.remove({
    x: 0,
    y: 0,
    w: 5000,
    h: 10500
  });
  t.equals((rslt2.length + rslt.length), 2000, 'got them all');
});