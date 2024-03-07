(function() {
  'use strict';

  angular
    .module('app.customer')
    .controller('DocumentDialogController', DocumentDialogController);

  /** @ngInject */
  function DocumentDialogController($mdDialog, Document, Documents, categoryDocument, msUtils, Categories, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService) {
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
    vm.categoryId = '';
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    if (Document) {
      vm.title = 'Edit Category';
      vm.document = angular.copy(Document);
      if (vm.document.categoryHierarchy === '' || vm.document.categoryHierarchy === null) {
        vm.document.categoryHierarchy = [];
      } else {
        vm.document.categoryHierarchy = [];
        vm.document.categoryHierarchy.push(Document.categoryHierarchy);
      }
    }

    // Data
    vm.documents = Documents;
    vm.searchDisabled = false;
    vm.documentRequired = true;

    if (Categories[0].categoryType == 'parts' || Categories[0].categoryType == 'products') {
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
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function(value, key) {
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
        .catch(function(response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    } else {
      angular.forEach(Categories, function(value, key) {
        if (value.categoryId === value.parentCategoryId) {
          value.categoryHierarchy = value.categoryName;
        }
      });
      vm.parent = Categories;
    }


    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;

    // Methods
    vm.addNewDocument = addNewDocument;
    vm.deleteDocumentConfirm = deleteDocumentConfirm;
    vm.closeDialog = closeDialog;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    vm.saveProduct = saveProduct;

    function parentCategoryFunction(Data) {
      vm.searchDisabled = true;
      vm.documentRequired = false;
      angular.forEach(Data, function(value, key) {
        if (vm.selectparentcategory == value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
      if (vm.document.categoryHierarchy == null) {
        vm.document.categoryHierarchy = [];
        var length = vm.document.categoryHierarchy.length;
        var dataPush = false;
        if (vm.document.categoryHierarchy.length === 0) {
          vm.document.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.document.categoryHierarchy, function(val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.document.categoryHierarchy.push(vm.selectRole);
          }
          vm.selectparentcategory = '';
        }
      } else {
        var length = vm.document.categoryHierarchy.length;
        var dataPush = false;
        if (vm.document.categoryHierarchy.length === 0) {
          vm.document.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.document.categoryHierarchy, function(val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.document.categoryHierarchy.push(vm.selectRole);
          }
          vm.selectparentcategory = '';
        }
      }
    }

    function searchCategoryFunction(itemid, Data) {
      if (itemid === 'undefined') {} else {
        vm.searchDisabled = true;
        angular.forEach(Data, function(value, key) {
          if (itemid === value.categoryHierarchy) {
            vm.categoryId = value.categoryId;
          }
        });
      }
    }

    function closeCategoryChips() {
      vm.searchDisabled = false;
      vm.categoryId = '';
    }

    if (!vm.document) {
      vm.document = {
        'categoryName': '',
        'categoryHierarchy': []
      };

      vm.title = 'New Document Category';
      vm.newDocument = true;
    }

    /**
     * Add new category document
     */
    function addNewDocument() {

      if (vm.searchDisabled) {
        vm.document.categoryHierarchy = vm.categoryId;
      } else {
        vm.document.categoryHierarchy = '';
      }

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

      var data = {
        categoryName: vm.document.categoryName,
        categoryType: 'documents',
        parentCategory: vm.document.categoryHierarchy
      };
      vm.document.categoryHierarchy = [];
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatecategory, params, data, header)
        .then(function(response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide();
              break;
            case 4006:
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
        .catch(function(response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    /**
     * Save contact
     */
    function saveProduct() {
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

      angular.forEach(vm.document.categoryHierarchy, function(value, key) {
        vm.document.categoryHierarchy = value;
      });

      if (vm.selectparentcategory == "") {

      } else {
        angular.forEach(categoryDocument, function(value, key) {
          if (vm.document.categoryHierarchy === value.categoryHierarchy) {
            vm.categoryId = value.parentCategoryId;
          }
        });
      }

      var data = {
        categoryId: vm.document.categoryId,
        categoryName: vm.document.categoryName,
        categoryType: vm.document.categoryType,
        parentCategory: vm.categoryId
      };
      vm.document.categoryHierarchy = [];
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatecategory, params, data, header)
        .then(function(response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
              break;
            case 4006:
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
        .catch(function(response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    /**
     * Delete Category Confirm Dialog
     */
    function deleteDocumentConfirm(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the category?')
        .htmlContent('<b>' + vm.document.categoryName + ' ' + vm.document.categoryType + '</b>' + ' will be deleted.')
        .ariaLabel('delete category')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function() {
        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryId: vm.document.categoryId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryId: vm.document.categoryId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecategory, params, '', header)
          .then(function(response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.documents.splice(vm.documents.indexOf(Document), 1);
                $mdToast.show($mdToast.simple().textContent("Category Removed Successfully...").position('top right'));
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
          .catch(function(response) {
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

      return query ? changeItemsQuerySearch(query).map(function(item) {
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
  }
})();
