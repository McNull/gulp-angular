// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var path = require('path');

var gutil = require('gulp-util');
var gtap = require('gulp-tap');
var gconcat = require('gulp-concat');
var gngmin = require('gulp-ngmin');
var guglify = require('gulp-uglify');
var ginsert = require('gulp-insert');
var grename = require('gulp-rename');
var gngtemplate = require('gulp-ng-html2js');
var gminifyHtml = require("gulp-minify-html");
var gminifyCss = require('gulp-minify-css');
var gsize = require('gulp-size');
var gsvgmin = require('gulp-svgmin');
var gfilter = require('gulp-filter');
var gclean = require('gulp-clean');
var gprefix = require('gulp-autoprefixer');

var deepExtend = require('deep-extend');
var es = require('event-stream');

var utils = require('./utils');
var settings = require('./settings');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var modules = module.exports = [];

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

modules.add = function (moduleName, options) {

  options = options || {};

  var module = deepExtend({
    // todo: fill with defaults
    name: moduleName,
    folder: moduleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }, options);

  modules.push(module);

  return modules;
};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

modules.init = function (gulp) {

  var folders = settings.folders;

  var processed = [];

  processed.add = function (file) {

//    console.log('processed', file.path);

    processed.push(file.path);
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks = {};

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks.clean = function () {

    var moduleFolders = [];

    modules.forEach(function (module) {
      moduleFolders.push(folders.dest + '/' + module.folder);
    });

    return gulp
      .src(moduleFolders, { read: false })
      .pipe(gclean({ force: true }));
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks.scalableVectorGraphics = function () {

    var streams = [];

    modules.forEach(function (module) {
      var s = gulp.src([folders.src + '/' + module.folder + '/**/*.svg', '!**/*.ng.svg'])
        .pipe(gtap(processed.add))
        .pipe(gsvgmin())
        .pipe(gulp.dest(folders.dest + '/' + module.folder));

      streams.push(s);
    });

    return es.merge.apply(es, streams);

  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks.javascript = function () {
    var streams = [];

    modules.forEach(function (module) {

      var moduleSrc = folders.src + '/' + module.folder;

      var svg = gulp.src(moduleSrc + '/**/*.ng.svg')
        .pipe(gtap(processed.add))
        .pipe(gsvgmin());

      var html = gulp.src(moduleSrc + '/**/*.ng.html')
        .pipe(gtap(processed.add))
        .pipe(gminifyHtml({
          empty: true,
          spare: true,
          quotes: true
        }));

      var templates = es.merge(svg, html)
        .pipe(gngtemplate({
          moduleName: module.name,
          prefix: module.folder + '/'
        }))
        .pipe(gconcat(module.folder + '-templates.js'))
        .pipe(ginsert.transform(function (contents) {
          contents = contents.replace(/^\(function\(module\)(.+\n){6}((.+\n)+)}\)\(\);/gm, '$2');
          contents = '(function(module) {' + contents + '})(' + module.name + ');';
          return contents;
        }));

      var scripts = gulp.src([
          moduleSrc + '/**/*.js', '!**/*.test.js'
      ]);

      // Track we files we've touched
      scripts = scripts.pipe(gtap(processed.add));

      // Merge with the output of the html templates
      scripts = es.merge(scripts, templates);

      if (settings.release) {

        // If we're in release mode we'll concat, ngmin and uglify.

        scripts = scripts
          .pipe(utils.sortStream(function (file1, file2) {

            // Ensure the templates file is appended as last.

            if (file1.path.match(/\-templates\.js$/)) {
              return 1;
            }

          }))
          .pipe(gconcat(module.folder + '.js'))
          .pipe(gngmin())
          .pipe(ginsert.wrap('(function(angular){', '})(angular);'))
          .pipe(guglify())
          .pipe(grename(module.folder + '.min.js'));

      }

      scripts = scripts.pipe(gsize({ title: gutil.colors.cyan('modules:javascript:') +
        gutil.colors.blue(module.folder)}));

      scripts = scripts.pipe(gulp.dest(folders.dest + '/' + module.folder));

      streams.push(scripts);
    });

    return es.merge.apply(es, streams);
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks.style = function () {
    var streams = [];

    modules.forEach(function (module) {

      var s = gulp.src(folders.src + '/' + module.folder + '/**/*.css')
        .pipe(gtap(processed.add))
        .pipe(gprefix());

      if (settings.release) {
        s = s.pipe(gconcat(module.folder + '.min.css'))
          .pipe(gminifyCss())
      }

      s = s.pipe(gsize({ title: gutil.colors.cyan('modules:style:') +
        gutil.colors.blue(module.folder)}));

      s = s.pipe(gulp.dest(folders.dest + '/' + module.folder));

      streams.push(s);

    });

    return es.merge.apply(es, streams);
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  modules.tasks.post = function () {

    var streams = [];

    modules.forEach(function (module) {

      // Copy everything ...

      var globs = [
          folders.src + '/' + module.folder + '/**/*'
      ];

      // ... isn't a test file

      globs.push('!' + folders.src + '/' + module.folder + '/**/*.test.js');

      // ... that has not been touched by transformers

      processed.forEach(function (filePath) {
        globs.push('!' + filePath);
      });

      var s = gulp.src(globs)
        .pipe(es.map(function(file, cb) {

          // Only include files to prevent empty directories

          if(file.stat.isFile()) {
            cb(null, file);
          } else {
            cb();
          }

        }))
        .pipe(gulp.dest(folders.dest + '/' + module.folder));

      streams.push(s);

    });

    return es.merge.apply(es, streams);

  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getIncludes(ext, exclude) {
    var globs = [];

    modules.forEach(function (module) {

      if (!settings.release) {

        // Not in release mode:
        // Ensure the main module file is included first

        globs.push(module.folder + '/' + module.folder + ext);
        globs.push(module.folder + '/**/*' + ext);
      } else {

        // In release mode:
        // Include the minified version.

        globs.push(module.folder + '/' + module.folder + '.min' + ext);
      }

    });

    var res = gulp.src(globs, {
      read: false,
      cwd: path.resolve(settings.folders.dest)
    });

    if (exclude) {
      res = res.pipe(gfilter('!**/*' + exclude));
//      res = res.pipe(utils.dumpFilePaths());
    }

    return res;
  }

  modules.includes = {
    js: function () {
      return getIncludes('.js', '.test.js');
    },
    css: function () {
      return getIncludes('.css');
    },
    test: function () {
      return getIncludes('.test.js');
    },
    all: function () {
      return es.merge(this.js(), this.css());
    }
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
