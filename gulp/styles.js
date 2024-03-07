/* jshint node: true */
(function () {
  'use strict';

  const gulp = require('gulp');
  const conf = require('./conf');
  const browserSync = require('browser-sync');
  const $ = require('gulp-load-plugins')();
  const wiredep = require('wiredep').stream;
  const _ = require('lodash');

  const buildStyles = function () {
    const sassOptions = {
      style: 'expanded'
    };

    const injectFiles = gulp.src([
      `${conf.paths.src}/app/core/scss/**/*.scss`,
      `${conf.paths.src}/app/core/**/*.scss`,
      `${conf.paths.src}/app/**/*.scss`,
      `!${conf.paths.src}/app/main/components/material-docs/demo-partials/**/*.scss`,
      `!${conf.paths.src}/app/core/scss/partials/**/*.scss`,
      `!${conf.paths.src}/app/index.scss`
    ], {read: false});

    const injectOptions = {
      transform: function (filePath) {
        filePath = filePath.replace(`${conf.paths.src}/app/`, '');
        return `@import "${filePath}";`;
      },
      starttag: '// injector',
      endtag: '// endinjector',
      addRootSlash: false
    };

    return gulp.src(
      `${conf.paths.src}/app/index.scss`)
      .pipe($.inject(injectFiles, injectOptions))
      .pipe(wiredep(_.extend({}, conf.wiredep)))
      .pipe($.sourcemaps.init())
      .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
      .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest(`${conf.paths.tmp}/serve/app/`));
  };

  const serveStyles = function () {
    const sassOptions = {
      style: 'expanded'
    };

    const injectFiles = gulp.src([
      `${conf.paths.src}/app/core/scss/**/*.scss`,
      `${conf.paths.src}/app/core/**/*.scss`,
      `${conf.paths.src}/app/**/*.scss`,
      `!${conf.paths.src}/app/main/components/material-docs/demo-partials/**/*.scss`,
      `!${conf.paths.src}/app/core/scss/partials/**/*.scss`,
      `!${conf.paths.src}/app/index.scss`
    ], {since: gulp.lastRun(serveStyles)})
      .pipe($.cached('styles'))
      .pipe($.remember('styles'));

    const injectOptions = {
      transform: function (filePath) {
        filePath = filePath.replace(`${conf.paths.src}/app/`, '');
        return `@import "${filePath}";`;
      },
      starttag: '// injector',
      endtag: '// endinjector',
      addRootSlash: false
    };

    return gulp.src(
      `${conf.paths.src}/app/index.scss`)
      .pipe($.inject(injectFiles, injectOptions))
      .pipe($.sourcemaps.init())
      .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest(`${conf.paths.tmp}/serve/app/`));
  };

  exports.serveStyles = serveStyles;

  exports.styles = function styles() {
    return buildStyles();
  };

  exports.stylesReload = function stylesReload() {
    return serveStyles()
      .pipe(browserSync.reload({stream: true}));
  };


}());
