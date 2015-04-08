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
        files: ['js/main.js', 'js/formats.js', 'js/formats/*.js', 'js/layers.js', 'js/i18n.js', 'locales/*/*.json', 'package.json']
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
                'dist/i18next.min.js': ['vendor/i18next/i18next.commonjs.withJQuery.js'],
                // Repository files
                'dist/i18n.min.js': ['js/i18n.js'],
                'dist/formats.min.js': ['js/formats.js', 'js/formats/*'],
                'dist/layers.min.js': ['js/layers.js'],
                'dist/planes.min.js': ['js/planes.js'],
                'dist/main.min.js': ['js/main.js']
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
                'dist/i18next.min.js',
                
                // Repository files
                //'js/social.js',
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
                'vendor/leaflet-sidebar/src/L.Control.Sidebar.css',
                //'crumble/css/grumble.min.css',
                //'crumble/css/crumble.css',
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
    // copy: {
    //     crumble: {
    //         expand: true,
    //         nonull: true,
    //         flatten: true,
    //         src: 'crumble/images/*',
    //         dest: 'images/'
    //     }
    // },
    watch: {
        css: {
            options: { livereload: true },
            files: ['css/style.scss'],
            tasks: ['clean:css', 'sass', 'cssmin']
        },
        js: {
            options: { livereload: true },
            files: ['js/*'],
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
    'jshint',
    'uglify',
    'concat',
    'sass',
    'cssmin',
    //'copy'
]);


require('load-grunt-tasks')(grunt);
};
