(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('supplierpartController', supplierpartController);

  /** @ngInject */
  function supplierpartController($rootScope, $state, $mdDialog, Supplier, Suppliers, msUtils, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, objectId) {

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
    var data;
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //Data
    vm.title = 'Edit Associate Supplier Part';
    vm.supplier = angular.copy(Supplier);
    vm.suppliers = Suppliers;
    vm.newContact = false;
    vm.allFields = false;
    vm.changeitem = [];
    vm.search = 'Search';

    if (!vm.supplier) {
      vm.supplier = {
        'objectKey': '',
        'notes': '',
        'type': 'supplier'
      };

      vm.title = 'Associate Supplier Part';
      vm.newContact = true;
      vm.attributes = true;
    } else {
      vm.supplier = {};
      angular.forEach(Supplier.sourceObjectTableList, function (value, key) {
        vm.supplier.notes = value.notes;
        vm.supplier.sourceId = value.sourceId
      });
      vm.search = '';
    }

    //Methods
    vm.addSupplier = addSupplier;
    vm.saveSupplier = saveSupplier
    vm.deleteContactConfirm = deleteContactConfirm;
    vm.closeDialog = closeDialog;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.parseString = parseString;
    vm.closeCategoryChips = closeCategoryChips;

    getAllSourcing();

    function getAllSourcing() {

      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          sourceType: 'supp',
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          sourceType: 'supp',
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallsourceobject, '', '', header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.supplierData = response.data;
              if (Supplier) {
                angular.forEach(vm.supplierData, function (value, key) {
                  if (value.objectId === Supplier.objectId) {
                    if (value.code === "" || value.code === null) {
                      vm.namecode = '[' + value.objectNumber + ']  ' + ' [' + value.objectName + ']';
                    } else {
                      vm.namecode = '[' + value.objectName + ']  ' + ' [' + value.objectNumber + ']    ' + '[' + value.code + ']';
                    }
                  }
                });
                Supplier
                vm.supplier.objectKey = Supplier.objectId;
                vm.changeitem.push(vm.namecode);
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
          console.log('catch');
        });
    }

    function searchCategoryFunction(item, Data) {
      if (item === undefined) {} else {
        vm.changeitem = [];
        angular.forEach(Data, function (value, key) {
          if (item === value.objectId) {
            if (value.code === "" || value.code === null) {
              vm.namecode = '[' + value.objectNumber + ']  ' + ' [' + value.objectName + ']';
            } else {
              vm.namecode = '[' + value.objectNumber + ']  ' + ' [' + value.objectName + ']    ' + '[' + value.code + ']';
            }
            vm.changeitem.push(vm.namecode);
            vm.supplier.objectKey = value.objectId;
            vm.attributes = false;
          }
        });
        vm.searchName = '';
        vm.search = '';
      }
    }

    function closeCategoryChips(index) {
      vm.changeitem.splice(index, 1);
      vm.search = 'Search';
      if (vm.changeitem.length == 0) {
        vm.attributes = true;
      } else {
        vm.attributes = false;
      }
    }

    /**

     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function parentIDQuerySearch(query) {

      return query ? changeItemsQuerySearch(query).map(function (item) {
        //console.log(item);
        return item;
      }) : [];
    }

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {

      return query ? vm.supplierData.filter(createFilterFor(query)) : [];
    }

    /**
     * Filter for chips
     *
     * @param query
     * @returns {filterFn}
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(item) {
        var objectNumberName = item.objectNumber + ' ' + item.objectName;
        return angular.lowercase(objectNumberName).indexOf(lowercaseQuery) >= 0;
      };
    }

    function parseString(item) {
      if (item.code === "" || item.code === null) {
        return '[' + item.objectNumber + ']  ' + ' [' + item.objectName + ']';
      } else {
        return '[' + item.objectNumber + ']  ' + ' [' + item.objectName + ']    ' + '[' + item.code + ']';
      }
    }

    function addSupplier() {

      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: objectId,
          existSourceObjectId: vm.supplier.objectKey
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: objectId,
          existSourceObjectId: vm.supplier.objectKey
        }
      }

      data = {
        objectKey: vm.supplier.objectKey,
        type: 'supplier',
        notes: vm.supplier.notes,
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateassociatepart, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide();
              break;
            case 15:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
            case 4006:
              console.log(response.message);
              break;
            case 4266:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    function saveSupplier() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: objectId,
          existSourceObjectId: Supplier.objectId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: objectId,
          existSourceObjectId: Supplier.objectId
        }
      }

      data = {
        objectKey: vm.supplier.objectKey,
        type: 'supplier',
        notes: vm.supplier.notes,
        sourceId: vm.supplier.sourceId
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateassociatepart, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              break;
            case 15:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
            case 4266:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
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
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    /**
     * Delete Category Confirm Dialog
     */
    function deleteContactConfirm(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the supplier part?')
        .htmlContent('<b>' + Supplier.objectName + ' ' + Supplier.objectNumber + '</b>' + ' will be deleted.')
        .ariaLabel('delete supplier part')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: objectId,
            sourceObjectId: vm.supplier.objectKey
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            objectId: objectId,
            sourceObjectId: vm.supplier.objectKey
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeassociatepart, params, '', header)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent("Supplier Part Removed Successfully...").position('top right'));
                $rootScope.$emit('deleteSupplierPart', '');
                break;
              case 2003:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            //For Progress Loader
            vm.progress = false;
            console.log('catch');
          });
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
