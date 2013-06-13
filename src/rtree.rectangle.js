RTree.Rectangle = function(ix, iy, iw, ih) { // new Rectangle(bounds) or new Rectangle(x, y, w, h)
	var x, x2, y, y2, w, h;

	if(ix.x) {
		x = ix.x; y = ix.y;
			if(ix.w !== 0 && !ix.w && ix.x2){
				w = ix.x2-ix.x;	h = ix.y2-ix.y;
			}	else {
				w = ix.w;	h = ix.h;
			}
		x2 = x + w; y2 = y + h; // For extra fastitude
	} else {
		x = ix; y = iy;	w = iw;	h = ih;
		x2 = x + w; y2 = y + h; // For extra fastitude
	}

	this.x1 = this.x = function(){return x;};
	this.y1 = this.y = function(){return y;};
	this.x2 = function(){return x2;};
	this.y2 = function(){return y2;};
	this.w = function(){return w;};
	this.h = function(){return h;};
	
	
	this.overlap = function(a) {
		return this.x() < a.x2() && this.x2() > a.x() && this.y() < a.y2() && this.y2() > a.y();
	};
	
	this.expand = function(a) {
		var nx = Math.min(this.x(), a.x());
		var ny = Math.min(this.y(), a.y());
		w = Math.max(this.x2(), a.x2()) - nx;
		h = Math.max(this.y2(), a.y2()) - ny;
		x = nx; y = ny;
		return this;
	};
	
	this.setRect = function(ix, iy, iw, ih) {
		var x, x2, y, y2, w, h;
		if(ix.x) {
			x = ix.x;
			y = ix.y;
			if(ix.w !== 0 && !ix.w && ix.x2) {
				w = ix.x2-ix.x;
				h = ix.y2-ix.y;
			}	else {
				w = ix.w;
				h = ix.h;
			}
			x2 = x + w; y2 = y + h; // For extra fastitude
		} else {
			x = ix;
			y = iy;
			w = iw;
			h = ih;
			x2 = x + w;
			y2 = y + h; // For extra fastitude
		}
	};
//End of RTree.Rectangle
};


/* returns true if rectangle 1 overlaps rectangle 2
 * [ boolean ] = overlapRectangle(rectangle a, rectangle b)
 * @static function
 */
RTree.Rectangle.overlapRectangle = function(a, b) {
	if((a.h===0&&a.w===0)||(b.h===0&&b.w===0)){
		return a.x <= (b.x+b.w) && (a.x+a.w) >= b.x && a.y <= (b.y+b.h) && (a.y+a.h) >= b.y;
	}else{
		return a.x < (b.x+b.w) && (a.x+a.w) > b.x && a.y < (b.y+b.h) && (a.y+a.h) > b.y;
	}
};

/* returns true if rectangle a is contained in rectangle b
 * [ boolean ] = containsRectangle(rectangle a, rectangle b)
 * @static function
 */
RTree.Rectangle.containsRectangle = function(a, b) {
	return (a.x+a.w) <= (b.x+b.w) && a.x >= b.x && (a.y+a.h) <= (b.y+b.h) && a.y >= b.y;
};

/* expands rectangle A to include rectangle B, rectangle B is untouched
 * [ rectangle a ] = expandRectangle(rectangle a, rectangle b)
 * @static function
 */
RTree.Rectangle.expandRectangle = function(a, b)	{
	var nx = Math.min(a.x, b.x);
	var ny = Math.min(a.y, b.y);
	a.w = Math.max(a.x+a.w, b.x+b.w) - nx;
	a.h = Math.max(a.y+a.h, b.y+b.h) - ny;
	a.x = nx; a.y = ny;
	return a;
};

/* generates a minimally bounding rectangle for all rectangles in
 * array 'nodes'. If rect is set, it is modified into the MBR. Otherwise,
 * a new rectangle is generated and returned.
 * [ rectangle a ] = makeMBR(rectangle array nodes, rectangle rect)
 * @static function
 */
RTree.Rectangle.makeMBR = function(nodes, rect) {
	if(nodes.length < 1){
		return {x:0, y:0, w:0, h:0};
	}
		//throw 'makeMBR: nodes must contain at least one rectangle!';
	if(!rect){
		rect = {x:nodes[0].x, y:nodes[0].y, w:nodes[0].w, h:nodes[0].h};
	} else {
		rect.x = nodes[0].x; rect.y = nodes[0].y; rect.w = nodes[0].w; rect.h = nodes[0].h;
	}
		
	for(var i = nodes.length-1; i>0; i--){
		RTree.Rectangle.expandRectangle(rect, nodes[i]);
	}
		
	return rect;
};