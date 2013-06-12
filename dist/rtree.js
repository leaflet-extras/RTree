/****************************************************************************** 
			rtree.js -Non-Recursive Javascript R-Tree Library
			Version 1.0.0, March 15th 2013

			https://github.com/leaflet-extras/RTree.
			******************************************************************************/
			(function(){
			/*global module,window,self */
			'use strict';
var RTree = function(width){
	// Variables to control tree-dimensions
	var minWidth = 3;  // Minimum width of any node before a merge
	var maxWidth = 6;  // Maximum width of any node before a split
	if(!isNaN(width)){ minWidth = Math.floor(width/2.0); maxWidth = width;}
	// Start with an empty root-tree
	var rootTree = {x:0, y:0, w:0, h:0, id:'root', nodes:[] };
	
	var isArray = function(o) {
		return Array.isArray?Array.isArray(o):Object.prototype.toString.call(o) === '[object Array]';
	};

	/* @function
	 * @description Function to generate unique strings for element IDs
	 * @param {String} n			The prefix to use for the IDs generated.
	 * @return {String}				A guarenteed unique ID.
	 */
	var nameToId = (function() {
		// hide our idCache inside this closure
		var idCache = {};

		// return the api: our function that returns a unique string with incrementing number appended to given idPrefix
		return function(idPrefix) {
			var idVal = 0;
			if(idPrefix in idCache) {
				idVal = idCache[idPrefix]++;
			} else {
				idCache[idPrefix] = 0;
			}
			return idPrefix + '_' + idVal;
		};
	})();

	// This is my special addition to the world of r-trees
	// every other (simple) method I found produced crap trees
	// this skews insertions to prefering squarer and emptier nodes
	RTree.Rectangle.squarifiedRatio = function(l, w, fill) {
		// Area of new enlarged rectangle
		var lperi = (l + w) / 2.0; // Average size of a side of the new rectangle
		var larea = l * w; // Area of new rectangle
		// return the ratio of the perimeter to the area - the closer to 1 we are,
		// the more 'square' a rectangle is. conversly, when approaching zero the
		// more elongated a rectangle is
		var lgeo = larea / (lperi*lperi);
		return(larea * fill / lgeo);
	};
	
	/* find the best specific node(s) for object to be deleted from
	 * [ leaf node parent ] = removeSubtree(rectangle, object, root)
	 * @private
	 */
	var removeSubtree = function(rect, obj, root) {
		var hitStack = []; // Contains the elements that overlap
		var countStack = []; // Contains the elements that overlap
		var retArray = [];
		var currentDepth = 1;
		var tree, i,ltree;
		if(!rect || !RTree.Rectangle.overlapRectangle(rect, root)){
			return retArray;
		}
		var retObj = {x:rect.x, y:rect.y, w:rect.w, h:rect.h, target:obj};
		
		countStack.push(root.nodes.length);
		hitStack.push(root);
		do {
			tree = hitStack.pop();
			i = countStack.pop()-1;
			if('target' in retObj) { // will this ever be false?
				while(i >= 0){
					ltree = tree.nodes[i];
					if(RTree.Rectangle.overlapRectangle(retObj, ltree)) {
						if( (retObj.target && 'leaf' in ltree && ltree.leaf === retObj.target) ||(!retObj.target && ('leaf' in ltree || RTree.Rectangle.containsRectangle(ltree, retObj)))) {
							// A Match !!
						// Yup we found a match...
						// we can cancel search and start walking up the list
							if('nodes' in ltree) {// If we are deleting a node not a leaf...
								retArray = searchSubtree(ltree, true, [], ltree);
								tree.nodes.splice(i, 1);
							} else {
								retArray = tree.nodes.splice(i, 1);
							}
							// Resize MBR down...
							RTree.Rectangle.makeMBR(tree.nodes, tree);
							delete retObj.target;
							//if(tree.nodes.length < minWidth) { // Underflow
							//	retObj.nodes = searchSubtree(tree, true, [], tree);
							//}
							break;
						}else if('nodes' in ltree) { // Not a Leaf
							currentDepth++;
							countStack.push(i);
							hitStack.push(tree);
							tree = ltree;
							i = ltree.nodes.length;
						}
					}
					i--;
				}
				
			} else if('nodes' in retObj) { // We are unsplitting
			
				tree.nodes.splice(i+1, 1); // Remove unsplit node
				if(tree.nodes.length > 0){
					RTree.Rectangle.makeMBR(tree.nodes, tree);
				}
				for(var t = 0;t<retObj.nodes.length;t++){
					insertSubtree(retObj.nodes[t], tree);
				}
				retObj.nodes = [];
				if(hitStack.length === 0 && tree.nodes.length <= 1) { // Underflow..on root!
					retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
					tree.nodes = [];
					hitStack.push(tree);
					countStack.push(1);
				} else if(hitStack.length > 0 && tree.nodes.length < minWidth) { // Underflow..AGAIN!
					retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
					tree.nodes = [];
				}else {
					delete retObj.nodes; // Just start resizing
				}
			} else { // we are just resizing
				RTree.Rectangle.makeMBR(tree.nodes, tree);
			}
			currentDepth -= 1;
		}while(hitStack.length > 0);
		return retArray;
	};

	/* choose the best damn node for rectangle to be inserted into
	 * [ leaf node parent ] = chooseLeafSubtree(rectangle, root to start search at)
	 * @private
	 */
	var chooseLeafSubtree = function(rect, root) {
		var bestChoiceIndex = -1;
		var bestChoiceStack = [];
		var bestChoiceArea;
	
		bestChoiceStack.push(root);
		var nodes = root.nodes;

		do {
			if(bestChoiceIndex !== -1)	{
				bestChoiceStack.push(nodes[bestChoiceIndex]);
				nodes = nodes[bestChoiceIndex].nodes;
				bestChoiceIndex = -1;
			}
	
			for(var i = nodes.length-1; i >= 0; i--) {
				var ltree = nodes[i];
				if('leaf' in ltree) {
					// Bail out of everything and start inserting
					bestChoiceIndex = -1;
					break;
				}
				// Area of new enlarged rectangle
				var oldLRatio = RTree.Rectangle.squarifiedRatio(ltree.w, ltree.h, ltree.nodes.length+1);

				// Enlarge rectangle to fit new rectangle
				var nw = Math.max(ltree.x+ltree.w, rect.x+rect.w) - Math.min(ltree.x, rect.x);
				var nh = Math.max(ltree.y+ltree.h, rect.y+rect.h) - Math.min(ltree.y, rect.y);
			
				// Area of new enlarged rectangle
				var lratio = RTree.Rectangle.squarifiedRatio(nw, nh, ltree.nodes.length+2);
				
				if(bestChoiceIndex < 0 || Math.abs(lratio - oldLRatio) < bestChoiceArea) {
					bestChoiceArea = Math.abs(lratio - oldLRatio); bestChoiceIndex = i;
				}
			}
		}while(bestChoiceIndex !== -1);

		return(bestChoiceStack);
	};

	/* split a set of nodes into two roughly equally-filled nodes
	 * [ an array of two new arrays of nodes ] = linearSplit(array of nodes)
	 * @private
	 */
	var linearSplit = function(nodes) {
		var n = pickLinear(nodes);
		while(nodes.length > 0)	{
			pickNext(nodes, n[0], n[1]);
		}
		return(n);
	};
	
	/* insert the best source rectangle into the best fitting parent node: a or b
	 * [] = pickNext(array of source nodes, target node array a, target node array b)
	 * @private
	 */
	var pickNext = function(nodes, a, b) {
	// Area of new enlarged rectangle
		var areaA = RTree.Rectangle.squarifiedRatio(a.w, a.h, a.nodes.length+1);
		var areaB = RTree.Rectangle.squarifiedRatio(b.w, b.h, b.nodes.length+1);
		var highAreaDelta;
		var highAreaNode;
		var lowestGrowthGroup;
		
		for(var i = nodes.length-1; i>=0;i--) {
			var l = nodes[i];
			var newAreaA = {};
			newAreaA.x = Math.min(a.x, l.x); newAreaA.y = Math.min(a.y, l.y);
			newAreaA.w = Math.max(a.x+a.w, l.x+l.w) - newAreaA.x;	newAreaA.h = Math.max(a.y+a.h, l.y+l.h) - newAreaA.y;
			var changeNewAreaA = Math.abs(RTree.Rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length+2) - areaA);
	
			var newAreaB = {};
			newAreaB.x = Math.min(b.x, l.x); newAreaB.y = Math.min(b.y, l.y);
			newAreaB.w = Math.max(b.x+b.w, l.x+l.w) - newAreaB.x;	newAreaB.h = Math.max(b.y+b.h, l.y+l.h) - newAreaB.y;
			var changeNewAreaB = Math.abs(RTree.Rectangle.squarifiedRatio(newAreaB.w, newAreaB.h, b.nodes.length+2) - areaB);

			if( !highAreaNode || !highAreaDelta || Math.abs( changeNewAreaB - changeNewAreaA ) < highAreaDelta ) {
				highAreaNode = i;
				highAreaDelta = Math.abs(changeNewAreaB-changeNewAreaA);
				lowestGrowthGroup = changeNewAreaB < changeNewAreaA ? b : a;
			}
		}
		var tempNode = nodes.splice(highAreaNode, 1)[0];
		if(a.nodes.length + nodes.length + 1 <= minWidth)	{
			a.nodes.push(tempNode);
			RTree.Rectangle.expandRectangle(a, tempNode);
		}	else if(b.nodes.length + nodes.length + 1 <= minWidth) {
			b.nodes.push(tempNode);
			RTree.Rectangle.expandRectangle(b, tempNode);
		}
		else {
			lowestGrowthGroup.nodes.push(tempNode);
			RTree.Rectangle.expandRectangle(lowestGrowthGroup, tempNode);
		}
	};

	/* pick the 'best' two starter nodes to use as seeds using the 'linear' criteria
	 * [ an array of two new arrays of nodes ] = pickLinear(array of source nodes)
	 * @private
	 */
	var pickLinear = function(nodes) {
		var lowestHighX = nodes.length-1;
		var highestLowX = 0;
		var lowestHighY = nodes.length-1;
		var highestLowY = 0;
		var t1, t2;
		
		for(var i = nodes.length-2; i>=0;i--){
			var l = nodes[i];
			if(l.x > nodes[highestLowX].x ){
				highestLowX = i;
			}else if(l.x+l.w < nodes[lowestHighX].x+nodes[lowestHighX].w){
				lowestHighX = i;
			}
			if(l.y > nodes[highestLowY].y ){
				highestLowY = i;
			}else if(l.y+l.h < nodes[lowestHighY].y+nodes[lowestHighY].h){
				lowestHighY = i;
			}
		}
		var dx = Math.abs((nodes[lowestHighX].x+nodes[lowestHighX].w) - nodes[highestLowX].x);
		var dy = Math.abs((nodes[lowestHighY].y+nodes[lowestHighY].h) - nodes[highestLowY].y);
		if( dx > dy )	{
			if(lowestHighX > highestLowX)	{
				t1 = nodes.splice(lowestHighX, 1)[0];
				t2 = nodes.splice(highestLowX, 1)[0];
			}	else {
				t2 = nodes.splice(highestLowX, 1)[0];
				t1 = nodes.splice(lowestHighX, 1)[0];
			}
		}	else {
			if(lowestHighY > highestLowY)	{
				t1 = nodes.splice(lowestHighY, 1)[0];
				t2 = nodes.splice(highestLowY, 1)[0];
			}	else {
				t2 = nodes.splice(highestLowY, 1)[0];
				t1 = nodes.splice(lowestHighY, 1)[0];
			}
		}
		return([{x:t1.x, y:t1.y, w:t1.w, h:t1.h, nodes:[t1]},
					{x:t2.x, y:t2.y, w:t2.w, h:t2.h, nodes:[t2]} ]);
	};
	
	var attachData = function(node, moreTree){
		node.nodes = moreTree.nodes;
		node.x = moreTree.x; node.y = moreTree.y;
		node.w = moreTree.w; node.h = moreTree.h;
		return(node);
	};

	/* non-recursive internal search function
	* [ nodes | objects ] = searchSubtree(rectangle, [return node data], [array to fill], root to begin search at)
	 * @private
	 */
	var searchSubtree = function(rect, returnNode, returnArray, root) {
		var hitStack = []; // Contains the elements that overlap
	
		if(!RTree.Rectangle.overlapRectangle(rect, root)){
			return(returnArray);
		}
	
	
		hitStack.push(root.nodes);
	
		do {
			var nodes = hitStack.pop();
	
			for(var i = nodes.length-1; i >= 0; i--) {
				var ltree = nodes[i];
				if(RTree.Rectangle.overlapRectangle(rect, ltree)) {
					if('nodes' in ltree) { // Not a Leaf
						hitStack.push(ltree.nodes);
					} else if('leaf' in ltree) { // A Leaf !!
						if(!returnNode) {
							returnArray.push(ltree.leaf);
						} else {
							returnArray.push(ltree);
						}
					}
				}
			}
		}while(hitStack.length > 0);
		
		return(returnArray);
	};
	
	/* non-recursive internal insert function
	 * [] = insertSubtree(rectangle, object to insert, root to begin insertion at)
	 * @private
	 */
	var insertSubtree = function(node, root) {
		var bc; // Best Current node
		// Initial insertion is special because we resize the Tree and we don't
		// care about any overflow (seriously, how can the first object overflow?)
		if(root.nodes.length === 0) {
			root.x = node.x; root.y = node.y;
			root.w = node.w; root.h = node.h;
			root.nodes.push(node);
			return;
		}
		
		// Find the best fitting leaf node
		// chooseLeaf returns an array of all tree levels (including root)
		// that were traversed while trying to find the leaf
		var treeStack = chooseLeafSubtree(node, root);
		var retObj = node;//{x:rect.x,y:rect.y,w:rect.w,h:rect.h, leaf:obj};
		var pbc;
		// Walk back up the tree resizing and inserting as needed
		do {
			//handle the case of an empty node (from a split)
			if(bc && 'nodes' in bc && bc.nodes.length === 0) {
				pbc = bc; // Past bc
				bc = treeStack.pop();
				for(var t=0;t<bc.nodes.length;t++){
					if(bc.nodes[t] === pbc || bc.nodes[t].nodes.length === 0) {
						bc.nodes.splice(t, 1);
						break;
					}
				}
			} else {
				bc = treeStack.pop();
			}
			
			// If there is data attached to this retObj
			if('leaf' in retObj || 'nodes' in retObj || isArray(retObj)) {
				// Do Insert
				if(isArray(retObj)) {
					for(var ai = 0; ai < retObj.length; ai++) {
						RTree.Rectangle.expandRectangle(bc, retObj[ai]);
					}
					bc.nodes = bc.nodes.concat(retObj);
					} else {
					RTree.Rectangle.expandRectangle(bc, retObj);
					bc.nodes.push(retObj); // Do Insert
				}
	
				if(bc.nodes.length <= maxWidth)	{ // Start Resizeing Up the Tree
					retObj = {x:bc.x,y:bc.y,w:bc.w,h:bc.h};
				}	else { // Otherwise Split this Node
					// linearSplit() returns an array containing two new nodes
					// formed from the split of the previous node's overflow
					var a = linearSplit(bc.nodes);
					retObj = a;//[1];
					
					if(treeStack.length < 1)	{ // If are splitting the root..
						bc.nodes.push(a[0]);
						treeStack.push(bc);	// Reconsider the root element
						retObj = a[1];
					} /*else {
						delete bc;
					}*/
				}
			}	else { // Otherwise Do Resize
				//Just keep applying the new bounding rectangle to the parents..
				RTree.Rectangle.expandRectangle(bc, retObj);
				retObj = {x:bc.x,y:bc.y,w:bc.w,h:bc.h};
			}
		} while(treeStack.length > 0);
	};

	/* quick 'n' dirty function for plugins or manually drawing the tree
	 * [ tree ] = RTree.getTree(): returns the raw tree data. useful for adding
	 * @public
	 * !! DEPRECATED !!
	 */
	this.getTree = function() {
		return rootTree;
	};
	
	/* quick 'n' dirty function for plugins or manually loading the tree
	 * [ tree ] = RTree.setTree(sub-tree, where to attach): returns the raw tree data. useful for adding
	 * @public
	 * !! DEPRECATED !!
	 */
	this.setTree = function(newTree, where) {
		if(!where){
			where = rootTree;
		}
		return(attachData(where, newTree));
	};
	
	/* non-recursive search function
	* [ nodes | objects ] = RTree.search(rectangle, [return node data], [array to fill])
	 * @public
	 */
	this.search = function(rect, returnNode, returnArray, callback) {
		if(typeof returnNode==='function'){
			callback = returnNode;
			returnNode=false;
			returnArray=[];
		}else if(typeof returnArray==='function'){
			callback = returnArray;
			returnArray=[];
		}
		returnArray = returnArray||[];
		if(callback){
			callback(null,searchSubtree(rect,returnNode,returnArray,rootTree));
		}else{
			return searchSubtree(rect,returnNode,returnArray,rootTree);
		}
	};
		
	/* partially-recursive toJSON function
	 * [ string ] = RTree.toJSON([rectangle], [tree])
	 * @public
	 */
	this.toJSON = function(rect, tree) {
		var hitStack = []; // Contains the elements that overlap
		var countStack = []; // Contains the elements that overlap
		var returnStack = {}; // Contains the elements that overlap
		var maxDepth = 3;  // This triggers recursion and tree-splitting
		var currentDepth = 1;
		var returnString = '';
		
		if(rect && !RTree.Rectangle.overlapRectangle(rect, rootTree)){
			return '';
		}
		
		if(!tree)	{
			countStack.push(rootTree.nodes.length);
			hitStack.push(rootTree.nodes);
			returnString += 'var mainTree = {x:'+rootTree.x.toFixed()+',y:'+rootTree.y.toFixed()+',w:'+rootTree.w.toFixed()+',h:'+rootTree.h.toFixed()+',nodes:[';
		}	else {
			maxDepth += 4;
			countStack.push(tree.nodes.length);
			hitStack.push(tree.nodes);
			returnString += 'var mainTree = {x:'+tree.x.toFixed()+',y:'+tree.y.toFixed()+',w:'+tree.w.toFixed()+',h:'+tree.h.toFixed()+',nodes:[';
		}
	
		do {
			var nodes = hitStack.pop();
			var i = countStack.pop()-1;
			
			if(i >= 0 && i < nodes.length-1){
				returnString += ',';
			}
				
			while(i >= 0){
				var ltree = nodes[i];
			if(!rect || RTree.Rectangle.overlapRectangle(rect, ltree)) {
				if(ltree.nodes) { // Not a Leaf
					if(currentDepth >= maxDepth) {
						//var len = returnStack.length;
						var nam = nameToId('savedSubtree');
						returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',load:"'+nam+'.js"}';
						returnStack[nam] = this.toJSON(rect, ltree);
							if(i > 0){
								returnString += ',';
							}
					}	else {
						returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',nodes:[';
						currentDepth += 1;
						countStack.push(i);
						hitStack.push(nodes);
						nodes = ltree.nodes;
						i = ltree.nodes.length;
					}
				}	else if(ltree.leaf) { // A Leaf !!
					var data = ltree.leaf.toJSON ? ltree.leaf.toJSON() : JSON.stringify(ltree.leaf);
					returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',leaf:' + data + '}';
						if(i > 0){
							returnString += ',';
						}
				}	else if(ltree.load) { // A load
					returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',load:"' + ltree.load + '"}';
						if(i > 0){
							returnString += ',';
						}
				}
				}
				i -= 1;
			}
			if(i < 0)	{
					returnString += ']}'; currentDepth -= 1;
			}
		}while(hitStack.length > 0);
		
		returnString+=';';
		
		for(var myKey in returnStack) {
			returnString += '\nvar ' + myKey + ' = function(){' + returnStack[myKey] + ' return(mainTree);};';
		}
		return(returnString);
	};
	
	var removeArea = function(rect,callback){
		var numberDeleted = 1,
		retArray = [],
		deleted;
		while( numberDeleted > 0) {
			deleted = removeSubtree(rect,false,rootTree);
			numberDeleted = deleted.length;
			retArray = retArray.concat(deleted);
		}
			return callback?callback(null, retArray):retArray;
	};
	
	var removeObj=function(rect,obj,callback){
		var retArray = removeSubtree(rect,obj,rootTree);
		return callback?callback(null, retArray):retArray;
	};
		/* non-recursive delete function
	 * [deleted object] = RTree.remove(rectangle, [object to delete])
	 */
	this.remove = function(rect, obj, callback) {
		if(!obj||typeof obj==='function'){
			return removeArea(rect,obj);
		}else{
			return removeObj(rect,obj,callback);
		}
	};
		
	/* non-recursive insert function
	 * [] = RTree.insert(rectangle, object to insert)
	 */
	this.insert = function(rect, obj, callback) {
		var retArray = insertSubtree({x:rect.x,y:rect.y,w:rect.w,h:rect.h,leaf:obj}, rootTree);
		return callback?callback(null, retArray):retArray;
	};
	


	
//End of RTree





/* partially-recursive toJSON function
	 * [ string ] = RTree.toJSON([rectangle], [tree])
	 * @public
	 */
	this.toJSON = function(rect, tree) {
		var hitStack = []; // Contains the elements that overlap
		var countStack = []; // Contains the elements that overlap
		var returnStack = {}; // Contains the elements that overlap
		var maxDepth = 3;  // This triggers recursion and tree-splitting
		var currentDepth = 1;
		var returnString = '';
		
		if(rect && !RTree.Rectangle.overlapRectangle(rect, rootTree)){
			return '';
		}
		
		if(!tree)	{
			countStack.push(rootTree.nodes.length);
			hitStack.push(rootTree.nodes);
			returnString += 'var mainTree = {x:'+rootTree.x.toFixed()+',y:'+rootTree.y.toFixed()+',w:'+rootTree.w.toFixed()+',h:'+rootTree.h.toFixed()+',nodes:[';
		}	else {
			maxDepth += 4;
			countStack.push(tree.nodes.length);
			hitStack.push(tree.nodes);
			returnString += 'var mainTree = {x:'+tree.x.toFixed()+',y:'+tree.y.toFixed()+',w:'+tree.w.toFixed()+',h:'+tree.h.toFixed()+',nodes:[';
		}
	
		do {
			var nodes = hitStack.pop();
			var i = countStack.pop()-1;
			
			if(i >= 0 && i < nodes.length-1){
				returnString += ',';
			}
				
			while(i >= 0){
				var ltree = nodes[i];
			if(!rect || RTree.Rectangle.overlapRectangle(rect, ltree)) {
				if(ltree.nodes) { // Not a Leaf
					if(currentDepth >= maxDepth) {
						//var len = returnStack.length;
						var nam = nameToId('savedSubtree');
						returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',load:"'+nam+'.js"}';
						returnStack[nam] = this.toJSON(rect, ltree);
							if(i > 0){
								returnString += ',';
							}
					}	else {
						returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',nodes:[';
						currentDepth += 1;
						countStack.push(i);
						hitStack.push(nodes);
						nodes = ltree.nodes;
						i = ltree.nodes.length;
					}
				}	else if(ltree.leaf) { // A Leaf !!
					var data = ltree.leaf.toJSON ? ltree.leaf.toJSON() : JSON.stringify(ltree.leaf);
					returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',leaf:' + data + '}';
						if(i > 0){
							returnString += ',';
						}
				}	else if(ltree.load) { // A load
					returnString += '{x:'+ltree.x.toFixed()+',y:'+ltree.y.toFixed()+',w:'+ltree.w.toFixed()+',h:'+ltree.h.toFixed()+',load:"' + ltree.load + '"}';
						if(i > 0){
							returnString += ',';
						}
				}
				}
				i -= 1;
			}
			if(i < 0)	{
					returnString += ']}'; currentDepth -= 1;
			}
		}while(hitStack.length > 0);
		
		returnString+=';';
		
		for(var myKey in returnStack) {
			returnString += '\nvar ' + myKey + ' = function(){' + returnStack[myKey] + ' return(mainTree);};';
		}
		return(returnString);
	};
var bbox = function (ar,obj) {
		if(obj && obj.bbox){
			return {leaf:obj,x:obj.bbox[0],y:obj.bbox[1],w:obj.bbox[2]-obj.bbox[0],h:obj.bbox[3]-obj.bbox[1]};
		}
		var len = ar.length;
		var i = 0;
		var a = new Array(len);
		while(i<len){
			a[i]=[ar[i][0],ar[i][1]];
			i++;
		}
		var first = a[0];
		len = a.length;
		i = 1;
		var temp = {min:[].concat(first),max:[].concat(first)};
		while (i<len) {
			if(a[i][0] < temp.min[0]) {
				temp.min[0] = a[i][0];
			}else if(a[i][0] > temp.max[0]) {
				temp.max[0] = a[i][0];
			}
			if(a[i][1] < temp.min[1]) {
				temp.min[1] = a[i][1];
			}else if(a[i][1] > temp.max[1]) {
				temp.max[1] = a[i][1];
			}
			i++;
		}
		var out =  {x:temp.min[0],y:temp.min[1],w:(temp.max[0]-temp.min[0]),h:(temp.max[1]-temp.min[1])};
		if(obj){
			out.leaf=obj;
		}
		return out;
	};
	var geoJSON = {};
	geoJSON.point = function(obj) {
		return(insertSubtree({x:obj.geometry.coordinates[0],y:obj.geometry.coordinates[1],w:0,h:0,leaf:obj}, rootTree));
	};
	geoJSON.multiPointLineString = function(obj) {
		return(insertSubtree(bbox(obj.geometry.coordinates,obj), rootTree));
	};
	geoJSON.multiLineStringPolygon = function(obj) {
		return(insertSubtree(bbox(Array.prototype.concat.apply([],obj.geometry.coordinates),obj), rootTree));
	};
	geoJSON.multiPolygon = function(obj) {
		return(insertSubtree(bbox(Array.prototype.concat.apply([],Array.prototype.concat.apply([],obj.geometry.coordinates)),obj), rootTree));
	};
	geoJSON.makeRec = function(obj){
		return new RTree.Rectangle(obj.x,obj.y,obj.w,obj.h);
	};
	geoJSON.geometryCollection = function(obj){
		if(obj.bbox){
			return(insertSubtree({leaf:obj,x:obj.bbox[0],y:obj.bbox[1],w:obj.bbox[2]-obj.bbox[0],h:obj.bbox[3]-obj.bbox[1]}, rootTree));
		}
		var geos = obj.geometry.geometries;
		var i = 0;
		var len = geos.length;
		var temp=[];
		var g;
		while(i<len){
			g=geos[i];
			switch(g.type){
					case 'Point':
						temp.push(geoJSON.makeRec({x:g.coordinates[0],y:g.coordinates[1],w:0,h:0}));
						break;
					case 'MultiPoint':
						temp.push(geoJSON.makeRec(bbox(g.coordinates)));
						break;
					case 'LineString':
						temp.push(geoJSON.makeRec(bbox(g.coordinates)));
						break;
					case 'MultiLineString':
						temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],g.coordinates))));
						break;
					case 'Polygon':
						temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],g.coordinates))));
						break;
					case 'MultiPolygon':
						temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([],Array.prototype.concat.apply([],g.coordinates)))));
						break;
					case 'GeometryCollection':
						geos=geos.concat(g.geometries);
						len = geos.length;
						break;
				}
			i++;
		}
		var first = temp[0];
		i=1;
		len = temp.length;
		while(i<len){
			first.expand(temp[i]);
			i++;
		}
		return insertSubtree({leaf:obj,x:first.x(),y:first.y(),h:first.h(),w:first.w()}, rootTree);
	};
	this.geoJSON=function(prelim, callback) {
		callback = callback||function(){return true;};
		var features,feature;
		if(isArray(prelim)) {
			features=prelim.slice();
		}else if(prelim.features && isArray(prelim.features)) {
			features=prelim.features.slice();
		}else{
			throw('this isn\'t what we\'re looking for');
		}
		var len = features.length;
		var i = 0;
		while(i<len){
			feature = features[i];
			if(feature.type === 'Feature'){
				switch(feature.geometry.type){
					case 'Point':
						geoJSON.point(feature);
						break;
					case 'MultiPoint':
						geoJSON.multiPointLineString(feature);
						break;
					case 'LineString':
						geoJSON.multiPointLineString(feature);
						break;
					case 'MultiLineString':
						geoJSON.multiLineStringPolygon(feature);
						break;
					case 'Polygon':
						geoJSON.multiLineStringPolygon(feature);
						break;
					case 'MultiPolygon':
						geoJSON.multiPolygon(feature);
						break;
					case 'GeometryCollection':
						geoJSON.geometryCollection(feature);
						break;
				}
			}
			i++;
		}
		return callback(null, true);
	};
	this.bbox=function(){
		var x1,y1,x2,y2,callback;
		switch(arguments.length){
			case 0:
				throw('not enough arguments');
			case 1:
				x1=arguments[0][0][0];
				y1=arguments[0][0][1];
				x2=arguments[0][1][0];
				y2=arguments[0][1][1];
				break;
			case 2:
				if(typeof arguments[1]==='function'){
					x1=arguments[0][0][0];
					y1=arguments[0][0][1];
					x2=arguments[0][1][0];
					y2=arguments[0][1][1];
					callback=arguments[1];
					break;
				}else{
					x1=arguments[0][0];
					y1=arguments[0][1];
					x2=arguments[1][0];
					y2=arguments[1][1];
					break;
				}
				break;
			case 3:
				x1=arguments[0][0];
				y1=arguments[0][1];
				x2=arguments[1][0];
				y2=arguments[1][1];
				callback=arguments[2];
				break;
			case 4:
				x1=arguments[0];
				y1=arguments[1];
				x2=arguments[2];
				y2=arguments[3];
				break;
			case 5:
				x1=arguments[0];
				y1=arguments[1];
				x2=arguments[2];
				y2=arguments[3];
				callback=arguments[4];
				break;
		}
		if(!callback){
			return this.search({x:x1,y:y1,w:x2-x1,h:y2-y1});
		}else{
			this.search({x:x1,y:y1,w:x2-x1,h:y2-y1},callback);
		}
	};
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
	
	this.toJSON = function() {
		return('{"x":'+x.toString()+', "y":'+y.toString()+', "w":'+w.toString()+', "h":'+h.toString()+'}');
	};
	
	this.overlap = function(a) {
		return(this.x() < a.x2() && this.x2() > a.x() && this.y() < a.y2() && this.y2() > a.y());
	};
	
	this.expand = function(a) {
		var nx = Math.min(this.x(), a.x());
		var ny = Math.min(this.y(), a.y());
		w = Math.max(this.x2(), a.x2()) - nx;
		h = Math.max(this.y2(), a.y2()) - ny;
		x = nx; y = ny;
		return(this);
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
		return(a.x <= (b.x+b.w) && (a.x+a.w) >= b.x && a.y <= (b.y+b.h) && (a.y+a.h) >= b.y);
	}else{
		return(a.x < (b.x+b.w) && (a.x+a.w) > b.x && a.y < (b.y+b.h) && (a.y+a.h) > b.y);
	}
};

/* returns true if rectangle a is contained in rectangle b
 * [ boolean ] = containsRectangle(rectangle a, rectangle b)
 * @static function
 */
RTree.Rectangle.containsRectangle = function(a, b) {
	return((a.x+a.w) <= (b.x+b.w) && a.x >= b.x && (a.y+a.h) <= (b.y+b.h) && a.y >= b.y);
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
	return(a);
};

/* generates a minimally bounding rectangle for all rectangles in
 * array 'nodes'. If rect is set, it is modified into the MBR. Otherwise,
 * a new rectangle is generated and returned.
 * [ rectangle a ] = makeMBR(rectangle array nodes, rectangle rect)
 * @static function
 */
RTree.Rectangle.makeMBR = function(nodes, rect) {
	if(nodes.length < 1){
		return({x:0, y:0, w:0, h:0});
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
		
	return(rect);
};if (typeof module !== 'undefined' && module.exports) {
	module.exports = rTree;
}else if(typeof document === 'undefined'){
	self.rTree = rTree;
	self.RTree = RTree;
}else{
	window.rTree = rTree;
	window.RTree = RTree;
}
})(this);
