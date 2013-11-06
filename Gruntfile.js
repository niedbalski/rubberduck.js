"use strict";

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      files: ['tests/index.html']
    },
    jshint: {
      options: {
                    jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'rubberduck.js']
    },
    watch: {
      files: ['tests/*.js', 'tests/*.html', 'rubberduck.js'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('test', 'qunit');
  grunt.registerTask('travis', ['jshint', 'qunit']);
  grunt.registerTask('default', ['qunit']);

};
