mocha.setup({
	ui: "bdd",
	globals: ["console"],
	timeout: 2000000000
});

chai.should();

describe('RTree', function () {
	var rt = new RTree();
	describe('RTree Creation', function () {
		it('Insert 1k Objects',function() {
		var i = 1000;
				while(i > 0) {
					var bounds = {x:(Math.random()*10000), y:(Math.random()*10000), w:(Math.random()*500), h:(Math.random()*500)};
					rt.insert(bounds, "JUST A TEST OBJECT!_"+i);
					i--;
				}
			rt.search({x:0,y:0,w:10600,h:10600}).length.should.equal(1000);
		});
		it('Insert 1k more Objects',function() {
		var i = 1000;
				while(i > 0) {
					var bounds = {x:(Math.random()*10000), y:(Math.random()*10000), w:(Math.random()*500), h:(Math.random()*500)};
					rt.insert(bounds, "JUST A TEST OBJECT!_"+i);
					i--;
				}
			rt.search({x:0,y:0,w:10600,h:10600}).length.should.equal(2000);
		});
	});
	describe('RTree Searching', function () {
		it('1k Out-of-Bounds Searches', function() {
			var i = 1000;
			var len = 0;
			while(i > 0) {
				var bounds = {x:-(Math.random()*10000+501), y:-(Math.random()*10000+501), w:(Math.random()*500), h:(Math.random()*500)};
				len += rt.search(bounds).length;
				i--;
			}
			len.should.equal(0);
		});
		it('1k In-Bounds Searches', function() {
			var i = 1000;
			var len = 0;
			while(i > 0) {
				var bounds = {x:(Math.random()*10000), y:(Math.random()*10000), w:(Math.random()*500), h:(Math.random()*500)};
				len += rt.search(bounds).length;
				i--;
			}
			len.should.not.equal(0);
		});
	});
	describe('RTree Deletion', function(){
		var g_len = 0;
		it('Delete Half the RTree', function() {
			var bounds = {x:5000, y:0, w:5500, h:10500};
			g_len += rt.remove(bounds).length;
			g_len.should.not.equal(0);
		});
		it('Delete the Other Half of the RTree', function() {
			var bounds = {x:0, y:0, w:5000, h:10500};
			g_len += rt.remove(bounds).length;
			g_len.should.equal(2000);
		});
	});
});