/**
 * Created by null on 15/05/14.
 */

var settings = require('./settings')
var path = require('path');
var utils = require('./utils');
var glob = require('glob');


var gkarma = require('gulp-karma');

var modules = require('./modules');

var test = module.exports = {

  init: function (gulp) {

    test.tasks = {
      run: function() {

        return gulp.src(test.includes())
          .pipe(gkarma({
            configFile: 'karma.conf.js'
          }))
          .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
          });
      },

      watch: function() {
        return gulp.src(test.includes())
          .pipe(gkarma({
            action: 'watch',
            configFile: 'karma.conf.js'
          }));
      }
    };

  },

  includes: function () {

    // Returns an array of js files to include in order


    var files = [];

    function expandGlobs(globs, folder) {

      var expanded = [];

      globs.forEach(function (pattern) {

        pattern = path.join(folder, pattern);

        var matches = glob.sync(pattern);

        matches.forEach(function (file) {

          if (settings.release) {
            file = utils.getMinifiedFilePath(file);
          }

          expanded.push(file);

        });

      });

      return expanded;
    }

    files = files.concat(expandGlobs(settings.files.vendor.js, settings.folders.vendor));
    files = files.concat(expandGlobs(settings.files.vendor.test, settings.folders.vendor));

    modules.forEach(function (module) {

      // Grab the root module folder in the DEST structure
      var moduleFolder = path.join(settings.folders.dest, module.folder);

      // Grab the main file: module-name.js (with dash)
      var mainFile = path.join(moduleFolder, module.folder + '.js');
      mainFile = utils.getMinifiedFilePath(mainFile);

      // Ensure we're using /'s instead of \'s

      mainFile = mainFile.split('\\').join('/');

      var expanded = expandGlobs(['**/*.js'], moduleFolder);

      // Ensure that the mainfile is included first

      var idx = expanded.indexOf(mainFile);
      if(idx != -1) {
        expanded.splice(idx, 1);
        expanded.unshift(mainFile);
      }

      // console.log(module.name, expanded);

      files = files.concat(expanded);

    });

    modules.forEach(function (module) {

      // Grab the root module folder in the SRC structure

      var moduleFolder = path.join(settings.folders.src, module.folder);
      files = files.concat(expandGlobs(['**/*.test.js'], moduleFolder));

    });

    return files;
  }
};