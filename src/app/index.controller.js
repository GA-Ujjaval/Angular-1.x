(function () {
  'use strict';

  angular
    .module('fuse')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController(fuseTheming, AuthService, $scope, $timeout, $cookies, $filter) {
    var vm = this;

    // Data
    vm.themes = fuseTheming.themes;
    vm.isAuthenticated = AuthService.isAuthenticated();
    vm.customerData = AuthService.getSessionData('customerData');


    function safeApply(scope, fn) {
      (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }

    $scope.$on('doAuthenticate', function (event, args) {
      vm.isAuthenticated = AuthService.isAuthenticated();
      vm.customerData = AuthService.getSessionData('customerData');
      safeApply($scope, function () {
      });
    });

    $scope.$on('doHide', function (event, args) {
      if (args) {
        $timeout(function () {
          vm.isHide = true;
        }, 1000);
      }
      else {
        vm.isHide = false;
      }
    });

    //MixPanel
    window.onbeforeunload = function () {
      if (window.tokenMixPanel) {

        var loginTime = +$cookies.get('startMixPanelTime');
        var logoutTime = Date.now();
        var duration = logoutTime - loginTime;

        duration = $filter('date')(duration, 'HH:mm:ss', 'UTC');
        loginTime = $filter('date')(loginTime, 'dd.MM.yyyy, hh:mm:ss a');
        logoutTime = $filter('date')(logoutTime, 'dd.MM.yyyy, hh:mm:ss a');
        $cookies.remove('startMixPanelTime');

        mixpanel.people.set({
          'Logout time': logoutTime,
          'Duration of last session': duration,
          'status': 'not active'
        });

        mixpanel.track(
          'session',
          {
            'session time': duration,
            'login time': loginTime,
            'logout time': logoutTime
          }
        );
      }
    };
  }
})();
