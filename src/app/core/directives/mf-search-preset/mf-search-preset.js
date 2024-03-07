(function () {
  angular
    .module('app.core')
    .directive('mfSearchPreset', function (searchPresetRequestService, searchPresetService, $mdToast, $mdDialog,
                                           AuthService, ShowController) {

      let sessionData;

      function link(scope) {
        scope.vm = scope;
        const vm = scope;
        vm.isCreateAvailable = () => !!vm.sections && vm.sections.some((section) => section.isDirty());
        vm.templateSearchText = '';
        vm.getPresets = getPresets;
        vm.deletePreset = deletePreset;
        vm.showPresetDialog = showPresetDialog;
        vm.applyPreset = applyPreset;
        vm.isCA = isUserRole('customer_admin');
        vm.isRO = isUserRole('read_only');
        vm.isUserEmpoweredToDelete = isUserEmpoweredToDelete;
        vm.stopHover = (event) => event.stopImmediatePropagation();
        sessionData = AuthService.getSessionData('customerData');

        vm.$on('presetChanged', (event) => {
          vm.appliedPresetId = null;
          setAppliedPreset(vm);
        })
      }

      function setAppliedPreset(vm, newId) {
        if(!vm.presets) {
          return;
        }
        vm.presets.forEach((preset) => {preset.applied = false});
        if(!vm.appliedPresetId && !newId) {
          return;
        }
        if(!vm.appliedPresetId) {
          vm.appliedPresetId = newId;
        }
        const preset = _.find(vm.presets, {templateId: vm.appliedPresetId});
        if(preset) {
          preset.applied = true;
        }
      }

      function getPresets(vm) {
        if (vm.presets && vm.presets.length) {
          return;
        }
        searchPresetRequestService.getSearchPresetsList(vm.objectType, vm.tabName)
          .then((presets) => {
            vm.presets = handlePresets(vm, presets);
            vm.showController = new ShowController(vm, vm.presets);
          })
      }

      function handlePresets(vm, presets) {
        const castedPresets = castPresets(presets);
        return getReadyPresetList(vm, castedPresets);
      }

      function getReadyPresetList(vm, presets) {
        const savedPreset = searchPresetService.getSavedSearchPreset(vm.tabName);
        const comingPreset = _.find(presets, {templateId: savedPreset && savedPreset.templateId});
        if(comingPreset && savedPreset &&
          _.isEqual(comingPreset.templateData.searchPreset, savedPreset.templateData.searchPreset)) {
          comingPreset.applied = true;
        }
        return presets;
      }

      function castPresets(presets) {
        return presets.map((preset) => castPreset(preset));
      }

      function castPreset(preset) {
        const presetCopy = _.cloneDeep(preset);
        presetCopy.fullName = preset.isDefault ? preset.templateName + ' (default)' : preset.templateName;
        return presetCopy;
      }

      function applyPreset(vm, preset) {
        vm.applyPresetToTable({preset: preset});
        setAppliedPreset(vm, preset.templateId);
        searchPresetService.saveSearchPreset(vm.tabName, preset);
      }

      function deletePreset(vm, presetId) {
        searchPresetRequestService.deleteSearchPreset(presetId)
          .then((res) => {
            if (res.code === 0) {
              vm.presets = vm.presets.filter((preset) => preset.templateId !== presetId);
              vm.showController = new ShowController(vm);
              $mdToast.show($mdToast.simple().textContent(res.message || res.data).position('top right'));
            } else {
              $mdToast.show($mdToast.simple().textContent(res.message || res.data).toastClass("md-error-toast-theme")
                .position('top right').hideDelay(5000));
            }
          })
      }

      function showPresetDialog(vm, preset, type) {
        if (!vm.isCreateAvailable() && type === 'create') {
          $mdToast.show($mdToast.simple().textContent('Cannot create preset because search criteria is not defined')
            .action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          return;
        }
        const input = preset ? {type: 'update', preset} : {type: 'create', presetData: vm.getPresetData()};
        input.objectType = vm.objectType;
        input.tabName = vm.tabName;
        $mdDialog.show({
          controller: 'SearchPresetDialogController',
          controllerAs: 'vm',
          templateUrl: 'app/core/directives/mf-search-preset/search.preset.dialog.html',
          clickOutsideToClose: true,
          locals: {
            input
          }
        }).then(() => vm.presets.length = 0)
      }

      function isUserRole(userRoleName) {
        return function () {
          return sessionData.userRoleSet.some(function (role) {
            return role === userRoleName
          })
        }
      }

      function isUserEmpoweredToDelete(creatorId) {
        return sessionData.userId === creatorId;
      }

      return {
        templateUrl: 'app/core/directives/mf-search-preset/mf-search-preset.html',
        restrict: 'E',
        link: link,
        scope: {
          objectType: '=',
          tabName: '=',
          sections: '=sections',
          applyPresetToTable: '&onPresetApplied',
          getPresetData: '&getPresetData'
        }
      }
    });
})();
