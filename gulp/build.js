/* jshint node: true */
(function () {
  'use strict';

  const path = require('path');
  const gulp = require('gulp');
  const conf = require('./conf');
  const uglify = require('gulp-uglify-es').default;
  const $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
  });

  const partials = function partials() {
    return gulp.src([
      `${conf.paths.src}/app/**/*.html`,
      `!${conf.paths.src}/app/main/components/material-docs/demo-partials/**/*.html`,
      `${conf.paths.tmp}/serve/app/**/*.html`
    ])
      .pipe($.htmlmin({
        collapseWhitespace: true,
        maxLineLength: 120,
        removeComments: true
      }))
      .pipe($.angularTemplatecache('templateCacheHtml.js', {
        module: 'fuse',
        root: 'app'
      }))
      .pipe(gulp.dest(`${conf.paths.tmp}/partials/`));
  };

  const html = function html() {
    const partialsInjectFile = gulp.src(`${conf.paths.tmp}/partials/templateCacheHtml.js`, {read: false});
    const partialsInjectOptions = {
      starttag: '<!-- inject:partials -->',
      ignorePath: `${conf.paths.tmp}/partials`,
      addRootSlash: false
    };

    const cssFilter = $.filter('**/*.css', {restore: true});
    const jsFilter = $.filter(['**/*.js', '!**/*.spec.js'], {restore: true});
    const htmlFilter = $.filter('*.html', {restore: true});

    const isAppJs = function (file) {
      return file.extname === '.js' && (path.basename(file.path).indexOf('app') !== -1);
    };

    const isJs = function (file) {
      return file.extname === '.js';
    };

    return gulp.src(`${conf.paths.tmp}/serve/*.html`)
      .pipe($.inject(partialsInjectFile, partialsInjectOptions))
      .pipe($.useref())
      .pipe(jsFilter)
      .pipe($.rev())
      .pipe(jsFilter.restore)
      .pipe(cssFilter)
      .pipe($.cleanCss())
      .pipe($.rev())
      .pipe(cssFilter.restore)
      .pipe($.revReplace())
      .pipe(htmlFilter)
      .pipe($.htmlmin({
        collapseWhitespace: true,
        maxLineLength: 120,
        removeComments: true
      }))
      .pipe(htmlFilter.restore)
      .pipe($.if(isAppJs, $.babel({
        presets: ['@babel/env'],
      })))
      .pipe($.if(isAppJs, $.ngAnnotate()))
      .pipe($.if(isJs, uglify()))
      .pipe(gulp.dest(`${conf.paths.dist}/`))
      .pipe($.size({
        title: `${conf.paths.dist}/`,
        showFiles: true
      }));
  };

  const fonts = function fonts() {
    gulp.src(['bower_components/angular-ui-grid/fonts/ui-grid.ttf',
      'bower_components/angular-ui-grid/fonts/ui-grid.woff',
      'bower_components/angular-ui-grid/fonts/ui-grid.eot',
      'bower_components/angular-ui-grid/fonts/ui-grid.svg'
    ])
      .pipe(gulp.dest(`${conf.paths.dist}/styles/fonts`));

    return gulp.src($.mainBowerFiles())
      .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
      .pipe($.flatten())
      .pipe(gulp.dest(`${conf.paths.dist}/fonts/`));
  };

  const other = function other() {
    const fileFilter = $.filter(function (file) {
      return file.stat.isFile();
    });

    return gulp.src([
      `${conf.paths.src}/**/*`,
      `!${conf.paths.src}/**/*.{html,css,js,scss}`
    ])
      .pipe(fileFilter)
      .pipe(gulp.dest(`${conf.paths.dist}/`));
  };

  const materialDocs = function materialDocs() {
    const fileFilter = $.filter(function (file) {
      return file.stat.isFile();
    });

    return gulp.src(
      `${conf.paths.src}/app/main/components/material-docs/demo-partials/**/*`
    )
      .pipe(fileFilter)
      .pipe(gulp.dest(`${conf.paths.dist}/app/main/components/material-docs/demo-partials/`));
  };

  gulp.task('clean', function clean() {
    return $.del([`${conf.paths.dist}/`, `${conf.paths.tmp}/`]);
  });

  const styles = conf.tasks.styles.styles;
  const scripts = conf.tasks.scripts.scripts;
  const inject = conf.tasks.injects.buildInject;

  gulp.task('build', gulp.series(gulp.parallel(styles, scripts), inject,
    partials, html, gulp.parallel(fonts, other, materialDocs), function buildComplete(done) {
    require('dotenv').config();
    const fs = require('fs');

    if (process.env.MIXPANEL_ID) {
      fs.writeFile('src/token.js', 'window.tokenMixPanel = ' + '"' + process.env.MIXPANEL_ID + '"' + ';', function (err) {
        if (err) {
          throw err;
        }
        console.log('token was saved in src!');
      });

      fs.writeFile('dist/token.js', 'window.tokenMixPanel = ' + '"' + process.env.MIXPANEL_ID + '"' + ';', function (err) {
        if (err){
          throw err;
        }
        console.log('token was saved in dist!');
      });
    } else {
      console.log('MIXPANEL_ID token is missing!');
    }
    done();
  }));
})();
