(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('mfCreateObjectDescription',
      function ($mdDialog) {

        function link(scope) {
          const vm = scope;
          scope.vm = scope;
          vm.openPopup = openPopup;
        }

        function openPopup(vm) {
          $mdDialog.show({
            controller: popupController,
            controllerAs: 'vm',
            clickOutsideToClose: true,
            templateUrl: 'app/core/directives/mf-create-object-description/description-popup-template.html',
            multiple: true,
            locals: {
              isAdvancedNumberingEnabled: vm.isAdvancedNumberingEnabled,
              objectType: vm.objectType
            }
          })
        }

        function popupController($mdDialog, isAdvancedNumberingEnabled, fuseUtils, objectType) {
          const vm = this;
          vm.isAdvancedNumberingEnabled = isAdvancedNumberingEnabled;
          vm.closeDialog = () => $mdDialog.cancel();
          vm.getCapitalized = () => fuseUtils.capitalizeFirstLetter((objectType || '').slice(0, -1));
          vm.getLowercase = () => (objectType || '').slice(0, -1);
        }

        return {
          templateUrl: 'app/core/directives/mf-create-object-description/mf-create-object-description.html',
          restrict: 'E',
          link: link,
          scope: {
            isAdvancedNumberingEnabled: '=',
            objectType: '='
          }
        }
      })
})();
