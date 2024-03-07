/* jshint node: true */
(function () {
  'use strict';

  const gulp = require('gulp');
  const conf = require('./conf');
  const $ = require('gulp-load-plugins')();
  const wiredep = require('wiredep').stream;
  const _ = require('lodash');
  const browserSync = require('browser-sync');

  function buildInject() {
    const injectStyles = gulp.src([
      `${conf.paths.tmp}/serve/app/**/*.css`,
      `!${conf.paths.tmp}/serve/app/vendor.css`
    ], {read: false});

    const injectScripts = gulp.src([
      `${conf.paths.src}/app/**/*.module.js`,
      `${conf.paths.src}/app/**/*.js`,
      `!${conf.paths.src}/app/**/*.spec.js`,
      `!${conf.paths.src}/app/**/*.mock.js`
    ])
      .pipe($.babel({
        presets: ['@babel/env']
      }))
      .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

    const injectOptions = {
      ignorePath: [conf.paths.src, `${conf.paths.tmp}/serve`],
      addRootSlash: false
    };

    return gulp.src(`${conf.paths.src}/*.html`)
      .pipe($.inject(injectStyles, injectOptions))
      .pipe($.inject(injectScripts, injectOptions))
      .pipe(wiredep(_.extend({}, conf.wiredep)))
      .pipe(gulp.dest(`${conf.paths.tmp}/serve/`));
  }

  function serveInject() {
    const injectStyles = gulp.src([
      `${conf.paths.tmp}/serve/app/**/*.css`,
      `!${conf.paths.tmp}/serve/app/vendor.css`
    ], {read: false});

    const injectScripts = gulp.src([
      `${conf.paths.src}/app/**/*.module.js`,
      `${conf.paths.src}/app/**/*.js`,
      `!${conf.paths.src}/app/**/*.spec.js`,
      `!${conf.paths.src}/app/**/*.mock.js`
    ]);

    const injectOptions = {
      ignorePath: [conf.paths.src, `${conf.paths.tmp}/serve`],
      addRootSlash: false
    };

    return gulp.src(`${conf.paths.src}/*.html`)
      .pipe($.inject(injectStyles, injectOptions))
      .pipe($.inject(injectScripts, injectOptions))
      .pipe(wiredep(_.extend({}, conf.wiredep)))
      .pipe(gulp.dest(`${conf.paths.tmp}/serve/`));
  }

  exports.buildInject = buildInject;
  exports.serveInject = serveInject;

  exports.injectReload = function serveInjectReload() {
    return serveInject()
      .pipe(browserSync.reload({stream: true}));
  };
}());
