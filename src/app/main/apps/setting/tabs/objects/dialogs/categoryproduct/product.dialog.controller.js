(function() {
  'use strict';

  angular
    .module('app.customer')
    .controller('ProductDialogController', ProductDialogController);

  /** @ngInject */
  function ProductDialogController($mdDialog, Product, Products, categoryPart, msUtils, Categories, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService) {
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

    if (Product) {
      vm.title = 'Edit Category';
      vm.product = angular.copy(Product);
      if (vm.product.categoryHierarchy === '' || vm.product.categoryHierarchy === null) {
        vm.product.categoryHierarchy = [];
      } else {
        vm.product.categoryHierarchy = [];
        vm.product.categoryHierarchy.push(Product.categoryHierarchy);
      }
    }

    // Data
    vm.products = Products;
    vm.newContact = false;
    vm.allFields = false;
    vm.searchDisabled = false;


    if (Categories[0].categoryType == 'parts' || Categories[0].categoryType == 'documents') {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          categoryType: 'products'
        };
      } else {
        params = {
          categoryType: 'products'
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
    vm.addNewProduct = addNewProduct;
    vm.deleteProductConfirm = deleteProductConfirm;
    vm.closeDialog = closeDialog;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.closeCategoryChips = closeCategoryChips;
    vm.saveProduct = saveProduct;

    function parentCategoryFunction(Data) {
      vm.searchDisabled = true;
      angular.forEach(Data, function(value, key) {
        if (vm.selectparentcategory == value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;
          vm.categoryId = value.categoryId;
        }
      });
      if (vm.product.categoryHierarchy == null) {
        vm.product.categoryHierarchy = [];
        var length = vm.product.categoryHierarchy.length;
        var dataPush = false;
        if (vm.product.categoryHierarchy.length === 0) {
          vm.product.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.product.categoryHierarchy, function(val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.product.categoryHierarchy.push(vm.selectRole);
          }
          vm.selectparentcategory = '';
        }
      } else {
        var length = vm.product.categoryHierarchy.length;
        var dataPush = false;
        if (vm.product.categoryHierarchy.length === 0) {
          vm.product.categoryHierarchy.push(vm.selectparentcategory);
          vm.selectparentcategory = '';
        } else if (length < 1) {
          angular.forEach(vm.product.categoryHierarchy, function(val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            vm.product.categoryHierarchy.push(vm.selectRole);
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

    if (!vm.product) {
      vm.product = {
        'categoryName': '',
        'categoryHierarchy': []
      };

      vm.title = 'New Product Category';
      vm.newProduct = true;
    }

    /**
     * Add new product category
     */
    function addNewProduct() {

      if (vm.searchDisabled) {
        vm.product.categoryHierarchy = vm.categoryId;
      } else {
        vm.product.categoryHierarchy = '';
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
        categoryName: vm.product.categoryName,
        categoryType: 'products',
        parentCategory: vm.product.categoryHierarchy
      };
      vm.product.categoryHierarchy = [];
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
     * Save product category
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

      angular.forEach(vm.product.categoryHierarchy, function(value, key) {
        vm.product.categoryHierarchy = value;
      });

      if (vm.selectparentcategory == "") {

      } else {
        angular.forEach(categoryPart, function(value, key) {
          if (vm.product.categoryHierarchy === value.categoryHierarchy) {
            vm.categoryId = value.parentCategoryId;
          }
        });
      }

      var data = {
        categoryId: vm.product.categoryId,
        categoryName: vm.product.categoryName,
        categoryType: vm.product.categoryType,
        parentCategory: vm.categoryId
      };
      vm.product.categoryHierarchy = [];
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
    function deleteProductConfirm(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the category?')
        .htmlContent('<b>' + vm.product.categoryName + ' ' + vm.product.categoryType + '</b>' + ' will be deleted.')
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
            categoryId: vm.product.categoryId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryId: vm.product.categoryId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecategory, params, '', header)
          .then(function(response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.products.splice(vm.products.indexOf(Product), 1);
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
