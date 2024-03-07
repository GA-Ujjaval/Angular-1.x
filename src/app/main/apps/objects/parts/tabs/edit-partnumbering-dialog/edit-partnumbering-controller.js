(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('editPartNumberingDialogController', editPartNumberingDialogController);

  /** @ngInject */
  function editPartNumberingDialogController($state, $rootScope, $scope, $mdDialog, hostUrlDevelopment, CustomerService,
                                             errors, $mdToast, AuthService, object, products, copyObject, objectId, configurationSettings, isConfig, MainTablesService,
                                             decoratorsService, lastStateName, $log, $q, editPart) {

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
    vm.newcategoryHierarchys = [];
    vm.copyObject = copyObject;

    vm.submitButton = false;
    vm.enableEditObjectNumber = false;
    vm.product = object;
    vm.products = products;
    vm.objectType = vm.product.objectType;
    vm.objectName = vm.product.objectName;
    vm.objectNumber = vm.product.objectNumber;
    vm.revision = vm.product.revision;
    vm.minorRevision = vm.product.minorRevision;
    vm.revisionNotes = vm.product.fuseObjectHistory.revisionNotes;
    vm.editObjectId = vm.products.fuseObjectNumberSetting.editObjectId;
    vm.enableMinorRev = vm.products.fuseObjectNumberSetting.enableMinorRev;
    vm.majorRevFormat = vm.products.fuseObjectNumberSetting.majorRevFormat;
    vm.minorRevFormat = vm.products.fuseObjectNumberSetting.minorRevFormat;
    vm.categoryId = vm.product.categoryId;
    const intialState = {
      categoryId: vm.categoryId,
      objectNumber: vm.product.objectNumber,
      systemGeneratedAdvNumber: vm.product.systemGeneratedAdvNumber
    };
    if (copyObject !== 'Edit') {
      vm.configure = configurationSettings;
      vm.isConfig = isConfig;
      vm.configName = vm.product.configName;
      vm.newcategoryHierarchy = vm.newcategoryHierarchys.push(object.categoryHierarchy);
    } else {
      vm.configure = configurationSettings;
      vm.isConfig = isConfig;
      vm.configName = vm.products.configName;
      vm.newcategoryHierarchy = vm.newcategoryHierarchys.push(vm.products.categoryHierarchy);
    }

    if (vm.editObjectId == false) {
      vm.enableEditObjectNumber = true;
    } else {
      vm.enableEditObjectNumber = false;
    }
    let systemGeneratedAdvNumber = vm.product.systemGeneratedAdvNumber;
    // let systemGeneratedAdvNumber = vm.product.systemGeneratedAdvNumber;
    //Methods
    vm.closeDialog = closeDialog;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    getCategoryList();
    vm.saveObject = saveObject;
    vm.objectCopy = objectCopy;

    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;

    function closeDialog() {
      $mdDialog.hide();
    }

    function parentCategoryFunction(categories) {
      // const oldCategory = _.find(categories, {categoryName: vm.newcategoryHierarchys[0]});
      const oldCategory = vm.newcategoryHierarchys[0];
      vm.newcategoryHierarchys.length = 0;
      vm.submitButton = false;
      angular.forEach(categories, function (value, key) {
        if (vm.selectparentcategory == value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
      vm.newcategoryHierarchys.push(vm.selectparentcategory);
      vm.selectparentcategory = '';
      getadvancedNumbering(vm.categoryId, oldCategory);
    }

    function searchCategoryFunction(itemid, Data) {
      if (!itemid) {
        return;
      }
      vm.submitButton = false;
      angular.forEach(Data, function (value, key) {
        if (itemid === value.categoryHierarchy) {
          vm.categoryId = value.categoryId;
        }
      });
      getadvancedNumbering(vm.categoryId);
    }

    function closeCategoryChips() {
      vm.submitButton = true;
    }

    function saveObject() {

      //For Progress Loader
      vm.progress = true;
      vm.submitButton = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      var data = getObject();
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateobject, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              if (editPart) {
                $mdDialog.hide();
                break;
              }
              MainTablesService.removeCache();
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              if (response.data.objectType === 'parts') {
                $state.go(lastStateName ? `app.objects.part.parts.${lastStateName}` : 'app.objects.part.parts.basicInfo', {
                  'id': response.data.objectId
                });
              } else {
                if (response.data.objectType === 'documents') {
                  $state.go(lastStateName ? `app.objects.documents.details.${lastStateName}` : 'app.objects.documents.details.basicInfo', {
                    'id': response.data.objectId
                  });
                } else {
                  $state.go(lastStateName ? `app.objects.products.details.${lastStateName}` : 'app.objects.products.details.basicInfo', {
                    'id': response.data.objectId
                  });
                }
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
              vm.submitButton = false;
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            case 4266:
              //For Progress Loader
              vm.progress = false;
              vm.submitButton = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          vm.createBtnToggle = false;
        });
    }

    function objectCopy() {

      //For Progress Loader
      vm.progress = true;
      vm.submitButton = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      var data = getcopyObject();
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.savecopiedfuseobject, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide('false');
              if (response.data.objectType === 'parts') {
                $state.go('app.objects.part.parts.basicInfo', {
                  'id': response.data.objectId
                });
              } else {
                if (response.data.objectType === 'documents') {
                  $state.go('app.objects.documents.details.basicInfo', {
                    'id': response.data.objectId
                  });
                } else {
                  $state.go('app.objects.products.details.basicInfo', {
                    'id': response.data.objectId
                  });
                }
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
              vm.submitButton = false;
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            case 4266:
              //For Progress Loader
              vm.progress = false;
              vm.submitButton = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          vm.submitButton = false;
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

    function getCategoryList() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          categoryType: vm.objectType
        };
      } else {
        params = {
          categoryType: vm.objectType
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

    function getObject() {
      return {
        objectId: vm.product.objectId,
        objectType: vm.objectType,
        objectName: vm.objectName,
        objectNumber: vm.objectNumber,
        configName: vm.configName,
        categoryId: vm.categoryId,
        description: vm.product.description,
        revision: vm.revision,
        uom: vm.product.uom,
        procurementType: vm.product.procurementType,
        projectNames: vm.product.projectNames,
        tags: vm.product.tags,
        additionalInfoList: vm.product.additionalInfoList,
        systemRevision: vm.product.systemRevision,
        minorRevision: vm.minorRevision,
        systemObjectNumber: vm.product.systemObjectNumber,
        systemMinorRevision: vm.product.systemMinorRevision,
        fuseObjectHistory: {
          revisionNotes: vm.revisionNotes
        },
        fuseCost: vm.product.fuseCost,
        costDetail: vm.product.costDetail,
        qtyOnHand: vm.product.qtyOnHand,
        qtyOnOrder: vm.product.qtyOnOrder,
        qtyTotal: vm.product.qtyTotal,
        isConfig: vm.products.isConfig,
        configId: vm.products.configId,
        systemGeneratedAdvNumber: systemGeneratedAdvNumber
      };
    }

    function getcopyObject() {
      return {
        copyObjectId: objectId,
        objectId: vm.product.objectId,
        objectType: vm.objectType,
        objectNumber: vm.objectNumber,
        configName: vm.configName,
        systemRevision: vm.product.systemRevision,
        minorRevision: vm.minorRevision,
        systemObjectNumber: vm.product.systemObjectNumber,
        revision: vm.revision,
        tempSystemRevision: vm.product.tempSystemRevision,
        systemMinorRevision: vm.product.systemMinorRevision,
        tempSystemMinorRevision: vm.product.tempSystemMinorRevision,
        customerId: vm.product.customerId,
        isLatest: vm.product.isLatest,
        objectName: vm.objectName,
        categoryId: vm.categoryId,
        categoryName: vm.product.categoryName,
        categoryHierarchy: vm.product.categoryHierarchy,
        status: vm.product.status,
        description: vm.product.description,
        uom: vm.product.uom,
        procurementType: vm.product.procurementType,
        displayPart: vm.product.displayPart,
        fuseCost: vm.product.fuseCost,
        costDetail: vm.product.costDetail,
        thumbnailName: vm.product.thumbnailName,
        thumbnailPath: vm.product.thumbnailPath,
        hasBOM: vm.product.hasBOM,
        qtyOnHand: vm.product.qtyOnHand,
        qtyOnOrder: vm.product.qtyOnOrder,
        qtyTotal: vm.product.qtyTotal,
        projectNames: vm.product.projectNames,
        tags: vm.product.tags,
        bomTableList: vm.product.bomTableList,
        whereUsed: vm.product.whereUsed,
        associatedCardSet: vm.product.associatedCardSet,
        attachmentsList: vm.product.attachmentsList,
        sourcingList: vm.product.sourcingList,
        sourcingPartsList: vm.product.sourcingPartsList,
        commentsList: vm.product.commentsList,
        additionalInfoList: vm.product.additionalInfoList,
        fuseObjectHistory: {
          revisionNotes: vm.revisionNotes
        },
        timeLineList: vm.product.timeLineList,
        isConfig: vm.product.isConfig,
        configId: vm.product.configId,
        systemGeneratedAdvNumber: systemGeneratedAdvNumber
      };
    }

    function showConfirmChangeDialog(categoryId, oldCategory) {
      const confirm = $mdDialog.confirm()
        .ok(`Yes, override the ${vm.objectType.substring(0, vm.objectType.length - 1)} number`)
        .cancel(`No, retain the custom ${vm.objectType.substring(0, vm.objectType.length - 1)} number`)
        .title(`Changing category will also change the ${vm.objectType.substring(0, vm.objectType.length - 1)} number based on rules defined by the admin, in the settings panel.`)
        .multiple(true);
      return $mdDialog.show(confirm)
        .then(() => {
          advancedNumbering(categoryId, 'yes');
        }, () => {
          return $q.reject(null);
        });
    }

    function showChangeCategoryBackDialog(oldCategory) {
      const confirm = $mdDialog.confirm()
        .title('Do you want to change category back to initial?')
        .ok('Yes')
        .cancel(`No, don't change`)
        .multiple(true);
      return $mdDialog.show(confirm)
        .then(() => {
          Object.assign(vm.product, intialState);
          systemGeneratedAdvNumber = intialState.systemGeneratedAdvNumber;
          return $q.reject(null);
        }, () => {
          vm.categoryId = _.find(vm.parent, {categoryName: oldCategory}) ? _.find(vm.parent, {categoryName: oldCategory}).categoryId : '';
          vm.newcategoryHierarchys = oldCategory ? [oldCategory] : [];
          return $q.reject(null);
        });
    }

    // Advanced Numbering.

    function getadvancedNumbering(newCategory, oldCategory) {
      const popup = newCategory === intialState.categoryId ? showChangeCategoryBackDialog(oldCategory, newCategory) : showConfirmChangeDialog(newCategory, oldCategory);
      popup.then(() => advancedNumbering(newCategory, 'yes'));
    }

    function advancedNumbering(categoryId, action) {
      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId,
        objectType: vm.objectType,
        objectNumber: object.objectNumber,
        action,
        categoryId
      };
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getnextnumber, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              vm.objectNumber = response.data;
              systemGeneratedAdvNumber = response.data;
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

  }
})();
