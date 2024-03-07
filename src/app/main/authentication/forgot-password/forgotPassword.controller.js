(function () {
    'use strict';

    angular
        .module('app.forgotPassword')
        .controller('forgotPasswordController', forgotPasswordController);

    /** @ngInject */
    function forgotPasswordController($state, AuthService, hostUrlDevelopment, AdminService, $mdToast) {
        var vm = this;

        //vm.channelName = $state.params.channelName;
        vm.channelName = 'aws';

        vm.forgotPasswordForm = {};

        vm.forgotPasswordFormFunction = forgotPasswordFormFunction;

        function forgotPasswordFormFunction() {
            //For Progress Loader
            vm.progress = true;
            var params = {
                emailId : vm.forgotPasswordForm.forgotemail
            };

                AdminService.dataManipulation('POST', hostUrlDevelopment.test.forgotpassword, params, '', '')
                    .then(function (response) {
                        //For Progress Loader
                        vm.progress = false;

                        switch (response.code) {
                            case 0:
                               // console.log("success");
                                $state.go('app.forgotPassword.messagedisplay');
                                break;
                            case 4006:
                                //console.log(vm.error.er4008);
                                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                                //$state.go('app.forgotPassword');
                                break;
                            default:
                                console.log(response.message);
                        }
                        return true;
                    })
                    .catch(function (response) {
                        //For Progress Loader
                        vm.progress = false;
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        return false;
                    });


        }
    }
})();
