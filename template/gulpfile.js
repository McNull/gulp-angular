
// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var gulp = require('gulp');
var project = require('gulp-angular');

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var settings = {

  files: {
    vendor: {
      js: [
        'angular/angular.js',
        'angular-route/angular-route.js',
        'angular-animate/angular-animate.js'
      ],
      css: [
        'bootstrap-css/css/bootstrap.css'
      ],
      test: [
        'angular-mocks/angular-mocks.js'
      ]
    }
  },

  release: false
};

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

project.init(gulp, settings);
project.modules
  .add('app')
  .add('nullCarousel', {
    folder: 'angular-null-carousel'
  });

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = project;

// - - - - 8-< - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

