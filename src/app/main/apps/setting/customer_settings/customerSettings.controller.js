(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('customerSettingsController', customerSettingsController);

  /** @ngInject */
  function customerSettingsController(AuthService, CustomerService, hostUrlDevelopment, GlobalSettingsService, $mdToast,
                                      errors, $rootScope) {
    const vm = this;

    vm.sessionData = AuthService.getSessionData('customerData');
    vm.linkTarget = false;
    vm.error = errors;

    vm.changeLinkTarget = changeLinkTarget;

    const headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    $rootScope.$watch('linkTarget', value => {
      vm.linkTarget = value;
    });

    function changeLinkTarget() {
      const data = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.userRoleSet[0] === 'customer_admin',
        customerId: vm.sessionData.userRoleSet[0] === 'customer_admin' ? vm.sessionData.userId : vm.sessionData.customerAdminId,
        linkTarget: !vm.linkTarget
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.helpsetting, '', data, headers)
        .then( response => {
          if (response.code === 0) {
            $rootScope.linkTarget = (response.data.helpSetting.linkTarget ? response.data.helpSetting.linkTarget === "true" : false);
            $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
          }
        })
        .catch(function () {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }
  }

})();
