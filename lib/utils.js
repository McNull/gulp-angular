
var gulp;

var utils = module.exports = {};

utils.init = function(gulpInstance) {
  gulp = gulpInstance;

  //noinspection JSUnresolvedFunction
  gulp.on('err', function(e) {
    console.log(e.err.stack);
  });
};

utils.dump = function(obj) {
  process.stdout.write(JSON.stringify(obj, null, '  '));
};

utils.dumpln = function(obj) {
  utils.dump(obj);
  process.stdout.write('\n');
};

utils.dummyTask = function(cb) { cb(); }

