/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */
/* jshint node: true */
'use strict';

const gulp = require('gulp');
const requireDir = require('require-dir');
requireDir('./gulp/');
/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', gulp.series('clean', 'build'));
