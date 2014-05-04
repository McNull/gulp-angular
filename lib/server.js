#!/usr/bin/env node
/**
 * Created by null on 28/04/14.
 */

var settings = require('./settings');
var express = require('express');
var gutil = require('gulp-util');
var path = require('path');

var server = module.exports = {};

server.init = function(gulp) {

  gulp.task('server', ['build'], function() {

    var app = express();

    if(settings.server.cacheDisabled) {
      app.use(function noCache(req, res, next) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        next();
      });
    }

    if(settings.server.delay) {
      app.use(function(req, res, next) {
        setTimeout(function() {
          next();
        }, settings.server.delay);
      });
    }

    var root = settings.server.root || settings.folders.dest;

    app.use(express.static(root));

    app.use(function(req, res, next) {
      res.send(404); // If we get here then the request for a static file is invalid
    });

    app.listen(settings.server.port);

    gutil.log('Server listening on ' + gutil.colors.yellow('http://localhost:' + settings.server.port + '/'));

  });

};