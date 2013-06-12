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