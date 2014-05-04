// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var fs = require('fs');

var gutil = require('gulp-util');
var gclean = require('gulp-clean');
var ginject = require('gulp-inject');
var gtap = require('gulp-tap');

var deepExtend = require('deep-extend');
var minimist = require('minimist');

var utils = require('./lib/utils');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var project = module.exports = {
  settings: require('./lib/settings'),
  vendor: require('./lib/vendor'),
  modules: require('./lib/modules'),
  server: require('./lib/server')
};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

project.init = function (gulp, settings) {

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  utils.init(gulp);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  settings = deepExtend(project.settings, settings || {});

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var argv = minimist(process.argv.slice(2));

  settings.release = argv.target == 'release' ||
    argv.target == 'production' ||
    process.env.NODE_ENV == 'production' ||
    process.env.NODE_ENV == 'release';

  if (settings.release) {
    gutil.log('Target build set to', gutil.colors.yellow('release'));
  } else {
    gutil.log('Target build set to', gutil.colors.yellow('debug'));
  }

  gutil.log('Target can be specified with', gutil.colors.cyan('--target (releas|debug)'))

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gutil.log('Source directory:', gutil.colors.cyan(settings.folders.src));
  gutil.log('Destination directory:', gutil.colors.cyan(settings.folders.dest));
  gutil.log('Vendor directory:', gutil.colors.cyan(settings.folders.vendor));

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  project.vendor.init(gulp);
  project.modules.init(gulp);
  project.server.init(gulp);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var folders = settings.folders;

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('clean', function () {

    return gulp.src(folders.dest, {read: false}).pipe(gclean());

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('index', ['modules', 'vendor'], function () {

    var vendor = project.vendor.includes.all();
    var modules = project.modules.includes.all();

    if (settings.release) {

      function preferMinified(file) {

        // Locate the minified version

        var filePath = file.path.replace(/\/([^\/]+)(\.min)?\.(\w+)$/, "/$1.min.$3");
        if (fs.existsSync(filePath)) {
          file.path = filePath;
        }
      }

      vendor.pipe(gtap(preferMinified));
      modules.pipe(gtap(preferMinified));
    }

    return gulp.src(folders.src + '/index.html')
      .pipe(ginject(vendor, {
        addPrefix: '/vendor',
        starttag: '<!-- inject:vendor:{{ext}} -->'
      }))
      .pipe(ginject(modules))
      .pipe(gulp.dest(folders.dest));

  });

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('build', ['index']);
  gulp.task('default', ['build']);

};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

