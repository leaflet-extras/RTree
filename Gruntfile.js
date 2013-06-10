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
							browserName: "firefox",
							platform: "linux",
							version: "21"
						},
						{
						browserName: "chrome",
						platform: "OS X 10.8",
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
					}, {
						browserName: 'chrome',
						platform: 'XP'
					}, {
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
						browserName: 'safari',
						platform: 'win7',
						version: '5'
					},
					{
						browserName: 'internet explorer',
						platform: 'win7',
						version: '9'
					},
					{
						browserName: 'internet explorer',
						platform: 'win7',
						version: '8'
					},
					{
						browserName: 'internet explorer',
						platform: 'xp',
						version: '8'
					},
					{
						browserName: 'internet explorer',
						platform: 'xp',
						version: '7'
					},
					{
						browserName: 'internet explorer',
						platform: 'xp',
						version: '6'
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