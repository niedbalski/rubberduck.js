"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.',
                }
            }
        },

        // qunit: {
        //     all: ['tests/*.html']
        // },

        qunit: {
            all: {
                options: {
                    urls: [
                        'http://127.0.0.1:3000/tests/index.html'
                    ]
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['Gruntfile.js', 'src/**/*.js']
        },

        uglify : {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
                mangle: false
            },
            release: {
                files: {
                    'releases/<%= pkg.name %>-<%= pkg.version %>.min.js': ['src/rubberduck.js']
                }
            }
        },

        watch: {
            files: ['tests/tests.js', 'tests/*.html', 'src/rubberduck.js'],
            tasks: ['jshint', 'qunit']
        },

        bump: {
            options: {
                pushTo: 'origin',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('test', ['connect', 'qunit']);
    grunt.registerTask('stage', 'test', 'bump-only');
    grunt.registerTask('release', ['test', 'uglify:release', 'bump-commit']);
    grunt.registerTask('travis', [ 'connect', 'jshint', 'qunit']);
    grunt.registerTask('default', ['test']);

};
