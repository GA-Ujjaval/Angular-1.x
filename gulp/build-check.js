'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync');

gulp.task('build:check', function() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});
