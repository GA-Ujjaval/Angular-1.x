(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('mfAdvancedNumbering',
      function (advancedNumberingService, attributesUtils, fuseUtils, $mdToast, errors, $mdDialog,
                $q, $rootScope, advancedNumberingStateService, decoratorsService, validationService) {


        const state = advancedNumberingStateService;
        const actionMessages = {
          schemeUpdated: `Saved changes. To apply these changes, click on ‘APPLY CHANGES’`
        };
        const objectTypes = {
          parts: 'parts',
          products: 'products',
          documents: 'documents'
        };
        const custom = 'custom';

        function fullValidation(val) {
          const validationResult = validationService.validationPipe(val, [
            validationService.emptyValidator,
            validationService.numberValidator,
            validationService.notDecimalNumberValidator,
            validationService.leadingSignValidator,
            validationService.positiveNumberValidator,
          ]);
          return validationResult && validationResult.error;
        }

        function validatePrefix(scope, string) {
          const spaceValidationResult = validationService.spaceCharsValidator(string);
          if (spaceValidationResult && spaceValidationResult.error) {
            return spaceValidationResult.error;
          }
          if (scope.OBJECT_TYPE === objectTypes.parts) {
            return null;
          }
          const validationResult = validationService.emptyValidator(string);
          return validationResult && validationResult.error;
        }

        function validateSuffix(string) {
          const result = validationService.spaceCharsValidator(string);
          return result && result.error;
        }

        function link(scope) {
          const vm = scope;
          scope.vm = scope;
          vm.updateScheme = updateScheme;
          vm.getNextNumber = decoratorsService.denyFrequentCalls(getNextNumber);
          vm.changeSchemeInUse = changeSchemeInUse;
          vm.isModeEdit = state.mode.isEditable;
          vm.checkEditable = state.isEditable;
          vm.validateSuffix = validateSuffix;
          vm.getTooltipText = getTooltipText;

          class WatchController {
            setWatcher() {
              this._watcher = vm.$watch(() => state.isEditable(vm.OBJECT_TYPE), (newVal) => {
                vm.isStateEditable = newVal;
              });
            }
            removeWatcher() {
              this._watcher();
            }
          }

          vm.watchController = new WatchController();
          vm.watchController.setWatcher();

          vm.legalObjectTypes = objectTypes;
          vm.OBJECT_TYPE = vm.objectType + 's';
          vm.CALL_FROM_DEFAULT = true;

          vm.fullValidation = fullValidation;
          vm.validatePrefix = validatePrefix;

          function getCorrespondentScheme(scheme) {
            return scheme.objectType === vm.OBJECT_TYPE
          }

          vm.$watch('inputSchemes', function (newVal) {
            if (!newVal) {
              return;
            }
            vm.defaultScheme = getChangesTrackingProxy(_.cloneDeep(vm.inputSchemes.filter(getCorrespondentScheme)[0]), vm.OBJECT_TYPE);
            vm.currentSchemeInUse = vm.defaultScheme.numberingScheme;
            state.schemeBackup.set(vm.OBJECT_TYPE, vm.defaultScheme);
            state.currentSchemeInUse.set(vm.OBJECT_TYPE, vm.currentSchemeInUse);
            if (vm.defaultScheme.numberingScheme === vm.legalObjectTypes.parts) {
              vm.defaultScheme = getChangesTrackingProxy(state.schemeBackup.get(vm.legalObjectTypes.parts), vm.OBJECT_TYPE);
            }
            state.validator.set(vm.OBJECT_TYPE, vm.defaultScheme);
            state.lastValidSchemeCache.set(vm.OBJECT_TYPE, vm.defaultScheme);
          });

          vm.$on('discardAdvancedNumberingChanges', function (event, data) {
            vm.defaultScheme = getChangesTrackingProxy(data.filter(getCorrespondentScheme)[0], vm.OBJECT_TYPE);
            vm.currentSchemeInUse = vm.defaultScheme.numberingScheme;
            if (vm.currentSchemeInUse === vm.legalObjectTypes.parts) {
              vm.defaultScheme = state.schemeBackup.get(vm.legalObjectTypes.parts);
            }
            state.currentSchemeInUse.set(vm.OBJECT_TYPE, vm.currentSchemeInUse);
            state.validator.set(vm.OBJECT_TYPE, vm.defaultScheme);
          });

          vm.$on('saveAdvancedNumberingState', function (ev, options) {
            if (options.isApplied) {
              vm.defaultScheme = options.schemes.filter(getCorrespondentScheme)[0].numberingScheme === 'parts' ? options.schemes[0] : options.schemes.filter(getCorrespondentScheme)[0];
              vm.defaultScheme.runningNumber = options.schemes.filter(getCorrespondentScheme)[0].numberingScheme === 'parts' ? options.schemes[0].runningNumber : options.schemes.filter(getCorrespondentScheme)[0].runningNumber;
            }
            state.schemeBackup.set(vm.OBJECT_TYPE, vm.defaultScheme);
          });

          vm.schemesOptions = [
            {value: objectTypes.parts, text: 'Use the default scheme of Parts'},
            {value: custom, text: 'Create New Default Scheme for ' + fuseUtils.capitalizeFirstLetter(vm.OBJECT_TYPE)}
          ];
          vm.nextNumbers = [];
        }

        function getTooltipText() {
          if (!state.mode.isEditable()) {
            return `Click "Edit" to make changes`
          }
          return 'Create new Default Scheme to make changes'
        }

        /**
         * The function wraps target with a proxy, which tracks the changing of the target
         * and sets these changes to state service
         * @param target {object}
         * @param objectType {object}
         * @returns {Proxy}
         */
        function getChangesTrackingProxy(target, objectType) {
          const trackChangingProxy = {
            set: function (target, prop, value) {
              target[prop] = value;
              return true;
            }
          };
          return new Proxy(target, trackChangingProxy);
        }

        function getNextNumber(vm, objectType, isCallFromDefault, categoryId) {
          advancedNumberingService.getNextNumber({
            objectType: objectType,
            isCallFromDefault: isCallFromDefault,
            categoryId: categoryId || null
          })
            .then(function (numbers) {
              const popupMessage = 'Next Numbers:';
              const confirm = $mdDialog.alert()
                .title(popupMessage + ' ' + numbers.join(', '))
                .ok('ok');
              $mdDialog.show(confirm);
            })
            .catch(showError)
        }

        /**
         * Handles the change of radio button
         * @param vm
         * @param currentSchemeInUse
         */
        function changeSchemeInUse(vm, currentSchemeInUse) {
          const promise = currentSchemeInUse === 'parts' ? state.isTableHasCustomSchemes() : Promise.resolve();
          promise
            .then((isHasCustom) => {
            if (!isHasCustom) {
              return;
            }
            return $mdDialog.show($mdDialog.confirm()
              .title(`This will erase all the custom category-based number schemes, for ${fuseUtils.capitalizeFirstLetter(vm.OBJECT_TYPE)}. Do you wish to continue?`)
              .ok('Yes')
              .cancel('No')
            )
          })
            .then(
              () => {
                changeSchemeInUseImpl(vm, currentSchemeInUse);
                if(currentSchemeInUse === 'parts') {
                  $rootScope.$broadcast('currentSchemeInUseChangedToParts')
                }
              },
              () => {
                vm.currentSchemeInUse = custom;
                vm.$digest();
              });
        }

        function changeSchemeInUseImpl(vm, currentSchemeInUse) {
          vm.watchController.removeWatcher();
          vm.defaultScheme.numberingScheme = currentSchemeInUse;
          state.currentSchemeInUse.set(vm.OBJECT_TYPE, currentSchemeInUse);
          vm.isEditable = state.isEditable(vm.OBJECT_TYPE);
          vm.defaultScheme.increment = vm.defaultScheme.increment || 1;
          Promise.all([
            advancedNumberingService.updateSchemeInUse(vm.OBJECT_TYPE, currentSchemeInUse),
            vm.isEditable ? Promise.resolve(null) : advancedNumberingService.getPartsDefaultScheme()
          ])
            .then(function (responses) {
              vm.watchController.setWatcher();
              const partsScheme = responses[1];
              if (partsScheme) {
                vm.defaultScheme = partsScheme;
                vm.defaultScheme = getChangesTrackingProxy(vm.defaultScheme, vm.OBJECT_TYPE);
              }
              if (vm.isEditable) {
                vm.defaultScheme = getChangesTrackingProxy(state.schemeBackup.get(vm.OBJECT_TYPE), vm.OBJECT_TYPE);
                vm.defaultScheme.numberingScheme = custom;
                vm.defaultScheme.objectType = vm.OBJECT_TYPE;
                vm.defaultScheme.prefix = null;
              }
              state.validator.set(vm.OBJECT_TYPE, vm.defaultScheme);
              showSuccess();
            })
            .catch(showError);
        }

        /**
         * Save changes of the scheme
         * @param vm {object} the reference to the scope
         * @param text {string} the text to show on success
         */
        function updateScheme(vm, text) {
          if (isSchemeInvalid(vm.defaultScheme, vm)) {
            return;
          }
          const scheme = _.cloneDeep(vm.defaultScheme);
          scheme.objectType = vm.OBJECT_TYPE;
          advancedNumberingService.updateDefaultScheme(scheme)
            .then(function () {
              showSuccess(text);
              state.lastValidSchemeCache.set(vm.OBJECT_TYPE, vm.defaultScheme);
            })
            .catch((err) => {
              showError(err);
              vm.defaultScheme = state.lastValidSchemeCache.get(vm.OBJECT_TYPE);
            })
            .finally(() => state.validator.set(vm.OBJECT_TYPE, vm.defaultScheme))
        }

        function isSchemeInvalid(scheme, vm) {
          if (vm.OBJECT_TYPE === vm.legalObjectTypes.parts) {
            return isNaN(scheme.increment) || !scheme.startingNumber;
          } else {
            return !scheme.prefix || isNaN(scheme.increment) || !scheme.startingNumber;
          }
        }

        function showError(err = errors.erCatch) {
          $mdToast.show($mdToast.simple().textContent(err).toastClass("md-error-toast-theme")
            .position('top right').hideDelay(4000));
        }

        function showSuccess(text) {
          $mdToast.show($mdToast.simple().textContent(text || actionMessages.schemeUpdated)
            .position('top right').hideDelay(3500));
        }

        return {
          templateUrl: 'app/core/directives/mf-advanced-numbering/mf-advanced-numbering.html',
          restrict: 'E',
          link: link,
          scope: {
            objectType: '=',
            inputSchemes: '='
          }
        }
      })
})();
