/* partially-recursive toJSON function
	 * [ string ] = RTree.toJSON(callback)
	 * @public
	 */
	this.toJSON = function(rect, callback) {
		callback = callback||function(err,data){return data;};
		return callback(null,JSON.stringify(this.root));
	};
	
	RTree.fromJSON = function(json, callback) {
		callback = callback ||function(err,data){return data;};
		var rt = new RTree();
		rt.setTree(JSON.parse(json));
		return callback(null, rt);
	};
