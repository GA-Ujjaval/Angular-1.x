(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('IntermediateConfigController', IntermediateConfigController);

  function IntermediateConfigController($document, $mdDialog, $mdToast, hostUrlDevelopment, CustomerService, AuthService,
                                        object, ev, configurationObject, advancedNumbering) {

    var vm = this;
    vm.closeDialog = closeDialog;
    vm.someFunction = someFunction;
    vm.submitConfig = submitConfig;
    vm.searchConfig;

    vm.object = object;
    vm.isMinorRevision = object.fuseObjectNumberSetting.enableMinorRev;
    vm.configurationObject = configurationObject;
    vm.configNameWithRevision = [];
    vm.configurationObject.forEach(function (config) {
      var configWithRevision;
      var configName = config.configName || 'Base Part';
      if (vm.isMinorRevision) {
        configWithRevision = configName + '-Revision-' + config.revision + '.' + config.minorRevision;
      } else {
        configWithRevision = configName + '-Revision-' + config.revision;
      }
      vm.configNameWithRevision.push({
        objectId: config.objectId,
        configName: configWithRevision
      });
    });
    vm.configNameWithRevisionDefault = vm.configNameWithRevision[0];

    vm.objects = [{
      name: 'Basic Info'
    }, {
      name: 'Cost'
    }, {
      name: 'Inventory'
    }, {
      name: 'Additional Info'
    }, {
      name: 'Attachments'
    }, {
      name: 'Sourcing'
    }, {
      name: 'Bill of Materials'
    }, {
      name: 'Comments'
    }
    ];
    vm.objectsDocument = [{
      name: 'Basic Info'
    }, {
      name: 'Additional Info'
    }, {
      name: 'Attachments'
    }, {
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
    if (vm.object.objectType !== 'documents') {
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
    vm.clearSearchTerm = function () {
      vm.searchConfig = '';
    };
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');
    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

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

    function submitConfig() {
      //For Progress Loader
      vm.progress = true;
      vm.createBtnToggle = true;
      var params;
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectId: vm.configNameWithRevisionDefault,
          isBom: false
        }
      } else {
        params = {
          fuseObjectId: vm.configNameWithRevisionDefault,
          isBom: false
        }
      }
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', header)
        .then(function (response) {
          if (response.code == 0) {
            response.data.filterDTO = {
              basicInfo: vm.basicInfo,
              costDetail: vm.cost,
              inventory: vm.inventory,
              additinalInfo: vm.additinalInfo,
              attachments: vm.attachments,
              sourcing: vm.sourcing,
              bom: vm.bom,
              comments: vm.comments
            };
            if (object.objectType === 'parts') {
              $mdDialog.show({
                controller: 'CreatePartsController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/objects/part/dialogs/create-part-dialog.html',
                parent: angular.element($document.find('#content-container')),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                  configure: 'Configuration',
                  object: response.data,
                  advancedNumbering: advancedNumbering
                }
              }).then(function (answer, ev) {
                if (angular.isUndefined(answer) === true || answer === 'false') {
                } else {
                  $mdDialog.show({
                    controller: 'IntermediateConfigController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/apps/objects/parts/dialog/intermediate-config-dialog.html',
                    parent: angular.element($document.find('#content-container')),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                      configurationObject: vm.configurationObject,
                      object: object,
                      ev: ev
                    }
                  }).then(function (data) {
                  }, function () {
                  });
                }
              }, function () {
              });
            }
            if (object.objectType === 'products') {
              $mdDialog.show({
                controller: 'CreateProductsController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/objects/products/dialogs/create-product-dialog.html',
                parent: angular.element($document.find('#content-container')),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                  configure: 'Configuration',
                  object: response.data,
                  advancedNumbering: advancedNumbering
                }
              }).then(function (answer, ev) {
                if (angular.isUndefined(answer) === true || answer === 'false') {
                } else {
                  $mdDialog.show({
                    controller: 'IntermediateConfigController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/apps/objects/parts/dialog/intermediate-config-dialog.html',
                    parent: angular.element($document.find('#content-container')),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                      configurationObject: vm.configurationObject,
                      object: object,
                      ev: ev
                    }
                  }).then(function (data) {
                  }, function () {
                  });
                }
              }, function () {
              });
            }
            if (object.objectType === 'documents') {
              $mdDialog.show({
                controller: 'CreateDocumentsController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/objects/documents/dialogs/create-document-dialog.html',
                parent: angular.element($document.find('#content-container')),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                  configure: 'Configuration',
                  object: response.data,
                  advancedNumbering: advancedNumbering
                }
              }).then(function (answer, ev) {
                if (angular.isUndefined(answer) === true || answer === 'false') {
                } else {
                  $mdDialog.show({
                    controller: 'IntermediateConfigController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/apps/objects/parts/dialog/intermediate-config-dialog.html',
                    parent: angular.element($document.find('#content-container')),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                      configurationObject: vm.configurationObject,
                      object: object,
                      ev: ev
                    }
                  }).then(function (data) {
                  }, function () {
                  });
                }
              }, function () {
              });
            }
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          vm.createBtnToggle = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
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
