(function() {
  'use strict';

  angular
    .module('app.customer')
    .controller('CategoryDialogController', CategoryDialogController);

  /** @ngInject */
  function CategoryDialogController($mdDialog, Category, Categoryes, categoryPart, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, msUtils, Categories) {
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

    // Data
    if (Category) {
      vm.title = 'Edit Category';
      vm.category = angular.copy(Category);
      if (vm.category.isBOMEnable === "true") {
        vm.category.isBOMEnable = true;
      } else {
        vm.category.isBOMEnable = false;
      }
      if (vm.category.categoryHierarchy === '' || vm.category.categoryHierarchy === null) {
        vm.category.categoryHierarchy = [];
      } else {
        vm.category.categoryHierarchy = [];
        vm.category.categoryHierarchy.push(Category.categoryHierarchy);
      }
    }

    vm.Categoryes = Categoryes;
    vm.newContact = false;
    vm.allFields = false;
    vm.searchDisabled = false;

    if (Categories[0].categoryType == 'documents' || Categories[0].categoryType == 'products') {
      if (vm.sessionData.proxy == true) {
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

    // Methods
    vm.addNewCategory = addNewCategory;
    vm.deleteCategoryConfirm = deleteCategoryConfirm;
    vm.closeDialog = closeDialog;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    vm.saveCategory = saveCategory;

    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;


    function parentCategoryFunction(Data) {
      vm.searchDisabled = true;
      angular.forEach(Data, function(value, key) {
        if (vm.selectparentcategory == value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
      if (vm.category.categoryHierarchy == null) {
        vm.category.categoryHierarchy = [];
        var length = vm.category.categoryHierarchy.length;
        var dataPush = false;
        if (vm.category.categoryHierarchy.length === 0) {
          vm.category.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.category.categoryHierarchy, function(val, key) {
            if (val === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.category.categoryHierarchy.push(vm.selectparentcategory);
          }
          vm.selectparentcategory = '';
        }
      } else {

        var length = vm.category.categoryHierarchy.length;
        var dataPush = false;
        if (vm.category.categoryHierarchy.length === 0) {
          vm.category.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.category.categoryHierarchy, function(val, key) {
            if (val === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.category.categoryHierarchy.push(vm.selectparentcategory);
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

    if (!vm.category) {
      vm.category = {
        'categoryName': '',
        'categoryHierarchy': [],
        'isBOMEnable': true
      };

      vm.title = 'New Part Category';
      vm.newCategory = true;
    }

    /**
     * Add new category
     */
    function addNewCategory() {
      if (vm.searchDisabled) {
        vm.category.categoryHierarchy = vm.categoryId;
      } else {
        vm.category.categoryHierarchy = '';
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

      if (vm.category.isBOMEnable === true) {
        vm.category.isBOMEnable = "true";
      } else {
        vm.category.isBOMEnable = "false";
      }

      var data = {
        categoryName: vm.category.categoryName,
        categoryType: 'parts',
        parentCategory: vm.category.categoryHierarchy,
        isBOMEnable: vm.category.isBOMEnable
      };
      vm.category.categoryHierarchy = [];
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
     * Edit Category
     */
    function saveCategory() {
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

      angular.forEach(vm.category.categoryHierarchy, function(value, key) {
        vm.category.categoryHierarchy = value;
      });

      if (vm.selectparentcategory == "") {

      } else {
        angular.forEach(categoryPart, function(value, key) {
          if (vm.category.categoryHierarchy === value.categoryHierarchy) {
            vm.categoryId = value.parentCategoryId;
          }
        });
      }

      if (vm.category.isBOMEnable === true) {
        vm.category.isBOMEnable = "true";
      } else {
        vm.category.isBOMEnable = "false";
      }

      var data = {
        categoryId: vm.category.categoryId,
        categoryName: vm.category.categoryName,
        categoryType: vm.category.categoryType,
        parentCategory: vm.categoryId,
        isBOMEnable: vm.category.isBOMEnable
      };
      vm.category.categoryHierarchy = [];
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
    function deleteCategoryConfirm(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the category?')
        .htmlContent('<b>' + vm.category.categoryName + ' ' + vm.category.parentCategory + '</b>' + ' will be deleted.')
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
            categoryId: vm.category.categoryId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryId: vm.category.categoryId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecategory, params, '', header)
          .then(function(response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.Categoryes.splice(vm.Categoryes.indexOf(Category), 1);
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
