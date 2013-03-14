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
					var bounds = {x:(Math.random()*10000), y:(Math.random()*10000), w:(0), h:(0)};
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
	describe('GeoJSON', function(){
		var gTree;
		var geoJson={"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[100,1]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,1]},{"type":"LineString","coordinates":[[102,0],[103,1]]}]}]},"properties":{"prop0":"value0"}}]};
		var geoJsonCopy={"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[100,1]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,1]},{"type":"LineString","coordinates":[[102,0],[103,1]]}]}]},"properties":{"prop0":"value0"}}]};

		it('should be able to use the factory function', function() {
			gTree=rTree();
			gTree.should.be.an.instanceOf(RTree);
		});
		it('should be able to add geojson without modifying the original',function(){
			gTree.geoJSON(geoJson);
			geoJson.should.deep.equal(geoJsonCopy);
		});
		it('should be able to get geojson',function(){
			var result = gTree.bbox([0,0],[500,500]);
			result.sort(function(a,b){return JSON.stringify(a).length-JSON.stringify(b).length});
			geoJsonCopy.features.sort(function(a,b){return JSON.stringify(a).length-JSON.stringify(b).length});
			result.should.deep.equal(geoJsonCopy.features);
		});
	});
	describe('async', function(){
		it('should be able to use the factory function', function(done) {
			rTree(function(err,gTree){
				gTree.should.be.an.instanceOf(RTree);
				done();
			});
		});
		it('should be able to use the factory function with a width', function(done) {
			rTree(3,function(err,gTree){
				gTree.should.be.an.instanceOf(RTree);
				done();
			});
		});
		it('should be able to get geojson',function(done){
			var geoJson={"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[100,1]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,1]},{"type":"LineString","coordinates":[[102,0],[103,1]]}]}]},"properties":{"prop0":"value0"}}]};
			rTree(function(err,gTree){
				gTree.geoJSON(geoJson,function(err,success){
					var num = 0;
					var tick = function(){
						if(num === 3){
							done();
						}
					};
					if(success){
						gTree.bbox([99,1],[101,3],function(err,result){
							result.length.should.equal(3);
							num++;
							tick();
						});
						gTree.bbox([[99,0],[101,2]],function(err,result){
							var geoJsonCopy={"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[100,1]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,1]},{"type":"LineString","coordinates":[[102,0],[103,1]]}]}]},"properties":{"prop0":"value0"}}]};
							result.sort(function(a,b){return JSON.stringify(a).length-JSON.stringify(b).length});
							geoJsonCopy.features.sort(function(a,b){return JSON.stringify(a).length-JSON.stringify(b).length});
							result.should.deep.equal(geoJsonCopy.features);
							num++;
							tick();
						});
						gTree.bbox(100,2,100,2,function(err,result){
							result.length.should.equal(2);
							num++;
							tick();
						});
					}	
				});
			});
		});
		it('should be able to delete geojson',function(done){
			var geoJson={"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[100,1]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},"properties":{"prop0":"value0"}},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]},{"type":"MultiPoint","coordinates":[[100,0],[101,1]]},{"type":"MultiLineString","coordinates":[[[100,0],[101,1]],[[102,2],[103,3]]]},{"type":"MultiPolygon","coordinates":[[[[102,2],[103,2],[103,3],[102,3],[102,2]]],[[[100,0],[101,0],[101,1],[100,1],[100,0]],[[100.2,0.2],[100.8,0.2],[100.8,0.8],[100.2,0.8],[100.2,0.2]]]]},{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,1]},{"type":"LineString","coordinates":[[102,0],[103,1]]}]}]},"properties":{"prop0":"value0"}}]};
			rTree(function(err,gTree){
				gTree.geoJSON(geoJson,function(err,success){
					if(success){
						gTree.remove({x:0,y:0,h:500,w:500},function(err,result){
							result.length.should.equal(geoJson.features.length);
						});
					}
				});
			});
		});
	});
});