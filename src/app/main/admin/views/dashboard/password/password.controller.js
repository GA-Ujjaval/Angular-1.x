(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('passwordAdminController', passwordAdminController);

    /** @ngInject */
    function passwordAdminController($scope, $state, AuthService, $mdToast, AdminService, hostUrlDevelopment, errors) {
        var vm = this;

        vm.error = errors;
        vm.customerPasswordForm = {};
        vm.sessionData = {};
        vm.customerPasswordFunction = customerPasswordFunction;
        vm.sessionData = AuthService.getSessionData('customerData');

        function customerPasswordFunction() {

            //For Progress Loader
            vm.progress = true;

            var data = {
                "newPassword": vm.customerPasswordForm.newPassword,
                "oldPassword": vm.customerPasswordForm.currentPassword
            };
            var header = {
                authId: vm.sessionData.authId,
                channel_name: vm.sessionData.channel_name,
                proxy:vm.sessionData.proxy
            };
            customerPasswordCall('POST', hostUrlDevelopment.test.changepassword, '', data, header);
        }

        function customerPasswordCall(method, url, params, data, header) {
            AdminService.dataManipulation(method, url, params, data, header)
                .then(function (response) {
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            $mdToast.show($mdToast.simple().textContent('Your Password Successfully Changed!').position('top right'));
                            $state.go('app.admin.dashboard');
                            break;
                        case 4006:
                            break;
                        default:
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
                });
        }
    }

})();
