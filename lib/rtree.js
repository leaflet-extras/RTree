'use strict';
var rectangle = require('./rectangle');
function RTree(width){
	if(!(this instanceof RTree)){
		return new RTree(width);
	}
	// Variables to control tree-dimensions
	var minWidth = 3;  // Minimum width of any node before a merge
	var maxWidth = 6;  // Maximum width of any node before a split
	if(!isNaN(width)){ minWidth = Math.floor(width/2.0); maxWidth = width;}
	// Start with an empty root-tree
	var rootTree = {x:0, y:0, w:0, h:0, id:'root', nodes:[] };
	this.root = rootTree;


	// This is my special addition to the world of r-trees
	// every other (simple) method I found produced crap trees
	// this skews insertions to prefering squarer and emptier nodes
	var flatten = function(tree){
		var todo = tree.slice();
		var done = [];
		var current;
		while(todo.length){
			current = todo.pop();
			if(current.nodes){
				todo=todo.concat(current.nodes);
			} else if (current.leaf) {
				done.push(current);
			}
		}
		return done;
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
		if(!rect || !rectangle.overlapRectangle(rect, root)){
			return retArray;
		}
		var retObj = {x:rect.x, y:rect.y, w:rect.w, h:rect.h, target:obj};
		
		countStack.push(root.nodes.length);
		hitStack.push(root);
		while(hitStack.length > 0) {
			tree = hitStack.pop();
			i = countStack.pop()-1;
			if('target' in retObj) { // will this ever be false?
				while(i >= 0){
					ltree = tree.nodes[i];
					if(rectangle.overlapRectangle(retObj, ltree)) {
						if( (retObj.target && 'leaf' in ltree && ltree.leaf === retObj.target) ||(!retObj.target && ('leaf' in ltree || rectangle.containsRectangle(ltree, retObj)))) {
							// A Match !!
						// Yup we found a match...
						// we can cancel search and start walking up the list
							if('nodes' in ltree) {// If we are deleting a node not a leaf...
								retArray = flatten(tree.nodes.splice(i, 1));
							} else {
								retArray = tree.nodes.splice(i, 1);
							}
							// Resize MBR down...
							rectangle.makeMBR(tree.nodes, tree);
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
					rectangle.makeMBR(tree.nodes, tree);
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
				rectangle.makeMBR(tree.nodes, tree);
			}
			currentDepth -= 1;
		}
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
		var first=true;
		bestChoiceStack.push(root);
		var nodes = root.nodes;

		while(first || bestChoiceIndex !== -1) {
			if(first) {
				first = false;
			} else {
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
				var oldLRatio = rectangle.squarifiedRatio(ltree.w, ltree.h, ltree.nodes.length+1);

				// Enlarge rectangle to fit new rectangle
				var nw = Math.max(ltree.x+ltree.w, rect.x+rect.w) - Math.min(ltree.x, rect.x);
				var nh = Math.max(ltree.y+ltree.h, rect.y+rect.h) - Math.min(ltree.y, rect.y);
			
				// Area of new enlarged rectangle
				var lratio = rectangle.squarifiedRatio(nw, nh, ltree.nodes.length+2);
				
				if(bestChoiceIndex < 0 || Math.abs(lratio - oldLRatio) < bestChoiceArea) {
					bestChoiceArea = Math.abs(lratio - oldLRatio); bestChoiceIndex = i;
				}
			}
		}

		return bestChoiceStack;
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
		return n;
	};
	
	/* insert the best source rectangle into the best fitting parent node: a or b
	 * [] = pickNext(array of source nodes, target node array a, target node array b)
	 * @private
	 */
	var pickNext = function(nodes, a, b) {
	// Area of new enlarged rectangle
		var areaA = rectangle.squarifiedRatio(a.w, a.h, a.nodes.length+1);
		var areaB = rectangle.squarifiedRatio(b.w, b.h, b.nodes.length+1);
		var highAreaDelta;
		var highAreaNode;
		var lowestGrowthGroup;
		
		for(var i = nodes.length-1; i>=0;i--) {
			var l = nodes[i];
			var newAreaA = {};
			newAreaA.x = Math.min(a.x, l.x); newAreaA.y = Math.min(a.y, l.y);
			newAreaA.w = Math.max(a.x+a.w, l.x+l.w) - newAreaA.x;	newAreaA.h = Math.max(a.y+a.h, l.y+l.h) - newAreaA.y;
			var changeNewAreaA = Math.abs(rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length+2) - areaA);
	
			var newAreaB = {};
			newAreaB.x = Math.min(b.x, l.x); newAreaB.y = Math.min(b.y, l.y);
			newAreaB.w = Math.max(b.x+b.w, l.x+l.w) - newAreaB.x;	newAreaB.h = Math.max(b.y+b.h, l.y+l.h) - newAreaB.y;
			var changeNewAreaB = Math.abs(rectangle.squarifiedRatio(newAreaB.w, newAreaB.h, b.nodes.length+2) - areaB);

			if( !highAreaNode || !highAreaDelta || Math.abs( changeNewAreaB - changeNewAreaA ) < highAreaDelta ) {
				highAreaNode = i;
				highAreaDelta = Math.abs(changeNewAreaB-changeNewAreaA);
				lowestGrowthGroup = changeNewAreaB < changeNewAreaA ? b : a;
			}
		}
		var tempNode = nodes.splice(highAreaNode, 1)[0];
		if(a.nodes.length + nodes.length + 1 <= minWidth)	{
			a.nodes.push(tempNode);
			rectangle.expandRectangle(a, tempNode);
		}	else if(b.nodes.length + nodes.length + 1 <= minWidth) {
			b.nodes.push(tempNode);
			rectangle.expandRectangle(b, tempNode);
		}
		else {
			lowestGrowthGroup.nodes.push(tempNode);
			rectangle.expandRectangle(lowestGrowthGroup, tempNode);
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
		return [
			{x:t1.x, y:t1.y, w:t1.w, h:t1.h, nodes:[t1]},
			{x:t2.x, y:t2.y, w:t2.w, h:t2.h, nodes:[t2]}
		];
	};
	
	var attachData = function(node, moreTree){
		node.nodes = moreTree.nodes;
		node.x = moreTree.x; node.y = moreTree.y;
		node.w = moreTree.w; node.h = moreTree.h;
		return node;
	};

	/* non-recursive internal search function
	* [ nodes | objects ] = searchSubtree(rectangle, [return node data], [array to fill], root to begin search at)
	 * @private
	 */
	var searchSubtree = function(rect, returnNode, returnArray, root) {
		var hitStack = []; // Contains the elements that overlap
	
		if(!rectangle.overlapRectangle(rect, root)){
			return returnArray;
		}
	
	
		hitStack.push(root.nodes);
	
		while(hitStack.length > 0){
			var nodes = hitStack.pop();
	
			for(var i = nodes.length-1; i >= 0; i--) {
				var ltree = nodes[i];
				if(rectangle.overlapRectangle(rect, ltree)) {
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
		}
		
		return returnArray;
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
		while(treeStack.length > 0) {
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
			if('leaf' in retObj || 'nodes' in retObj || Array.isArray(retObj)) {
				// Do Insert
				if(Array.isArray(retObj)) {
					for(var ai = 0; ai < retObj.length; ai++) {
						rectangle.expandRectangle(bc, retObj[ai]);
					}
					bc.nodes = bc.nodes.concat(retObj);
					} else {
					rectangle.expandRectangle(bc, retObj);
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
			} else { // Otherwise Do Resize
				//Just keep applying the new bounding rectangle to the parents..
				rectangle.expandRectangle(bc, retObj);
				retObj = {x:bc.x,y:bc.y,w:bc.w,h:bc.h};
			}
		}
	};

	this.insertSubtree = insertSubtree;
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
		return attachData(where, newTree);
	};
	
	/* non-recursive search function
	* [ nodes | objects ] = RTree.search(rectangle, [return node data], [array to fill])
	 * @public
	 */
	this.search = function(rect, returnNode, returnArray) {
		returnArray = returnArray||[];
		return searchSubtree(rect,returnNode,returnArray,rootTree);
	};
		
	
	var removeArea = function(rect){
		var numberDeleted = 1,
		retArray = [],
		deleted;
		while( numberDeleted > 0) {
			deleted = removeSubtree(rect,false,rootTree);
			numberDeleted = deleted.length;
			retArray = retArray.concat(deleted);
		}
			return retArray;
	};
	
	var removeObj=function(rect,obj){
		var retArray = removeSubtree(rect,obj,rootTree);
		return retArray;
	};
		/* non-recursive delete function
	 * [deleted object] = RTree.remove(rectangle, [object to delete])
	 */
	this.remove = function(rect, obj) {
		if(!obj||typeof obj==='function'){
			return removeArea(rect,obj);
		}else{
			return removeObj(rect,obj);
		}
	};
		
	/* non-recursive insert function
	 * [] = RTree.insert(rectangle, object to insert)
	 */
	this.insert = function(rect, obj) {
		var retArray = insertSubtree({x:rect.x,y:rect.y,w:rect.w,h:rect.h,leaf:obj}, rootTree);
		return retArray;
	};
}
RTree.prototype.toJSON = function(printing) {
	return JSON.stringify(this.root, false, printing);
};

RTree.fromJSON = function(json) {
	var rt = new RTree();
	rt.setTree(JSON.parse(json));
	return rt;
};

module.exports = RTree;


