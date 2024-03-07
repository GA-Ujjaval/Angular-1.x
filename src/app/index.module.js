(function () {
  'use strict';

  /**
   * Main module of the Fuse
   */
  angular
    .module('fuse', [


      'ngMaterial',

      // Core
      'app.core',

      // Navigation
      'app.navigation',

      // Toolbar
      'app.toolbar',

      // Quick panel
      'app.quick-panel',

      // Apps
      'app.admin',
      //'app.landing',
      'app.login',
      'app.createPassword',
      'app.forgotPassword',
      'app.customer',
      'app.objects',
      'app.adminsetting',
      'app.search',
      // plm chat bot integration
      'app.chat-bot'

      //'app.dashboards',
      //'app.calendar',
      //'app.e-commerce',
      //'app.mail',
      //'app.chat',
      //'app.file-manager',
      //'app.scrumboard',
      //'app.gantt-chart',
      //'app.todo',
      //'app.contacts',
      //'app.notes',

      // Pages
      //'app.pages',

      // User Interface
      //'app.ui',

      // Components
      //'app.components'
    ]);
})();
