var gulp;

var fs = require('fs');

var es = require('event-stream');
var gtap = require('gulp-tap');


var utils = module.exports = {};

utils.init = function (gulpInstance) {
  gulp = gulpInstance;

  //noinspection JSUnresolvedFunction
  gulp.on('err', function (e) {
    console.log(e.err.stack);
  });
};

utils.dump = function (obj) {
  process.stdout.write(JSON.stringify(obj, null, '  '));
};

utils.dumpln = function (obj) {
  utils.dump(obj);
  process.stdout.write('\n');
};

utils.dumpFilePaths = function () {
  return gtap(function (f) {
    console.log(f.path);
  });
};

utils.dummyTask = function (cb) {
  cb();
};

utils.sortStream = function (sortFn) {

  var files = [];

  function write(file) {
    files.push(file);
  }

  function end() {

    var self = this;

    files.sort(sortFn);

    files.forEach(function (file) {
      self.emit('data', file);
    });

    this.emit('end');
  }

  return es.through(write, end);
};

utils.getMinifiedFilePath = function(filePath) {
  var minified = filePath.replace(/\/([^\/]+)(\.min)?\.(\w+)$/, "/$1.min.$3");
  return fs.existsSync(minified) ? minified : filePath;
};