(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('notificationService', MainTablesService);


  /** @ngInject */
  function MainTablesService($mdDialog, $window) {

    return {
      multyLineAlert,
      oneLineAlert
    };

    function multyLineAlert(message) {
      const messages = message.split('.');
      return $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text"><div>' + messages[0] + '.</div> <div>' + messages[1] + '.</div></div><div><md-button class="show-ok-popup-button md-accent md-raised  md-button md-default-theme md-ink-ripple" ng-click="close()">Ok</md-button></div>',
        controller: ($scope, $mdDialog) => {
          $scope.close = () => {
            $mdDialog.hide();
          };
        }
      });
    }

    function oneLineAlert(message, type, userId) {
      return $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text"><div>' + message + '</div></div><div class="one-line-notification-buttons"><md-button class="show-ok-popup-button-alert md-accent md-raised  md-button md-default-theme md-ink-ripple" ng-click="closeWithLocalStorage()">Ok, Don\'t show this message again</md-button><md-button class="show-ok-popup-button md-accent md-raised  md-button md-default-theme md-ink-ripple" ng-click="close()">Ok</md-button></div>',
        controller: ($scope, $mdDialog) => {
          $scope.close = () => {
            $mdDialog.hide();
          };
          $scope.closeWithLocalStorage = () => {
            $window.localStorage.setItem(`dontShowAlertForDatabaseLoad_${type}_${userId}`, 'true');
            $mdDialog.hide();
          };
        }
      });
    }
  }
})
();
