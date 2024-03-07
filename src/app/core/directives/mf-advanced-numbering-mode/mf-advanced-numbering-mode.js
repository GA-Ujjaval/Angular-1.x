(function () {
  angular
    .module('app.core')
    .directive('mfAdvancedNumberingMode',
      function (advancedNumberingService, $mdToast, $rootScope, $mdDialog, advancedNumberingStateService) {

        var state = advancedNumberingStateService;

        var modeStates = {
          active: 'active',
          edit: 'edit',
          discard: 'discard'
        };
        var modes = [
          {value: modeStates.edit, text: 'Apply Changes', oppositeValue: modeStates.active},
          {value: modeStates.edit, text: 'Discard Changes', oppositeValue: modeStates.active},
          {value: modeStates.active, text: 'Edit', oppositeValue: modeStates.edit}
        ];
        var actionMessages = {
          schemeUpdated: 'Changes are saved',
          toBeEdited: 'Ready for Edits'
        };

        var saveModeOptionValues = {
          yes: 'yes',
          no: 'no'
        };
        var saveModeOptions = [
          {
            buttonText: 'Yes, Apply Changes',
            value: saveModeOptionValues.yes
          },
          {
            buttonText: 'No, Continue to Edit',
            value: saveModeOptionValues.no
          }
        ];

        function link(scope) {
          var vm = scope;
          scope.vm = scope;
          vm.changeMode = changeMode;
          vm.modes = modes;
          vm.saveModeOptions = saveModeOptions;
          vm.changeModeByOption = changeModeByOption;
          vm.discardChanges = discardChanges;
          vm.isDiscardAvailable = state.isDiscardAvailable;
          vm.modeStates = modeStates;
          vm.validator = state.validator;


          vm.$watch(function () {
            return state.mode.get();
          }, function (newVal, oldVal) {
            if (!newVal && oldVal) {
              vm.appliedMode = _.find(modes, {value: oldVal});
            }
            if (newVal) {
              vm.appliedMode = _.find(modes, {value: newVal});
            }
          });
        }

        function changeMode(vm, newMode) {
          vm.progressChange = true;
          const promise = newMode === modeStates.active ? showConfirmDialog(vm) : Promise.resolve();
          if (newMode === modeStates.active) {
            vm.newMode = newMode;
          }
          promise.then(function (schemes) {
            if (newMode === modeStates.active) {
              $rootScope.$broadcast('saveAdvancedNumberingState', {isApplied: true, schemes});
            } else {
              $rootScope.$broadcast('saveAdvancedNumberingState', {isApplied: false});
              updateMode(vm, newMode);
            }
          });
        }

        function showConfirmDialog(vm) {
          return $mdDialog.show({
            templateUrl: 'app/core/directives/mf-advanced-numbering-mode/dialogs/edit-to-active-template.html',
            scope: vm,
            preserveScope: true,
            parent: angular.element(document.body),
            clickOutsideToClose: true
          })
        }

        function updateMode(vm, newMode, action) {
          return advancedNumberingService.updateMode(newMode, action)
            .then(function (response) {
              vm.appliedMode = _.find(modes, {value: response.advancedNumberingStatus});
              state.mode.set(vm.appliedMode.value);
              $mdToast.show($mdToast
                .simple()
                .textContent(newMode === modeStates.edit ? actionMessages.toBeEdited : actionMessages.schemeUpdated)
                .position('top right').hideDelay(1000));
              $mdDialog.hide(response.fuseAdvancedNumbering_active);
            })
            .catch(showError)
            .finally(function () {
              vm.progressChange = false;
              $mdDialog.hide();
            })
        }

        function changeModeByOption(vm, chosenOption) {
          if (chosenOption === saveModeOptionValues.yes) {
            updateMode(vm, vm.newMode, chosenOption);
          } else {
            $mdDialog.cancel();
          }
        }

        function discardChanges(vm, newMode, action) {
          updateMode(vm, newMode, action)
            .then(function () {
              return advancedNumberingService.getDefaultScheme();
            })
            .then(function (schemes) {
              $rootScope.$broadcast('discardAdvancedNumberingChanges', schemes);
            })
            .catch(showError);
        }

        function showError(err) {
          $mdToast.show($mdToast.simple().textContent(err).toastClass("md-error-toast-theme")
            .position('top right').hideDelay(4000));
        }

        return {
          templateUrl: 'app/core/directives/mf-advanced-numbering-mode/mf-advanced-numbering-mode.html',
          restrict: 'E',
          link: link,
          scope: {}
        }
      })
})();
