require('chai').should();
var data = require('./data');
var RTree = require('../lib');
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