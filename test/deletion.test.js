require('chai').should();
var data = require('./data');
var RTree = require('../lib');
describe('RTree Deletion 1', function() {
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
	it('same result as a search?', function() {


		expect.forEach(function(a) {
			//console.log(a,rslt[0]);
			rslt.should.include(a);
		});
	});
	it('get them all?', function() {
		var rslt2 = rt.remove({
			x: 0,
			y: 0,
			w: 5000,
			h: 10500
		});
		(rslt2.length + rslt.length).should.equal(2000);
	});
});
describe('RTree Deletion 2', function() {
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
	it('same result as a search?', function() {


		expect.forEach(function(a) {
			//console.log(a,rslt[0]);
			rslt.should.include(a);
		});
	});
	it('get them all?', function() {
		var rslt2 = rt.remove({
			x: 0,
			y: 0,
			w: 5000,
			h: 10500
		});
		(rslt2.length + rslt.length).should.equal(2000);
	});
});