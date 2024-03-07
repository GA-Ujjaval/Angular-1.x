(function () {
  'use strict';

  angular
    .module('fuse')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $rootScope, $location, $timeout, introService) {
    // Data
    $timeout(function () {
      if ($location.url() != '/customer/dashboard') {
        $("a.introjs-hint div").css('display', 'none');
      } else {
        $("a.introjs-hint div").css('display', 'block');
      }
    });
    // Remove the splash screen
    $scope.$on('$viewContentAnimationEnded', function (event) {
      if (event.targetScope.$id === $scope.$id) {
        $rootScope.$broadcast('msSplashScreen::remove');
      }

    });

    $scope.$emit('doAuthenticate');

  }
})();
