/* jshint node: true */
(function () {
  'use strict';

  const gulp = require('gulp');
  const conf = require('./conf');
  const browserSync = require('browser-sync');
  const $ = require('gulp-load-plugins')();

  exports.scriptsReload = function scriptsReload() {
    return buildScripts()
      .pipe(browserSync.reload({stream: true}));
  };
  exports.scripts = function scripts() {
    return buildScripts();
  };

  function buildScripts() {
    return gulp.src(`${conf.paths.src}/app/**/*.js`, {since: gulp.lastRun(buildScripts)})
      .pipe($.cached('scripts'))
      .pipe($.remember('scripts'));
  }
})();
