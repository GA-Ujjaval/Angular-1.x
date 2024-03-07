(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('supplierController', supplierController);

  /** @ngInject */
  function supplierController(sourcerManagementService, $state, $mdDialog, Supplier, Suppliers, msUtils,
                              hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, objectId,
                              status, SaveDisabled, releaseSourcingSettings, $scope) {

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
        if (value.objectKey === objectId) {
          vm.supplier.notes = value.notes;
        }
      });
      vm.search = '';
    }

    //Methods
    vm.addSupplier = addSupplier;
    vm.saveSupplier = saveSupplier
    vm.deleteSupplierConfirm = deleteSupplierConfirm;
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
      if (item === undefined) {
      } else {
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
          fuseObjectId: objectId,
          sourceObjectId: vm.supplier.objectKey,
          sourceType: 'supplier',
          notes: vm.supplier.notes
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          fuseObjectId: objectId,
          sourceObjectId: vm.supplier.objectKey,
          sourceType: 'supplier',
          notes: vm.supplier.notes
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addassociatesourcing, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide();
              break;
            case 4006:
              console.log(response.message);
              break;
            case 2003:
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
          newSourceObjectId: vm.supplier.objectKey,
          existingSourceObjectId: Supplier.objectId,
          notes: vm.supplier.notes
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: objectId,
          newSourceObjectId: vm.supplier.objectKey,
          existingSourceObjectId: Supplier.objectId,
          notes: vm.supplier.notes
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.updateassociatesourcing, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              break;
            case 2003:
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

    function getDeleteDialog(checkStatus, ev) {
      return $mdDialog.confirm()
        .title(checkStatus ? 'WARNING: Object is ' + status + ', are you sure want to remove?' :
          'Are you sure want to delete the supplier part?')
        .htmlContent('<b>' + Supplier.objectName + ' ' + Supplier.objectNumber + '</b>' +
          ' will be deleted.')
        .ariaLabel(checkStatus ? 'remove fuse object supplier' : 'delete supplier part')
        .targetEvent(ev)
        .ok('Remove')
        .cancel('Cancel');
    }

    /**
     * Delete Supplier Confirm Dialog
     */
    function deleteSupplierConfirm(ev) {
      const confirm = getDeleteDialog(SaveDisabled && releaseSourcingSettings, ev);
      $mdDialog.show(confirm.multiple(true))
        .then(function () {
          vm.progress = true;
          return sourcerManagementService.removeSourcer(objectId, vm.supplier.objectKey);
        })
        .then(function () {
          vm.progress = false;
          vm.suppliers.splice(vm.suppliers.indexOf(Supplier), 1);
          $mdDialog.hide();
          $mdToast.show($mdToast.simple().textContent("Supplier Part Removed Successfully...").position('top right'));
        }, function (message) {
          if (message) {
            $mdToast.show($mdToast.simple().textContent(message).action('x')
              .toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            $mdDialog.hide();
          }
          vm.progress = false;
        });
    }

    $scope.$watch('vm.changeitem.length', function (newVal, oldVal) {
      if (newVal < oldVal) {
        vm.attributes = true;
      }
    });

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

  }
})();
