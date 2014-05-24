'use strict';

module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
		dist: {
			src: ['dist/*','images/*']
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
				'dist/jquery.cookie.min.js': ['jquery-cookie/jquery.cookie.js'],
				'dist/L.Control.Sidebar.min.js': ['leaflet-sidebar/src/L.Control.Sidebar.js'],
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
				'dist/jquery.cookie.min.js',
				'dist/L.Control.Sidebar.min.js',		
				'dist/togeojson.min.js',
				'dist/togpx.min.js',
				'dist/leaflet.filelayer.min.js',
				'dist/FileSaver.min.js',
				'simplify-geometry/simplifygeometry-0.0.1.min.js',
				'bootstrap-slider/dist/bootstrap-slider.min.js',
				'crumble/js/jquery.grumble.min.js',
				'crumble/js/jquery.crumble.min.js',				
				'social.js',
				'dist/main.min.js'			
			],
			dest: 'dist/app.min.js'
		}
	},
	cssmin: {
		combine: {
			src: [
				'bootstrap-slider/dist/css/bootstrap-slider.min.css',
				'crumble/css/grumble.min.css',
				'crumble/css/crumble.css',				
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
	copy: {
		crumble: {
			expand: true,
			nonull: true,
			flatten: true,
			src: 'crumble/images/*',
			dest: 'images/'
		}
		// i18n: {
		// 	nonull: true,
		// 	expand: true,
		// 	cwd: 'i18n/',
		// 	src: 'mix.*',
		// 	dest: 'dist/',
		// 	flatten: true,
		// 	filter: 'isFile',
		// }		
	},	
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
	'jshint',	
	'uglify',	
	'concat',
	'cssmin',	
	'copy'
]);


grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-copy');
};