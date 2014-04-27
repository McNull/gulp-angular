# [gulp](http://gulpjs.com)-[angular](https://angularjs.org)

> Opinionated domain driven AngularJs project builder based on Gulp.

## Install

```bash
$ npm install --save-dev gulp-angular
```


## Usage

```js
// gulpfile.js

var gulp = require('gulp');
var project = require('gulp-angular');

project.init(gulp);

project.modules.add('app')
		  	   .add('myModule');
```

### Release build

```bash
$ gulp --release [taskname]
```

### Debug build

```bash
$ gulp [taskname]
```

