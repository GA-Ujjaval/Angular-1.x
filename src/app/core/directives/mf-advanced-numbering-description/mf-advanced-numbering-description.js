(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('mfAdvancedNumberingDescription',
      function ($mdDialog) {

        function link(scope) {
          const vm = scope;
          scope.vm = scope;
          vm.openPopup = openPopup;
        }

        function openPopup() {
          $mdDialog.show({
            controller: popupController,
            controllerAs: 'vm',
            clickOutsideToClose: true,
            templateUrl: 'app/core/directives/mf-advanced-numbering-description/description-popup-template.html'
          })
        }

        function popupController($mdDialog) {
          const vm = this;
          vm.closeDialog = () => $mdDialog.cancel();
        }

        return {
          templateUrl: 'app/core/directives/mf-advanced-numbering-description/mf-advanced-numbering-description.html',
          restrict: 'E',
          link: link,
          scope: {}
        }
      })
})();
