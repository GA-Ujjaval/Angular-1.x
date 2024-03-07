(function () {
  'use strict';

  angular
    .module('app.admin')
    .controller('orgDialogController', orgDialogController);

  /** @ngInject */
  function orgDialogController($mdDialog, $rootScope, editData, event, callback, $parent, AdminService, $mdToast,
                               $state, AuthService, hostUrlDevelopment, errors, GlobalSettingsService) {
    var vm = this;
    vm.createCustomerForm = {};
    vm.createCustomerForm.userRoleSet = ['customer_admin'];

    vm.customer = {};

    vm.editPermision = true;

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;
    var params;
    var headers;
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    vm.ngFlowOptions = {
      // You can configure the ngFlow from here
      chunkSize: 100 * 1024 * 1024,
      target: hostUrlDevelopment.test.uploadfile + '?imageType=logo',
      testChunks: false,
      fileParameterName: 'uploadfile'
      /*chunkSize                : 15 * 1024 * 1024,
       maxChunkRetries          : 1,
       simultaneousUploads      : 1,
       testChunks               : false,
       progressCallbacksInterval: 1000*/
    };
    vm.ngFlow = {
      // ng-flow will be injected into here through its directive
      flow: {}
    };

    // Data
    var data;
    vm.trialExpire = false;
    vm.trialExprieHide = false;
    vm.activeinactiveCompnay = false;
    vm.activeinactiveCompanylabel = 'Inactive';
    vm.configuration = false;
    vm.advancedNumbering = false;

    vm.fileAdded = fileAdded;
    vm.upload = upload;
    vm.fileSuccess = fileSuccess;
    vm.submit = addNewCustomerFunction;
    vm.deleteFuseObject = deleteFuseObject;
    vm.closeDialog = closeDialog;
    vm.yesDialog = yesDialog;
    vm.callallSettingDialog = callallSettingDialog;
    vm.trialExpireChange = trialExpireChange;
    vm.trialExpireDateChange = trialExpireDateChange;
    vm.changerecordsImportSetting = changerecordsImportSetting;
    vm.statusChange = statusChange;
    vm.activeinactiveCompanyChange = activeinactiveCompanyChange;

    function getallUsers() {
      var headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: false
      };
      AdminService.dataManipulation('GET', hostUrlDevelopment.test.getusers, '', '', headers)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              vm.getUsers = response.data.Organization;
              angular.forEach(vm.getUsers, function (value, key) {
                if (value.customerId === editData.customerId) {
                  editData = value;
                }
              });
              $rootScope.$broadcast('render-dashboard', 'some data');
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    if (editData === '') {
      vm.title = 'Add Company';
      vm.settingHide = false;
    } else {
      vm.title = 'Edit Company';
      vm.editPermision = false;
      vm.createCustomerForm = angular.copy(editData) || {};
      vm.settingHide = true;
      headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: true
      };
      params = {
        customerId: editData.customerId
      };
      if (Object.keys(editData.systemSettings).length === 0) {
        vm.activeinactiveCompnay = true;
        vm.activeinactiveCompanylabel = 'Active';
      }
      var systemSettings = editData.systemSettings;

      if (systemSettings.trialSetting !== undefined || systemSettings.importSetting !== undefined || systemSettings.companystatusSetting !== undefined || systemSettings.configurationSetting !== undefined) {
        if (systemSettings.trialSetting !== undefined) {
          if (systemSettings.trialSetting.trialEnabled === 'true') {
            vm.trialExpire = true;
            vm.trialExprieHide = true;
            vm.trialExpireDate = new Date(moment(systemSettings.trialSetting.trialEndDate).format('YYYY/MM/DD h:mm:ss'));
          } else {
            vm.trialExpire = false;
            vm.trialExprieHide = false;
            vm.trialExpireDate = "";
          }
        }
        if (systemSettings.importSetting !== undefined) {
          vm.recordsImportSetting = systemSettings.importSetting.maxRecords;
        }
        if (systemSettings.companystatusSetting !== undefined) {
          if (systemSettings.companystatusSetting.status === 'true') {
            vm.activeinactiveCompnay = true;
            vm.activeinactiveCompanylabel = 'Active';
            vm.licensesUser = systemSettings.companystatusSetting.licensesUser;
          } else {
            vm.activeinactiveCompnay = false;
            vm.activeinactiveCompanylabel = 'Inactive';
          }
        }
        if (systemSettings.configurationSetting !== undefined) {
          if (systemSettings.configurationSetting.configurationEnabled === 'true') {
            vm.configuration = true;
          } else {
            vm.configuration = false;
          }
        }
        if (systemSettings.productionModuleSetting) {
          vm.productionModule = systemSettings.productionModuleSetting.productEnabled === 'true';
        } else {
          vm.productionModule = true;
        }
        if (editData.systemSettings.advancednumberingSetting !== undefined) {
          if (editData.systemSettings.advancednumberingSetting.advancednumberingEnabled === 'true') {
            vm.advancedNumbering = true;
          } else {
            vm.advancedNumbering = false;
          }
        }
        if (systemSettings.sourcingCostSetting) {
          vm.sourcingCost = systemSettings.sourcingCostSetting.isEnabled === 'true';
        } else {
          vm.sourcingCost = false;
        }
      }
    }

    //For Trial Expire.
    function trialExpireChange() {
      if (vm.trialExpire) {
        vm.trialExprieHide = true;
        if (editData.systemSettings.trialSetting !== undefined) {
          vm.trialExpireDate = editData.systemSettings.trialSetting.trialEndDate;
        }
      } else {
        vm.trialExprieHide = false;
        vm.trialExpireDate = "";
        vm.endDate = "";
        callallSettingDialog('', "trial");
      }
    }

    //For Trial Expire with date change.
    function trialExpireDateChange() {
      vm.endDate = new Date(moment(vm.trialExpireDate).format('YYYY/MM/DD h:mm:ss'));
      callallSettingDialog('', "trial");
    }

    function callallSettingDialog(ev, settings) {
      $mdDialog.show({
        template: '<md-dialog>' +
        '<md-dialog-content>' +
        'Are you sure want to change ' + settings + ' ' +
        'setting option ?' +
        '</md-dialog-content>' +
        '<md-dialog-actions>' +
        '<md-button ng-click="closetrialDialog()" class="md-primary">' +
        'No' +
        '</md-button>' +
        '<md-button ng-click="yestrialDialog()" class="md-primary">Yes</md-button>' +
        '</md-dialog-actions>' +
        '</md-dialog>',
        controller: trialController,
        controllerAs: 'vm',
        skipHide: true,
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        multiple: true,
        locals: {
          editData: editData || '',
          trialenddate: vm.endDate,
          allsettings: settings
        }
      });
    }

    const settingChanger = {
      'trial': trialExpire,
      'total records import': changerecordsImportSetting,
      'status': activeinactiveCompanyChange,
      'configuration': configurationCompany,
      'productionModule': changeProductionModule,
      'sourcingCost': changeSourcingCost,
      'advanced numbering': advancedNumberingCompany
    };

    function changeSourcingCost() {
      GlobalSettingsService.updateSystemSetting({
        key: 'isEnabled',
        value: vm.sourcingCost,
        groupName: 'sourcingCostSetting',
        customerId: editData.customerId,
        headers: headers
      })
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.hide();
              break;
            default:
              $mdToast.show($mdToast.simple().textContent(response.message)
                .action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          }
        })
    }

    function changeProductionModule() {
      GlobalSettingsService.updateSystemSetting({
        key: 'productEnabled',
        value: vm.productionModule,
        groupName: 'productionModuleSetting',
        customerId: editData.customerId,
        headers: headers
      })
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.hide();
              break;
            default:
              $mdToast.show($mdToast.simple().textContent(response.message)
                .action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          }
        })
    }


    function trialController($scope, $mdDialog, trialenddate, editData, allsettings) {
      $scope.yestrialDialog = function () {
        settingChanger[allsettings](trialenddate);
      };
      $scope.closetrialDialog = function () {
        if (editData.systemSettings.trialSetting !== undefined) {
          if (editData.systemSettings.trialSetting.trialEnabled === 'true') {
            vm.trialExpire = true;
            vm.trialExprieHide = true;
            vm.trialExpireDate = new Date(moment(editData.systemSettings.trialSetting.trialEndDate).format('YYYY/MM/DD h:mm:ss'));
          } else {
            vm.trialExpire = false;
            vm.trialExprieHide = false;
            vm.trialExpireDate = "";
          }
        }
        if (editData.systemSettings.importSetting !== undefined) {
          vm.recordsImportSetting = editData.systemSettings.importSetting.maxRecords;
        } else {
          vm.recordsImportSetting = '';
        }
        if (editData.systemSettings.companystatusSetting !== undefined) {
          if (editData.systemSettings.companystatusSetting.status === 'true') {
            vm.activeinactiveCompnay = true;
            vm.activeinactiveCompanylabel = 'Active';
            vm.licensesUser = editData.systemSettings.companystatusSetting.licensesUser;
          } else {
            vm.activeinactiveCompnay = false;
            vm.activeinactiveCompanylabel = 'Inactive';
          }
        } else {
          vm.activeinactiveCompnay = false;
          vm.activeinactiveCompanylabel = 'Inactive';
        }
        if (editData.systemSettings.configurationSetting !== undefined) {
          if (editData.systemSettings.configurationSetting.configurationEnabled === 'true') {
            vm.configuration = true;
          } else {
            vm.configuration = false;
          }
        } else {
          vm.configuration = false;
        }
        if (editData.systemSettings.advancednumberingSetting !== undefined) {
          if (editData.systemSettings.advancednumberingSetting.advancednumberingEnabled === 'true') {
            vm.advancedNumbering = true;
          } else {
            vm.advancedNumbering = false;
          }
        } else {
          vm.advancedNumbering = false;
        }
        $mdDialog.cancel();
      }
    }

    //For Trial Expire generic function.
    function trialExpire(endDate) {

      if (endDate) {
        data = {
          groupName: 'trialSetting',
          propertiesMap: {
            trialEnabled: vm.trialExprieHide,
            trialEndDate: endDate
          }
        };
      } else {
        data = {
          groupName: 'trialSetting',
          propertiesMap: {
            trialEnabled: vm.trialExprieHide,
            trialEndDate: ''
          }
        };
      }

      AdminService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, headers)
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.cancel();
              break;
            case 1001:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              vm.priceBreakSetting = true;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    //For Configuration generic function.
    function configurationCompany() {
      GlobalSettingsService.updateSystemSetting({
        key: 'configurationEnabled',
        value: vm.configuration,
        groupName: 'configurationSetting',
        customerId: editData.customerId,
        headers: headers
      })
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.cancel();
              break;
            case 1001:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4008:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              vm.priceBreakSetting = true;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    function advancedNumberingCompany() {

      data = {
        groupName: 'advancednumberingSetting',
        propertiesMap: {
          advancednumberingEnabled: vm.advancedNumbering
        }
      };

      AdminService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.cancel();
              break;
            case 1001:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              vm.priceBreakSetting = true;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    //For Import records setting.
    function changerecordsImportSetting() {

      data = {
        groupName: 'importSetting',
        propertiesMap: {
          maxRecords: vm.recordsImportSetting
        }
      };

      AdminService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, headers)
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              getallUsers();
              $mdDialog.cancel();
              break;
            case 1001:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              vm.priceBreakSetting = true;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    function statusChange() {
      if (vm.activeinactiveCompnay) {
        vm.activeinactiveCompnay = true;
        vm.activeinactiveCompanylabel = 'Active';
        if (editData.systemSettings.companystatusSetting !== undefined) {
          vm.licensesUser = editData.systemSettings.companystatusSetting.licensesUser;
        } else {
          vm.licensesUser = 5;
        }
        callallSettingDialog('', "status");
      } else {
        vm.activeinactiveCompnay = false;
        vm.activeinactiveCompanylabel = 'Inactive';
        callallSettingDialog('', "status");
      }
    }

    //For active/inactive compnay.
    function activeinactiveCompanyChange() {

      if (vm.licensesUser == '') {
        $mdToast.show($mdToast.simple().textContent('Enter number of user licenses').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
      } else {
        if (vm.activeinactiveCompnay) {
          vm.activeinactiveCompnay = true;
        } else {
          vm.activeinactiveCompnay = false;
          if (editData.systemSettings.companystatusSetting !== undefined) {
            vm.licensesUser = editData.systemSettings.companystatusSetting.licensesUser;
          } else {
            vm.licensesUser = 5;
          }
        }

        data = {
          groupName: 'companystatusSetting',
          propertiesMap: {
            status: vm.activeinactiveCompnay,
            licensesUser: vm.licensesUser
          }
        };

        AdminService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, headers)
          .then(function (response) {

            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
                getallUsers();
                $mdDialog.cancel();
                break;
              case 1001:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4004:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 2003:
                vm.priceBreakSetting = true;
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function () {
            console.log('catch');
          });
      }

    }

    vm.hide = function () {
      $mdDialog.hide();
    };
    vm.cancel = function () {
      $mdDialog.cancel();
    };

    function addNewCustomerFunction() {

      //For Progress Loader
      vm.progress = true;
      if (vm.sessionData.userId) {
        params = {
          customerId: vm.sessionData.userId
        };

        if (vm.editPermision == false) {
          vm.submitButton = true;
          customerCall('POST', hostUrlDevelopment.test.updatemember, params, vm.createCustomerForm, header, 'Successfully Updated');
        } else {
          vm.submitButton = true;
          customerCall('POST', hostUrlDevelopment.test.createCustomer, params, vm.createCustomerForm, header, 'Successfully Created');
        }
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
    }

    function customerCall(method, url, params, data, header, toast) {
      AdminService.dataManipulation(method, url, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.createCustomerForm = '';
              $mdToast.show($mdToast.simple().textContent(toast).position('top right'));
              $mdDialog.hide(true);
              break;
            case 4004:
              break;
            case 4:
              vm.submitButton = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4265:
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function fileAdded(file) {
      var uploadingFile = {
        id: file.uniqueIdentifier,
        file: file,
        type: 'uploading'
      };
    }

    function upload(files) {
      //For Progress Loader
      vm.progressimage = true;
      // Set headers
      vm.ngFlow.flow.opts.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'authId': vm.sessionData.authId,
        'channel_name': vm.sessionData.channel_name,
        'proxy': vm.sessionData.proxy
      };

      vm.ngFlow.flow.upload();
    }

    function fileSuccess(file, message) {

      var response = JSON.parse(message);

      //For Progress Loader
      vm.progressimage = false;

      vm.createCustomerForm.organizationLogo = response.data.imagePath;
    }

    /**
     * Delete Fuse Objects Confirm Dialog
     */
    function deleteFuseObject(ev) {
      $mdDialog.show({
        template: '<md-dialog>' +
        '<md-dialog-content>' +
        'Are you sure want to delete all the fuse objects?' +
        '</md-dialog-content>' +
        '<md-dialog-actions>' +
        '<md-button ng-click="vm.closeDialog()" class="md-primary">' +
        'No' +
        '</md-button>' +
        '<md-button ng-click="vm.yesDialog()" class="md-primary">Yes</md-button>' +
        '</md-dialog-actions>' +
        '</md-dialog>',
        controller: orgDialogController,
        controllerAs: 'vm',
        skipHide: true,
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        locals: {
          event: ev,
          editData: editData || '',
          $parent: vm,
          callback: null
        }
      }).then(function () {
        //For Progress Loader
        vm.progress = true;

        params = {
          customerId: editData.customerId
        }

        AdminService.dataManipulation('POST', hostUrlDevelopment.test.removecustomerdatabyadmin, params, '', header)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                $mdDialog.hide();
                $mdToast.show($mdToast.simple().textContent("Fuse Objects Removed Successfully...").position('top right'));
                break;
              case 4006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            //For Progress Loader
            vm.progress = false;
            console.log('catch');
          });
      }, function () {
      });
    }

    //Delete Fuse Objects Confirm Dialog Yes
    function yesDialog() {
      $mdDialog.hide();
    }

    //Delete Fuse Objects Confirm Dialog No
    function closeDialog() {
      $mdDialog.cancel();
    }
  }
})();
