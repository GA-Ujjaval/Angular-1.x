(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('CopyPPDController', CopyPPDController);

  /** @ngInject */
  function CopyPPDController($document, $state, $rootScope, $mdDialog, hostUrlDevelopment, CustomerService, errors, $mdToast,
                             AuthService, objectId, objectType, objects, configurationSettings, isConfig, MainTablesService,
                             GlobalSettingsService, $location) {

    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    vm.objectType = objectType;
    vm.objects = [{
        name: 'Basic Info'
      },
      {
        name: 'Cost'
      },
      {
        name: 'Inventory'
      },
      {
        name: 'Additional Info'
      },
      {
        name: 'Attachments'
      },
      {
        name: 'Sourcing'
      },
      {
        name: 'Bill of Materials'
      },
      {
        name: 'Comments'
      }
    ];
    vm.objectsDocument = [{
        name: 'Basic Info'
      },
      {
        name: 'Additional Info'
      },
      {
        name: 'Attachments'
      },
      {
        name: 'Comments'
      }
    ];
    vm.itemChecked = [];
    vm.basicInfo = false;
    vm.cost = false;
    vm.inventory = false;
    vm.additinalInfo = false;
    vm.attachments = false;
    vm.sourcing = false;
    vm.bom = false;
    vm.comments = false;
    vm.fuseObjectNumberSetting = '';

    if (vm.objectType !== 'documents') {
      for (var i = 0; i < vm.objects.length; i++) {
        if (i !== 7) {
          vm.itemChecked[i] = true;
          vm.basicInfo = true;
          vm.cost = true;
          vm.inventory = true;
          vm.additinalInfo = true;
          vm.attachments = true;
          vm.sourcing = true;
          vm.bom = true;
        } else {
          vm.itemChecked[i] = false;
        }
      }
    } else {
      for (var i = 0; i < vm.objectsDocument.length; i++) {
        if (i !== 3) {
          vm.itemChecked[i] = true;
          vm.basicInfo = true;
          vm.cost = false;
          vm.inventory = false;
          vm.additinalInfo = true;
          vm.attachments = true;
          vm.sourcing = false;
          vm.bom = false;
        } else {
          vm.itemChecked[i] = false;
        }
      }
    }

    // Methods
    vm.closeDialog = closeDialog;
    vm.someFunction = someFunction;
    vm.createCopy = createCopy;
    proxyDetails();

    function proxyDetails() {

      GlobalSettingsService.getProxydetails()
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.fuseObjectNumberSetting = response.data;
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function someFunction(index, name) {
      for (var i = 0; i < vm.objects.length; i++) {
        if (vm.objects[i].name === name) {
          if (vm.objects[i].name === 'Basic Info') {
            vm.basicInfo = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Cost') {
            vm.cost = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Inventory') {
            vm.inventory = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Additional Info') {
            vm.additinalInfo = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Attachments') {
            vm.attachments = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Sourcing') {
            vm.sourcing = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Bill of Materials') {
            vm.bom = vm.itemChecked[index];
          }
          if (vm.objects[i].name === 'Comments') {
            vm.comments = vm.itemChecked[index];
          }
        }
      }
    }

    function createCopy(ev) {
      var data = {
        basicInfo: vm.basicInfo,
        costDetail: vm.cost,
        inventory: vm.inventory,
        additinalInfo: vm.additinalInfo,
        attachments: vm.attachments,
        sourcing: vm.sourcing,
        bom: vm.bom,
        comments: vm.comments
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          toCopyObjectId: objectId
        };
      } else {
        params = {
          toCopyObjectId: objectId
        };
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.copyfuseobject, params, data, headers)
        .then(function (response) {

          switch (response.code) {
            case 0:
              MainTablesService.removeCache();
              const lastStateName = $location.url().split('/')[$location.url().split('/').length - 1];
              if ('parts' === response.data.objectType) {

                $mdDialog.show({
                  controller: 'editPartNumberingDialogController',
                  controllerAs: 'vm',
                  templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
                  targetEvent: ev,
                  clickOutsideToClose: true,
                  locals: {
                    object: response.data,
                    products: vm.fuseObjectNumberSetting,
                    copyObject: 'Create Part',
                    objectId: objectId,
                    configurationSettings: configurationSettings,
                    isConfig: isConfig,
                    lastStateName: lastStateName,
                    editPart: false
                  }
                }).then(function (answer, ev) {
                  if (answer === 'false') {} else {
                    $mdDialog.show({
                      controller: 'CopyPPDController',
                      controllerAs: 'vm',
                      templateUrl: 'app/main/apps/objects/parts/tabs/copy-ppd/dialog/copyppd-dialog.html',
                      parent: angular.element($document.find('#content-container')),
                      targetEvent: ev,
                      clickOutsideToClose: true,
                      locals: {
                        objectId: objectId,
                        objectType: vm.objectType,
                        objects: objects,
                        configurationSettings: configurationSettings,
                        isConfig: isConfig
                      }
                    }).then(function (data) {}, function () {});
                  }
                }, function () {});
              }
              if ('products' === response.data.objectType) {
                $mdDialog.show({
                  controller: 'editPartNumberingDialogController',
                  controllerAs: 'vm',
                  templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
                  targetEvent: ev,
                  clickOutsideToClose: true,
                  locals: {
                    object: response.data,
                    products: vm.fuseObjectNumberSetting,
                    copyObject: 'Create Product',
                    objectId: objectId,
                    configurationSettings: configurationSettings,
                    isConfig: isConfig,
                    lastStateName: lastStateName,
                    editPart: false
                  }
                }).then(function (answer, ev) {
                  if (answer === 'false') {} else {
                    $mdDialog.show({
                      controller: 'CopyPPDController',
                      controllerAs: 'vm',
                      templateUrl: 'app/main/apps/objects/parts/tabs/copy-ppd/dialog/copyppd-dialog.html',
                      parent: angular.element($document.find('#content-container')),
                      targetEvent: ev,
                      clickOutsideToClose: true,
                      locals: {
                        objectId: objectId,
                        objectType: vm.objectType,
                        objects: objects,
                        configurationSettings: configurationSettings,
                        isConfig: isConfig,
                      }
                    }).then(function (data) {}, function () {});
                  }
                }, function () {});
              }
              if ('documents' === response.data.objectType) {
                $mdDialog.show({
                  controller: 'editPartNumberingDialogController',
                  controllerAs: 'vm',
                  templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
                  targetEvent: ev,
                  clickOutsideToClose: true,
                  locals: {
                    object: response.data,
                    products: vm.fuseObjectNumberSetting,
                    copyObject: 'Create Document',
                    objectId: objectId,
                    configurationSettings: configurationSettings,
                    isConfig: isConfig,
                    lastStateName: lastStateName,
                    editPart: false
                  }
                }).then(function (answer, ev) {
                  if (answer === 'false') {} else {
                    $mdDialog.show({
                      controller: 'CopyPPDController',
                      controllerAs: 'vm',
                      templateUrl: 'app/main/apps/objects/parts/tabs/copy-ppd/dialog/copyppd-dialog.html',
                      parent: angular.element($document.find('#content-container')),
                      targetEvent: ev,
                      clickOutsideToClose: true,
                      locals: {
                        objectId: objectId,
                        objectType: vm.objectType,
                        objects: objects,
                        configurationSettings: configurationSettings,
                        isConfig: isConfig
                      }
                    }).then(function (data) {}, function () {});
                  }
                }, function () {});
              }
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log(response.message);
        });
    }

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

  }
})();
