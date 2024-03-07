(function () {
  'use strict';

  angular
    .module('app.landing', []
  )
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    // State
    $stateProvider
      .state('app.landing', {
        url: '/landing',
        views: {
          'main@'                       : {
            templateUrl: 'app/core/layouts/content-only.html',
            controller : 'MainController as vm'
          },
          'content@app.landing': {
            templateUrl: 'app/main/authentication/landing/landing.html',
            controller: 'landingController as vm'
          }
        },
        bodyClass: 'landing',
        authenticate: true
      });

    // Translation
    //$translatePartialLoaderProvider.addPart('app/main/apps/landing');
  }
})();
