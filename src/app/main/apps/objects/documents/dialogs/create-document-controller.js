(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('CreateDocumentsController', CreateDocumentsController);

  /** @ngInject */
  function CreateDocumentsController($state, $log, $mdDialog, $document, hostUrlDevelopment, CustomerService, errors,
                                     $mdToast, AuthService, configure, object, MainTablesService, advancedNumbering, $scope) {

    var vm = this;
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;
    vm.advancedNumbering = advancedNumbering;

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
      vm.document = {
        objectName: object.objectName,
        configName: '',
        revisionNotes: object.fuseObjectHistory.revisionNotes,
        categoryHierarchy: categoryHierarchy
      };
      isConfig = true;
      configFromObjectId = object.objectId;
    } else {
      vm.configure = 'Document';
      vm.document = {
        objectName: '',
        categoryHierarchy: []
      };
      vm.categoryId = '';
      isConfig = false;
      configFromObjectId = '';
      vm.searchDisabled = false;
      vm.submitButton = true;
      vm.enableEditObjectNumber = false;
    }

    vm.document.categoryHierarchy = [];

    $scope.$watch('vm.document.categoryHierarchy.length', function (newVal, oldVal) {
      if (newVal < oldVal) {
        vm.searchDisabled = false;
        vm.submitButton = true;
      }
    });

    getFuseObjectNumbering();

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;

    //Methods
    vm.closeDialog = closeDialog;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    getCategoryList();
    vm.cteateDocument = cteateDocument;

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

    function parentCategoryFunction(Data) {
      vm.searchDisabled = true;
      vm.submitButton = false;
      const confirmPopup = $mdDialog.confirm()
        .title('Changing a category will also change the document number based on the rules defined by the admin, in the settings panel.')
        .ok('Yes, override the document number')
        .cancel('No, retain the custom document number')
        .multiple(true);
      const promise = vm.objectNumber ? $mdDialog.show(confirmPopup) : Promise.resolve();
      promise
        .then(() => {
          vm.document.categoryHierarchy.length = 0;
          parentCategoryFunctionImpl(Data, true);
        }, () => {
          vm.document.categoryHierarchy.length = 0;
          parentCategoryFunctionImpl(Data);
        });
    }

    function parentCategoryFunctionImpl(Data, isChangeObjectNumber = false) {
      angular.forEach(Data, function (value, key) {
        if (vm.selectparentcategory === value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
      var length = vm.document.categoryHierarchy.length;
      var dataPush = false;
      if (vm.document.categoryHierarchy.length === 0) {
        vm.document.categoryHierarchy.push(vm.selectparentcategory);
        vm.selectparentcategory = '';
      } else if (length < 1) {
        angular.forEach(vm.document.categoryHierarchy, function (val, key) {
          if (val.categoryHierarchy === vm.selectparentcategory) {
            dataPush = true;
          }
        });
        if (dataPush === false) {
          vm.document.categoryHierarchy.push(vm.selectparentcategory);
        }
        vm.selectparentcategory = '';
      }
      if (isChangeObjectNumber) {
        getadvancedNumbering(vm.categoryId);
      }
    }

    function searchCategoryFunction(itemId, data) {
      if (!itemId) {
        return;
      }
      const confirm = $mdDialog.confirm()
        .title('Changing a category will also change the document number based on the rules defined by the admin, in the settings panel.')
        .ok('Yes, override the document number')
        .cancel(`No, retain the custom document number`)
        .multiple(true);

      const promise = vm.objectNumber ? $mdDialog.show(confirm) : Promise.resolve();
      promise.then(() => {
        searchCategoryFunctionImpl(itemId, data, true);
      }, () => {
        searchCategoryFunctionImpl(itemId, data);
      });
    }

    function searchCategoryFunctionImpl(itemId, data, isChangeObjectNumber = false) {
      vm.searchDisabled = true;
      vm.submitButton = false;
      angular.forEach((data || []), function (value, key) {
        if (itemId === value.categoryHierarchy) {
          vm.categoryId = value.categoryId;
        }
      });
      if (isChangeObjectNumber) {
        getadvancedNumbering(vm.categoryId);
      }
    }

    function closeCategoryChips() {
      vm.searchDisabled = false;
      vm.submitButton = true;
      vm.objectNumber = '';
    }

    function cteateDocument() {
      //For Progress Loader
      vm.progress = true;
      vm.createBtnToggle = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      var data = {
        objectName: vm.document.objectName,
        objectNumber: vm.objectNumber,
        configName: vm.document.configName,
        objectType: 'documents',
        systemRevision: vm.systemRevision,
        minorRevision: vm.minorRevision,
        systemObjectNumber: vm.systemObjectNumber,
        revision: vm.revision,
        systemMinorRevision: vm.systemMinorRevision,
        categoryId: vm.categoryId,
        tempSystemRevision: vm.tempSystemRevision,
        tempSystemMinorRevision: vm.tempSystemMinorRevision,
        fuseObjectHistory: {
          revisionNotes: vm.document.revisionNotes
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
                  .title('System number already exists, so should system use next sequence to generate document?')
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
                          if (response.data.objectType === 'documents') {
                            $state.go('app.objects.documents.details.basicInfo', {
                              reload: true,
                              notify: true,
                              id: response.data.objectId
                            });
                          }
                          break;
                        case 4006:
                          console.log(response.message);
                          break;
                        case 1006:
                          console.log(response.message);
                          break;
                        case 4004:
                          //For Progress Loader
                          vm.progress = false;
                          vm.createBtnToggle = false;
                          console.log(response.message);
                          break;
                        case 11:
                          console.log(response.message);
                          break;
                        case 4266:
                          //For Progress Loader
                          vm.progress = false;
                          vm.createBtnToggle = false;
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
                      vm.createBtnToggle = false;
                      console.log('catch');
                    });
                }, function (ev) {
                  $mdDialog.show({
                    controller: 'CreateDocumentsController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/apps/objects/documents/dialogs/create-document-dialog.html',
                    parent: angular.element($document.find('#content-container')),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                      configure: '',
                      object: ''
                    }
                  })
                    .then(function () {
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
                        if (response.data.objectType === 'documents') {
                          $state.go('app.objects.documents.details.basicInfo', {
                            reload: true,
                            notify: true,
                            id: response.data.objectId
                          });
                        }
                        break;
                      case 4006:
                        console.log(response.message);
                        break;
                      case 1006:
                        console.log(response.message);
                        break;
                      case 4004:
                        //For Progress Loader
                        vm.progress = false;
                        vm.createBtnToggle = false;
                        console.log(response.message);
                        break;
                      case 11:
                        console.log(response.message);
                        break;
                      case 4266:
                        //For Progress Loader
                        vm.progress = false;
                        vm.createBtnToggle = false;
                        console.log(response.message);
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        break;
                      default:
                        console.log(response.message);
                    }
                  })
                  .catch(function () {
                    //For Progress Loader
                    vm.progress = false;
                    vm.createBtnToggle = false;
                    console.log('catch');
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

    function getCategoryList() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          categoryType: 'documents'
        };
      } else {
        params = {
          categoryType: 'documents'
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

    // Advanced Numbering.
    let systemGeneratedAdvNumber;

    function getadvancedNumbering(categoryId) {
      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId,
        objectType: 'documents',
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

    function getFuseObjectNumbering() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
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
              if (vm.editPart == false) {
                vm.enableEditObjectNumber = true;
              } else {
                vm.enableEditObjectNumber = false;
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
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

  }
})();
