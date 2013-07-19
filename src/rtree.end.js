}
RTree.isArray = function(o) {
	return Array.isArray?Array.isArray(o):Object.prototype.toString.call(o) === '[object Array]';
};
var rTree = function(width, callback){
	var temp,err;
	if(typeof width === 'function'){
		callback = width;
		width = undefined;
	}
	if(!callback){
		return new RTree(width);
	}else{
		try{
			temp = new RTree(width);
		}catch(e){
			err=e;
		}finally{
			callback(err,temp);
		}
	}
};
rTree.isArray = RTree.isArray;
if (typeof module !== 'undefined' && module.exports) {
	module.exports = rTree;
}else if(typeof document === 'undefined'){
	self.rTree = rTree;
	self.RTree = RTree;
}else{
	window.rTree = rTree;
	window.RTree = RTree;
}
})(this);