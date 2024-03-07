(function ()
{
    'use strict';

    angular
        .module('app.customer.todo', ['constants'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, pageTitles)
    {
        // State
        $stateProvider.state('app.customer.to-do', {
            url      : '/to-do/:date?&taskId',
            views    : {
                'main@': {
                    templateUrl: 'app/core/layouts/vertical-navigation.html',
                    controller: 'MainController as vm'
                },
                'toolbar@app.customer.to-do': {
                    templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
                    controller: 'ToolbarController as vm'
                },
                'navigation@app.customer.to-do': {
                    templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
                    controller: 'NavigationController as vm'
                },
                'quickPanel@app.customer.to-do': {
                    templateUrl: 'app/quick-panel/quick-panel.html',
                    controller: 'QuickPanelController as vm'
                },
                'content@app.customer.to-do': {
                    templateUrl: 'app/main/apps/todo/todo.html',
                    controller : 'TodoController as vm'
                }
            },
            bodyClass: 'todo',
            authenticate: true,
            authenticateUsers : true,
            pageTitle: pageTitles.toDoPage
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/todo');

        // Navigation
        /*msNavigationServiceProvider.saveItem('apps.customer.to-do', {
            title : 'To-Do',
            icon  : 'icon-checkbox-marked',
            state : 'app.customer.to-do',
            badge : {
                content: 3,
                color  : '#FF6F00'
            },
            weight: 9
        });*/
    }

})();
