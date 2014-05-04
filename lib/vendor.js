
// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var path = require('path');
var fs = require('fs');

var gtap = require('gulp-tap');

var es = require('event-stream');

var settings = require('./settings');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var vendor = module.exports = {};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

vendor.init = function(gulp) {

  var folders = settings.folders;

  gulp.task('vendor', ['clean'], function () {

    return gulp.src(folders.vendor + '/**/*')
      .pipe(gulp.dest(folders.dest + '/' + folders.vendor));

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getIncludeFiles(glob) {

    var folders = settings.folders;

    var options = {
      read: false,
      cwd: path.resolve(folders.dest + '/' + folders.vendor)
    };

    return gulp.src(glob, options);

  }

  vendor.includes = {
    js: function() {
      return getIncludeFiles(settings.files.vendor.js);
    },
    css: function() {
      return getIncludeFiles(settings.files.vendor.css);
    },
    all: function() {
      return es.merge(vendor.includes.js(), vendor.includes.css());
    }
  };

};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -