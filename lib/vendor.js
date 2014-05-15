
// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var path = require('path');
var fs = require('fs');

var gclean = require('gulp-clean');

var es = require('event-stream');

var settings = require('./settings');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var vendor = module.exports = {};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

vendor.init = function(gulp) {

  var folders = settings.folders;

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  vendor.tasks = {
    clean: function() {
      return gulp
        .src(folders.dest + '/' + folders.vendor, { read: false })
        .pipe(gclean({force: true}));
    },
    copy: function() {
      return gulp.src(folders.vendor + '/**/*')
        .pipe(gulp.dest(folders.dest + '/' + folders.vendor));
    }
  };


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