#rTree

A non-recursive R-Tree library in pure JavaScript with no dependencies. Fork of [Jon-Carlos Rivera's fantastic library](https://github.com/imbcmdth/RTree) which sadly seems not to be maintained. MIT Licensed. 

[![Selenium Test Status](https://saucelabs.com/browser-matrix/rtrees.svg)](https://saucelabs.com/u/rtrees)

##So far:

- Bugfix when deleting points.
- Common.js module.
- Updated tests.
- Factory function for constructor.
- Method for dealing with GeoJSON.
- All methods now accept callbacks.
- Query by bbox instead of rectangle. 
- Submit to NPM.
- Update examples.
- add closure
- add GruntFile
- fix syntax (make it pass jslint)

##todo

- more modular
- that bug with deleting

##API

-  *rTree* ( _[ Number **max_node_width**, Function **callback** ]_ )

###Parameters: 

-  **max_node_width** : _optional_ : The maximum width of a node before a split is performed[<sup>1</sup>](#f1).
-  **callback** : _optional_ : Function to send the rTree to when it's created[<sup>2</sup>](#f2).

###Returns: 

-  An empty **rTree** object.

###Usage: 

-  Make a new rTree with a max node width of 10:
- `var myRTree = rTree(10);`
-  do the same async:
-  `rTree(10,function(err,myRTree){...code goes here...});`
-  don't have to do it all in the closure fyi
-  `var myRTree;rTree(function(err,rt){myRTree=rTree;});`


##rTree.insert

-  **rTree.insert** ( Rectangle[<sup>3</sup>](#f3) **bounds**, Object **element** _[, Function **callback** ]_ )

###Parameters: 

-  **bounds** : **required** : A minimally bounding box for **element**.
- **element** : **required** : An object to add to the R-Tree.
- **callback** : _optional_ : Function called after the nodes are inserted[<sup>2</sup>](#f2).

###Returns: 

-  True.

###Usage: 

-  Insert a 10x10 object that starts at position 10x10:
- `myRTree.insert({x:10, y:10, w:10, h:10}, myObject);`


##rTree.remove

-  **rTree.remove** ( Rectangle[<sup>3</sup>](#f3) **area** _[, Object **element**, Function **callback**]_ )

###Parameters: 

-  **area** : **required** : An area to search within.
- **element** : _optional_ : An object to remove from the R-Tree. If no object is specified, *all* elements that touch *area* are deleted.
- **callback** : _optional_ : Function called after the nodes are removed[<sup>2</sup>](#f2).

###Returns: 

-  An array of leafs deleted from the R-Tree.

###Usage: 

- Deletes all object that touch the 10x10 rectangle starting at position 10x10:
- `var myDelCount = myRTree.delete({x:10, y:10, w:10, h:10});`
- Delete only specific_object if it touches the 10x10 rectangle starting at position 10x10:
- `var myDelCount = myRTree.delete({x:10, y:10, w:10, h:10}, specific_object);`

##rTree.geoJSON:

- **rTree.geoJSON** ( Object or Array **geoJSON** _[, Function **callback**]_ )

###Parameters

- **geoJSON** : **required** : Either an Object representing a GeoJSON feature collection or an Array representing a list of GeoJSON features.
- **callback** : _optional_ : Function called after the features are added[<sup>2</sup>](#f2).

###Returns: 

- True

###Usage:

```JavaScript
myRTree.geoJSON({
	"type":"FeatureCollection",
	"features":[
		{
			"type":"Feature",
			"geometry":{
				"type":"Point",
				"coordinates":[100,1]
			},
			"properties":{
				"prop0":"value0"
			}
		},
		{
			"type":"Feature",
			"geometry":{
				"type":"LineString",
				"coordinates":[
					[100,0],
					[101,1]
				]
			},
			"properties":{
				"prop0":"value0"
			}
		}
	]
});
```

##rTree.bbox:

-  **rTree.bbox** ( Bounds **area** _[, Function **callback**]_ )

###Parameters

-  **area** : **required** : Area to search, this can either be represented by a single parameter bounds array `[[x1,y1],[x2,y2]]`, two parameters representing the southwest and northeast corners `[x1,y1],[x2,y2]`, or 4 parameters of `[x1,y1,x2,y2]`.  
- **callback** : _optional_ : Function called with the results<sup>2</sup>](#f2).

###Returns:

- An array of matched features.

###Usage:
- Search a 10x10 area that starts at position 10x10 (these are all equivilent):
- `var myObjects1 = myRTree.bbox([[10,10],[20,20]]);`
- `var myObjects2; myRTree.bbox([[10,10],[20,20]], function(err,data){if(!err){myObjects2 = data}});`
- `var myObjects3 = myRTree.bbox([10,10],[20,20]);`
- `var myObjects4; myRTree.bbox([10,10],[20,20], function(err,data){if(!err){myObjects4 = data}});`
- `var myObjects5 = myRTree.bbox(10,10,20,20);`
- `var myObjects6; myRTree.bbox(10,10,20,20, function(err,data){if(!err){myObjects6 = data}});`

##rTree.search

-  **RTree.search** ( Rectangle[<sup>3</sup>](#f3) **area** [, Boolian **return_node**, Array **return_array**, Function **callback**] )

###Parameters: 

-  **area** : **required** : An area to search within.
-  **return_node** : _optional_ : Whether to return the entire node, mainly internal option.
-  **return_array** : _optional_ : An existing array to add the results to, defaults to [], mainly internal option.
- **callback** : _optional_ : Function called with the results<sup>2</sup>](#f2).

###Returns: 

-  An array of objects that overlap or touch **area**.

###Usage: 

-  Search a 10x10 area that starts at position 10x10:
- `var myObjects = myRTree.search({x:10, y:10, w:10, h:10});`


###Notes

<sup><a name="f1">1</a></sup> Default max node width is currently 6.

<sup><a name="f2">2</a></sup> All callbacks are optional and follow the node.js convention of the first parameter being an error object which is undefined unless there is an error and the second parameter being whatever the method would have returned.

<sup><a name="f3">3</a></sup> A _Rectangle_ is **any** object with public x, y, w, h properties. The object itself is not saved or used directly but copies are made of its x, y, w, h properties.