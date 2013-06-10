module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
			banner:'/****************************************************************************** \nrtree.js -Non-Recursive Javascript R-Tree Library\nVersion 1.0.0, March 15th 2013\n\nhttps://github.com/leaflet-extras/RTree.\n******************************************************************************/\n',
		uglify: {
			all: {
				options:{
					banner: '<%= banner %>'
				},
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			all: {
				options:{
					banner: '<%= banner %>'
				},
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.js'
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
				src: 'src/<%= pkg.name %>.js'
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
							browserName: "chrome",
							platform: "linux",
						},
						{
							browserName: "firefox",
							platform: "linux",
							version: "21"
						}
					],
				urls: [
						"http://localhost:8000/tests/index.html"
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
	grunt.registerTask('default', ['jshint','concat','uglify','test']);
};