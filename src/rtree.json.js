this.toJSON = function(printing) {
	return JSON.stringify(this.root, false, printing);
};

RTree.fromJSON = function(json) {
	var rt = new RTree();
	rt.setTree(JSON.parse(json));
	return rt;
};
