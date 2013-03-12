#RTree

A non-recursive R-Tree library in pure JavaScript with no dependencies. MIT Licensed.

##API

-  *RTree* ( _[ Number **max_node_width** ]_ )

###Parameters: 

-  **max_node_width** : _optional_ : The maximum width of a node before a split is performed[<sup>1</sup>](#f1).

###Returns: 

-  An empty **RTree** object.

###Usage: 

-  Make a new RTree with a max node width of 10:
- `var myRTree = new RTree(10);`


###RTree.insert

-  **RTree.insert** ( Rectangle[<sup>2</sup>](#f2) **bounds**, Object **element** )

###Parameters: 

-  **bounds** : **required** : A minimally bounding box for **element**.
- **element** : **required** : An object to add to the R-Tree.

###Returns: 

-  Nothing.

###Usage: 

-  Insert a 10x10 object that starts at position 10x10:
- `myRTree.insert({x:10, y:10, w:10, h:10}, myObject);`


###RTree.remove

-  **RTree.remove** ( Rectangle[<sup>2</sup>](#f2) **area** _[, Object **element** ]_ )

###Parameters: 

-  **area** : **required** : An area to search within.
- **element** : _optional_ : An object to remove from the R-Tree. If no object is specified, *all* elements that touch *area* are deleted.

###Returns: 

-  An array of leafs deleted from the R-Tree.

###Usage: 

-  Deletes all object that touch the 10x10 rectangle starting at position 10x10:
- `var myDelCount = myRTree.delete({x:10, y:10, w:10, h:10});`
- Delete only specific_object if it touches the 10x10 rectangle starting at position 10x10:
- `var myDelCount = myRTree.delete({x:10, y:10, w:10, h:10}, specific_object);`


###RTree.search

-  **RTree.search** ( Rectangle[<sup>2</sup>](#f2) **area** )

###Parameters: 

-  **area** : **required** : An area to search within.

###Returns: 

-  An array of objects that overlap or touch **area**.

###Usage: 

-  Search a 10x10 area that starts at position 10x10:
- `var myObjects = myRTree.search({x:10, y:10, w:10, h:10});`

###RTree.geoJSON:

-  **RTree.insert** ( **geojson** )
-  insert a geojson feature collection or feature array
-  should handle all geometry except geometry collection

###RTree.bbox:

-  **RTree.bbox** ( [**southWest**, **northEast**] ) or **RTree.bbox** ( **southWest**, **northEast** )
-  shortcut to `rTree.search({x:southWest[0],y:southWest[1],w:northEast[0]-southWest[0],h:northEast[1]-southWest[1]})`

###Notes

<sup><a name="f1">1</a></sup> Default max node width is currently 6.

<sup><a name="f2">2</a></sup> A _Rectangle_ is **any** object with public x, y, w, h properties. The object itself is not saved or used directly but copies are made of its x, y, w, h properties.