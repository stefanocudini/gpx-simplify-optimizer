'use strict';

module.exports = function(grunt) {

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
        css: {
            src: ['dist/*.css']
        },
        js: {
            src: ['dist/*.js']
        }
    },
    jshint: {
        options: {
            reporter: require('jshint-stylish'),
            globals: {
                console: true,
                module: true
            },
            "-W099": true,    //ignora tabs e space warning
            "-W033": true,
            "-W044": true    //ignore regexp
        },
        sources: ['src/main.js', 'src/formats.js', 'src/formats/*.js', 'src/layers.js', 'src/i18n.js', 'locales/*/*.json', 'package.json'],
        tests: ['tests/*.js']

    },
    uglify: {
        dist: {
            files: {
                'dist/jquery.cookie.min.js': ['vendor/jquery-cookie/jquery.cookie.js'],
                //'dist/L.Control.Sidebar.min.js': ['vendor/leaflet-sidebar/src/L.Control.Sidebar.js'],
                'dist/togeojson.min.js': ['vendor/togeojson/togeojson.js'],
                'dist/togpx.min.js': ['vendor/togpx/togpx.js'],
                'dist/pretty-data.min.js': ['vendor/pretty-data/index.js'],
                'dist/tokml.min.js': ['vendor/tokml/tokml.js'],
                'dist/geojson-to-path.min.js': ['vendor/geojson-to-path/geojson-to-path.js'],
                'dist/leaflet.filelayer.min.js': ['vendor/Leaflet.FileLayer/leaflet.filelayer.js'],
                'dist/FileSaver.min.js': ['vendor/FileSaver.js/FileSaver.js'],
                'dist/i18next.min.js': ['vendor/i18next/i18next.commonjs.withJQuery.js'],
                'dist/gpx-parse.min.js': ['vendor/gpx-parse/dist/gpx-parse-browser.js'],
                // Repository files
                'dist/i18n.min.js': ['src/i18n.js'],
                'dist/formats.min.js': ['src/formats.js', 'src/formats/*'],
                'dist/layers.min.js': ['src/layers.js'],
                'dist/planes.min.js': ['src/planes.js'],
                'dist/main.min.js': ['src/main.js']
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
        libs: {
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
                'dist/i18next.min.js',
                'dist/gpx-parse.min.js',
            ],
            dest: 'dist/libs.min.js'
        },
        main: {
            src: [
                'src/social.js',
                'dist/formats.min.js',
                //'dist/planes.min.js',
                'dist/i18n.min.js',
                'dist/layers.min.js',
                'dist/main.min.js'
            ],
            dest: 'dist/app.min.js'
        }
    },
    sass: {
        dist: {
            options: {
                style: 'nested',
                sourcemap: 'none',
                cacheLocation: 'css/.sass-cache'
            },
            files: {
                'dist/style.css': 'css/style.scss'
            }
        }
    },
    cssmin: {
        combine: {
            src: [
                'vendor/bootstrap-slider/dist/css/bootstrap-slider.min.css',
                //'vendor/leaflet-sidebar/src/L.Control.Sidebar.css',
                'dist/style.css'
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
    jasmine: {
        components: {
          src: [
          'src/layers.js',
          'src/formats.js',
          'src/formats/*.js',
          ],
          options: {
            vendor: [
                'http://code.jquery.com/jquery-1.8.3.min.js',
                // Here we use the non minified source
                'http://cdn.leafletjs.com/leaflet-0.7/leaflet-src.js',
                'vendor/simplify-geometry/simplifygeometry-0.0.1.min.js',
                'dist/jquery.cookie.min.js',
                'dist/togeojson.min.js',
                'dist/togpx.min.js',
                'dist/pretty-data.min.js',
                'dist/tokml.min.js',
                'dist/geojson-to-path.min.js',
                'dist/leaflet.filelayer.min.js',
                'dist/FileSaver.min.js',
                'dist/i18next.min.js',
                'dist/i18n.min.js',
                'node_modules/jasmine-jquery/lib/jasmine-jquery.js'
            ],
            specs: 'tests/*.js',
            keepRunner : false,
          }
        }
    },
    watch: {
        css: {
            options: { livereload: true },
            files: ['css/style.scss'],
            tasks: ['clean:css', 'sass', 'cssmin']
        },
        js: {
            options: { livereload: true },
            files: ['src/*', 'src/formats/*'],
            tasks: ['clean:js', 'jshint', 'uglify', 'concat']
        },
        i18n: {
            options: { livereload: true },
            files: ['locales/*/*'],
            tasks: ['jshint']
        }
    }
});

grunt.registerTask('default', [
    'clean',
    'jshint:sources',
    'uglify',
    'concat',
    'sass',
    'cssmin',
    //'copy'
]);
grunt.registerTask('travis', [
    'jshint:tests',
    'jasmine',
]);



require('load-grunt-tasks')(grunt);
};
