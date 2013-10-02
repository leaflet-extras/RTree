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
