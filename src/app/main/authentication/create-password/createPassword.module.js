(function () {
    'use strict';

    angular
        .module('app.createPassword', ['constants']
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider
            .state('app.createPassword', {
                url: '/createPassword/:verificationToken',
                views: {
                    'main@'                       : {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller : 'MainController as vm'
                    },
                    'content@app.createPassword': {
                        templateUrl: 'app/main/authentication/create-password/createPassword.html',
                        controller: 'createPasswordController as vm'
                    }
                },
                bodyClass: 'createPassword',
                authenticate: true
            })
            .state('app.createPassword.errorauthToken', {
                url: '/errorauthToken',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller: 'MainController as vm'
                    },
                    'content@app.createPassword.errorauthToken': {
                        templateUrl: 'app/main/authentication/create-password/errorauthToken/errorAuthToken.html',
                        controller: 'createPasswordController as vm'
                    }
                },
                bodyClass: 'createPassword',
                authenticate: true
            });


        // Translation
        //$translatePartialLoaderProvider.addPart('app/main/apps/landing');
    }
})();
