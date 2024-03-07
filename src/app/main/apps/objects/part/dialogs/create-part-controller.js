(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('CreatePartsController', CreatePartsController);

  /** @ngInject */
  function CreatePartsController($state, $log, $mdDialog, $document, hostUrlDevelopment, CustomerService, errors,
                                 $mdToast, AuthService, configure, object, MainTablesService, advancedNumbering, $scope) {
    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    const vm = this;
    vm.advancedNumbering = advancedNumbering;
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    var isConfig = '';
    var configFromObjectId = '';

    if (configure !== '') {
      vm.configure = configure;
      vm.objectNumber = object.objectNumber;
      vm.configurationObjectNumber = true;
      var categoryHierarchy = [];
      vm.categoryId = object.categoryId;
      categoryHierarchy.push(object.categoryHierarchy);
      vm.part = {
        objectName: object.objectName,
        configName: '',
        revisionNotes: object.fuseObjectHistory.revisionNotes,
        categoryHierarchy: categoryHierarchy
      };
      isConfig = true;
      configFromObjectId = object.objectId;
    } else {
      vm.configure = 'Part';
      //Data
      vm.categoryId = '';
      vm.part = {
        objectName: '',
        categoryHierarchy: []
      };
      isConfig = false;
      configFromObjectId = '';
      vm.submitButton = true;
      vm.enableEditObjectNumber = false;
    }

    vm.part.categoryHierarchy = [];

    $scope.$on('categoryChanged', () => {
      if (vm.part.categoryHierarchy.length === 1) {
        vm.submitButton = false;
      }
    });

    getFuseObjectNumbering();
    //Methods
    vm.closeDialog = closeDialog;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.createPart = createPart;
    getCategoryList();

    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

    /**
     * parent category functions
     * @param Data
     */
    function parentCategoryFunction(Data) {
      vm.submitButton = false;
      const confirmPopup = $mdDialog.confirm()
        .title('Changing a category will also change the part number based on the rules defined by the admin, in the settings panel.')
        .ok('Yes, override the part number')
        .cancel('No, retain the custom part number')
        .multiple(true);
      const promise = vm.objectNumber ? $mdDialog.show(confirmPopup) : Promise.resolve();
      promise
        .then(() => {
          vm.part.categoryHierarchy.length = 0;
          parentCategoryFunctionImpl(Data, true);
        }, () => {
          vm.part.categoryHierarchy.length = 0;
          parentCategoryFunctionImpl(Data);
        });
    }

    function parentCategoryFunctionImpl(Data, isChangePartNumber = false) {
      angular.forEach(Data, function (value, key) {
        if (vm.selectparentcategory === value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });

      var length = vm.part.categoryHierarchy.length;
      var dataPush = false;

      if (vm.part.categoryHierarchy.length === 0) {
        vm.part.categoryHierarchy.push(vm.selectparentcategory);
        vm.selectparentcategory = '';
        $scope.$emit('categoryChanged');
      } else if (length < 1) {

        angular.forEach(vm.part.categoryHierarchy, function (val, key) {
          if (val.categoryHierarchy === vm.selectparentcategory) {
            dataPush = true;
          }
        });

        if (dataPush === false) {
          vm.part.categoryHierarchy.push(vm.selectparentcategory);
          $scope.$emit('categoryChanged');
        }
        vm.selectparentcategory = '';
      }
      if (isChangePartNumber) {
        getadvancedNumbering(vm.categoryId);
      }
    }

    /**
     * search category functions
     * @param itemId
     * @param data
     */
    function searchCategoryFunction(itemId, data) {
      if (!itemId) {
        return;
      }
      const confirm = $mdDialog.confirm()
        .title('Changing a category will also change the part number based on the rules defined by the admin, in the settings panel.')
        .ok('Yes, override the part number')
        .cancel(`No, retain the custom part number`)
        .multiple(true);

      const promise = vm.objectNumber ? $mdDialog.show(confirm) : Promise.resolve();
      promise.then(() => {
        searchCategoryFunctionImpl(itemId, data, true);
      }, () => {
        searchCategoryFunctionImpl(itemId, data);
      });
    }

    function searchCategoryFunctionImpl(itemId, data, isChangePartNumber = false) {
      angular.forEach((data || []), function (value, key) {
        if (itemId === value.categoryHierarchy) {
          vm.selectSearchCategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
        vm.part.categoryHierarchy.length = 0;
        vm.part.categoryHierarchy.push(vm.selectSearchCategory);
        $scope.$emit('categoryChanged');
        vm.selectSearchCategory = '';
      if (isChangePartNumber) {
        getadvancedNumbering(vm.categoryId);
      }
    }

    /**
     * create part
     */
    function createPart() {

      //For Progress Loader
      vm.progress = true;
      vm.createBtnToggle = true;

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        };
      }

      var data = {
        objectName: vm.part.objectName,
        objectNumber: vm.objectNumber,
        objectType: 'parts',
        configName: vm.part.configName,
        systemRevision: vm.systemRevision,
        minorRevision: vm.minorRevision,
        systemObjectNumber: vm.systemObjectNumber,
        revision: vm.revision,
        systemMinorRevision: vm.systemMinorRevision,
        categoryId: vm.categoryId,
        tempSystemRevision: vm.tempSystemRevision,
        tempSystemMinorRevision: vm.tempSystemMinorRevision,
        fuseObjectHistory: {
          revisionNotes: vm.part.revisionNotes
        },
        isConfig: isConfig,
        configFromObjectId: configFromObjectId,
        filterDTO: object.filterDTO,
        systemGeneratedAdvNumber
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.checkconcurrentparts, params, data, header)
        .then(function (response) {
          closeDialog();
          switch (response.code) {
            case 0:
              var updatedData = response.data;
              if (response.data && response.data.showDialog) {
                var confirm = $mdDialog.confirm()
                  .title('System number already exists, so should system use next sequence to generate part?')
                  .ok('Yes')
                  .cancel('No');

                $mdDialog.show(confirm).then(function () {
                  updatedData.object.systemGeneratedAdvNumber = systemGeneratedAdvNumber;
                  CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateobject, params, updatedData.object, header)
                    .then(function (response) {
                      switch (response.code) {
                        case 0:
                          MainTablesService.removeCache();
                          $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
                          if (response.data.objectType === 'parts') {
                            $state.go('app.objects.part.parts.basicInfo', {
                              reload: true, notify: true, id: response.data.objectId,
                              targetPageIndex: configure ? 2 : 0
                            });
                          }
                          break;
                        case 4006:
                          $log.log(response.message);
                          break;
                        case 1006:
                          $log.log(response.message);
                          break;
                        case 4004:
                          //For Progress Loader
                          vm.progress = false;
                          vm.createBtnToggle = false;
                          $log.log(response.message);
                          break;
                        case 11:
                          $log.log(response.message);
                          break;
                        case 4266:
                          //For Progress Loader
                          vm.progress = false;
                          vm.createBtnToggle = false;
                          $mdToast.show($mdToast.simple().textContent(response.message).action('x')
                            .toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                          break;
                        default:
                          $log.log(response.message);
                      }
                    })
                    .catch(function () {
                      //For Progress Loader
                      vm.progress = false;
                      vm.createBtnToggle = false;
                    });
                }, function (ev) {
                  $mdDialog.show({
                    controller: 'CreatePartsController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/apps/objects/part/dialogs/create-part-dialog.html',
                    parent: angular.element($document.find('#content-container')),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                      configure: '',
                      object: ''
                    }
                  }).then(function () {
                  }, function () {
                  });
                });
              } else {
                CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateobject, params, updatedData.object, header)
                  .then(function (response) {
                    switch (response.code) {
                      case 0:
                        MainTablesService.removeCache();
                        $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
                        if (response.data.objectType === 'parts') {
                          $state.go('app.objects.part.parts.basicInfo', {
                            reload: true,
                            notify: true,
                            id: response.data.objectId,
                            targetPageIndex: configure ? 2 : 0
                          });
                        }
                        break;
                      case 4006:
                        $log.log(response.message);
                        break;
                      case 1006:
                        $log.log(response.message);
                        break;
                      case 4004:
                        //For Progress Loader
                        vm.progress = false;
                        vm.createBtnToggle = false;
                        $log.log(response.message);
                        break;
                      case 11:
                        $log.log(response.message);
                        break;
                      case 4266:
                        //For Progress Loader
                        vm.progress = false;
                        vm.createBtnToggle = false;
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x')
                          .toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        break;
                      default:
                        $log.log(response.message);
                    }
                  })
                  .catch(function () {
                    //For Progress Loader
                    vm.progress = false;
                    vm.createBtnToggle = false;
                  });
              }
              break;
            case 4006:
              $log.log(response.message);
              break;
            case 1006:
              $log.log(response.message);
              break;
            case 4004:
              $log.log(response.message);
              break;
            case 11:
              $log.log(response.message);
              break;
            case 4266:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x')
                .toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              $log.log(response.message);
          }
        })
    }


    function getFuseObjectNumbering() {

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectsequence, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:

              vm.revision = response.data.fuseObject.revision;
              vm.minorRevision = response.data.fuseObject.minorRevision;

              vm.systemMinorRevision = response.data.fuseObject.systemMinorRevision;
              vm.systemObjectNumber = response.data.fuseObject.systemObjectNumber;
              vm.systemRevision = response.data.fuseObject.systemRevision;
              vm.tempSystemRevision = response.data.fuseObject.tempSystemRevision;
              vm.tempSystemMinorRevision = response.data.fuseObject.tempSystemMinorRevision;
              vm.editPart = response.data.fuseObjectNumberSetting.editObjectId;
              vm.enableMinorRev = response.data.fuseObjectNumberSetting.enableMinorRev;
              vm.majorRevFormat = response.data.fuseObjectNumberSetting.majorRevFormat;
              vm.minorRevFormat = response.data.fuseObjectNumberSetting.minorRevFormat;

              if (vm.editPart === false) {
                vm.enableEditObjectNumber = true;
              } else {
                vm.enableEditObjectNumber = false;
              }

              break;
            case 4008:
              $mdToast.show($mdToast.simple().textContent(vm.error.er4008).position('top right'));
              AuthService.userLogout('customerData');
              //$state.go('app.landing');
              $state.go('app.login', {
                channelName: 'aws'
              });
              break;
            case 4006:
              $log.log(response.message);
              break;
            default:
              $log.log(response.message);
          }
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {
      return query ? vm.parent.filter(createFilterFor(query)) : [];
    }

    /**

     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function parentIDQuerySearch(query) {

      return query ? changeItemsQuerySearch(query).map(function (item) {
        return item.categoryHierarchy;
      }) : [];
    }

    /**
     * Change Items filter
     *
     * @param change item
     * @returns {boolean}
     */
    function filterChangeItem(changeItem) {
      return angular.lowercase(changeItem.categoryHierarchy).indexOf(angular.lowercase(changeItem.categoryHierarchy)) >= 0;
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
        return angular.lowercase(item.categoryHierarchy).indexOf(lowercaseQuery) >= 0;
      };
    }

    /**
     * Read category list from server
     */
    function getCategoryList() {

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          categoryType: 'parts'
        };
      } else {
        params = {
          categoryType: 'parts'
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, params, '', header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function (value, key) {
                if (value.categoryId === value.parentCategoryId) {
                  value.categoryHierarchy = value.categoryName;
                }
              });
              vm.parent = response.data;
              break;
            case 4006:
              $log.log(response.message);
              break;
            default:
              $log.log(response.message);
          }
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    let systemGeneratedAdvNumber;

    function getadvancedNumbering(categoryId) {

      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId,
        objectType: 'parts',
        categoryId: categoryId,
        action: 'yes'
      };

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getnextnumber, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              vm.objectNumber = response.data;
              systemGeneratedAdvNumber = vm.objectNumber;
              break;
            case 4006:
              $log.log(response.message);
              break;
            default:
              $log.log(response.message);
          }
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

  }
})();
