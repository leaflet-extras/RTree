'use strict';
var rectangle = require('./rectangle');
var bbox = function(ar, obj) {
	if (obj && obj.bbox) {
		return {
			leaf: obj,
			x: obj.bbox[0],
			y: obj.bbox[1],
			w: obj.bbox[2] - obj.bbox[0],
			h: obj.bbox[3] - obj.bbox[1]
		};
	}
	var len = ar.length;
	var i = 0;
	var a = new Array(len);
	while (i < len) {
		a[i] = [ar[i][0], ar[i][1]];
		i++;
	}
	var first = a[0];
	len = a.length;
	i = 1;
	var temp = {
		min: [].concat(first),
		max: [].concat(first)
	};
	while (i < len) {
		if (a[i][0] < temp.min[0]) {
			temp.min[0] = a[i][0];
		}
		else if (a[i][0] > temp.max[0]) {
			temp.max[0] = a[i][0];
		}
		if (a[i][1] < temp.min[1]) {
			temp.min[1] = a[i][1];
		}
		else if (a[i][1] > temp.max[1]) {
			temp.max[1] = a[i][1];
		}
		i++;
	}
	var out = {
		x: temp.min[0],
		y: temp.min[1],
		w: (temp.max[0] - temp.min[0]),
		h: (temp.max[1] - temp.min[1])
	};
	if (obj) {
		out.leaf = obj;
	}
	return out;
};
var geoJSON = {};
geoJSON.point = function(obj, self) {
	return (self.insertSubtree({
		x: obj.geometry.coordinates[0],
		y: obj.geometry.coordinates[1],
		w: 0,
		h: 0,
		leaf: obj
	}, self.root));
};
geoJSON.multiPointLineString = function(obj, self) {
	return (self.insertSubtree(bbox(obj.geometry.coordinates, obj), self.root));
};
geoJSON.multiLineStringPolygon = function(obj, self) {
	return (self.insertSubtree(bbox(Array.prototype.concat.apply([], obj.geometry.coordinates), obj), self.root));
};
geoJSON.multiPolygon = function(obj, self) {
	return (self.insertSubtree(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], obj.geometry.coordinates)), obj), self.root));
};
geoJSON.makeRec = function(obj) {
	return rectangle(obj.x, obj.y, obj.w, obj.h);
};
geoJSON.geometryCollection = function(obj, self) {
	if (obj.bbox) {
		return (self.insertSubtree({
			leaf: obj,
			x: obj.bbox[0],
			y: obj.bbox[1],
			w: obj.bbox[2] - obj.bbox[0],
			h: obj.bbox[3] - obj.bbox[1]
		}, self.root));
	}
	var geos = obj.geometry.geometries;
	var i = 0;
	var len = geos.length;
	var temp = [];
	var g;
	while (i < len) {
		g = geos[i];
		switch (g.type) {
		case 'Point':
			temp.push(geoJSON.makeRec({
				x: g.coordinates[0],
				y: g.coordinates[1],
				w: 0,
				h: 0
			}));
			break;
		case 'MultiPoint':
			temp.push(geoJSON.makeRec(bbox(g.coordinates)));
			break;
		case 'LineString':
			temp.push(geoJSON.makeRec(bbox(g.coordinates)));
			break;
		case 'MultiLineString':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
			break;
		case 'Polygon':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
			break;
		case 'MultiPolygon':
			temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], g.coordinates)))));
			break;
		case 'GeometryCollection':
			geos = geos.concat(g.geometries);
			len = geos.length;
			break;
		}
		i++;
	}
	var first = temp[0];
	i = 1;
	len = temp.length;
	while (i < len) {
		first.expand(temp[i]);
		i++;
	}
	return self.insertSubtree({
		leaf: obj,
		x: first.x(),
		y: first.y(),
		h: first.h(),
		w: first.w()
	}, self.root);
};
exports.geoJSON = function(prelim) {
	var that = this;
	var features, feature;
	if (Array.isArray(prelim)) {
		features = prelim.slice();
	}
	else if (prelim.features && Array.isArray(prelim.features)) {
		features = prelim.features.slice();
	}
	else if (prelim instanceof Object) {
            features = [prelim];
        }
	else{
		throw ('this isn\'t what we\'re looking for');
	}
	var len = features.length;
	var i = 0;
	while (i < len) {
		feature = features[i];
		if (feature.type === 'Feature') {
			switch (feature.geometry.type) {
			case 'Point':
				geoJSON.point(feature, that);
				break;
			case 'MultiPoint':
				geoJSON.multiPointLineString(feature, that);
				break;
			case 'LineString':
				geoJSON.multiPointLineString(feature, that);
				break;
			case 'MultiLineString':
				geoJSON.multiLineStringPolygon(feature, that);
				break;
			case 'Polygon':
				geoJSON.multiLineStringPolygon(feature, that);
				break;
			case 'MultiPolygon':
				geoJSON.multiPolygon(feature, that);
				break;
			case 'GeometryCollection':
				geoJSON.geometryCollection(feature, that);
				break;
			}
		}
		i++;
	}
};
exports.bbox = function() {
	var x1, y1, x2, y2;
	switch (arguments.length) {
	case 1:
		x1 = arguments[0][0][0];
		y1 = arguments[0][0][1];
		x2 = arguments[0][1][0];
		y2 = arguments[0][1][1];
		break;
	case 2:
		x1 = arguments[0][0];
		y1 = arguments[0][1];
		x2 = arguments[1][0];
		y2 = arguments[1][1];
		break;
	case 4:
		x1 = arguments[0];
		y1 = arguments[1];
		x2 = arguments[2];
		y2 = arguments[3];
		break;
	}

	return this.search({
		x: x1,
		y: y1,
		w: x2 - x1,
		h: y2 - y1
	});
};
