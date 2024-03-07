(function () {
  'use strict';

  angular
    .module('app.login')
    .controller('loginController', loginController);

  /** @ngInject */
  function loginController($state, AuthService, hostUrlDevelopment, AdminService, $mdToast, errors, $rootScope, $filter, $cookies, $window) {
    var vm = this;
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    vm.loginForm = {};
    vm.loginFormSend = {};
    vm.channelName = $state.params.channelName || 'aws';

    if (!$state.params.channelName) {
      //$state.go('app.landing');
      $state.go('app.login', {
        channelName: 'aws'
      });
    }
    vm.userAuthFunction = userAuthFunction;
    vm.channelNameFunction = channelNameFunction;

    function userAuthFunction() {
      //For Progress Loader
      $rootScope.authFlag = true;
      vm.progress = true;

      var headers = {
        channel_name: vm.channelName
      };

      AdminService.dataManipulation('POST', hostUrlDevelopment.test.authentication, '', vm.loginForm, headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              AuthService.userLogin('customerData', response.data);
              if (response.data.auth === true && response.data.userAuth === true) {
                if ($cookies.get('returnUrl') != 'undefined' && $cookies.get('userId') === response.data.userId) {
                  $window.location.href = $cookies.get('returnUrl');
                } else {
                  $state.go('app.admin.dashboard');
                }
              } else if (response.data.auth === false && response.data.userAuth === true) {
                if ($cookies.get('returnUrl') != 'undefined' && $cookies.get('userId') === response.data.userId) {
                  $window.location.href = $cookies.get('returnUrl');
                } else {
                  $state.go('app.customer.dashboard');
                }
              } else {
                if ($cookies.get('returnUrl') != 'undefined' && $cookies.get('userId') === response.data.userId) {
                  $window.location.href = $cookies.get('returnUrl');
                } else {
                  $state.go('app.customer.dashboard');
                }
              }
              break;
            case 6:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4265:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
          return true;
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          return false;
        });
    }

    function channelNameFunction(channel) {
      $state.go('app.forgotPassword', {
        channelName: channel
      });
    }
  }
})();
