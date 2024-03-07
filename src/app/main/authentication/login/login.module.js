(function () {
  'use strict';

  angular
    .module('app.login', ['constants']
  )
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    // State
    $stateProvider
      .state('app.login', {
        url: '/login/:channelName',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/content-only.html',
            controller : 'MainController as vm'
          },
          'content@app.login': {
            templateUrl: 'app/main/authentication/login/login.html',
            controller: 'loginController as vm'
          }
        },
        bodyClass: 'login',
        authenticate: true
      });

    // Translation
    //$translatePartialLoaderProvider.addPart('app/main/apps/landing');
  }
})();
