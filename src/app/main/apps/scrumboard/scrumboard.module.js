(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard', ['constants', 'flow', 'ui.calendar'])
    .config(config)
    .run(run);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, pageTitles) {
    $stateProvider
      .state('app.customer.scrumboard', {
        abstract: true,
        url: '/scrumboard',
        bodyClass: 'scrumboard'
      })

      // Home
      .state('app.customer.scrumboard.boards', {
        url: '/boards',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.customer.scrumboard.boards': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.customer.scrumboard.boards': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.customer.scrumboard.boards': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.customer.scrumboard.boards': {
            templateUrl: 'app/main/apps/scrumboard/views/boards/boards-view.html',
            controller: 'BoardsViewController as vm'
          }
        },
        authenticate: true,
        authenticateUsers: true,
        pageTitle: pageTitles.boardsListPage
      })

      // Add board
      .state('app.customer.scrumboard.boards.addBoard', {
        url: '/add',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.customer.scrumboard.boards.addBoard': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.customer.scrumboard.boards.addBoard': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.customer.scrumboard.boards.addBoard': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.customer.scrumboard.boards.addBoard': {
            templateUrl: 'app/main/apps/scrumboard/scrumboard.html',
            controller: 'ScrumboardController as vm'
          },
          'scrumboardContent@app.customer.scrumboard.boards.addBoard': {
            templateUrl: 'app/main/apps/scrumboard/views/board/board-view.html',
            controller: 'BoardViewController as vm'
          }
        },
        resolve: {
          BoardData: function ($stateParams, BoardService) {
            return BoardService.addNewBoard();
          }
        },
        authenticate: true,
        authenticateUsers: true
      })


      // Board
      .state('app.customer.scrumboard.boards.board', {
        url: '/:id?priority&cardId&date',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.customer.scrumboard.boards.board': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.customer.scrumboard.boards.board': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.customer.scrumboard.boards.board': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.customer.scrumboard.boards.board': {
            templateUrl: 'app/main/apps/scrumboard/scrumboard.html',
            controller: 'ScrumboardController as vm'
          },
          'scrumboardContent@app.customer.scrumboard.boards.board': {
            templateUrl: 'app/main/apps/scrumboard/views/board/board-view.html',
            controller: 'BoardViewController as vm'
          }
        },
        resolve: {
          BoardData: function ($stateParams, BoardService) {
            return BoardService.getBoardData($stateParams);
          }
        },
        authenticate: true,
        authenticateUsers: true,
        pageTitle: pageTitles.dontChangeTitle
      })

      // Calendar
      .state('app.customer.scrumboard.boards.board.calendar', {
        url: '/calendar',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.customer.scrumboard.boards.board.calendar': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.customer.scrumboard.boards.board.calendar': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.customer.scrumboard.boards.board.calendar': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.customer.scrumboard.boards.board.calendar': {
            templateUrl: 'app/main/apps/scrumboard/scrumboard.html',
            controller: 'ScrumboardController as vm'
          },
          'scrumboardContent@app.customer.scrumboard.boards.board.calendar': {
            templateUrl: 'app/main/apps/scrumboard/views/calendar/calendar-view.html',
            controller: 'CalendarViewController as vm'
          }
        },
        authenticate: true,
        authenticateUsers: true
      })

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/scrumboard');

  }

  /** @ngInject */
  function run(editableThemes) {
    /**
     * Inline Edit Configuration
     * @type {string}
     */
    editableThemes.default.submitTpl = '<md-button class="md-icon-button" type="submit" aria-label="save"><md-icon md-font-icon="icon-checkbox-marked-circle" class="md-accent-fg md-hue-1"></md-icon></md-button>';
    editableThemes.default.cancelTpl = '<md-button class="md-icon-button" ng-click="$form.$cancel()" aria-label="cancel"><md-icon md-font-icon="icon-close-circle" class="icon-cancel"></md-icon></md-button>';
  }

})();
