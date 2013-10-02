require('chai').should();
var data = require('./data');
var RTree = require('../lib');
describe('JSON', function() {
	var rt = new RTree();
	data[1].forEach(function(v) {
		rt.insert(v[0], v[1]);
	});
	data[0].forEach(function(v) {
		rt.insert(v[0], v[1]);
	});
	var fromJson;
	it('should produce valid json', function() {
		fromJson = rt.toJSON();
		JSON.parse(fromJson);
	});
	it('should work the other way', function() {
		rt.getTree().should.deep.equal(RTree.fromJSON(fromJson).getTree());
	});
});