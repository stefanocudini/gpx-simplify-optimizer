'use strict';

module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
		dist: {
			src: ['dist/*','main.min.js']
		}
	},
	jshint: {
		options: {
			globals: {
				console: true,
				module: true
			},
			"-W099": true,	//ignora tabs e space warning
			"-W033": true,
			"-W044": true	//ignore regexp
		},
		files: ['main.js']
	},
	uglify: {
		dist: {
			files: {
				'dist/togeojson.min.js': ['togeojson/togeojson.js'],
				'dist/togpx.min.js': ['togpx/togpx.js'],
				'dist/leaflet.filelayer.min.js': ['Leaflet.FileLayer/leaflet.filelayer.js'],
				'dist/FileSaver.min.js': ['FileSaver.js/FileSaver.js'],
				'dist/main.min.js': ['main.js'],
			}
		}
	},	
	concat: {
		//TODO cut out SearchMarker
		options: {
			separator: ';\n',
			stripBanners: {
				block: true
			}
		},
		dist: {
			src: [
				'dist/togeojson.min.js',
				'dist/togpx.min.js',
				'dist/leaflet.filelayer.min.js',
				'dist/FileSaver.min.js',				
				'simplify-geometry/simplifygeometry-0.0.1.min.js',
				'bootstrap-slider/dist/bootstrap-slider.min.js',
				'dist/main.min.js'
			],
			dest: 'dist/app.min.js'
		}
	},
	cssmin: {
		combine: {
			src: [
				//'Font-Awesome/css/font-awesome.min.css',
				'bootstrap-slider/dist/css/bootstrap-slider.min.css',
				'style.css'
			],
			dest: 'dist/style.min.css'
		},
		minify: {
			expand: true,
			cwd: 'dist/',
			src: '<%= cssmin.combine.dest %>'
			//,dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.css'
		}
	},
	// copy: {
	// 	css: {
	// 		expand: true,
	// 		flatten: true,
	// 		filter: 'isFile',			
	// 		src: ['Font-Awesome/fonts/*'],
	// 		dest: 'dist/fonts/'
	// 	}
	// },
	watch: {
		dist: {
			options: { livereload: true },
			files: ['main.js','index.html','style.css'],
			tasks: ['clean','concat','cssmin','jshint']
		}
	}
});

grunt.registerTask('default', [
	'clean',
	'uglify',	
	'concat',	
	'cssmin',
	'jshint',
	//'copy'
]);


grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-watch');

};