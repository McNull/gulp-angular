// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var gutil = require('gulp-util');

var deepExtend = require('deep-extend');
var minimist = require('minimist');

var utils = require('./lib/utils');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var project = module.exports = {
  settings: require('./lib/settings'),
  vendor: require('./lib/vendor'),
  modules: require('./lib/modules'),
  server: require('./lib/server'),
  index: require('./lib/index-html'),
  test: require('./lib/test.js')
};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

project.init = function (gulp, settings) {

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  utils.init(gulp);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  settings = deepExtend(project.settings, settings || {});

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var argv = minimist(process.argv.slice(2));

  var target = argv.target || process.env.NODE_ENV;

  if(target) {
    target = target.toLowerCase();

    if(target == 'production' || target == 'release') {
      settings.release = true;
    }
  }

  if (settings.release) {
    gutil.log('Target build set to', gutil.colors.yellow('release'));
  } else {
    gutil.log('Target build set to', gutil.colors.yellow('debug'));
  }

  gutil.log('Target can be specified with', gutil.colors.cyan('--target (release|debug)'))

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gutil.log('Source directory:', gutil.colors.cyan(settings.folders.src));
  gutil.log('Destination directory:', gutil.colors.cyan(settings.folders.dest));
  gutil.log('Vendor directory:', gutil.colors.cyan(settings.folders.vendor));

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  project.vendor.init(gulp);
  project.modules.init(gulp);
  project.server.init(gulp);
  project.index.init(gulp);
  project.test.init(gulp);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('vendor:clean', project.vendor.tasks.clean);
  gulp.task('vendor', ['vendor:clean'], project.vendor.tasks.copy);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('modules:clean', project.modules.tasks.clean);
  gulp.task('modules:svg', ['modules:clean'], project.modules.tasks.scalableVectorGraphics);
  gulp.task('modules:javascript', ['modules:clean'], project.modules.tasks.javascript);
  gulp.task('modules:style', ['modules:clean'], project.modules.tasks.style);
  gulp.task('modules', ['modules:javascript', 'modules:style', 'modules:svg'], project.modules.tasks.post);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('index:clean', project.index.tasks.clean);
  gulp.task('index', ['modules', 'vendor'], project.index.tasks.make);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('clean', ['vendor:clean', 'modules:clean', 'index:clean']);
  gulp.task('build', ['index']);
  gulp.task('default', ['build']);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  gulp.task('test-run', ['build'], project.test.tasks.run);
  gulp.task('test-watch', ['build'], project.test.tasks.watch);

  // - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

