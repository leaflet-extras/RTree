require('chai').should();
var data = require('./data');
var RTree = require('../lib');
describe('RTree Creation', function() {
	var rt = new RTree();
	it('Insert 1k Objects', function() {
		data[0].forEach(function(v) {
			rt.insert(v[0], v[1]);
		});
		var rslt = rt.search({
			x: 0,
			y: 0,
			w: 10600,
			h: 10600
		});
		rslt.should.have.length(1000);
	});
	it('Insert 1k more Objects', function() {
		data[1].forEach(function(v) {
			rt.insert(v[0], v[1]);
		});
		rt.search({
			x: 0,
			y: 0,
			w: 10600,
			h: 10600
		}).should.have.length(2000);
	});
});
describe('RTree Searching', function() {
	var rt = new RTree();
	data[0].forEach(function(v) {
		rt.insert(v[0], v[1]);
	});
	data[1].forEach(function(v) {
		rt.insert(v[0], v[1]);
	});
	it('1k Out-of-Bounds Searches', function() {
		var i = 1000;
		var len = 0;
		while (i > 0) {
			var bounds = {
				x: -(Math.random() * 10000 + 501),
				y: -(Math.random() * 10000 + 501),
				w: (Math.random() * 500),
				h: (Math.random() * 500)
			};
			len += rt.search(bounds).length;
			i--;
		}
		len.should.equal(0);
	});
	it('1k In-Bounds Searches', function() {
		var i = 1000;
		var len = 0;
		while (i > 0) {
			var bounds = {
				x: (Math.random() * 10000),
				y: (Math.random() * 10000),
				w: (Math.random() * 500),
				h: (Math.random() * 500)
			};
			len += rt.search(bounds).length;
			i--;
		}
		len.should.not.equal(0);
	});
});
