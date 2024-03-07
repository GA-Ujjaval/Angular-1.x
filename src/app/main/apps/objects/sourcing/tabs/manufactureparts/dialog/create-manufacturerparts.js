(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('CreateManufacturerpartController', CreateManufacturerpartController);

  /** @ngInject */
  function CreateManufacturerpartController($state, $mdDialog, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, type, sourceObject, $scope) {

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
    vm.search = 'Search';

    //Data
    vm.newContact = false;
    vm.allFields = false;
    vm.sourceType = type;
    vm.sourceTypes = '';
    vm.changeitem = [];
    vm.attributes = true;

    if (vm.sourceType) {
      if (vm.sourceType === 'supplierpart') {
        vm.title = 'New Supplier Part';
        vm.name = 'Supplier';
        vm.sourceTypes = 'supplier';
      } else {
        vm.title = 'New Manufacturer Part';
        vm.name = 'Manufacturer';
        vm.sourceTypes = 'manufacturer';
      }

      if (!vm.manufacturersupplier) {
        vm.manufacturersupplier = {
          'objectId': '',
          'objectName': '',
          'objectNumber': '',
          'revision': '',
          'minorRevision': '',
          'sourceType': vm.sourceTypes,
          'description': ''
        };
        vm.newContact = true;

      }

    } else {

      if (sourceObject.sourceType === 'supplier') {
        vm.title = 'Edit Supplier Part';
        vm.name = 'Supplier';
        vm.sourceTypes = 'supplier';
        delete sourceObject['isApproved'];
        delete sourceObject['name'];
        delete sourceObject['timeLineList'];
        delete sourceObject['whereUsed'];
        delete sourceObject['sourcePartsList'];
        vm.manufacturersupplier = sourceObject;
        vm.search = '';
        vm.attributes = false;
      } else {
        vm.title = 'Edit Manufacturer Part';
        vm.name = 'Manufacturer';
        vm.sourceTypes = 'manufacturer';
        delete sourceObject['isApproved'];
        delete sourceObject['name'];
        delete sourceObject['timeLineList'];
        delete sourceObject['whereUsed'];
        delete sourceObject['sourcePartsList'];
        vm.manufacturersupplier = sourceObject;
        vm.search = '';
        vm.attributes = false;
      }
    }

    //Methods
    vm.addNewManufacture = addNewManufacture;
    vm.closeDialog = closeDialog;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.parseString = parseString;
    vm.closeCategoryChips = closeCategoryChips;
    vm.notFound = notFound;

    function getAllSourcing() {

      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          sourcingType: vm.sourceTypes
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          sourcingType: vm.sourceTypes
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallsourcingobject, params, '', header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.manufacturerData = response.data;
              if (sourceObject) {
                angular.forEach(vm.manufacturerData, function (value, key) {
                  if (value.name === sourceObject.objectName) {
                    // if (value.code === "") {
                    //   vm.namecode = '[' + value.name + ']';
                    // } else {
                    //   vm.namecode = '[' + value.name + ']  ' + ' [' + value.code + ']';
                    // }
                    vm.namecode = '[' + value.name + ']';
                  }
                });
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
          console.log('catch');
        });
    }

    getAllSourcing();

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

      return query ? vm.manufacturerData.filter(createFilterFor(query)) : [];
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
        var objectNameCode = item.name + ' ' +item.code;
        return angular.lowercase(objectNameCode).indexOf(lowercaseQuery) >= 0;
      };
    }

    function parseString(item) {
      if (item.code === "") {
        return '[' + item.name + ']'
      } else {
        return '[' + item.name + '] [' + item.code + ']'
      }
    }

    function notFound(key) {
      transformChip(key);
    }
    /**
     * Return the proper object when the append is called.
     */
    function transformChip(chip) {
      // If it is an object, it's already a known chip
      if (angular.isObject(chip)) {
        return chip;
      }
    }

    function searchCategoryFunction(item, Data) {
      if (item === undefined) {} else {
        vm.changeitem = [];
        angular.forEach(Data, function (value, key) {
          if (item === value.name) {
            // if (value.code === "") {
            //   vm.namecode = '[' + value.name + ']';
            // } else {
            //   vm.namecode = '[' + value.name + ']  ' + ' [' + value.code + ']';
            // }
            vm.namecode = '[' + value.name + ']';
            vm.changeitem.push(vm.namecode);
            vm.manufacturersupplier.objectName = value.name;
            vm.manufacturersupplier.sourcingId = value.objectId;
            vm.attributes = false;
          }
        });
        vm.searchName = '';
        vm.search = '';
      }
    }

    function addNewManufacture() {

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

      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };


      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatesourceobject, params, vm.manufacturersupplier, header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              if (sourceObject) {
                $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
                $mdDialog.hide();
              } else {
                $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
                $mdDialog.hide();
              }

              // console.log(response.data);
              $state.go('app.objects.sourcing.sourcingdetails', {
                'id': response.data.objectId
              });
              break;
            case 4266:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
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
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
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

    $scope.$watch('vm.changeitem.length', function (newVal, oldVal) {
      if (newVal < oldVal) {
        vm.attributes = true;
      }
    });

  }
})();
