module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
			banner:'/****************************************************************************** \n\
			rtree.js -Non-Recursive Javascript R-Tree Library\n\
			Version 1.0.0, March 15th 2013\n\n\
			https://github.com/leaflet-extras/RTree.\n\
			******************************************************************************/\n\
			(function(){\n\
			/*global module,window,self */\n\
			\'use strict\';\n',
			footer:'if (typeof module !== \'undefined\' && module.exports) {\n\
	module.exports = rTree;\n\
}else if(typeof document === \'undefined\'){\n\
	self.rTree = rTree;\n\
	self.RTree = RTree;\n\
}else{\n\
	window.rTree = rTree;\n\
	window.RTree = RTree;\n\
}\n\
})(this);\n',
			uglify: {
			all: {
				src: 'dist/rtree.js',
				dest: 'dist/rtree.min.js'
			}
		},
		concat: {
			all: {
				options:{
					banner: '<%= banner %>',
					footer:'<%= footer %>'
				},
				src: ['src/rtree.js','src/rtree.geojson.js','src/rtree.end.js','src/rtree.rectangle.js'],
				dest: 'dist/rtree.js'
			}
		},
		jshint: {
			all:{
				options:{
					bitwise:true,
					camelcase:true,
					curly:true,
					eqeqeq:true,
					immed:true,
					latedef:true,
					newcap:true,
					noarg:true,
					quotmark:'single',
					undef:true,
					unused:true,
					strict:true,
					trailing:true
				},
				src: 'dist/<%= pkg.name %>.js'
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						"http://localhost:8000/tests/index.html"
					]
				}
			}
		},
		"saucelabs-mocha":{
			all:{
				options:{
					username:"rtrees",
					key: "348b94f0-0bb9-4a45-898f-66c88bec254c",
					concurrency:3,
					build: process.env.TRAVIS_JOB_ID,
					browsers: [
						{
							browserName: "firefox",
							platform: "linux",
							version: "21"
						},{
							browserName: "safari",
							platform: "OS X 10.8",
							version:'6'
						},{
							browserName: "safari",
							platform: "OS X 10.6",
							version:'5'
						},{
							browserName: "iphone",
							platform: "OS X 10.8",
							version:'6'
						},{
							browserName: 'chrome',
							platform: 'linux'
						}, {
							browserName: 'internet explorer',
							platform: 'WIN8',
							version: '10'
						}, {
							browserName: 'opera',
							platform: 'linux',
							version: '12'
						},{
							browserName: 'opera',
							platform: 'win7',
							version: '12'
						},{
							browserName: 'internet explorer',
							platform: 'win7',
							version: '9'
						}
					],
				urls: [
						"http://localhost:8000/tests/index.html",
						"http://localhost:8000/tests/min.html"
					]
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-saucelabs');
	grunt.registerTask('test', ['connect:server','saucelabs-mocha']);
	grunt.registerTask('default', ['concat','uglify','jshint','test']);
};