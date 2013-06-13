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