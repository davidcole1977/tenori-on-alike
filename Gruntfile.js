module.exports = function(grunt) {

  var express = require('express'),
      expressApp = express(),
      chalk = require('chalk');

  grunt.registerTask('serveStaticFiles', 'Uses Express to serve static files for development', function() {
    // serve static files
    expressApp.use(express.static('_app'));

    // start server
    expressApp.listen(3000);
    console.log(chalk.cyan('Server started at localhost:3000'));
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      app: {
        src: ['src/js/**/*.js', '!src/js/vendor/*']
      },
      test: {
        src: [ 'test/**/*.js']
      },
      gruntfile: {
        src: ['Gruntfile.js']
      }
    },
    mochaTest: {
      dev: {
        options: {
          reporter: 'spec',
          clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false) 
        },
        src: ['test/**/*.spec.js']
      }
    },
    clean: {
      app: ['_app/']
    },
    copy: {
      vendorJs: {
        expand: true,
        cwd: 'src/js/vendor/',
        src: ['**/*.js'],
        dest: '_app/js/vendor/'
      },
      css: {
        expand: true,
        cwd: 'src/css/',
        src: ['**/*.css'],
        dest: '_app/css/'
      },
      html: {
        expand: true,
        cwd: 'src/html/',
        src: ['**/*.html'],
        dest: '_app/'
      },
      ogg: {
        expand: true,
        cwd: 'src/ogg/',
        src: ['**/*.ogg'],
        dest: '_app/ogg/'
      }
    },
    browserify: {
      app: {
        files: {
          '_app/js/main.js': ['src/js/main.js']
        }
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      app: {
        expand: true,
        cwd: 'src/scss/',
        src: ['**/*.scss'],
        dest: '_app/css/',
        rename: function (destDir, srcFile) {
          return destDir + srcFile.replace('.scss', '.css');
        }
      }
    },
    watch: {
      appTestJs: {
        files: ['src/js/**/*.js', '!src/js/vendor/*'],
        tasks: ['jshint:app', 'mochaTest']
      },
      appBrowserifyJs: {
        files: ['src/js/**/*.js', '!src/js/vendor/*'],
        tasks: ['browserify']
      },
      gruntfileJs: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:gruntfile']
      },
      testJs: {
        files: ['test/**/*.js'],
        tasks: ['jshint:test', 'mochaTest']
      },
      vendorJs: {
        files: ['src/js/vendor/**/*.js'],
        tasks: ['copy:vendorJs']
      },
      html: {
        files: ['src/html/**/*.html'],
        tasks: ['copy:html']
      },
      css: {
        files: ['src/css/**/*.css'],
        tasks: ['copy:css']
      },
      ogg: {
        files: ['src/ogg/**/*.ogg'],
        tasks: ['copy:ogg']
      },
      scss: {
        files: ['src/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('default', [
    'clean',
    'copy',
    'sass',
    'browserify',
    'serveStaticFiles',
    'watch'
  ]);

  // for some reason browserify doesn't like to run after mochaTest in the grunt default task list,
  // so separating out the test tasks for now
  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);

};