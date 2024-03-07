(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('AttributeDialogController', AttributeDialogController)
    .filter('capitalizes', function () {
      return function (input) {
        var output, outputs;

        if (input !== undefined) {
          outputs = input.replace(/([A-Z])/g, ' $1').trim();
          output = (!!outputs) ? outputs.charAt(0).toUpperCase() + outputs.substr(1) : '';
        }
        return output;
      }
    });

  /** @ngInject */
  function AttributeDialogController($mdDialog, Attribute, Attributes, categoryPart, msUtils, Categories, hostUrlDevelopment, CustomerService,
                                     ScrumboardService, errors, $mdToast, AuthService, $state, $scope, AttributesService) {
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
    vm.attributeId = '';
    vm.categoryId = [];
    vm.boardId = [];
    //sourcing
    vm.sourcingId = [];
    vm.sourcingpartId = [];
    vm.dropdown = [];
    vm.attributeType = '';

    vm.categoryHierarchy = [];
    vm.newBoardTitle = [];
    vm.searchDisabled = false;
    vm.allCategoryYes = false;
    vm.attributes = true;
    vm.board = false;
    vm.sourcings = false;
    vm.sourcpart = false;

    // Data
    vm.Attributes = Attributes;
    vm.newAttribute = false;
    vm.allFields = false;
    vm.parent = [];
    vm.parentCategory = [];
    vm.boardData = [];
    if (!vm.attribute) {
      vm.attribute = {
        'attribute': '',
        'attributeType': '',
        'tabname': '',
        'objectType': '',
        'isAllCategory': 'false',
        'categoryHierarchy': [],
        'sourcing': [],
        'sourcingpart': []
      };

      vm.title = 'New Attribute';
      vm.newAttribute = true;
    }
    vm.sourceTypeSet = '';
    //sourcing
    vm.sourcingData = [];
    vm.sourcingpartsData = [];

    if (Attribute) {
      vm.title = 'Edit Attribute';
      vm.attribute = angular.copy(Attribute);
      vm.attributeType = vm.attribute.attributeType;
      if (vm.attribute.attributeType == 'Dropdown') {
        vm.dropdown = vm.attribute.dropDownList;
      }
      vm.attributes = false;
      vm.newAttribute = false;
      if (Attribute.isAllCategory === "true") {
        vm.attribute.categoryHierarchy = [];
        vm.attribute.board = [];
        vm.attribute.sourcing = [];
        vm.attribute.sourcingpart = [];
        vm.allCategoryYes = true;
        vm.searchDisabled = true;
      } else {
        if (vm.attribute.objectType == 'boards') {
          getBoardList(); //to get boardlist on edit
          angular.forEach(Attribute.categoryResponseList, function (value, key) {
            vm.boardId.push(value.categoryId);
            vm.newBoardTitle.push(value.categoryName);
          });
          vm.attribute.board = vm.newBoardTitle;
        }
        if (Attribute.objectType == 'sourcing') {
          getSourcingList(Attribute.objectType);
          vm.attribute.sourcing = [];
          angular.forEach(Attribute.sourceTypeList, function (value, key) {
            vm.sourcingId.push(value);
            vm.attribute.sourcing.push(value);
          });
        }
        if (Attribute.objectType == 'sourcingObject') {
          getSourcingList(Attribute.objectType);
          vm.attribute.sourcingpart = [];
          if (Attribute.sourceTypeList.length == 2) {
            vm.attribute.sourcingpart = ['Manufacturer Part', 'Supplier Part'];
            vm.sourcingpart = ['Manufacturer Part', 'Supplier Part'];
          } else {
            if (Attribute.sourceTypeList[0] === 'manufacturerpart') {
              vm.attribute.sourcingpart = ['Manufacturer Part'];
              vm.sourcingpart = ['Manufacturer Part', 'Supplier Part'];
            } else {
              vm.attribute.sourcingpart = ['Supplier Part'];
              vm.sourcingpart = ['Manufacturer Part', 'Supplier Part'];
            }
          }
        } else {
          getCategoryList(vm.attribute.objectType);
          angular.forEach(Attribute.categoryResponseList, function (value, key) {
            if ((vm.categoryId.indexOf(value.categoryId) == -1)) {

              vm.categoryId.push(value.categoryId);
            }
            if (value.categoryId === value.parentCategoryId) {
              vm.attribute.categoryHierarchy = [];
              vm.categoryHierarchy.push(value.categoryName);
            } else {
              vm.categoryHierarchy.push(value.categoryHierarchy);
            }
          });
          vm.attribute.categoryHierarchy = vm.categoryHierarchy;
        }
      }
    } else {}

    /* Category change */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.changeItemsQuerySearchForBoard = changeItemsQuerySearchForBoard;
    vm.parentIDQuerySearch = parentIDQuerySearch;
    vm.boardIDQuerySearch = boardIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;

    //sourcing
    vm.sourcingIDQuerySearch = sourcingIDQuerySearch;
    vm.changeItemsQuerySearchForSourcing = changeItemsQuerySearchForSourcing;
    vm.sourcingpartIDQuerySearch = sourcingpartIDQuerySearch
    vm.changeItemsQuerySearchForSourcingpart = changeItemsQuerySearchForSourcingpart;

    // Methods
    vm.addNewAttribute = addNewAttribute;
    vm.saveAttribute = saveAttribute;
    vm.deleteContactConfirm = deleteContactConfirm;
    vm.closeDialog = closeDialog;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.parentCategoryFunction = parentCategoryFunction;
    vm.searchCategoryFunction = searchCategoryFunction;
    vm.searchBoardFunction = searchBoardFunction;

    //sourcing
    vm.searchSourcingFunction = searchSourcingFunction;
    vm.searchSourcingpartFunction = searchSourcingpartFunction
    vm.SourcingPartFunction = SourcingPartFunction;
    vm.BoardFunction = BoardFunction;
    vm.closeCategoryChips = closeCategoryChips;
    vm.allCategoryYesOption = allCategoryYesOption;
    vm.optionFunction = optionFunction;
    vm.getCategoryList = getCategoryList;
    vm.getBoardList = getBoardList;
    vm.attributeTypeFunction = attributeTypeFunction;
    vm.addChip = addChip;
    vm.closedropdownChips = closedropdownChips;
    vm.callCategoryList = callCategoryList;

    //sourcing
    vm.getSourcingList = getSourcingList;
    vm.SourcingFunction = SourcingFunction;

    function closedropdownChips(index) {
      vm.dropdown.splice(index, 1);
      if (vm.dropdown.length == 0) {
        vm.attributes = true;
      } else {
        vm.attributes = false;
      }
    }

    function attributeTypeFunction(ev) {
      // if (vm.attribute.attributeType != 'Dropdown') {
      //   vm.dropdown = [];
      // } else {
      //   vm.attributes = true;
      // }
      //if (vm.attribute.attributeType !== 'richText') {
        $mdDialog.show({
          template: '<md-dialog>' +
            '<md-dialog-content>' +
            'WARNING: Changing attribute type will REMOVE any existing values.' +
            '</br>' +
            'Do you wish to continue?' +
            '</md-dialog-content>' +
            '<md-dialog-actions>' +
            '<md-button ng-click="closeDialog()" class="md-primary">' +
            'No' +
            '</md-button>' +
            '<md-button ng-click="yesDialog()" class="md-primary">Yes, change attribute type</md-button>' +
            '</md-dialog-actions>' +
            '</md-dialog>',
          controller: AttributetypeController,
          controllerAs: 'vm',
          skipHide: true,
          targetEvent: ev,
          clickOutsideToClose: true,
          escapeToClose: true,
          locals: {
            attribute: vm.attribute,
            attributeType: vm.attributeType
          }
        })
      //}
    }

    function AttributetypeController($scope, $mdDialog, attributeType, attribute) {
      $scope.yesDialog = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        vm.attribute.attributeType = attribute.attributeType;
        $mdDialog.hide();
      };

      $scope.closeDialog = function () {
        vm.attribute.attributeType = attributeType;
        $mdDialog.cancel();
      }
    }

    function addChip(chip) {
      vm.attributes = false;
    }

    function allCategoryYesOption() {
      if (vm.allCategoryYes == false) {
        vm.allCategoryYes = true;
        vm.searchDisabled = true;
        vm.categoryId = [];
        vm.attribute.categoryHierarchy = [];
        vm.attribute.board = [];
        vm.attribute.sourcing = [];
        vm.attribute.sourcingpart = [];
        vm.boardId = [];
        vm.sourcingId = [];
        vm.sourcingpartId = [];
        vm.attributes = false;
      }
    }

    function optionFunction(type) {
      vm.allCategoryYes = false;
      vm.searchDisabled = false;
      vm.attributes = true;
      switch (type) {
        case 'parts':
          getCategoryList('parts');
          break;
        case 'products':
          getCategoryList('products');
          break;
        case 'boards':
          getBoardList();
          break;
        case 'sourcing':
          getSourcingList('sourcing');
          break;
        case 'sourcingObject':
          getSourcingList('sourcingObject');
          break;
      }
    }

    function parentCategoryFunction(Data) {
      vm.attributes = false;

      angular.forEach(Data, function (value, key) {
        if (vm.selectparentcategory == value.categoryId) {
          vm.selectparentcategory = value.categoryHierarchy;

          if ((vm.categoryId.indexOf(value.categoryId) == -1)) {

            vm.categoryId.push(value.categoryId);
          }
        }
      });
      if (vm.attribute.categoryHierarchy == null) {
        var length = vm.attribute.categoryHierarchy.length;
        var dataPush = false;
        if (vm.attribute.categoryHierarchy.length === 0) {
          if ((vm.attribute.categoryHierarchy.indexOf(vm.selectparentcategory) == -1)) {

            vm.attribute.categoryHierarchy.push(vm.selectparentcategory);
          }
          vm.selectparentcategory = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.categoryHierarchy, function (val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.categoryHierarchy.indexOf(vm.selectparentcategory) == -1)) {

              vm.attribute.categoryHierarchy.push(vm.selectparentcategory);
            }
          }
          vm.selectparentcategory = '';
        }
      } else {
        var length = vm.attribute.categoryHierarchy.length;
        var dataPush = false;
        if (vm.attribute.categoryHierarchy.length === 0) {

          if ((vm.attribute.categoryHierarchy.indexOf(vm.selectparentcategory) == -1)) {

            vm.attribute.categoryHierarchy.push(vm.selectparentcategory);
          }
          vm.selectparentcategory = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.categoryHierarchy, function (val, key) {
            if (val.categoryHierarchy === vm.selectparentcategory) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.categoryHierarchy.indexOf(vm.selectparentcategory) == -1)) {

              vm.attribute.categoryHierarchy.push(vm.selectparentcategory);
            }
          }
          vm.selectparentcategory = '';
        }
      }
    }

    // called on ng-change of board type board selection
    function BoardFunction(Data) {
      vm.attributes = false;

      if (vm.title == 'Edit Attribute') {

      } else {
        if (vm.attribute.objectType == 'boards' && !vm.board) {
          vm.attribute.board = [];

          vm.board = true;
        }
      }
      angular.forEach(Data, function (value, key) {
        if (vm.selectboard == value.boardId) {
          vm.selectboard = value.boardTitle;
          if ((vm.boardId.indexOf(value.boardId) == -1)) {
            vm.boardId.push(value.boardId);
          }
        }
      });
      if (vm.attribute.board == null) {
        var length = vm.attribute.board.length;
        var dataPush = false;
        if (vm.attribute.board.length === 0) {
          if ((vm.attribute.board.indexOf(vm.selectboard) == -1)) {
            vm.attribute.board.push(vm.selectboard);
          }
          vm.selectboard = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.board, function (val, key) {
            if (val.boardTitle === vm.selectboard) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.board.indexOf(vm.selectboard) == -1)) {
              vm.attribute.board.push(vm.selectboard);
            }

          }
          vm.selectboard = '';
        }
      } else {
        var length = vm.attribute.board.length;
        var dataPush = false;
        if (vm.attribute.board.length === 0) {

          if ((vm.attribute.board.indexOf(vm.selectboard) == -1)) {
            vm.attribute.board.push(vm.selectboard);
          }
          vm.selectboard = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.board, function (val, key) {
            if (val.boardTitle === vm.selectboard) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.board.indexOf(vm.selectboard) == -1)) {
              vm.attribute.board.push(vm.selectboard);
            }
          }
          vm.selectboard = '';
        }
      }
    }

    // called on ng-change of sourcing type sourcing selection
    function SourcingFunction(Data) {
      vm.attributes = false;

      if (vm.title == 'Edit Attribute') {

      } else {
        if (vm.attribute.objectType == 'sourcing' && !vm.sourcings) {
          vm.sourcings = true;
        }
      }

      angular.forEach(Data, function (value, key) {
        if (vm.selectsourcing == value) {
          vm.selectsourcing = value;
          if ((vm.sourcingId.indexOf(value) == -1)) {
            vm.sourcingId.push(value);
          }
        }
      });

      if (vm.attribute.sourcing == null) {
        var length = vm.attribute.sourcing.length;
        var dataPush = false;
        if (vm.attribute.sourcing.length === 0) {
          if ((vm.attribute.sourcing.indexOf(vm.selectsourcing) == -1)) {
            vm.attribute.sourcing.push(vm.selectsourcing);
          }
          vm.selectsourcing = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.sourcing, function (val, key) {
            if (val === vm.selectsourcing) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.sourcing.indexOf(vm.selectsourcing) == -1)) {
              vm.attribute.sourcing.push(vm.selectsourcing);
            }

          }
          vm.selectsourcing = '';
        }
      } else {
        var length = vm.attribute.sourcing.length;
        var dataPush = false;
        if (vm.attribute.sourcing.length === 0) {

          if ((vm.attribute.sourcing.indexOf(vm.selectsourcing) == -1)) {
            vm.attribute.sourcing.push(vm.selectsourcing);
          }
          vm.selectsourcing = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.sourcing, function (val, key) {
            if (val === vm.selectsourcing) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.sourcing.indexOf(vm.selectsourcing) == -1)) {
              vm.attribute.sourcing.push(vm.selectsourcing);
            }
          }
          vm.selectsourcing = '';
        }
      }
    }

    // called on ng-change of sourcingObject type sourcingObject selection
    function SourcingPartFunction(Data) {
      vm.attributes = false;

      if (vm.title == 'Edit Attribute') {} else {
        if (vm.attribute.objectType == 'sourcingObject' && !vm.sourcpart) {
          //vm.attribute.sourcingpart = [];
          vm.sourcpart = true;
        }
      }

      angular.forEach(Data, function (value, key) {

        if (vm.sourcingpart == value) {
          vm.sourcingpart = value;
          if ((vm.sourcingpartId.indexOf(value) == -1)) {
            vm.sourcingpartId.push(value);
          }
        }
      });

      if (vm.attribute.sourcingpart == null) {
        var length = vm.attribute.sourcingpart.length;
        var dataPush = false;
        if (vm.attribute.sourcingpart.length === 0) {
          if ((vm.attribute.sourcingpart.indexOf(vm.sourcingpart) == -1)) {
            vm.attribute.sourcingpart.push(vm.sourcingpart);
          }
          vm.sourcingpart = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.sourcingpart, function (val, key) {
            if (val === vm.sourcingpart) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.sourcingpart.indexOf(vm.sourcingpart) == -1)) {
              vm.attribute.sourcingpart.push(vm.sourcingpart);
            }
          }
          vm.sourcingpart = '';
        }
      } else {
        var length = vm.attribute.sourcingpart.length;
        var dataPush = false;
        if (vm.attribute.sourcingpart.length === 0) {
          if ((vm.attribute.sourcingpart.indexOf(vm.sourcingpart) == -1)) {
            vm.attribute.sourcingpart.push(vm.sourcingpart);
          }
          vm.sourcingpart = '';
        } else if (length < 5) {
          angular.forEach(vm.attribute.sourcingpart, function (val, key) {
            if (val === vm.selectboard) {
              dataPush = true;
            }
          });
          if (dataPush === false) {
            if ((vm.attribute.sourcingpart.indexOf(vm.sourcingpart) == -1)) {
              vm.attribute.sourcingpart.push(vm.sourcingpart);
            }
          }
          vm.sourcingpart = '';
        }
      }
    }

    function searchCategoryFunction(itemid, Data) {
      vm.attributes = false;
      if (itemid === 'undefined') {} else {
        angular.forEach(Data, function (value, key) {
          if (itemid === value.categoryHierarchy) {
            vm.categoryId.push(value.categoryId);
          }
        });
      }
    }

    //board
    function searchBoardFunction(itemid, Data) {
      if (itemid === 'undefined') {} else {
        angular.forEach(Data, function (value, key) {
          if (itemid === value.boardTitle) {
            vm.boardId.push(value.boardId);
          }
        });
      }
    }

    //sourcing
    function searchSourcingFunction(itemid, Data) {
      angular.forEach(Data, function (value, key) {
        if (itemid === value) {
          if ((vm.sourcingId.indexOf(value) == -1)) {
            vm.sourcingId.push(value);
          }
        }
      });
    }

    //sourcing part
    function searchSourcingpartFunction(itemid, Data) {
      angular.forEach(Data, function (value, key) {
        if (itemid === value) {
          if ((vm.sourcingpartId.indexOf(value) == -1)) {
            vm.sourcingpartId.push(value);
          }
        }
      });
    }

    function closeCategoryChips(index) {
      if (vm.attribute.objectType == 'boards') {
        vm.boardId.splice(index, 1);
        if (vm.boardId.length == 0) {
          vm.attributes = true;
        } else {
          vm.attributes = false;
        }
        vm.searchDisabled = false;
      } else if (vm.attribute.objectType == 'sourcing') {
        vm.sourcingId.splice(index, 1);
        if (vm.sourcingId.length == 0) {
          vm.attributes = true;
        } else {
          vm.attributes = false;
        }
        vm.searchDisabled = false;
      } else if (vm.attribute.objectType == 'sourcingObject') {
        vm.sourcingpartId.splice(index, 1);
        if (vm.sourcingpartId.length == 0) {
          vm.attributes = true;
        } else {
          vm.attributes = false;
        }
        vm.searchDisabled = false;
      } else {
        vm.categoryId.splice(index, 1);
        if (vm.categoryId.length == 0) {
          vm.attributes = true;
        } else {
          vm.attributes = false;
        }
        vm.searchDisabled = false;
      }
    }

    function getCategoryList(objectType) {
      var headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      if (objectType) {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryType: objectType
          };
          callCategoryList(params, headers);
        } else {
          params = {
            categoryType: objectType
          };
          callCategoryList(params, headers);
        }
      } else {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryType: vm.attribute.objectType
          };
          if (vm.attribute.objectType == 'boards') {
            getBoardList();
          }
        } else {
          switch (vm.attribute.objectType) {
            case 'parts':
              params = {
                categoryType: vm.attribute.objectType
              }
              callCategoryList(params, headers);
              break;
            case 'products':
              params = {
                categoryType: vm.attribute.objectType
              }
              callCategoryList(params, headers);
              break;
            case 'documents':
              params = {
                categoryType: vm.attribute.objectType
              }
              callCategoryList(params, headers);
              break;
            case 'boards':
              getBoardList();
              break;
            case 'sourcing':
              getSourcingList('sourcing');
              break;
            case 'sourcingObject':
              getSourcingList();
              break;
            default:
          }
        }
      }
    }

    function callCategoryList(params, headers) {
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, params, '', headers)
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

    // get all board list
    function getBoardList() {
      var headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };
      var params = {};
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboards, params, '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.boardData = response.data;
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
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
    }

    function getSourcingList(Source) {
      if (Source == 'sourcing') {
        vm.sourcingData = ['manufacturer', 'supplier'];
      } else {
        vm.sourcingpartsData = ['Manufacturer Part', 'Supplier Part'];
      }
    }

    /**
     * Add new Attribute
     */
    function addNewAttribute() {
      vm.attribute.categoryHierarchy = vm.categoryId;

      //For Progress Loader
      vm.progress = true;
      vm.attributes = true;

      if (vm.sourcingpartId.length == 2) {
        vm.sourcingpartId = ['manufacturerpart', 'supplierpart'];
      } else {
        if (vm.sourcingpartId[0] === 'Manufacturer Part') {
          vm.sourcingpartId = ['manufacturerpart'];
        } else {
          vm.sourcingpartId = ['supplierpart'];
        }
      }
      if (vm.sessionData.proxy == true) {
        if (vm.attribute.objectType == 'boards') {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryList: vm.boardId
          }
          vm.sourceTypeSet = [];
        } else if (vm.attribute.objectType == 'sourcing') {
          params = {
            customerId: vm.sessionData.customerAdminId
          }
          sourceTypeSet: vm.sourcingpartId
        } else if (vm.attribute.objectType == 'sourcingObject') {
          params = {
            customerId: vm.sessionData.customerAdminId
          }
          vm.sourceTypeSet = vm.sourcingId;
        } else {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryList: vm.attribute.categoryHierarchy
          }
          vm.sourceTypeSet = [];
        }
      } else {
        if (vm.attribute.objectType == 'boards') {
          params = {
            customerId: vm.sessionData.userId,
            categoryList: vm.boardId
          }
          vm.sourceTypeSet = [];
        } else if (vm.attribute.objectType == 'sourcing') {
          params = {
            customerId: vm.sessionData.userId,
          }
          vm.sourceTypeSet = vm.sourcingId;
        } else if (vm.attribute.objectType == 'sourcingObject') {
          params = {
            customerId: vm.sessionData.userId
          }
          vm.sourceTypeSet = vm.sourcingpartId;
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryList: vm.attribute.categoryHierarchy
          }
          vm.sourceTypeSet = [];
        }
      }

      var data = {
        attribute: vm.attribute.attribute,
        attributeType: vm.attribute.attributeType,
        objectType: vm.attribute.objectType,
        tabname: "Additional Info",
        isAllCategory: vm.attribute.isAllCategory,
        defaultValue: "",
        dropDownList: vm.dropdown,
        sourceTypeSet: vm.sourceTypeSet
      };

      vm.attribute.categoryHierarchy = [];
      AttributesService.addOrUpdateAttribute(params, data)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;
          vm.attributes = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Created').position('top right'));
              $mdDialog.hide();
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
     * Save contact
     */
    function saveAttribute() {
      //For Progress Loader
      vm.progress = true;
      vm.attributes = true;

      if (vm.selectparentcategory == " ") {

      } else {
        angular.forEach(categoryPart, function (value, key) {
          angular.forEach(value.categoryResponseList, function (valu, ke) {
            angular.forEach(vm.categoryId, function (val, keys) {
              if (val === value.parentCategoryId) {
                vm.categoryId.push(valu.parentCategoryId);
              }
            });
          });
        });
      }

      if (vm.sourcingpartId.length == 2) {
        vm.sourcingpartId = ['manufacturerpart', 'supplierpart'];
      } else {
        if (vm.sourcingpartId[0] === 'Manufacturer Part') {
          vm.sourcingpartId = ['manufacturerpart'];
        } else {
          vm.sourcingpartId = ['supplierpart'];
        }
      }

      if (vm.sessionData.proxy == true) {
        if (vm.attribute.objectType == 'boards') {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryList: vm.boardId
          }
          vm.sourceTypeSet = [];
        } else if (vm.attribute.objectType == 'sourcing') {
          params = {
            customerId: vm.sessionData.customerAdminId
          }
          sourceTypeSet: vm.sourcingpartId
        } else if (vm.attribute.objectType == 'sourcingObject') {
          params = {
            customerId: vm.sessionData.customerAdminId
          }
          vm.sourceTypeSet = vm.sourcingId;
        } else {
          params = {
            customerId: vm.sessionData.customerAdminId,
            categoryList: vm.categoryId
          }
          vm.sourceTypeSet = [];
        }
      } else {
        if (vm.attribute.objectType == 'boards') {
          params = {
            customerId: vm.sessionData.userId,
            categoryList: vm.boardId
          }
          vm.sourceTypeSet = [];
        } else if (vm.attribute.objectType == 'sourcing') {
          params = {
            customerId: vm.sessionData.userId,
          }
          vm.sourceTypeSet = vm.sourcingId;
        } else if (vm.attribute.objectType == 'sourcingObject') {
          params = {
            customerId: vm.sessionData.userId
          }
          vm.sourceTypeSet = vm.sourcingpartId;
        } else {
          params = {
            customerId: vm.sessionData.userId,
            categoryList: vm.categoryId
          }
          vm.sourceTypeSet = [];
        }
      }

      angular.forEach(vm.attribute.categoryHierarchy, function (value, key) {
        vm.attribute.categoryHierarchy = value;
      });

      var data = {
        attributeId: vm.attribute.attributeId,
        attribute: vm.attribute.attribute,
        attributeType: vm.attribute.attributeType,
        objectType: vm.attribute.objectType,
        tabname: "Additional Info",
        isAllCategory: vm.attribute.isAllCategory,
        defaultValue: "",
        dropDownList: vm.dropdown,
        sourceTypeSet: vm.sourceTypeSet
      };

      vm.attribute.categoryHierarchy = [];
      AttributesService.addOrUpdateAttribute(params, data)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;
          vm.attributes = false;

          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              $mdDialog.hide();
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
     * Delete Category Confirm Dialog
     */
    function deleteContactConfirm(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the category?')
        .htmlContent('<b>' + vm.attribute.attribute + ' ' + vm.attribute.attributeType + '</b>' + ' will be deleted.')
        .ariaLabel('delete category')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;
        vm.attributes = true;

        AttributesService.removeAttribute(vm.attribute.attributeId)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;
            vm.attributes = false;

            switch (response.code) {
              case 0:
                vm.Attributes.splice(vm.Attributes.indexOf(Attribute), 1);
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
     * Add change item chips(for board only)
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearchForBoard(query) {
      return query ? vm.boardData.filter(createFilterForBoard(query)) : [];
    }

    /**
     * Add change item chips(for sourcing only)
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearchForSourcing(query) {
      return query ? vm.sourcingData.filter(createFilterForSourcing(query)) : [];
    }

    /**
     * Add change item chips(for sourcing only)
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearchForSourcingpart(query) {
      return query ? vm.sourcingpartsData.filter(createFilterForSourcingpart(query)) : [];
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
     * Filter change Items(for board only)
     *
     * @param query
     * @returns {array} IDs
     */
    function boardIDQuerySearch(query) {
      return query ? changeItemsQuerySearchForBoard(query).map(function (item) {
        return item.boardTitle;
      }) : [];
    }

    /**
     * Filter change Items(for sourcing only)
     *
     * @param query
     * @returns {array} IDs
     */
    function sourcingIDQuerySearch(query) {
      return query ? changeItemsQuerySearchForSourcing(query).map(function (item) {
        return item;
      }) : [];
    }

    /**
     * Filter change Items(for sourcingpart only)
     *
     * @param query
     * @returns {array} IDs
     */
    function sourcingpartIDQuerySearch(query) {
      return query ? changeItemsQuerySearchForSourcingpart(query).map(function (item) {
        return item;
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
     * Filter for chips(for board only)
     *
     * @param query
     * @returns {filterFn}
     */
    function createFilterForBoard(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFnBoard(item) {
        return angular.lowercase(item.boardTitle).indexOf(lowercaseQuery) >= 0;
      };

    }

    /**
     * Filter for chips(for sourcing only)
     *
     * @param query
     * @returns {filterFnsourc}
     */
    function createFilterForSourcing(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFnsourc(item) {
        return angular.lowercase(item).indexOf(lowercaseQuery) >= 0;
      };
    }

    /**
     * Filter for chips(for sourcingpart only)
     *
     * @param query
     * @returns {filterFnsurcpart}
     */
    function createFilterForSourcingpart(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(item) {
        return angular.lowercase(item).indexOf(lowercaseQuery) >= 0;
      };
    }

  }
})();
