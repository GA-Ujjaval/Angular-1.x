(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('ErrorHandlingService', ErrorHandlingService);

  function ErrorHandlingService(AuthService, errors, $state, $mdToast) {

    var responseCodeHandler = {};

    Object.defineProperty(responseCodeHandler, '4008', {
      get: userLogout
    });

    function userLogout() {
      $mdToast.show($mdToast.simple().textContent(errors.er4008).position('top right'));
      AuthService.userLogout('customerData');
      $state.go('app.login', {
        channelName: 'aws'
      });
    }

    return responseCodeHandler;

  }
})();
