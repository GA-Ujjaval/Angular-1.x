(function () {
  'use strict';

  angular
    .module('app.search', ['constants', 'flow'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, pageTitles) {
    // State
    $stateProvider
      .state('app.search', {
        abstract: true,
        url: '/search'
      })
      .state('app.search.search', {
        url: '/search',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.search.search': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.search.search': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.search.search': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.search.search': {
            templateUrl: 'app/main/apps/search/search.html',
            controller: 'SearchController as vm'
          }
        },
        bodyClass: 'search',
        pageTitle: pageTitles.searchPage
      });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/pages/search');

  }

})();
