(function () {
  'use strict';

  angular
    .module('app.adminsetting', ['constants', 'flow', 'ui.grid.autoResize', 'ui.grid.edit'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, pageTitles) {
    $stateProvider
      .state('app.adminsetting', {
        abstract: true,
        url: '/admin'
      })
      .state('app.adminsetting.setting', {
        url: '/setting',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.adminsetting.setting': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.adminsetting.setting': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.adminsetting.setting': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.adminsetting.setting': {
            templateUrl: 'app/main/apps/setting/setting.html',
            controller: 'settingCustomerController as vm'
          }
        },
        bodyClass: 'setting-customer',
        authenticate: true,
        authenticateUsers: false,
        pageTitle: pageTitles.settingsPage
      });
  }
})();
