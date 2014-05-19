#!/usr/bin/env node
/**
 * Created by null on 15/05/14.
 */

var fs = require('fs');

var vendor = require('./vendor');
var modules = require('./modules');
var settings = require('./settings');
var utils = require('./utils');

var gtap = require('gulp-tap');
var ginject = require('gulp-inject');
var gutil = require('gulp-util');
var gclean = require('gulp-clean');

var indexHtml = module.exports = {

  init: function (gulp) {

    var folders = settings.folders;

    indexHtml.tasks = {
      clean: function () {
        return gulp.src(folders.dest + '/index.html', { read: false }).pipe(gclean({ force: true }));
      },
      make: function () {

        // Builds the index.html

        var srcIndex = folders.src + '/index.html';

//        if (!fs.existsSync(srcIndex)) {
//
//          gutil.log('Creating example', gutil.colors.cyan(srcIndex));
//
//          var contents = fs.readFileSync(require.resolve('../template/src/index.html'), 'utf8');
//          fs.writeFileSync(srcIndex, contents, 'utf8');
//        }

        // Locate all vendor and module includes

        var vendor_includes = vendor.includes.all();
        var modules_includes = modules.includes.all();

        // If we're in release mode -- hook in a tap that tries to locate (pre)minified versions.

        if (settings.release) {

          function preferMinified(file) {
            if (process.platform === 'win32') {
              file.path = file.path.split('\\').join('/');
            }

            file.path = utils.getMinifiedFilePath(file.path);
          }

          vendor_includes.pipe(gtap(preferMinified));
          modules_includes.pipe(gtap(preferMinified)); // needed?
        }

        // Grab the index.html and inject all the includes

        return gulp.src(folders.src + '/index.html')
          .pipe(ginject(vendor_includes, {
            addPrefix: '/vendor',
            starttag: '<!-- inject:vendor:{{ext}} -->'
          }))
          .pipe(ginject(modules_includes))
          .pipe(gulp.dest(folders.dest));
      }
    };
  }

};