(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('billofmaterialController', billofmaterialController);

  /** @ngInject */
  function billofmaterialController($state, $rootScope, $mdDialog, editData, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, ObjectId, BOMS, event,
                                    row, isConfigurationCompare, isCheckboxChecked, bomId, BomService, columns, editReleased, MainTablesService, allFuseObjects, isConfigEnabled,
                                    $stateParams, $timeout, addedit, fuseUtils) {


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

    vm.isConfigurationCompare = isConfigurationCompare;
    vm.searchDisabled = false;
    vm.objectNumber = '';
    vm.BOMS = BOMS;
    vm.isLatest = true;
    vm.isChangeOnlyNotes = editData && editData.isChangeOnlyNotes;

    //Methods
    vm.closeDialog = closeDialog;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    vm.addNewBOM = addNewBOM;
    vm.saveBOM = saveBOM;
    vm.deleteBOMConfirm = deleteBOMConfirm;
    vm.addChip = addChip;
    vm.removeChip = removeChip;
    vm.parseStrings = parseStrings;
    vm.parseChip = parseChip;
    vm.isAddRowToMatrix = isAddRowToMatrix;
    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.parentIDQuerySearchStatus = parentIDQuerySearchStatus;
    vm.parentIDQuerySearchConfig = parentIDQuerySearchConfig;
    vm.filterChangeItem = filterChangeItem;
    vm.changeEditDataObjectId = changeEditDataObjectId;
    vm.getallfuseobject = getallfuseobject;

    vm.bomQuantity = 1;
    vm.addRefe = [];
    vm.bomparts = angular.copy(allFuseObjects) || [];

    if (allFuseObjects)
      sortProducts(vm.bomparts);

    var prePopulation = {};
    var Data = {objectId: ObjectId || $stateParams.id};

    if ((editData === '' && !isConfigurationCompare) || Array.isArray(ObjectId)) {
      vm.newContact = true;
      vm.title = 'Add Part to Bill-of-Material';
      vm.bom = {
        displayObjectId: [],
        bomPackage: '',
        referenceDesignator: [],
        quantity: vm.bomQuantity,
        notes: ''
      }
    } else if (editData === '' && isCheckboxChecked) {
      vm.newContact = true;
      vm.title = 'Add Part to Bill-of-Material';
      vm.bom = {
        displayObjectId: [parseRowForConfigurationCompare(row)],
        bomPackage: '',
        referenceDesignator: [],
        quantity: vm.bomQuantity,
        notes: ''
      }
    } else if (editData === '' && !isCheckboxChecked) {
      vm.title = 'Edit/Replace Part in Bill-of-Material';
      vm.editMember = false;
      vm.newContact = false;
      vm.bom = {};
    } else {
      vm.title = 'Edit/Replace Part in Bill-of-Material';
      vm.editMember = false;
      vm.newContact = false;
      vm.bom = angular.copy(editData) || {};
      vm.bom.displayObjectId = [];
      vm.bom.displayObjectId.push(editData);
      vm.bomQuantity = vm.bom.quantity;
      vm.bom.referenceDesignatorText = vm.bom.referenceDesignator.join(', ');
    }

    if (!isCheckboxChecked && isConfigurationCompare) {
      getfuseobjectbyid(ObjectId);
    }

    function searchCategoryFunction(itemid, Data) {
      if (itemid === 'undefined') {
      }
      else {
        vm.searchDisabled = true;
        angular.forEach(Data, function (value, key) {
          if (itemid === value.displayObjectId) {
            vm.objectNumber = value.objectId;
          }
        });
      }
    }

    function parseRowForConfigurationCompare(row) {
      return '[' + row.objectNumber + ' - Revision ' + row.revision + '] ' + row.objectName;
    }

    function getfuseobjectbyid(objectId) {
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectId: objectId,
          isBom: true
        };
      } else {
        params = {
          fuseObjectId: objectId,
          isBom: true
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', headers)
        .then(function (response) {
          var bomResponse = response.data.bomResponse;
          bomResponse.forEach(function (responseRow) {
            if (responseRow.objectId == row.id) {
              prePopulation = responseRow;
            }
          });
          vm.bom.referenceDesignator = prePopulation.referenceDesignator.join(', ');
          vm.bom.referenceDesignatorText = vm.bom.referenceDesignator;
          vm.bom.notes = prePopulation.notes;
          vm.bom.bomPackage = prePopulation.bomPackage;
          vm.bom.displayObjectId = [prePopulation.displayObjectId];
          vm.bomQuantity = prePopulation.quantity;

          vm.progress = false;
        })
        .catch(function () {
        });
    }

    function getallfuseobject() {
      if (vm.progress || (vm.bomparts && vm.bomparts.length > 0)) {
        return;
      }
      vm.progress = true;
      MainTablesService.getallfuseobjectcustom()
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function (value, key) {
                if ('parts' === value.objectType) {
                  vm.bomparts.push(angular.copy(value));
                }
              });

              sortProducts(vm.bomparts);


              setTimeout(function () {
                try {
                  var partNumberInput = $(".add-part-to-bom input")[0];
                  vm.title !== 'Edit/Replace Part in Bill-of-Material' &&
                  partNumberInput.focus();
                } catch (e) {
                  console.log(e.message);
                }
              }, 500);
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
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function sortProducts(array) {
      setTimeout(function () {
        array.sort(function (a, b) {
          if (parseChip(a) > parseChip(b))
            return 1;
          else
            return -1;
        })
      });
    }

    function addNewBOM() {
      vm.progress = true;

      var data = {
        objectKey: vm.objectNumber,
        bomPackage: vm.bom.bomPackage,
        referenceDesignator: vm.bom.referenceDesignator,
        quantity: vm.bomQuantity,
        notes: vm.bom.notes
      };

      if (isConfigurationCompare && !Array.isArray(ObjectId)) {
        data.objectKey = row.id;
      }

      if (ObjectId === null && isConfigurationCompare) {
        var numberOfRequest = 0;
        angular.forEach(row, function (value, key, obj) {
          if ((key.indexOf('parts') !== -1) && !value.exists && !isColumnDisabled(key)) {
            numberOfRequest++;
          }
        });

        if (!numberOfRequest) {
          var message = 'Nothing to add';
          $mdToast.show($mdToast.simple().textContent(message).position('top right'));
          $mdDialog.hide();
        }

        angular.forEach(row, function (value, key, obj) {
          if ((key.indexOf('parts') !== -1) && !value.exists && !isColumnDisabled(key)) {
            BomService.addPartToBom(key, data)
              .then(function (response) {
                closePopupAndEmitEvent(response, key)
              })
              .catch(function (response) {
                vm.progress = false;
                console.log('catch');
              });
          }
        });
        /**
         * this case works, when new row (and part) is added to bom matrix table
         */
      } else if (isConfigurationCompare && Array.isArray(ObjectId)) {
        var parents = [];

        ObjectId.forEach(function (parent) {
          parents.push({
            objectKey: parent.id,
            revision: parent.revision,
            objectNumber: parent.objectNumber,
            configName: parent.configName
          });
        });

        $mdDialog.cancel();
        openBulkScreenInBomMatrix(parents, data);
      } else {
        BomService.addPartToBom(ObjectId, data)
          .then(function (response) {
            closePopupAndEmitEvent(response, ObjectId)
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          });

      }
    }

    function closePopupAndEmitEvent(response, colName) {
      vm.progress = false;
      switch (response.code) {
        case 0:
          if (isConfigurationCompare && !isAddRowToMatrix()) {
            var message = 'Successfully Added';
            $rootScope.$broadcast('part added', {rowId: row.id, colName: colName, bomId: response.data.bomId});
          } else {
            var message = 'Successfully Created';
          }

          $mdToast.show($mdToast.simple().textContent(message).position('top right'));
          $mdDialog.hide();
          break;
        case 4006:
          console.log(response.message);
          break;
        case 1006:
          console.log(response.message);
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
          break;
        case 4004:
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent('Please, choose part from the list.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          console.log(response.message);
          break;
        case 11:
          console.log(response.message);
        case 15:
          console.log(response.message);
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 4266:
          console.log(response.message);
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 14:
          console.log(response.message);
        //$mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        default:
          console.log(response.message);
      }
    }

    function isColumnDisabled(colName) {
      if (editReleased) {
        return false;
      } else {
        var isColDisabled = false;
        columns.forEach(function (col) {
          if (col.name == colName && col.status !== 'InDevelopment') {
            isColDisabled = true;
          }
        });
        return isColDisabled;
      }
    }

    function changeEditDataObjectId() {
      if (!editData) {
        return;
      }
      editData.objectId = vm.bom.displayObjectId[0] ? vm.bom.displayObjectId[0].objectId : null;
    }

    function saveBOM() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: Data.objectId
        }
      }
      else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: Data.objectId
        }
      }
      angular.forEach(vm.bom.displayObjectId, function (val, key) {
        if (editData.displayObjectId === val) {
          vm.objectNumber = editData.objectId;
        }
      });

      var data = {
        bomId: editData.bomId,
        objectKey: editData.objectId || vm.objectNumber,
        bomPackage: vm.bom.bomPackage,
        referenceDesignator: vm.bom.referenceDesignator,
        quantity: vm.bomQuantity,
        notes: vm.bom.notes
      };

      if (!isCheckboxChecked && isConfigurationCompare) {
        data.bomId = bomId;
        data.objectKey = row.id;
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatebom, params, data, headers)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              if (isConfigurationCompare) {
                $rootScope.$broadcast('recheck checkbox', {row: row, colName: ObjectId});
              }
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
              break;
              break;
            case 4004:
              console.log(response.message);
              break;
              break;
            case 11:
              console.log(response.message);
              break;
            case 15:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4266:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 14:
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
    }

    /**
     * Delete BOM Confirm Dialog
     */
    function deleteBOMConfirm(ev) {
      if (isConfigurationCompare) {
        $mdDialog.hide();
      }

      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove this object from the Bill-of-Material?')
        .htmlContent('<b>' + (vm.bom.objectNumber || row.objectNumber) + ' ' + (vm.bom.objectName || row.objectName) + '</b>' + ' will be deleted.')
        .ariaLabel('delete Bill of Material')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true && !isConfigurationCompare) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            bomId: editData.bomId
          }
        } else if (vm.sessionData.proxy != true && !isConfigurationCompare) {
          params = {
            bomId: editData.bomId
          }
        } else if (isConfigurationCompare) {
          params = {
            bomId: bomId
          }
        } else {
          throw new Error('wrong parameters for removeBom request');
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removebom, params, '', headers)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent("Object Removed Successfully.").position('top right'));
                if (isConfigurationCompare)
                  $rootScope.$broadcast('turn off circular', row);

                if (!isConfigurationCompare)
                  $rootScope.$emit("invokePartInitializeShit", {});
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
          })
      }, function () {
        $rootScope.$broadcast('turn off circular');
        $rootScope.$broadcast('recheck checkbox', {row: row, colName: ObjectId});
      });
    }

    function addChip(chip) {

      for (var i = 0; i < vm.bom.referenceDesignator.length; i++) {
        if (chip === vm.bom.referenceDesignator[i]) ;
        return;
      }

      vm.addRefe.push(chip);

      if (vm.bom.referenceDesignator.length === 0 || vm.bom.referenceDesignator.length > 0) {

        if (vm.bom.referenceDesignator.length === 0) {

          vm.bomQuantity = 1;
        }
        else {

          vm.bom.referenceDesignator.push(chip);

          vm.bomQuantity = vm.bom.referenceDesignator.length;
        }
      }
    }

    function removeChip(chip) {

      if (vm.bom.referenceDesignator.length === 0) {
        vm.bomQuantity = 1;
      }
      else {
        vm.bomQuantity = vm.bom.referenceDesignator.length;
      }

    }


    function ReferenceDesignatorChecker(target) {
      this.setSavedState();
      this._target = target;
    }

    ReferenceDesignatorChecker.prototype.processInput = function (input) {
      var refDes = input.split(',');
      refDes = refDes.map(function (reference) {
        return reference.trim()
      });
      this._target.referenceDesignator = _.uniq(refDes.filter(function (item) {
        return item.length > 0
      }));
      vm.bomQuantity = this._isUpdateAfterAdding === true ? this._target.referenceDesignator.length : vm.bomQuantity;
    };
    ReferenceDesignatorChecker.prototype.setState = function (state, text) {
      this._isUpdateAfterAdding = state;
      localStorage.setItem(fuseUtils.buildAttributeName("reference designator checker"), JSON.stringify(state));
      this.processInput(text);
    };
    ReferenceDesignatorChecker.prototype.setSavedState = function () {
      var state = angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName('reference designator checker')));
      this._isUpdateAfterAdding = (state === true || state === false) ? state : true;
    };

    vm.refDesChecker = new ReferenceDesignatorChecker(vm.bom);

    function isAddRowToMatrix() {
      return Array.isArray(ObjectId);
    }

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.cancel();
    }

    function closeCategoryChips() {
      vm.searchDisabled = true;
    }

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {
      if (vm.isLatest) {
        vm.bompartsLatest = _.filter(vm.bomparts, ['isLatest', 'true']);
      } else {
        vm.bompartsLatest = vm.bomparts;
      }
      return query ? vm.bompartsLatest.filter(createFilterFor(query)) : [];
    }

    /**

     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function parentIDQuerySearch(query) {
      return query ? changeItemsQuerySearch(query).map(function (item) {
        return item.displayObjectId;
      }) : [];
    }

    function parentIDQuerySearchStatus(chip) {
      return chip ? changeItemsQuerySearch(chip).map(function (item) {
        return item.status;
      }) : [];
    }

    function parentIDQuerySearchConfig(chip) {
      return chip ? changeItemsQuerySearch(chip).map(function (item) {
        return item.configName ? item.configName : "";
      }) : [];
    }

    function parseStrings(str1) {
      var objectNumber1 = str1.objectNumber || '';
      var configName1 = str1.configName || '';
      var revision1 = str1.revision || '';
      var minorRevision1 = str1.minorRevision || '';
      var status1 = str1.status || '';
      var objectName1 = str1.objectName || '';
      if (isConfigEnabled && configName1) {
        return "[ " + objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      } else {
        return "[ " + objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      }
    }

    // remove duplicate from array
    function removeDuplicateUsingFilter(arr) {
      if (angular.isObject(arr)) {
        var unique_array = arr.filter(function (elem, index, self) {
          return index == self.indexOf(elem);
        });
        return unique_array;
      }
    }

    function parseChip(chip) {
      if (!chip.displayObjectId && vm.bom && vm.bom.objectNumber) {
        if (vm.bom.configName && isConfigEnabled) {
          return '[ ' + vm.bom.objectNumber + ' - Config.: ' + vm.bom.configName + ' - Rev. ' + vm.bom.revision + ' ] [ ' + vm.bom.status + ' ] ' + vm.bom.objectName;
        } else {
          return '[ ' + vm.bom.objectNumber + ' - Rev. ' + vm.bom.revision + ' ] [' + vm.bom.status + '] ' + vm.bom.objectName;
        }
      }
      return vm.parseStrings(chip);
    }

    /**
     * Change Items filter
     *
     * @param change item
     * @returns {boolean}
     */
    function filterChangeItem(changeItem) {
      return angular.lowercase(changeItem.displayObjectId).indexOf(angular.lowercase(changeItem.displayObjectId)) >= 0;
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
        return angular.lowercase(item.displayObjectId).indexOf(lowercaseQuery) >= 0;
      };
    }

    /**
     * opens bulk operation screen from bom matrix, when we add part to the table
     */
    function openBulkScreenInBomMatrix(parent, partToAdd) {
      $mdDialog.show({
        controller: 'BulkDeleteController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/bulk-delete/bulk-delete.html',
        clickOutsideToClose: false,
        locals: {
          selectedRows: parent,
          isRemoveQuantitiesFlatView: false,
          params: {
            operationType: 'addNewRowToBomMatrix',
            partToAdd: partToAdd
          },
          targetQuatity: ''
        }
      }).then(function (val) {
      });
    }

  }
})();
