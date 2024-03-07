/* jshint node: true */
(function () {
  'use strict';

  const gulp = require('gulp');
  const conf = require('./conf');

  const browserSync = require('browser-sync');
  const browserSyncSpa = require('browser-sync-spa');
  const util = require('util');
  require('dotenv').config();
  const fs = require('fs');

  if (process.env.MIXPANEL_ID) {
    fs.writeFile('src/token.js', 'window.tokenMixPanel = ' + '"' + process.env.MIXPANEL_ID + '"' + ';', function (err) {
      if (err) {
        throw err;
      }
      console.log('token was saved in src!');
    });
  } else {
    console.log('MIXPANEL_ID token is missing!');
  }
// create file with MixPanelToken end


  const proxyMiddleware = require('http-proxy-middleware');

  function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    let routes = null;
    if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
      routes = {
        '/bower_components': 'bower_components'
      };
    }

    const server = {
      baseDir: baseDir,
      routes: routes
    };

    /*
     * You can add a proxy to your backend by uncommenting the line below.
     * You just have to configure a context which will we redirected and the target url.
     * Example: $http.get('/users') requests will be automatically proxified.
     *
     * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.9.0/README.md
     */
    // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', changeOrigin: true});

    browserSync.instance = browserSync.init({
      startPath: '/',
      server: server,
      browser: browser
    });
  }

  const styles = conf.tasks.styles.serveStyles;
  const scripts = conf.tasks.scripts.scripts;
  const inject = conf.tasks.injects.serveInject;
  const watches = conf.tasks.watch;

  browserSync.use(browserSyncSpa({
    selector: '[ng-app]'// Only needed for angular apps
  }));

  const serve = (done) => {
    browserSyncInit([(`${conf.paths.tmp}/serve`), conf.paths.src]);
    done();
  };

  gulp.task('serve', gulp.series(gulp.parallel(styles, scripts), inject, gulp.parallel(watches.watch, watches.watchHtml,
    watches.watchScripts, watches.watchStyles, serve)));
})();
