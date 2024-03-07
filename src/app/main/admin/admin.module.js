(function () {
    'use strict';

    angular
        .module('app.admin', [
            'flow'
        ]
    )
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {
        // State
        $stateProvider
            .state('app.admin', {
                abstract: true,
                url: '/admin'
            })
            .state('app.admin.dashboard', {
                url: '/dashboard',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-with-toolbar.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.admin.dashboard': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-admin/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'content@app.admin.dashboard': {
                        templateUrl: 'app/main/admin/views/dashboard/dashboard.html',
                        controller: 'dashboardAdminController as vm'
                    }
                },
                bodyClass: 'dashboard-admin',
                authenticate: false,
                authenticateUsers : false
            })
            .state('app.admin.profile', {
                url: '/dashboard/profile',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-with-toolbar.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.admin.profile': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-admin/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'content@app.admin.profile': {
                        templateUrl: 'app/main/admin/views/dashboard/profile/profile.html',
                        controller: 'profileAdminController as vm'
                    }
                },
                bodyClass: 'profile-admin',
                authenticate: false,
                authenticateUsers : false
            })
            .state('app.admin.password', {
                url: '/dashboard/password',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-with-toolbar.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.admin.password': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-admin/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'content@app.admin.password': {
                        templateUrl: 'app/main/admin/views/dashboard/password/password.html',
                        controller: 'passwordAdminController as vm'
                    }
                },
                bodyClass: 'passwordAdmin',
                authenticate: false,
                authenticateUsers : false
            });

        // Translation
        //$translatePartialLoaderProvider.addPart('app/main/admin/views/login');

        // Api
        //msApiProvider.register('tables.employees100', ['app/data/tables/employees100.json']);
        //msApiProvider.register('tables.employees100', ['http://10.0.0.13:9090/FusePLM/getusers']);

        /*
         // Navigation
         msNavigationServiceProvider.saveItem('apps.admin', {
         title : 'Admin',
         icon  : 'icon-cart',
         weight: 3
         });

         msNavigationServiceProvider.saveItem('apps.admin.landing', {
         title: 'Landing',
         state: 'app.admin.landing'
         });

         msNavigationServiceProvider.saveItem('apps.admin.login', {
         title: 'Login',
         state: 'app.admin.login'
         });*/

    }
})();
