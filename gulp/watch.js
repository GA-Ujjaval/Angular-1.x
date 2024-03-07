/* jshint node: true */
(function () {
  'use strict';

  const gulp = require('gulp');
  const conf = require('./conf');
  const browserSync = require('browser-sync');

  exports.watchHtml = function watchHtml() {
    gulp.watch([`${conf.paths.src}/*.html`, 'bower.json'], gulp.series(conf.tasks.injects.injectReload));
  };

  exports.watchStyles = function watchStyles() {
    gulp.watch([`${conf.paths.src}/app/**/*.css`, `${conf.paths.src}/app/**/*.scss`],
      gulp.series(conf.tasks.styles.stylesReload));
  };

  exports.watchScripts = function watchScripts() {
    gulp.watch(`${conf.paths.src}/app/**/*.js`, gulp.series(conf.tasks.scripts.scriptsReload));
  };

  exports.watch = function watch() {
    gulp.watch([`${conf.paths.src}/app/**/*.json`, `${conf.paths.src}/app/**/*.html`], function reload(event) {
     browserSync.reload(event.path);
     event();
    });
  };
})();
