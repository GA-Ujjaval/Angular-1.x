(function () {
    'use strict';

    angular
        .module('app.createPassword')
        .controller('createPasswordController', createPasswordController);

    /** @ngInject */
    function createPasswordController($state, AuthService, errors, hostUrlDevelopment, AdminService, $mdToast) {
        var vm = this;

        vm.error = errors;
        vm.channelName = 'aws';

        vm.createPasswordForm = {};

        vm.verificationData = {
            verificationToken: $state.params.verificationToken || ''
        };

        var params;

        vm.createPasswordFormFunction = createPasswordFormFunction;

        init();

        function init() {
            params = {
                verificationToken: $state.params.verificationToken
            };
            AdminService.dataManipulation('GET', hostUrlDevelopment.test.validateauthtoken, params, '', '')
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            vm.createPasswordForm.userEmail = response.data.userEmail
                            break;
                        case 7:
                            console.log(response);
                            $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                            //$state.go('app.landing');
                            $state.go('app.createPassword.errorauthToken');
                            break;
                        case 403:
                            console.log(response);
                            $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                            $state.go('app.createPassword.errorauthToken');
                            break;
                        default:
                            console.log(response.message);
                    }
                    return true;
                })
                .catch(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                    return false;
                });
        }

        function createPasswordFormFunction() {
            //For Progress Loader
            vm.progress = true;

            if (vm.verificationData != {}) {

                AdminService.dataManipulation('POST', hostUrlDevelopment.test.createpassword, vm.verificationData, vm.createPasswordForm, '')
                    .then(function (response) {
                        //For Progress Loader
                        vm.progress = false;

                        switch (response.code) {
                            case 0:
                               // console.log("success");
                                //$state.go('app.landing');
                                $state.go('app.login', {channelName:'aws'});
                                break;
                            default:
                                //console.log(response.message);
                                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        }
                        return true;
                    })
                    .catch(function (response) {
                        //For Progress Loader
                        vm.progress = false;
                        //console.error(response);
                        return false;
                    });
            }


        }
    }
})();
