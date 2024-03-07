(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('settingCustomerController', settingCustomerController);

  /** @ngInject */
  function settingCustomerController($scope, $rootScope, $http, $location, $timeout, $mdSidenav, msUtils, $document, hostUrlDevelopment,
                                     CustomerService, errors, $mdToast, AuthService, $mdDialog, $state, introService, AttributesService,
                                     GlobalSettingsService, currencyExchangeService, sourceCostService, availableCurrencies, fuseUtils,
                                     ValidationReporter, currencyRatesBackendService, helperData, advancedNumberingService,
                                     advancedNumberingStateService) {
    var vm = this;
    $scope.IntroOptionsSettings = {
      steps: introService.getIntroObj("settings"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>',
      doneLabel: 'Got it'
    };
    $scope.AfterChangeEvent = function () {
      $(".introjs-button").css({
        'display': 'inline-block'
      });
      $('.introjs-skipbutton').hide();
      if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
        $('.introjs-skipbutton').show();
      }
    };

    $scope.Complete = function () {
      $http({
        method: 'POST',
        url: hostUrlDevelopment.test.helpsetting,
        headers: {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
        },
        data: {
          helpIntroSetting: false,
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin',
          customerId: vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId : null
        }
      }).then(function successCallback(response) {
      }, function errorCallback(response) {
      });
    };

    $timeout(function () {
      $('md-tab-item').map(function (index, elem) {
        elem.setAttribute("id", 'step' + index);
      })
    });

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Tabs Forms Main Object------------------------------------------------------------------------------------
    vm.createMemberForm = {};
    vm.createMemberForm.userRoleSet = [];

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call----------------------------------------------------------------------------------------------
    vm.proxyChange = proxyChange;

    //For Global Variable-------------------------------------------------------------------------------------------
    vm.getAllUsers = [];
    var params;
    vm.parts = 'parts';
    vm.systemSetting = 'objectNumbering';
    vm.products = '';
    vm.categoryproduct = [];
    vm.attribute = [];
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    vm.statusList = [{
      disp: 'All',
      val: 'all'
    }, {
      disp: 'Active',
      val: 'active'
    }, {
      disp: 'Inactive',
      val: 'inactive'
    }, {
      disp: 'Pending',
      val: 'pending'
    }];

    // To set default data value
    vm.numericmajor = 'N';
    vm.numericminor = 'N';
    vm.disableMajor = false;
    vm.disableMinor = false;
    vm.editReleased = false;
    vm.editReleasedBom = false;
    vm.editReleaseAttachments = false;
    vm.editReleaseSourcing = false;
    vm.editReleaseAdditionalInfo = false;
    vm.currencySetting = '$ (USD)';
    vm.currencyDecimalsSetting = 'No Limit';
    vm.priceBreakSetting = false;
    vm.idCount = 0;
    vm.manualRelease = true;
    vm.releasedHierarchy = false;
    vm.referenceDesignatorsSetting = false;
    vm.onlyActiveMembers = 'active';
    vm.advancedNumberingStateService = advancedNumberingStateService;


    vm.revisionChange = revisionChange;
    vm.changeObjectSetting = changeObjectSetting;
    vm.objectNumberingFunction = objectNumberingFunction;
    vm.changeCurrencySetting = changeCurrencySetting;
    vm.changeReleaseSetting = changeReleaseSetting;
    vm.changeReleaseBomSetting = changeReleaseBomSetting;
    vm.changePriceBreakSetting = changePriceBreakSetting;
    vm.changeReleaseAttachmentSetting = changeReleaseAttachmentSetting;
    vm.changeReleaseSourcingSetting = changeReleaseSourcingSetting;
    vm.changeReleaseAdditionalInfoSetting = changeReleaseAdditionalInfoSetting;
    vm.saveGroupSetting = saveGroupSetting;
    vm.addPriceBreak = addPriceBreak;
    vm.initExchangeRateDeletion = initExchangeRateDeletion;
    vm.deleteRow = deleteRow;
    vm.editCell = editCell;
    vm.changeManualRelease = changeManualRelease;
    vm.changeReleaseHierarchy = changeReleaseHierarchy;
    vm.changereferenceDesignatorsSetting = changereferenceDesignatorsSetting;
    vm.changeEditSubLevelParts = changeEditSubLevelParts;
    vm.getallUsers = getallUsers;
    vm.addNewCurrency = addNewCurrency;
    vm.updateExchangeRates = updateExchangeRates;
    vm.changeCurrencyForRate = changeCurrencyForRate;
    vm.validateNumber = validateNumber;
    vm.clearErrorMessage = clearErrorMessage;
    vm.isCurrencyAvailable = isCurrencyAvailable;
    vm.isAdvancedNumberTableShown = isAdvancedNumberTableShown;
    vm.changeCurrencyDecimalsSetting = changeCurrencyDecimalsSetting;

    function isAdvancedNumberTableShown() {
      const schemeInUse = advancedNumberingStateService.currentSchemeInUse.get(vm.currentAdvancedNumberingTab + 's');
      if(!schemeInUse){
        return true;
      }
      return schemeInUse === 'custom';
    }

    //For Dialog Definition-----------------------------------------------------------------------------------------
    vm.showTabDialog = function (ev, editData) {
      $mdDialog.show({
        controller: 'customerDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/dialogs/customer-dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          event: ev,
          editData: editData || '',
          $parent: vm,
          callback: null,
          statusChange: true
        }
      }).then(function (data) {
        getallUsers();
      }, function () {
        //Error
      });
    };
    $scope.$on("render-setting", function () {
      getallUsers();
    });

    $scope.$watch('vm.currencySetting', function (newVal) {
      if (newVal) {
        vm.exchangeRates.data.forEach((row) => {
          row.baseCurrency = newVal
        });
      }
    });

    //Functions-----------------------------------------------------------------------------------------------------

    init();

    $rootScope.$watch('systemSetting', value => {
      if (value !== undefined) {
        if ($rootScope.addonService == null || angular.equals({}, $rootScope.addonService)) {
          $rootScope.addonService = false;
        } else {
          vm.addonService = JSON.parse($rootScope.addonService.formBuilder);
        }
        vm.sourceCostSetting = sourceCostService.getFeatureState();
        vm.proxyEnable = $rootScope.proxyEnable;
        vm.editObjectId = $rootScope.editObjectId;
        vm.enableMinorRev = $rootScope.enableMinorRev;
        vm.numericminor = $rootScope.numericminor;
        vm.numericmajor = $rootScope.numericmajor;
        vm.enableEmptyObjectNumberSetting = $rootScope.enableEmptyObjectNumberSetting;
        advancedNumberingStateService.mode.set($rootScope.advancedNumberingStatus);
        let advancedNumbering = $rootScope.advancedNumberSettings;
        vm.isAdvancedNumberingEnabled = !!advancedNumbering;
        vm.tabNames = $rootScope.enableProducts ? ['part', 'product', 'document'] : ['part', 'document'];
        $scope.$watch('vm.selectedAdvancedNumberingTab', function (newVal) {
          vm.currentAdvancedNumberingTab = vm.tabNames[newVal];
        });

        vm.disableMajor = vm.editObjectId === false;

        vm.disableMinor = vm.enableMinorRev === false;

        if ($rootScope.systemSetting) {
          setGroupSettings($rootScope.systemSetting);
        } else {
          setDefaultCostDetail();
        }

        getDefaultAdvancedNumberingScheme();

        vm.exchangeRates.data = getRatesData($rootScope.systemSetting.currencyRates);
        reviewAvailableCurrencies();
      }
    });

    function init() {
      if (vm.sessionData.userId) {
        getallUsers();
        getCategoryList(vm.parts);
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
      $timeout(function () {
        if ($rootScope.introSettingFlag != true && $rootScope.introGlobalHelp) {
          $timeout(function () {
            $rootScope.CallMeSettings();
          });
        }
      }, 1000)

    }

    function getallUsers() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              if (vm.onlyActiveMembers === 'active') {
                vm.getAllUsers = _.filter(response.data.Members, function (member) {
                  return member.isActive === true && member.status === true;
                });
              } else if (vm.onlyActiveMembers === 'inactive') {
                vm.getAllUsers = _.filter(response.data.Members, function (member) {
                  return member.isActive === false && member.status === true;
                });
              } else if (vm.onlyActiveMembers === 'all') {
                vm.getAllUsers = response.data.Members;
              } else if (vm.onlyActiveMembers === 'pending') {
                vm.getAllUsers = _.filter(response.data.Members, function (member) {
                  return member.status === false;
                });
              }
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log(vm.error.erCatch);
        });
    }

    function proxydetails() {
      GlobalSettingsService.getProxydetails()
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              var resData = response.data;
              if (response.data.addonService == null || angular.equals({}, response.data.addonService)) {
                response.data.addonService = false;
              } else {
                vm.addonService = JSON.parse(response.data.addonService.formBuilder);
              }
              vm.sourceCostSetting = sourceCostService.getFeatureState();
              vm.proxyEnable = resData.proxyEnable;
              vm.editObjectId = resData.fuseObjectNumberSetting.editObjectId;
              vm.enableMinorRev = resData.fuseObjectNumberSetting.enableMinorRev;
              vm.numericminor = resData.fuseObjectNumberSetting.minorRevFormat;
              vm.numericmajor = resData.fuseObjectNumberSetting.majorRevFormat;
              vm.enableEmptyObjectNumberSetting = resData.fuseObjectNumberSetting.enableEmptyObjectNumberSetting;
              advancedNumberingStateService.mode.set(resData.advancedNumberingStatus);
              var advancedNumbering = resData.systemSettings.advancednumberingSetting;
              vm.isAdvancedNumberingEnabled = advancedNumbering ? advancedNumbering.advancednumberingEnabled === 'true' : false;
              vm.tabNames = $rootScope.enableProducts ? ['part', 'product', 'document'] : ['part', 'document'];
              $scope.$watch('vm.selectedAdvancedNumberingTab', function (newVal) {
                vm.currentAdvancedNumberingTab = vm.tabNames[newVal];
              });

              if (vm.editObjectId == false) {
                vm.disableMajor = true;
              } else {
                vm.disableMajor = false;
              }

              if (vm.enableMinorRev == false) {
                vm.disableMinor = true;
              } else {
                vm.disableMinor = false;
              }

              if (response.data.systemSettings) {
                setGroupSettings(response.data.systemSettings);
              } else {
                setDefaultCostDetail();
              }

              getDefaultAdvancedNumberingScheme();

              vm.exchangeRates.data = getRatesData(response.data.systemSettings.currencyRates);
              reviewAvailableCurrencies();
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function revisionChange() {
      if (vm.editObjectId == false) {
        vm.disableMajor = true;
      } else {
        vm.disableMajor = false;
      }

      if (vm.enableMinorRev == false) {
        vm.disableMinor = true;
      } else {
        vm.disableMinor = false;
      }
    }

    function changeObjectSetting(ev, type) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change object number setting option?')
        .ariaLabel('change object numbering')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
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

        if (!vm.editObjectId) {
          vm.enableEmptyObjectNumberSetting = false;
        }

        var data = {
          editObjectId: vm.editObjectId,
          enableEmptyObjectNumberSetting: vm.enableEmptyObjectNumberSetting,
          enableMinorRev: vm.enableMinorRev,
          majorRevFormat: vm.numericmajor,
          minorRevFormat: vm.numericminor
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.updatefusenumbersetting, params, data, headers)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              default:
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      }, function () {
        if (type === 'major') {
          if (vm.numericmajor === 'N')
            vm.numericmajor = 'A';
          else {
            vm.numericmajor = 'N';
          }
        }
        if (type === 'minor') {
          if (vm.numericminor === 'N')
            vm.numericminor = 'A';
          else {
            vm.numericminor = 'N';
          }
        }
        if (type === 'allowEdit') {
          vm.editObjectId = !vm.editObjectId;
        }
        if (type === 'allowEditEmpty') {
          vm.enableEmptyObjectNumberSetting = !vm.enableEmptyObjectNumberSetting;
        }
        if (type === 'editMinor') {
          vm.enableMinorRev = !vm.enableMinorRev;
          revisionChange();
        }
      });

    }

    function proxyChange() {

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.doproxy, '', '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              proxydetails();
              break;
            case 1006:
              proxydetails();
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    // Data
    vm.filterIds = null;
    vm.listType = 'all';
    vm.listOrder = 'name';
    vm.listOrderAsc = false;
    vm.selectedContacts = [];
    vm.newGroupName = '';
    vm.parts = true;
    vm.product = false;
    vm.attributes = false;
    var data = '';

    // Methods
    vm.openCategoryDialog = openCategoryDialog;
    vm.openProductDialog = openProductDialog;
    vm.openDocumentDialog = openDocumentDialog;
    vm.openAttributeDialog = openAttributeDialog;
    vm.openFormBuilderDialog = openFormBuilderDialog;
    vm.deleteCategoryConfirm = deleteCategoryConfirm;
    vm.deleteProductConfirm = deleteProductConfirm;
    vm.deleteAttributeConfirm = deleteAttributeConfirm;
    vm.deleteContact = deleteContact;
    vm.closeDialog = closeDialog;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.toggleSelectContact = toggleSelectContact;
    vm.resendEmail = resendEmail;

    //Add parts category
    vm.productsFunction = productsFunction;
    vm.partsFunction = partsFunction;
    vm.documentsFunction = documentsFunction;
    vm.customAttributeFunction = customAttributeFunction;
    vm.alltilte = "Part Categories";

    function partsFunction() {
      vm.alltilte = "Parts Categories";
      vm.parts = true;
      vm.product = false;
      vm.document = false;
      vm.attributes = false;
      vm.parts = 'parts';
      getCategoryList(vm.parts);
    }

    function productsFunction() {
      vm.alltilte = "Products Categories";
      vm.parts = false;
      vm.product = true;
      vm.document = false;
      vm.attributes = false;
      vm.products = 'products';
      getCategoryList(vm.products);
    }

    function documentsFunction() {
      vm.alltilte = "Documents Categories";
      vm.parts = false;
      vm.product = false;
      vm.document = true;
      vm.attributes = false;
      vm.documents = 'documents';
      getCategoryList(vm.documents);
    }

    function customAttributeFunction() {
      vm.parts = false;
      vm.product = false;
      vm.document = false;
      vm.attributes = true;
      vm.alltilte = "All Attributes";
      getAttributesList();
    }

    function getCategoryList(parts, products, documents) {

      if (parts) {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryType: parts
          };
        } else {
          params = {
            categoryType: parts
          };
        }
      } else {
        if (documents) {
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              categoryType: documents
            };
          } else {
            params = {
              categoryType: documents
            };
          }
        } else {
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              categoryType: products
            };
          } else {
            params = {
              categoryType: products
            };
          }
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.categoryproduct = response.data;
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

    /**
     * Toggle selected status of the contact
     *
     * @param contact
     * @param event
     */
    function toggleSelectContact(contact, event) {
      if (event) {
        event.stopPropagation();
      }

      if (vm.selectedContacts.indexOf(contact) > -1) {
        vm.selectedContacts.splice(vm.selectedContacts.indexOf(contact), 1);
      } else {
        vm.selectedContacts.push(contact);
      }
    }

    /**
     * Open new dialog
     *
     * @param ev
     * @param contact
     */

    function openCategoryDialog(ev, category, categoryPart) {
      $mdDialog.show({
        controller: 'CategoryDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/tabs/objects/dialogs/categoryproduct/category-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Category: category,
          Categoryes: vm.categoryproduct,
          Categories: vm.categoryproduct,
          categoryPart: categoryPart
        }
      })
        .then(function (answer) {
          vm.parts = 'parts';
          getCategoryList(vm.parts);
        }, function () {

        });
    }

    function openProductDialog(ev, product, categoryPart) {
      $mdDialog.show({
        controller: 'ProductDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/tabs/objects/dialogs/categoryproduct/product-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Product: product,
          Products: vm.categoryproduct,
          Categories: vm.categoryproduct,
          categoryPart: categoryPart
        }
      })
        .then(function (answer) {
          vm.products = 'products';
          getCategoryList(vm.products);
        }, function () {
        });
    }

    function openDocumentDialog(ev, document, categoryDocument) {
      $mdDialog.show({
        controller: 'DocumentDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/tabs/objects/dialogs/categoryproduct/document-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Document: document,
          Documents: vm.categoryproduct,
          Categories: vm.categoryproduct,
          categoryDocument: categoryDocument
        }
      })
        .then(function (answer) {
          vm.documents = 'documents';
          getCategoryList(vm.documents);
        }, function () {

        });
    }

    function openAttributeDialog(ev, attribute, categoryPart) {
      if (attribute) {
        AttributesService.getAttributeDetailsById(attribute.attributeId)
          .then(function (response) {
            switch (response.code) {
              case 0:
                $mdDialog.show({
                  controller: 'AttributeDialogController',
                  controllerAs: 'vm',
                  templateUrl: 'app/main/apps/setting/tabs/objects/dialogs/categoryproduct/attribute-dialog.html',
                  parent: angular.element($document.find('#content-container')),
                  targetEvent: ev,
                  clickOutsideToClose: true,
                  locals: {
                    Attribute: response.data,
                    Attributes: vm.attribute,
                    Categories: vm.categoryproduct,
                    categoryPart: categoryPart
                  }
                })
                  .then(function (answer) {
                    getAttributesList();
                  }, function () {

                  });
                break;
              case 4006:
                console.log(response.message);
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      } else {
        $mdDialog.show({
          controller: 'AttributeDialogController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/setting/tabs/objects/dialogs/categoryproduct/attribute-dialog.html',
          parent: angular.element($document.find('#content-container')),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            Attribute: attribute,
            Attributes: vm.attribute,
            Categories: vm.categoryproduct,
            categoryPart: categoryPart
          }
        })
          .then(function (answer) {
            getAttributesList();
          }, function () {

          });
      }
    }

    /**
     * Delete Contact Confirm Dialog
     */
    function deleteCategoryConfirm(ev, category) {

      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete the category?')
        .htmlContent('<b>' + category.categoryName + ' ' + category.parentCategory + '</b>' + ' will be deleted.')
        .ariaLabel('delete category')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryId: category.categoryId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryId: category.categoryId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecategory, params, '', headers)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.categoryproduct.splice(vm.categoryproduct.indexOf(category), 1);
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
          .catch(function (response) {
            //For Progress Loader
            vm.progress = false;
            console.log('catch');
          });
      }, function () {

      });
    }

    function openFormBuilderDialog(ev) {
      $mdDialog.show({
        controller: 'FormBuilderDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/tabs/add-on/dialogs/form-builder/form-builder-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          AddonServiceFlag: vm.addonService
        }
      })
        .then(function () {
          proxydetails();

        }, function () {
          proxydetails();

        });

    }

    /**
     * Delete Contact Confirm Dialog
     */
    function deleteProductConfirm(ev, category) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete the category?')
        .htmlContent('<b>' + category.categoryName + ' ' + category.parentCategory + '</b>' + ' will be deleted.')
        .ariaLabel('delete category')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryId: category.categoryId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryId: category.categoryId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removecategory, params, '', headers)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.categoryproduct.splice(vm.categoryproduct.indexOf(category), 1);
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
          .catch(function (response) {
            //For Progress Loader
            vm.progress = false;
            console.log('catch');
          });

      }, function () {

      });
    }

    /**
     * Delete Attribute Confirm Dialog
     */
    function deleteAttributeConfirm(ev, attribute) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete the attribute?')
        .htmlContent('<b>' + attribute.attribute + ' ' + attribute.attributeType + '</b>' + ' will be deleted.')
        .ariaLabel('delete attribute')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;

        AttributesService.removeAttribute(attribute.attributeId)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                vm.attribute.splice(vm.attribute.indexOf(attribute), 1);
                $mdToast.show($mdToast.simple().textContent("Attribute Removed Successfully...").position('top right'));
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
              case 13:
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
      }, function () {

      });
    }

    /**
     * Delete Contact
     */
    function deleteContact() {
      vm.categoryproduct.splice(vm.categoryproduct.indexOf(), 1);
    }

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    function getAttributesList() {
      vm.progressCustomAttribute = true;
      vm.progress = false;


      AttributesService.getAttributesList()
        .then(function (response) {
          //For Progress Loader
          vm.progress = true;
          switch (response.code) {
            case 0:
              vm.attribute = angular.copy(response.data);
              vm.progress = false;
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
      vm.progress = true;
    }

    function resendEmail(user) {

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

      data = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        userName: user.userName
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.resendactivationmail, params, data, headers)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully sent activation email...").position('top right'));
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
    }

    function objectNumberingFunction(flag) {
      vm.systemSetting = flag;
    }

    function changeReleaseSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release setting option?')
        .ariaLabel('change release setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowEdit: flag.toString()
        });
      }, function () {
        vm.editReleased = !flag;
      })
    }

    function changeReleaseBomSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release setting option?')
        .ariaLabel('change release setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowEdit: flag.toString()
        });
      }, function () {
        vm.editReleasedBom = !flag;
      })
    }

    function changeCurrencySetting(ev, settings, flag, oldValue) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change currency setting?')
        .ariaLabel('change currency')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          currencyChoice: flag.currencyChoice
        });
      }, function () {
        vm.currencySetting = oldValue;
      })
    }

    function changeCurrencyDecimalsSetting(ev, settings, flag, oldValue) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change currency setting?')
        .ariaLabel('change currency')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          currencyDecimals: flag.currencyDecimals
        });
      }, function () {
        vm.currencyDecimalsSetting = oldValue;
      })
    }

    function changePriceBreakSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change price break setting?')
        .ariaLabel('change price break')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowCostSplit: flag.toString()
        });
      }, function () {
        vm.priceBreakSetting = !flag;
      })
    }

    function changeManualRelease(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change manual release?')
        .ariaLabel('change manual release')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {manualRelease: flag.toString()});
      }, function () {
        vm.manualRelease = !flag;
      })
    }

    function changeReleaseHierarchy(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release hierarchy?')
        .ariaLabel('change release hierarchy')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {releaseHierarchy: flag.toString()});
        $timeout(() => {
          if (flag === false && vm.releaseEditsHierarchy === true) {
            vm.releaseEditsHierarchy = false;
            saveGroupSetting(settings, {releaseEditsHierarchy: vm.releaseEditsHierarchy.toString()});
          }
        }, 1000);
      }, function () {
        vm.releaseHierarchy = !flag;
      })
    }

    vm.changeEditReleaseHierarchy = changeEditReleaseHierarchy;

    function changeEditReleaseHierarchy(ev, settings, flag) {
      let confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release hierarchy?')
        .ariaLabel('change release hierarchy')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {releaseEditsHierarchy: flag.toString()});
      }, function () {
        vm.releaseEditsHierarchy = !flag;
      })
    }

    vm.changePromoteDemote = changePromoteDemote;

    function changePromoteDemote(ev, settings, flag) {
      let confirm = $mdDialog.confirm()
        .title('Are you sure you want to toggle this setting?')
        .ariaLabel('change promote/demote')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {promoteDemote: flag.toString()});
      }, function () {
        vm.promoteDemote = !flag;
      })
    }

    // Change Release Attachment Setting.
    function changeReleaseAttachmentSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release setting option?')
        .ariaLabel('change release setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowEdit: flag.toString()
        });
      }, function () {
        vm.editReleaseAttachments = !flag;
      })
    }

    // Change Release Sourcing Setting.
    function changeReleaseSourcingSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release setting option?')
        .ariaLabel('change release setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowEdit: flag.toString()
        });
      }, function () {
        vm.editReleaseSourcing = !flag;
      })
    }

    // Change Release Additional Setting.
    function changeReleaseAdditionalInfoSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change additional info?')
        .ariaLabel('change additional info setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          allowEdit: flag.toString()
        });
      }, function () {
        vm.editReleaseAdditionalInfo = !flag;
      })
    }

    function changereferenceDesignatorsSetting(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change release setting option?')
        .ariaLabel('change release setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          refDesCheckForDuplicate: flag.toString()
        });
      }, function () {
        vm.referenceDesignatorsSetting = !flag;
      })
    }

    function changeEditSubLevelParts(ev, settings, flag) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change BOM Level setting option?')
        .ariaLabel('change BOM Level setting')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        saveGroupSetting(settings, {
          editSubLevelParts: flag.toString()
        });
      }, function () {
        vm.editSubLevelParts = !flag;
      })
    }

    function saveGroupSetting(flag, value) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      data = {
        groupName: flag,
        propertiesMap: value
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, headers)
        .then(function (response) {

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Successfully Updated").position('top right'));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              vm.priceBreakSetting = true;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    function deleteRow(flag) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          groupSettings: 'PRICE_BREAK-' + flag,
          groupSettingsType: "priceBreak"
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          groupSettings: 'PRICE_BREAK-' + flag,
          groupSettingsType: "priceBreak"
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.removegroupsetting, params, '', headers)
        .then(function (response) {

          switch (response.code) {
            case 0:
              _.remove(vm.priceBreakOptions.data, {
                id: flag
              });
              $mdToast.show($mdToast.simple().textContent("Successfully Removed").position('top right'));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 2003:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          console.log('catch');
        });
    }

    function buildPriceBreakColumns() {

      var attributes = [{
        cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/editing-row-template.html',
        field: 'name',
        displayName: 'Label',
        enableCellEdit: true,
        width: 180,
        cellEditableCondition: function ($scope) {
          return $scope.rowRenderIndex != 0
        }
      },
        {
          cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/editing-row-template.html',
          field: 'value',
          displayName: 'Price break quantity',
          enableCellEdit: true,
          width: 180,
          cellEditableCondition: function ($scope) {
            return $scope.rowRenderIndex != 0
          }
        },
        {
          cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/delete-row-template.html',
          field: 'id',
          displayName: '',
          enableCellEdit: false,
          width: 85
        }
      ];

      return attributes;
    }

    vm.priceBreakOptions = {
      initialized: false,
      columnDefs: buildPriceBreakColumns(),
      data: [],
      rowHeight: 30,
      enableFiltering: false,
      enableSorting: false,
      enableColumnMenus: false,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.priceBreakUiGrid = gridApi;

        vm.priceBreakUiGrid.edit.on.afterCellEdit($scope, function (rowEntity) {
          var propertiesMap = {
            id: rowEntity.id,
            name: rowEntity.name
          };
          propertiesMap[rowEntity.id] = rowEntity.value;
          saveGroupSetting('PRICE_BREAK-' + rowEntity.id, propertiesMap);
        });

        vm.priceBreakUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.priceBreakOptions.data.length > 0) && !vm.priceBreakOptions.initialized) {
            $timeout(function () {
              vm.priceBreakOptions.initialized = true;
            });
          }
        });
      }
    };

    function addPriceBreak() {
      vm.idCount++;
      var val = 'M' + vm.idCount;
      var propertiesMap = {
        id: val,
        name: 'Manual'
      };
      propertiesMap[val] = '';
      vm.priceBreakOptions.data.push(propertiesMap);
      saveGroupSetting('PRICE_BREAK-' + val, propertiesMap);
    }

    function setGroupSettings(data) {
      vm.editReleased = data.releaseSettings ?
        (data.releaseSettings.allowEdit === 'true') : false;

      vm.editReleasedBom = data.releaseBomSettings ?
        (data.releaseBomSettings.allowEdit === 'true') : false;

      vm.priceBreakSetting = data.costSplitSettings ?
        (data.costSplitSettings.allowCostSplit === 'true') : false;

      vm.currencySetting = data.currencySettings ?
        (data.currencySettings.currencyChoice) : '$ (USD)';

      vm.currencyDecimalsSetting = data.currencyDecimals && data.currencyDecimals.currencyDecimals ?
        data.currencyDecimals.currencyDecimals === 'No Limit'? 'No Limit' : (data.currencyDecimals.currencyDecimals) : 'No Limit';

      vm.manualRelease = data.releaseSettings ? data.releaseSettings.manualRelease !== 'false' : true;

      vm.releaseHierarchy = data.releaseSettings ?
        (data.releaseSettings.releaseHierarchy === 'true') : false;

      vm.promoteDemote = data.releaseSettings ?
        (data.releaseSettings.promoteDemote === 'true') : false;

      vm.releaseEditsHierarchy = data.releaseSettings ?
        (data.releaseSettings.releaseEditsHierarchy === 'true') : false;

      vm.editReleaseAttachments = data.releaseAttachmentSettings ?
        (data.releaseAttachmentSettings.allowEdit === 'true') : false;

      vm.editReleaseSourcing = data.releaseSourcingSettings ?
        (data.releaseSourcingSettings.allowEdit === 'true') : false;

      vm.editReleaseAdditionalInfo = data.releaseAdditionalInfoSettings ?
        (data.releaseAdditionalInfoSettings.allowEdit === 'true') : false;

      vm.referenceDesignatorsSetting = data.refDesBOMSettings ?
        (data.refDesBOMSettings.refDesCheckForDuplicate === 'true') : false;

      vm.editSubLevelPartsSetting = data.editSubLevelParts && data.editSubLevelParts.editSubLevelParts === 'true';

      var arrayId = [];
      _.forIn(data, function (o) {
        if (_.has(o, 'id') && _.has(o, 'name')) {
          o.value = o[o.id];
          if (o.id == 'M') {
            if (vm.priceBreakOptions.data[0] && vm.priceBreakOptions.data[0].id === helperData.rollupCostId) {
              vm.priceBreakOptions.data.splice(1, 0, o);
            } else {
              vm.priceBreakOptions.data.unshift(o);
            }
          } else if (o.id === helperData.rollupCostId) {
            vm.priceBreakOptions.data.unshift(o);
          } else {
            vm.priceBreakOptions.data.push(o);
          }
          arrayId.push(parseInt((o.id).replace(/\D+/g, '')));
        }
      });
      setDefaultCostDetail();
      vm.idCount = _.max(arrayId) || 0;
    }

    function setDefaultCostDetail() {
      if (_.find(vm.priceBreakOptions.data, function (val) {
        return val.id == 'M';
      }) == undefined) {
        if (_.find(vm.priceBreakOptions.data, function (val) {
          return val.id === helperData.rollupCostId;
        }) == undefined) {
          vm.priceBreakOptions.data.unshift({
            id: 'M',
            name: 'Manual',
            value: ''
          });
        } else {
          vm.priceBreakOptions.data.splice(1, 0, {
            id: 'M',
            name: 'Manual',
            value: ''
          });
        }
      }
      if (_.find(vm.priceBreakOptions.data, function (val) {
        return val.id === helperData.rollupCostId;
      }) == undefined) {
        vm.priceBreakOptions.data.unshift({
          id: helperData.rollupCostId,
          name: 'Rollup',
          value: ''
        });
      }
    }

    function editCell(row, col) {
      angular.element('#' + row + '-' + col).dblclick();
    }

    function getDefaultAdvancedNumberingScheme() {
      advancedNumberingService.getDefaultScheme()
        .then(function (schemes) {
          vm.defaultSchemes = schemes;
        })
        .catch(function (err) {
          $mdToast.show($mdToast.simple().textContent(err)
            .toastClass("md-error-toast-theme").position('top right').hideDelay(4000));
        });
    }

    const ratesColumns = [
      {
        field: 'baseCurrency', displayName: '', width: 100,
        cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/base-currency-cell.html'
      },
      {
        field: 'exchangeRate', displayName: 'Exchange Rate',
        cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/exchange-rate-cell.html',
        width: 150,
      },
      {
        field: 'currency', displayName: 'Currency',
        cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/currencies-dropdown.html'
      },
      {
        field: 'delete', displayName: '',
        cellTemplate: 'app/main/apps/setting/tabs/fuseobject-numbering/templates/delete-currency.html',
        width: 50
      }
    ];

    vm.exchangeRates = {
      enableColumnMenus: false,
      data: [],
      columnDefs: ratesColumns,
      canAddCurrency: true
    };

    function addNewCurrency() {
      vm.exchangeRates.data.push(new StandardExchangeRate(vm.currencySetting));
      vm.exchangeRates.canAddCurrency = isAbleToAddCurrency(vm.exchangeRates.data);
    }

    class StandardExchangeRate {
      constructor(baseCurrency, currency = null, exchangeRate) {
        this.id = StandardExchangeRate.lastId++;
        this.baseCurrency = baseCurrency;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
      }
    }

    StandardExchangeRate.lastId = 0;

    function initExchangeRateDeletion(removedRow) {
      vm.exchangeRates.canAddCurrency = isAbleToAddCurrency(vm.exchangeRates.data);
      if (!removedRow.currency || !removedRow.exchangeRate) {
        processDeletion(removedRow);
        return;
      }
      currencyRatesBackendService.removeCurrencyExchangeRate(
        currencyExchangeService.getCurrencyAbbreviation(removedRow.currency))
        .then(() => {
          processDeletion(removedRow);
          reviewAvailableCurrencies();
        })
        .catch((response) => {
          showFailMessage(response.message);
        });
    }

    /**
     * Function changes currency choice for a particulat currency exchange rate (a row in the table)
     * @param oldCurrency - currency before change
     */
    function changeCurrencyForRate(oldCurrency, exchangeRate) {
      reviewAvailableCurrencies();
      if (!(exchangeRate || oldCurrency)) {
        return;
      }
      const deletionPromise = oldCurrency ? currencyRatesBackendService.removeCurrencyExchangeRate(
        currencyExchangeService.getCurrencyAbbreviation(oldCurrency)) : Promise.resolve();
      deletionPromise
        .then((response) => {
          updateExchangeRates();
        })
        .catch((response) => {
          showFailMessage(response.message);
        });
    }

    function processDeletion(removedRow) {
      vm.exchangeRates.data = deleteExchangeRate(vm.exchangeRates.data, removedRow);
      vm.exchangeRates.canAddCurrency = isAbleToAddCurrency(vm.exchangeRates.data);
      showSuccessMessage('Successfully Updated');
    }

    function isAbleToAddCurrency(arr) {
      return !arr.some((row) => {
        return !row.exchangeRate || !row.currency;
      });
    }

    function deleteExchangeRate(tableData, rowToRemove) {
      return tableData.filter((row) => {
        return row.id !== rowToRemove.id;
      });
    }

    vm.availableCurrencies = angular.copy(availableCurrencies);
    vm.currenciesToShowInDropdown = [];

    /**
     * Check whether to show currency in dropdown or not, in exchange rates table
     * @param abbreviation
     */
    function isCurrencyAvailable(abbreviation) {
      return _.find(vm.currenciesToShowInDropdown, (currency) => {
        return currency.abbreviation === abbreviation
      })
    }

    /**
     * Keeps the list of currencies to show in drop-down updated
     */
    function reviewAvailableCurrencies() {
      const systemCurrencyAbbreviation = currencyExchangeService.getSystemCurrency().abbreviation;
      const usedCurrencies = getAppliedCurrencies(vm.exchangeRates.data).concat([systemCurrencyAbbreviation]);
      vm.currenciesToShowInDropdown = _.filter(vm.availableCurrencies, function (currency) {
        return !_.find(usedCurrencies, (abbreviation) => {
          return abbreviation == currency.abbreviation
        });
      });
    }

    /**
     * Returns all currecies, which should not be shown in drop-down in exchange rates table
     * @param tableRows
     * @returns {*}
     */
    function getAppliedCurrencies(tableRows) {
      return tableRows.map((row) => {
        return currencyExchangeService.getCurrencyAbbreviation(row.currency);
      })
    }

    function updateExchangeRates() {
      const validationReport = getValidationReport(vm.exchangeRates.data);
      if (validationReport.isError) {
        showErrorToast(validationReport.message);
        return;
      }
      if (!validateChosenCurrencies(vm.exchangeRates.data)) {
        showErrorToast('Please, fill in the currency');
        return;
      }
      vm.exchangeRates.canAddCurrency = isAbleToAddCurrency(vm.exchangeRates.data);
      GlobalSettingsService.updateSystemSetting({
        value: getRatesForUpdating(vm.exchangeRates.data),
        groupName: 'currencyRates',
        customerId: vm.sessionData.userId
      })
        .then((response) => {
          if (response.code === 0) {
            showSuccessMessage('Successfully Updated');
          } else {
            showFailMessage(response.message);
          }
        });
    }

    function validateChosenCurrencies(arr) {
      return !arr.some((row) => {
        return !row.currency
      });
    }

    function showSuccessMessage(text) {
      $mdToast.show($mdToast.simple().textContent(text).position('top right'));
    }

    function showFailMessage(text) {
      $mdToast.show($mdToast.simple().textContent(text)
        .action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
    }

    function getValidationReport(rows) {
      const propertyToCheck = 'exchangeRate';
      const noValueMessage = 'Please, provide a value to save';
      const notNumberMessage = 'Please, provide a numeric value';
      const zeroMessage = 'Please, provide a number, different from zero';
      const negativeNumberMessage = 'Please, provide a positive value';
      if (isValueNotDefined(rows, propertyToCheck)) {
        return new ValidationReporter(true, noValueMessage)
      }
      if (areNotNumbers(rows, propertyToCheck)) {
        return new ValidationReporter(true, notNumberMessage);
      }
      if (isZero(rows, propertyToCheck)) {
        return new ValidationReporter(true, zeroMessage);
      }
      if (isNotPositive(rows, propertyToCheck)) {
        return new ValidationReporter(true, negativeNumberMessage);
      }
      return new ValidationReporter();
    }

    function isNotPositive(arr, propToCheck) {
      return arr.some((row) => {
        return +row[propToCheck] < 0;
      });
    }

    function isZero(arr, propToCheck) {
      return arr.some((row) => {
        return row[propToCheck] === '0';
      });
    }

    function areNotNumbers(arr, propToCheck) {
      return arr.some((row) => {
        return !fuseUtils.isNumber(row[propToCheck]);
      });
    }

    function isValueNotDefined(arr, propToCheck) {
      return arr.some((row) => {
        return !row[propToCheck];
      });
    }

    function showErrorToast(text) {
      $mdToast.show($mdToast.simple().textContent(text)
        .toastClass("md-error-toast-theme").position('top right').hideDelay(3000));
    }

    function getRatesForUpdating(tableData) {
      const result = {};
      tableData.forEach((row) => {
        const currencyAbbreviation = row.currency.split('(')[1].split(')')[0];
        if (!result[currencyAbbreviation]) {
          result[currencyAbbreviation] = row.exchangeRate;
        }
      });
      return result;
    }

    function getRatesData(ratesMap) {
      return _.map(ratesMap, (rateDetails, currency) => {
        const currencyObject = _.find(vm.availableCurrencies, {abbreviation: currency});
        const currencyString = `${currencyObject.sign} (${currencyObject.abbreviation})`;
        return new StandardExchangeRate(vm.currencySetting, currencyString, rateDetails);
      });
    }

    function clearErrorMessage(row) {
      row.invalid = null;
    }

    function validateNumber(data, field, row) {
      if (!row.invalid) {
        row.invalid = {};
      }
      if (data.length === 0) {
        row.invalid[field] = 'This field is required';
        return '';
      }
      if (!fuseUtils.isNumber(data)) {
        row.invalid[field] = 'Please, provide numeric value';
        return '';
      }
      return true;
    }

  }
})();

