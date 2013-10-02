var banner = '/****************************************************************************** \n\
			rtree.js -Non-Recursive Javascript R-Tree Library\n\
			Version 1.0.0, March 15th 2013\n\n\
			https://github.com/leaflet-extras/RTree.\n\
			******************************************************************************/\n';
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				mangle: true,
				banner: '/****************************************************************************** \n\
			rtree.js -Non-Recursive Javascript R-Tree Library\n\
			Version <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n\n\
			https://github.com/leaflet-extras/RTree.\n\
			******************************************************************************/\n',
				report: 'gzip'
			},
			all: {
				src: 'dist/rtree.js',
				dest: 'dist/rtree.min.js'
			}
		},
		jshint: {
			all: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'lib/*.js'
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'nyan'
				},
				src: ['test/*.test.js']
			}
		},
		browserify: {
			all: {
				files: {
					'dist/rtree.js': ['lib/index.js'],
				},
				options: {
					standalone: 'RTree'
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['jshint', 'test', 'browserify', 'uglify']);
};