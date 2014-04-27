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
    processed.push(file.path);
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('modules:pre', ['clean'], utils.dummyTask);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('modules:javascript', ['modules:pre'], function () {

    var streams = [];

    modules.forEach(function (module) {

      var templates = gulp.src(folders.src + '/' + module.folder + '/**/*.ng.html')
        .pipe(gtap(processed.add))
        .pipe(gminifyHtml({
          empty: true,
          spare: true,
          quotes: true
        }))
        .pipe(gngtemplate({
          moduleName: module.name,
          prefix: module.folder + '/'
        }))
        .pipe(gconcat(module.folder + '-templates.js'))
        .pipe(ginsert.transform(function(contents) {
          contents = contents.replace(/^\(function\(module\)(.+\n){6}((.+\n)+)}\)\(\);/gm, '$2');
          contents = '(function(module) {' + contents + '})(' + module.name + ');';
          return contents;
        }));

      var scripts = gulp.src([
          folders.src + '/' + module.folder + '/**/*.js'
      ]);

      // Track we files we've touched
      scripts = scripts.pipe(gtap(processed.add));

      // Merge with the output of the html templates
      scripts = es.merge(templates, scripts);

      if (settings.release) {

        // If we're in release mode we'll concat, ngmin and uglify.

        scripts = scripts.pipe(gconcat(module.folder + '.js'))
          .pipe(gngmin())
          .pipe(ginsert.wrap('(function(angular){', '})(angular);'))
          .pipe(guglify())
          .pipe(grename(module.folder + '.min.js'));

      }

      scripts = scripts.pipe(gsize({ title: gutil.colors.cyan('modules:javascript:') +
                                            gutil.colors.blue(module.folder)}));

      scripts = scripts.pipe(gulp.dest(folders.build + '/' + module.folder));

      streams.push(scripts);
    });

    return es.merge.apply(es, streams);

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('modules:style', ['modules:pre'], function () {

    var streams = [];

    modules.forEach(function (module) {

      var s = gulp.src(folders.src + '/' + module.folder + '/**/*.css')
        .pipe(gtap(processed.add));

      if(settings.release) {
        s = s.pipe(gconcat(module.folder + '.min.css'))
          .pipe(gminifyCss())
      }

      s = s.pipe(gsize({ title: gutil.colors.cyan('modules:style:') +
                                gutil.colors.blue(module.folder)}));

      s = s.pipe(gulp.dest(folders.build + '/' + module.folder));

      streams.push(s);

    });

    return es.merge.apply(es, streams);

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('modules', ['modules:javascript', 'modules:style'], function () {

    var streams = [];

    modules.forEach(function (module) {

      // Copy everything that has not been touched by transformers

      var globs = [folders.src + '/' + module.folder + '/**/*'];

      processed.forEach(function(filePath) {
        globs.push('!' + filePath);
      });

      var s = gulp.src(globs).pipe(gulp.dest(folders.build + '/' + module.folder));

      streams.push(s);

    });

    return es.merge.apply(es, streams);

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getIncludes(ext) {
    var globs = [];

    modules.forEach(function (module) {

      if (!settings.release) {
        globs.push(module.folder + '/' + module.folder + ext);
        globs.push(module.folder + '/**/*' + ext);
      } else {
        globs.push(module.folder + '/' + module.folder + '.min' + ext);
      }

    });

    return gulp.src(globs, {
      read: false,
      cwd: path.resolve(settings.folders.build)
    });
  }

  modules.includes = {
    js: function () {
      return getIncludes('.js');
    },
    css: function () {
      return getIncludes('.css');
    },
    all: function () {
      return es.merge(this.js(), this.css());
    }
  };

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -