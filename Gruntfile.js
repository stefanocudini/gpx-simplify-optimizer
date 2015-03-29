'use strict';

module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
		dist: {
			src: ['dist/*']
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
		files: ['main.js', 'formats.js', 'formats/*.js']
	},
	uglify: {
		dist: {
			files: {
				'dist/jquery.cookie.min.js': ['vendor/jquery-cookie/jquery.cookie.js'],
				'dist/L.Control.Sidebar.min.js': ['vendor/leaflet-sidebar/src/L.Control.Sidebar.js'],
				'dist/togeojson.min.js': ['vendor/togeojson/togeojson.js'],
				'dist/togpx.min.js': ['vendor/togpx/togpx.js'],
				'dist/pretty-data.min.js': ['vendor/pretty-data/index.js'],
				'dist/tokml.min.js': ['vendor/tokml/tokml.js'],
				'dist/geojson-to-path.min.js': ['vendor/geojson-to-path/geojson-to-path.js'],
				'dist/leaflet.filelayer.min.js': ['vendor/Leaflet.FileLayer/leaflet.filelayer.js'],
				'dist/FileSaver.min.js': ['vendor/FileSaver.js/FileSaver.js'],
				'dist/formats.min.js': ['formats.js', 'formats/*'],
				'dist/main.min.js': ['main.js']
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
				'dist/pretty-data.min.js',
				'dist/tokml.min.js',
				'dist/geojson-to-path.min.js',
				'dist/leaflet.filelayer.min.js',
				'dist/FileSaver.min.js',
				'vendor/simplify-geometry/simplifygeometry-0.0.1.min.js',
				'vendor/bootstrap-slider/dist/bootstrap-slider.min.js',
                'vendor/jquery-autocomplete/dist/jquery.autocomplete.min.js',
				//'crumble/js/jquery.grumble.min.js',
				//'crumble/js/jquery.crumble.min.js',
				'social.js',
				'planes.js',
				'dist/formats.min.js',
				'dist/main.min.js'
			],
			dest: 'dist/app.min.js'
		}
	},
	cssmin: {
		combine: {
			src: [
				'vendor/bootstrap-slider/dist/css/bootstrap-slider.min.css',
				'vendor/leaflet-sidebar/src/L.Control.Sidebar.css',
				//'crumble/css/grumble.min.css',
				//'crumble/css/crumble.css',
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
	// 	crumble: {
	// 		expand: true,
	// 		nonull: true,
	// 		flatten: true,
	// 		src: 'crumble/images/*',
	// 		dest: 'images/'
	// 	}
	// },
	watch: {
		dist: {
			options: { livereload: true },
			files: ['main.js', 'formats.js', 'formats/*.js', 'planes.js', 'index.html', 'style.css'],
			tasks: ['clean', 'jshint', 'uglify', 'concat', 'cssmin']
		}
	}
});

grunt.registerTask('default', [
	'clean',
	'jshint',
	'uglify',
	'concat',
	'cssmin',
	//'copy'
]);


grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');
//grunt.loadNpmTasks('grunt-contrib-copy');
};
