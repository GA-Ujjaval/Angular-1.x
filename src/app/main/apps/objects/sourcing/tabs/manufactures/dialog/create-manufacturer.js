(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('CreateManufacturerController', CreateManufacturerController);

  /** @ngInject */
  function CreateManufacturerController($state, $mdDialog, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, type, sourcingObject) {

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
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    //Data
    vm.type = type;
    vm.sourceType = '';

    if(vm.type){
        if (vm.type === 'supplier') {
          vm.title = 'Create Supplier';
          vm.sourcingType = 'Supplier';
          vm.sourceType = 'supplier';
        } else {
          vm.title = 'Create Manufacturer';
          vm.sourcingType = 'Manufacturer';
          vm.sourceType = 'manufacturer';
        }
        vm.manufacturer = {
          objectId: '',
          name: '',
          sourceType: vm.sourceType,
          description: '',
          code: ''
        };
    }
    else{
      if (sourcingObject.sourceType === 'supplier') {
        vm.button = 'Save';
        vm.title = 'Edit Supplier';
        vm.sourcingType = 'Supplier';
        vm.sourceType = 'supplier';
        delete sourcingObject['timeLineList'];
        delete sourcingObject['attachmentsList'];
        delete sourcingObject['commentsList'];
        delete sourcingObject['contactList'];
        delete sourcingObject['manufacturerObjects'];
        delete sourcingObject['supplierObjects'];
        delete sourcingObject['whereUsed'];
        vm.manufacturer = sourcingObject;
        // vm.manufacturer  = {
        //   objectId: sourcingObject.objectId,
        //   name: sourcingObject.name,
        //   sourceType: sourcingObject.sourceType,
        //   description: sourcingObject.description,
        //   code: sourcingObject.code
        // }
      } else {
        vm.button = 'Save';
        vm.title = 'Edit Manufacturer';
        vm.sourcingType = 'Manufacturer';
        vm.sourceType = 'manufacturer';
        delete sourcingObject['timeLineList'];
        delete sourcingObject['attachmentsList'];
        delete sourcingObject['commentsList'];
        delete sourcingObject['contactList'];
        delete sourcingObject['manufacturerObjects'];
        delete sourcingObject['supplierObjects'];
        delete sourcingObject['whereUsed'];
        vm.manufacturer = sourcingObject;
        // vm.manufacturer  = {
        //   objectId: sourcingObject.objectId,
        //   name: sourcingObject.name,
        //   sourceType: sourcingObject.sourceType,
        //   description: sourcingObject.description,
        //   code: sourcingObject.code
        // }
      }
    }

    //Methods
    vm.closeDialog = closeDialog;
    vm.cteateManufacturer = cteateManufacturer;
    vm.saveManufacturer = saveManufacturer;

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

    function cteateManufacturer() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatesourcingobject, params, vm.manufacturer, header)
        .then(function(response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide();
              $state.go('app.objects.sourcing.sourcemfgsuppdetails', {
                  'sourceType': response.data.sourceType,
                  'id': response.data.objectId
                });
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            case 4266:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    function saveManufacturer() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatesourcingobject, params, vm.manufacturer, header)
        .then(function(response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              $state.go('app.objects.sourcing.sourcemfgsuppdetails', {
                  'sourceType': response.data.sourceType,
                  'id': response.data.objectId
                });
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            case 4266:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }
  }
})();
