(function () {
    'use strict';

    angular
        .module('app.customer', ['constants', 'app.customer.scrumboard', 'app.customer.todo', 'angular-clipboard']
    )
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider, pageTitles) {

        var Board = [];
        // State
        $stateProvider
            .state('app.customer', {
                abstract: true,
                url: '/customer',
                controller: 'CustomerController as vm'
            })
            .state('app.customer.dashboard', {
                url: '/dashboard',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/vertical-navigation.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.customer.dashboard': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'navigation@app.customer.dashboard': {
                        templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
                        controller: 'NavigationController as vm'
                    },
                    'quickPanel@app.customer.dashboard': {
                        templateUrl: 'app/quick-panel/quick-panel.html',
                        controller: 'QuickPanelController as vm'
                    },
                    'content@app.customer.dashboard': {
                        templateUrl: 'app/main/apps/dashboard/dashboard.html',
                        controller: 'dashboardCustomerController as vm'
                    }
                },
                bodyClass: 'dashboard-customer',
                authenticate: true,
                authenticateUsers: true,
                pageTitle: pageTitles.dashboardPage,
                resolve  : {
                      Tasks: function (BoardService)
                      {
                          return BoardService.getTaskData();
                      }
                  }
            })
            .state('app.customer.profile', {
                url: '/profile',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/vertical-navigation.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.customer.profile': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'navigation@app.customer.profile': {
                        templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
                        controller: 'NavigationController as vm'
                    },
                    'quickPanel@app.customer.profile': {
                        templateUrl: 'app/quick-panel/quick-panel.html',
                        controller: 'QuickPanelController as vm'
                    },
                    'content@app.customer.profile': {
                        templateUrl: 'app/main/apps/profile/profile.html',
                        controller: 'profileCustomerController as vm'
                    }
                },
                bodyClass: 'profile-customer',
                authenticate: true,
                authenticateUsers: true
            })
            .state('app.customer.settings', {
              url: '/settings',
              views: {
                'main@': {
                  templateUrl: 'app/core/layouts/vertical-navigation.html',
                  controller: 'MainController as vm'
                },
                'toolbar@app.customer.settings': {
                  templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
                  controller: 'ToolbarController as vm'
                },
                'navigation@app.customer.settings': {
                  templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
                  controller: 'NavigationController as vm'
                },
                'quickPanel@app.customer.settings': {
                  templateUrl: 'app/quick-panel/quick-panel.html',
                  controller: 'QuickPanelController as vm'
                },
                'content@app.customer.settings': {
                  templateUrl: 'app/main/apps/setting/customer_settings/customerSettings.html',
                  controller: 'customerSettingsController as vm'
                }
              },
              bodyClass: 'settings-customer',
              authenticate: true,
              authenticateUsers: true
            })
            .state('app.customer.password', {
                url: '/password',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/vertical-navigation.html',
                        controller: 'MainController as vm'
                    },
                    'toolbar@app.customer.password': {
                        templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
                        controller: 'ToolbarController as vm'
                    },
                    'navigation@app.customer.password': {
                        templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
                        controller: 'NavigationController as vm'
                    },
                    'quickPanel@app.customer.password': {
                        templateUrl: 'app/quick-panel/quick-panel.html',
                        controller: 'QuickPanelController as vm'
                    },
                    'content@app.customer.password': {
                        templateUrl: 'app/main/apps/password/password.html',
                        controller: 'passwordCustomerController as vm'
                    }
                },
                // resolve: {
                //     Board: function (BoardService) {
                //         return BoardService.getBoardListCard();
                //     }
                // },
                bodyClass: 'passwordCustomer',
                authenticate: true,
                authenticateUsers: true
            });

        // Navigation

        msNavigationServiceProvider.saveItem('search', {
            title : 'Home',
            group: true,
            weight: 1
        });

        msNavigationServiceProvider.saveItem('search.search', {
            title: 'Search',
            icon: 'icon-magnify',
            state: 'app.search.search'
        });

        msNavigationServiceProvider.saveItem('search.dashboard', {
            title: 'Dashboard',
            icon: 'icon-dashboard',
            state: 'app.customer.dashboard'
        });

        msNavigationServiceProvider.saveItem('customer', {
            title: 'APPS',
            group: true,
            weight: 2
        });

        msNavigationServiceProvider.saveItem('customer.scrumboard', {
            title: 'Boards',
            icon: 'icon-trello',
            state: 'app.customer.scrumboard.boards'
        });

        msNavigationServiceProvider.saveItem('customer.to-do', {
            title: 'Tasks',
            icon: 'icon-checkbox-marked',
            state: 'app.customer.to-do'
        });

        msNavigationServiceProvider.saveItem('objects', {
            title: 'Objects',
            group: true,
            weight: 3
        });

        msNavigationServiceProvider.saveItem('objects.products', {
            title: 'Products',
            icon: 'icon-cube-outline',
            state: 'app.objects.products'
        });

        msNavigationServiceProvider.saveItem('objects.part', {
            title: 'Parts',
            icon: 'icon-cog',
            state: 'app.objects.part'
        });

        msNavigationServiceProvider.saveItem('objects.documents', {
            title: 'Documents',
            icon: 'icon-folder',
            state: 'app.objects.documents'
        });

        msNavigationServiceProvider.saveItem('objects.sourcing', {
            title: 'Sourcing',
            icon: 'icon-domain',
            state: 'app.objects.sourcing'
        });

        msNavigationServiceProvider.saveItem('adminsetting', {
            title: 'Admin',
            group: true,
            weight: 4
        });

        msNavigationServiceProvider.saveItem('adminsetting.setting', {
            title: 'Settings',
            img: 'assets/images/avatars/Maintenance.png',
            state: 'app.adminsetting.setting'
        });

    }

})();
