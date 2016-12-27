
module.exports = function(grunt) {
  var port = 3000;

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // browserSync: {
    //   bsFiles: {
    //     src: [
    //       'public/styles/**/*.css',
    //       'public/app/**/*.{js|html}'
    //     ]
    //   },
    //   options: {
    //     proxy: 'http://localhost:3000',
    //     watchTask: true
    //   }
    // },
    concurrent: {
      dev: {
        tasks: ['watch', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server/app.js'
      },
      options: {
        callback: function(nodemon) {
          nodemon.on('log', function(event) {
            console.log(event.colour);
          });

          nodemon.on('config:update', function () {
            setTimeout(function () {
              require('open')('http://localhost:3000');
            }, 1000);
          });

          nodemon.on('restart', function () {
            setTimeout(function () {
              require('fs').writeFileSync('.rebooted', 'rebooted');
            }, 1000);
          });
        },
        watch: ['server']
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dev: {
        files: {
          'public/styles/styles.css': 'public/styles/sass/styles.scss'
        }
      }
    },
    watch: {
      css: {
        files: ['public/styles/sass/**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['public/app/**/*.html'],
        options: {
          livereload: true
        }
      },
      scripts: {
        files: ['public/app/**/*.js'],
        options: {
          livereload: true
        }
      },
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.registerTask('default', ['concurrent']);
  // grunt.registerTask('default', ['concurrent']);

};

