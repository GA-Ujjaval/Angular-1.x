(function () {
  angular
    .module('app.core')
    .controller('SearchPresetDialogController', SearchPresetDialogController);

  function SearchPresetDialogController($mdDialog, input, searchPresetRequestService, searchPresetService, AuthService,
                                        $mdToast) {
    const vm = this;
    vm.updatePreset = updatePreset;
    vm.createPreset = createPreset;
    vm.isCA = isUserRole('customer_admin');
    const sessionData = AuthService.getSessionData('customerData');


    vm.closeDialog = () => {
      $mdDialog.hide()
    };
    vm.presetScope = [
      {text: 'Only me', value: 'local'},
      {text: 'All users', value: 'global'},
      {text: 'All users AND Set as Default', value: 'defaultGlobal'}
    ];
    vm.input = input;
    vm.type = input.type;

    if (vm.type === 'update') {
      vm.newPresetOptions = getViewPreset(_.cloneDeep(input.preset));
    }
    if (vm.type === 'create') {
      vm.newPresetOptions = {
        isShared: 'local'
      };
    }

    function getViewPreset(presetModel) {
      const presetView = _.cloneDeep(presetModel);
      presetView.name = presetView.templateName;
      if (presetView.sharedWithUsers) {
        presetView.isShared = 'global';
      } else {
        presetView.isShared = 'local';
      }
      if (presetView.isDefault) {
        presetView.isShared = 'defaultGlobal';
      }
      return presetView;
    }

    function updatePreset(newPresetOptions) {
      searchPresetRequestService.updateSearchPreset(getPresetModel(newPresetOptions), input.tabName, input.objectType)
        .then((res) => {
          $mdToast.show($mdToast.simple().textContent('Saved changes').position('top right').hideDelay(4000));
        })
        .catch((message) => {
          $mdToast.show($mdToast.simple().textContent(message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
        })
        .finally(() => $mdDialog.hide())
    }

    function createPreset(presetOptions, env) {
      const {name, isDefault, isShared} = getPresetModel(presetOptions);
      searchPresetRequestService.createSearchPreset({
        name, isDefault, isShared,
        tabName: env.tabName,
        objectType: env.objectType,
        presetData: env.presetData
      }).then((res) => {
        $mdToast.show($mdToast.simple().textContent('Preset Saved').position('top right').hideDelay(4000));
        searchPresetService.saveSearchPreset(env.tabName, env.presetData);
      })
        .catch((message) => {
          $mdToast.show($mdToast.simple().textContent(message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
        })
        .finally(() => {
          $mdDialog.hide();
        })
    }

    function getPresetModel(presetView) {
      const preset = _.cloneDeep(presetView);
      preset.isDefault = preset.isShared === 'defaultGlobal';
      preset.isShared = preset.isShared !== 'local';
      return preset;
    }

    function isUserRole(userRoleName) {
      return function () {
        return sessionData.userRoleSet.some(function (role) {
          return role === userRoleName
        })
      }
    }
  }
})();
