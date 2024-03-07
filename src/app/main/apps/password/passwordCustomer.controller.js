(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('passwordCustomerController', passwordCustomerController);

  /** @ngInject */
  function passwordCustomerController($scope, $interval, AuthService, $mdToast, CustomerService, hostUrlDevelopment, errors, $state) {
    var vm = this;

    vm.error = errors;

    vm.customerPasswordForm = {};

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.customerPasswordFunction = customerPasswordFunction;
    vm.Reset = resetFunction;

    function resetFunction() {
      vm.customerPasswordForm.currentPassword = '';
      vm.customerPasswordForm.newPassword = '';
      vm.customerPasswordForm.retypeNewPassword = '';
    }

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
        proxy: vm.sessionData.proxy
      };
      customerPasswordCall('POST', hostUrlDevelopment.test.changepassword, '', data, header);
    }

    function customerPasswordCall(method, url, params, data, header) {
      CustomerService.addNewMember(method, url, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Your Password Successfully Changed!').position('top right'));
              $state.go('app.customer.dashboard');
              break;
            case 5:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
            //console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }


  }

})();
