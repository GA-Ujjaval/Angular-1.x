(function () {
    'use strict';

    angular
        .module('app.forgotPassword', []
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider
            .state('app.forgotPassword', {
                url: '/forgotPassword/:channelName',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller: 'MainController as vm'
                    },
                    'content@app.forgotPassword': {
                        templateUrl: 'app/main/authentication/forgot-password/forgotPassword.html',
                        controller: 'forgotPasswordController as vm'
                    }
                },
                bodyClass: 'forgotPassword',
                authenticate: true
            })
            .state('app.forgotPassword.messagedisplay', {
                url: '/messagedisplay',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller: 'MainController as vm'
                    },
                    'content@app.forgotPassword.messagedisplay': {
                        templateUrl: 'app/main/authentication/forgot-password/messagedisplay/message.html',
                        controller: 'forgotPasswordController as vm'
                    }
                },
                bodyClass: 'forgotPassword',
                authenticate: true
            });

        // Translation
        //$translatePartialLoaderProvider.addPart('app/main/apps/landing');
    }
})();
