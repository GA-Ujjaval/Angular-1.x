(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('SourcingController', SourcingController);

  /** @ngInject */
  function SourcingController($state, $mdDialog, $document, $filter, hostUrlDevelopment, CustomerService, errors,
                              $mdToast, AuthService, objectPageEnum, fuseUtils, $window, $timeout, $scope, bulkDelete,
                              $rootScope, attributesUtils, helpSettingService, exporterCallbackService, uiGridGridMenuService) {

    var vm = this;
    vm.objectPageEnum = objectPageEnum;
    vm.fuseUtils = fuseUtils;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.readonly = fuseUtils.findAccessRights();
    const debouncedDoTabSourcing = _.debounce(doTabSourcing, 2000);

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    var manufacturerId = 'grid-manufacturers',
      supplierId = 'grid-supplier',
      manufacturerPartsId = 'grid-manufacturer-parts',
      supplierPartsId = 'grid-supplier-parts';

    vm.manufacturerId = 'grid-manufacturers';
    vm.supplierId = 'grid-supplier';
    vm.manufacturerPartsId = 'grid-manufacturer-parts';
    vm.supplierPartsId = 'grid-supplier-parts';
    // Data
    vm.sourcingName = 'Manufacturers';
    vm.manufacturerType = true;
    vm.heightMax = document.body.scrollHeight;
    vm.linkTarget = '_self';
    let selectedRows = [];

    $rootScope.$on('tabChange', function (event, args) {
      vm.selectedtypeTab = args.data;
      switch (vm.selectedtypeTab) {
        case 'manufacturers':
          vm.selectedTabs = 0;
          vm.selectedtypeTab = 'Manufacturers';
          restoreState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
          break;
        case 'suppliers':
          vm.selectedTabs = 2;
          vm.selectedtypeTab = 'Suppliers';
          restoreState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
          break;
        case 'manufacturersparts':
          vm.selectedTabs = 1;
          vm.selectedtypeTab = 'Manufacturer Parts';
          restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
          break;
        case 'supplierparts':
          vm.selectedTabs = 4;
          vm.selectedtypeTab = 'Supplier Parts';
          restoreState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
          break;
      }
      window.localStorage.selectedTabs = vm.selectedTabs;
      window.localStorage.selectedtypeTab = vm.selectedtypeTab;
    });

    if (angular.isDefined(window.localStorage.selectedTabs)) {
      vm.selectedTabs = parseInt(window.localStorage.selectedTabs);
      delete window.localStorage.selectedTabs;
      tabSourcing(window.localStorage.selectedtypeTab, true);
      delete window.localStorage.selectedtypeTab;
    } else {
      vm.selectedTabs = 0;
      tabSourcing('Manufacturers', true);
    }

    //Method
    vm.tabSourcing = tabSourcing;
    vm.createSourcing = createSourcing;
    vm.editTable = editTable;
    vm.changesearchtext = changesearchtext;
    vm.clearSearch = clearSearch;
    vm.initManufacturesSuppliers = initManufacturesSuppliers;
    vm.getallsourceobjectcount = getallsourceobjectcount;
    vm.restoreState = restoreState;
    vm.deleteItems = deleteItems;
    vm.getSelectedRows = getSelectedRows;
    getallUsers();

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
          switch (response.code) {
            case 0:
              vm.allUsers = response.data.Members;
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    function tabSourcing(sourcingname, isDebounced) {
      vm.progress = true;
      vm.sourcingName = sourcingname;
      debouncedDoTabSourcing.cancel();
      if ((sourcingname === 'Manufacturer Parts' && vm.mfrPartsFlag) ||
        (sourcingname === 'Suppliers' && vm.suppFlag) ||
        (sourcingname === 'Supplier Parts' && vm.suppPartsFlag)) {
        doTabSourcing(sourcingname);
      } else if (isDebounced) {
        debouncedDoTabSourcing(sourcingname)
      }

    }

    function doTabSourcing(sourcingname) {
      switch (sourcingname) {
        case 'Manufacturers':
          vm.manufacturerType = true;
          initManufacturesSuppliers('mfr');
          getallsourceobjectcount('manufacturer');
          break;
        case 'Manufacturer Parts':
          vm.manufacturerType = true;
          if (!vm.mfrPartsFlag) {
            initManufacturesSuppliers('mfr');
          } else {
            vm.progress = false;
          }
          getallsourceobjectcount('mfr');
          break;
        case 'Suppliers':
          vm.manufacturerType = false;
          if (!vm.suppFlag) {
            initManufacturesSuppliers('supp');
          } else {
            vm.progress = false;
          }
          getallsourceobjectcount('supplier');
          break;
        case 'Supplier Parts':
          vm.manufacturerType = false;
          if (!vm.suppPartsFlag) {
            initManufacturesSuppliers('supp');
          } else {
            vm.progress = false;
          }
          getallsourceobjectcount('supp');
          break;
        default:
      }
    }

    function createSourcing(sourcingname) {
      switch (sourcingname) {
        case 'Manufacturers':
          manufacturerFunction('', 'manufacturer');
          break;
        case 'Manufacturer Parts':
          manufacturerpartFunction('', 'manufacturerpart');
          break;
        case 'Suppliers':
          manufacturerFunction('', 'supplier');
          break;
        case 'Supplier Parts':
          manufacturerpartFunction('', 'supplierpart');
          break;
        default:
      }
    }

    function manufacturerFunction(ev, type) {
      $mdDialog.show({
        controller: 'CreateManufacturerController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/tabs/manufactures/dialog/create-manufacturer-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          type: type,
          sourcingObject: ''
        }
      })
        .then(function () {

        }, function () {

        });
    }

    function manufacturerpartFunction(ev, type) {
      $mdDialog.show({
        controller: 'CreateManufacturerpartController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/tabs/manufactureparts/dialog/create-manufacturerparts-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          type: type,
          sourceObject: ''
        }
      })
        .then(function () {

        }, function () {

        });
    }

    function initManufacturesSuppliers(type) {
      vm.progress = true;
      var url;
      if (vm.sourcingName == 'Manufacturers' || vm.sourcingName == 'Suppliers') {
        url = hostUrlDevelopment.test.getallsourcingobject;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            sourcingType: type
          };
        } else {
          params = {
            sourcingType: type
          };
        }
      } else {
        url = hostUrlDevelopment.test.getallsourceobject;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            sourceType: type
          };
        } else {
          params = {
            sourceType: type
          };
        }
      }

      CustomerService.addNewMember('GET', url, params, '', headers)
        .then(function processResponse(response) {
          if (!vm.allUsers || !vm.allUsers.length) {
            delayFuncCall(processResponse, [response], 100);
            return;
          }

          if (vm.sourcingName == 'Suppliers') {
            vm.suppFlag = true;
          }
          if (vm.sourcingName == 'Manufacturer Parts') {
            vm.mfrPartsFlag = true;
          }
          if (vm.sourcingName == 'Supplier Parts') {
            vm.suppPartsFlag = true;
          }
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function (value) {
                extendSourcing(value);
              });
              if (vm.sourcingName == 'Manufacturers') {
                vm.manufaturersTableOptions.data = response.data;
                fuseUtils.handleAllOptionForPagination(vm.manufaturersTableOptions, objectPageEnum.manufacturerPage);
              } else if (vm.sourcingName == 'Suppliers') {
                vm.supplierTableOptions.data = response.data.map((row) => {
                  if (row.approved) {
                    row.approved = capitalizefirstAndLowerRest(row.approved);
                  }
                  return row;
                });
                fuseUtils.handleAllOptionForPagination(vm.supplierTableOptions, objectPageEnum.supplierPage);
              } else if (vm.sourcingName == 'Supplier Parts') {
                vm.supplierPartsTableOptions.data = response.data.map((row) => {
                  if (row.isAvailable) {
                    row.isAvailable = capitalizefirstAndLowerRest(row.isAvailable);
                  }
                  return row;
                });
                fuseUtils.handleAllOptionForPagination(vm.supplierPartsTableOptions, objectPageEnum.supplierPartsPage);
              } else if (vm.sourcingName == 'Manufacturer Parts') {
                vm.manufacturerPartsTableOptions.data = response.data;
                fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.manufacturerPartsPage);
              }
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
          console.log(response.message);
        });
    }

    /**
     *
     * @param func - the function to be executed after the timout
     * @param args [] - array of arguments to passed to a function
     * @param timeout - {number}
     */
    function delayFuncCall(func, args, timeout) {
      setTimeout(function () {
        func.apply(null, args);
      }, timeout);
    }

    function getallsourceobjectcount(sourcetype) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          sourceType: sourcetype
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          sourceType: sourcetype
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallsourceobjectcount, params, '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.sourceCount = response.data;
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

    function extendSourcing(val) {
      if (!_.isEmpty(val.sourceObjectResponses)) {
        val = _.merge(val, val.sourceObjectResponses);
      }
      if (!_.isEmpty(val.sourcingObjectResponses)) {
        val = _.merge(val, val.sourcingObjectResponses);
      }
      val.tags = val.tags.join(', ');
      val.additionalInfoList.forEach(function (additionalInfoItem) {
        val[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });
      if (val.contactList && val.contactList[0]) {
        val.contactsName = val.contactList[0].name;
        val.contactsTitle = val.contactList[0].title;
        val.contactsEmail = val.contactList[0].email;
        val.contactsNumber = val.contactList[0].contactNumber;
        val.contactsAddress = val.contactList[0].address;
      }
      if (vm.sourcingName == 'Manufacturers') {
        val.objectType = 'manufacturer';
      } else if (vm.sourcingName == 'Suppliers') {
        val.objectType = 'supplier';
      } else if (vm.sourcingName == 'Supplier Parts') {
        val.objectType = 'supplierPart';
      } else if (vm.sourcingName == 'Manufacturer Parts') {
        val.objectType = 'manufacturerPart';
      }
      if (!_.isEmpty(val.costDetail)) {
        val.cost = val.costDetail[0].cost;
        val.currency = val.costDetail[0].currency;
        val.orderQuantity = val.costDetail[0].moq;
      }
      if (val.website && !/^https?:\/\//i.test(val.website)) {
        val.website = 'http://' + val.website;
      }
      if (val.sourcingObjectHistory) {
        let creator = _.find(vm.allUsers, {userId: val.sourcingObjectHistory.createdBy});
        let editor = _.find(vm.allUsers, {userId: val.sourcingObjectHistory.modifiedBy});
        val.createdBy = creator ? creator.firstName + " " + creator.lastName : '';
        val.modifiedBy = editor ? editor.firstName + " " + editor.lastName : '';
        val.createDate = $filter('date')(val.sourcingObjectHistory.createDate, "medium");
        val.modifiedDate = $filter('date')(val.sourcingObjectHistory.modifiedDate, "medium");
        val.revisionNotes = val.sourcingObjectHistory.revisionNotes;
      }
      if (val.sourceObjectHistory) {
        let creator = _.find(vm.allUsers, {userId: val.sourceObjectHistory.createdBy});
        let editor = _.find(vm.allUsers, {userId: val.sourceObjectHistory.modifiedBy});
        val.createdBy = creator ? creator.firstName + " " + creator.lastName : '';
        val.modifiedBy = editor ? editor.firstName + " " + editor.lastName : '';
        val.createDate = $filter('date')(val.sourceObjectHistory.createDate, "medium");
        val.modifiedDate = $filter('date')(val.sourceObjectHistory.modifiedDate, "medium");
        val.revisionNotes = val.sourceObjectHistory.revisionNotes;
      }

    }

    function editTable(ev, flag) {
      $mdDialog.show({
        controller: 'EditTableController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/edittable.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          pageType: flag,
          whereIsRevisionFrom: '',
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function () {
        if (objectPageEnum.manufacturerPage === flag) {
          vm.manufaturersTableOptions.initialized = false;
          vm.manufaturersTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufaturersTableUiGrid, manufacturerId, flag);
        } else if (objectPageEnum.supplierPage === flag) {
          vm.supplierTableOptions.initialized = false;
          vm.supplierTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierTableUiGrid, supplierId, flag);
        } else if (objectPageEnum.manufacturerPartsPage === flag) {
          vm.manufacturerPartsTableOptions.initialized = false;
          vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, flag);
        } else if (objectPageEnum.supplierPartsPage === flag) {
          vm.supplierPartsTableOptions.initialized = false;
          vm.supplierPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierPartsTableUiGrid, supplierPartsId, flag);
        }
      }, function () {

      });
    }


    function getAttributes(type) {
      var obj = {};
      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", type));
      var attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", type));
      var attributesContacts = localStorage.getItem(fuseUtils.buildAttributeName("attributesContacts", type));
      var attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", type));
      var attributesCost = localStorage.getItem(fuseUtils.buildAttributeName("attributesCost", type));
      var attributesObjectHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", type));

      var parsedBasicAttributes = angular.fromJson(attributesBasic);

      if (attributesBasic && attributesBasic != 'undefined' &&
        (_.find(parsedBasicAttributes, {name: 'Packaging'}) || type == objectPageEnum.manufacturerPage || type == objectPageEnum.supplierPage) &&
        (_.find(parsedBasicAttributes, {name: 'Website'}) || type == objectPageEnum.manufacturerPartsPage || type == objectPageEnum.supplierPartsPage) &&
        _.find(parsedBasicAttributes, {value: 'hasAttachments'})) {

        obj.basicInfo = parsedBasicAttributes;
      } else {
        if (type == objectPageEnum.manufacturerPage) {

          obj.basicInfo = attributesUtils.getManufacturerBasicAttributes();

        } else if (type == objectPageEnum.supplierPage) {

          obj.basicInfo = attributesUtils.getSupplierBasicAttributes();

        } else if (type == objectPageEnum.manufacturerPartsPage) {

          obj.basicInfo = attributesUtils.getManufacturerPartsBasicAttributes();

        } else if (type == objectPageEnum.supplierPartsPage) {

          obj.basicInfo = attributesUtils.getSupplierPartsBasicAttributes();
        }

        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", type), JSON.stringify(obj.basicInfo));
      }
      if (attributesContacts && attributesContacts != 'undefined') {
        obj.contacts = angular.fromJson(attributesContacts);
      }
      if (attributesInventory && attributesInventory != 'undefined') {
        obj.inventory = angular.fromJson(attributesInventory);
      }
      if (attributesCost && attributesCost != 'undefined') {
        obj.cost = angular.fromJson(attributesCost);
      } else {
        obj.cost = attributesUtils.getSupplierManufacturerPartsCostAttributes();
      }
      if (attributesAdditional && attributesAdditional != 'undefined') {
        obj.additional = angular.fromJson(attributesAdditional);
      }
      if (attributesObjectHistory) {
        obj.objectHistory = angular.fromJson(attributesObjectHistory);
      }

      return obj;
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function buildTableColumns(type) {
      var attributes = getAttributes(type);
      var arr = [];
      if (type == objectPageEnum.manufacturerPage || type == objectPageEnum.manufacturerPartsPage) {
        arr = angular.copy(attributesUtils.getBasicSourcingManufacturerPageAttributes());
      } else {
        arr = angular.copy(attributesUtils.getBasicSourcingSupplierPageAttributes());
      }

      if (attributes.basicInfo) {
        angular.forEach((attributes.basicInfo || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value === 'objectName' || o.value === 'name') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/object-name-cell.html';
            }
            if (o.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }
            if (o.value === 'associatedCardsList') {
              return;
            }
            if (o.value === 'leadTime') {
              colDef.sortingAlgorithm = fuseUtils.sortLeadTime;
            }
            arr.push(colDef);
          }
        });
      }

      if (attributes.additional) {
        angular.forEach((attributes.additional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            }

            arr.push(colDef);
          }
        });
      }

      if (type == objectPageEnum.manufacturerPage || type == objectPageEnum.supplierPage) {
        if (attributes.contacts && attributes.contacts[0].value == 'contactsName') {
          angular.forEach((attributes.contacts || []), function (o, i) {
            if (o.displayed) {
              arr.push(fuseUtils.parseAttributes(o));
            }
          });
        } else {
          localStorage.removeItem(fuseUtils.buildAttributeName("attributesContacts", type));
        }
      } else {
        if (attributes.inventory) {
          angular.forEach((attributes.inventory || []), function (o, i) {
            if (o.displayed) {
              let colDef = fuseUtils.parseAttributes(o);
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              arr.push(colDef);
            }
          });
        }
        if (attributes.cost) {
          angular.forEach((attributes.cost || []), function (o, i) {
            if (o.displayed) {
              let colDef = fuseUtils.parseAttributes(o);
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              arr.push(colDef);
            }
          });
        }
      }
      if (attributes.objectHistory) {
        angular.forEach((attributes.objectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    $scope.$watch(() => {
      if (vm.selectedTabs === 0) {
        const gridElem = document.getElementById('grid-manufacturers');
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 198}px`;
        }
      }
      if (vm.selectedTabs === 1) {
        const gridElem = document.getElementById('grid-manufacturer-parts');
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 198}px`;
        }
      }
      if (vm.selectedTabs === 2) {
        const gridElem = document.getElementById('grid-supplier');
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 198}px`;
        }
      }
      if (vm.selectedTabs === 3) {
        const gridElem = document.getElementById('grid-supplier-parts');
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 198}px`;
        }
      }

    });

    vm.manufaturersTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.manufaturersTableOptions.exporterFieldCallback = exporterCallbackService.mainTable;
    vm.manufaturersTableOptions.enableRowSelection = true;
    vm.manufaturersTableOptions.enableSelectAll = true;
    vm.manufaturersTableOptions.multiSelect = true;
    vm.manufaturersTableOptions.rowTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html';
    vm.manufaturersTableOptions.columnDefs = buildTableColumns(objectPageEnum.manufacturerPage);
    vm.manufaturersTableOptions.exporterSuppressColumns = ['manufacturerId'];
    vm.manufaturersTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.manufaturersTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.manufaturersTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.manufacturerPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.manufacturerPage);
        }
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelManufacturers = $('#grid-manufacturers .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.manufaturersTableOptions.columnDefs, 0, null, vm.manufaturersTableUiGrid);
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.manufaturersTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.manufaturersTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.manufaturersTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
      });
      vm.manufaturersTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.manufaturersTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.manufaturersTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.manufaturersTableOptions.data.length > 0) && !vm.manufaturersTableOptions.initialized) {
          $timeout(function () {
            vm.manufaturersTableOptions.initialized = true;
          });
        }
        showClearButton(vm.manufaturersTableUiGrid);
        vm.heightTopPanelManufacturers = $('#grid-manufacturers .ui-grid-top-panel').height();
      });
      vm.manufaturersTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
        selectedRows = _.filter(vm.manufaturersTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

      vm.manufaturersTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
        selectedRows = _.filter(vm.manufaturersTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

      restoreState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.manufacturerPage);
    };

    vm.supplierTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.supplierTableOptions.exporterFieldCallback = exporterCallbackService.mainTable;
    vm.supplierTableOptions.enableRowSelection = true;
    vm.supplierTableOptions.enableSelectAll = true;
    vm.supplierTableOptions.multiSelect = true;
    vm.supplierTableOptions.rowTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html';
    vm.supplierTableOptions.columnDefs = buildTableColumns(objectPageEnum.supplierPage);
    vm.supplierTableOptions.exporterSuppressColumns = ['supplierId'];
    vm.supplierTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.supplierTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.supplierTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.supplierPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.supplierPage);
        }
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelSupplier = $('#grid-supplier .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.supplierTableOptions.columnDefs, 4, null, vm.supplierTableUiGrid);
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.supplierTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.supplierTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.supplierTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.supplierPage);
      });
      vm.supplierTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.supplierTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.supplierTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.supplierTableOptions.data.length > 0) && !vm.supplierTableOptions.initialized) {
          $timeout(function () {
            vm.supplierTableOptions.initialized = true;
          });
        }
        showClearButton(vm.supplierTableUiGrid);
        vm.heightTopPanelSupplier = $('#grid-supplier .ui-grid-top-panel').height();
      });
      vm.supplierTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
        selectedRows = _.filter(vm.supplierTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

      vm.supplierTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
        selectedRows = _.filter(vm.supplierTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

    };

    vm.manufacturerPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.manufacturerPartsTableOptions.exporterFieldCallback = exporterCallbackService.mainTable;
    vm.manufacturerPartsTableOptions.enableRowSelection = true;
    vm.manufacturerPartsTableOptions.enableSelectAll = true;
    vm.manufacturerPartsTableOptions.multiSelect = true;
    vm.manufacturerPartsTableOptions.rowTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html';
    vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.manufacturerPartsPage);
    vm.manufacturerPartsTableOptions.exporterSuppressColumns = ['manufacturerId'];
    vm.manufacturerPartsTableOptions.exporterOlderExcelCompatibility = true;
    vm.manufacturerPartsTableOptions.exporterCsvFilename = 'Manufacture partslist.csv';

    vm.manufacturerPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.manufacturerPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.manufacturerPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.manufacturerPartsPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.manufacturerPartsPage);
        }
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelManufacturerParts = $('#grid-manufacturer-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 2, null, vm.manufacturerPartsTableUiGrid);
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.manufacturerPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.manufacturerPartsTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.manufacturerPartsTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.manufacturerPartsPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.manufacturerPartsTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.manufacturerPartsTableOptions.data.length > 0) && !vm.manufacturerPartsTableOptions.initialized) {
          $timeout(function () {
            vm.manufacturerPartsTableOptions.initialized = true;
          });
        }
        showClearButton(vm.manufacturerPartsTableUiGrid);
        vm.heightTopPanelManufacturerParts = $('#grid-manufacturer-parts .ui-grid-top-panel').height();
      });
      vm.manufacturerPartsTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
        selectedRows = _.filter(vm.manufacturerPartsTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

      vm.manufacturerPartsTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
        selectedRows = _.filter(vm.manufacturerPartsTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });
    };

    vm.supplierPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.supplierPartsTableOptions.exporterFieldCallback = exporterCallbackService.mainTable;
    vm.supplierPartsTableOptions.enableRowSelection = true;
    vm.supplierPartsTableOptions.enableSelectAll = true;
    vm.supplierPartsTableOptions.multiSelect = true;
    vm.supplierPartsTableOptions.rowTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html';
    vm.supplierPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.supplierPartsPage);
    vm.supplierPartsTableOptions.exporterSuppressColumns = ['supplierId'];
    vm.supplierPartsTableOptions.exporterOlderExcelCompatibility = true;
    vm.supplierPartsTableOptions.exporterCsvFilename = 'Supplier partslist.csv';

    vm.supplierPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.supplierPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.supplierPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.supplierPartsPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.supplierPartsPage);
        }
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelSupplierParts = $('#grid-supplier-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 6, null, vm.supplierPartsTableUiGrid);
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.supplierPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.supplierPartsTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.supplierPartsTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.supplierPartsPage);
      });
      vm.supplierPartsTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.supplierPartsTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.supplierPartsTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.supplierPartsTableOptions.data.length > 0) && !vm.supplierPartsTableOptions.initialized) {
          $timeout(function () {
            vm.supplierPartsTableOptions.initialized = true;
          });
        }
        showClearButton(vm.supplierPartsTableUiGrid);
        vm.heightTopPanelSupplierParts = $('#grid-supplier-parts .ui-grid-top-panel').height();
      });
      vm.supplierPartsTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
        selectedRows = _.filter(vm.supplierPartsTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

      vm.supplierPartsTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
        selectedRows = _.filter(vm.supplierPartsTableUiGrid.selection.getSelectedRows(), function (o) {
          return !o.sourcingChildren
        });
      });

    };

    function saveState(grid, id, type) {
      var state = grid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName(id, type), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState(grid, id, type) {
      if (!grid) {
        return;
      }
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName(id, type));
        state = state ? angular.fromJson(state) : null;

        if (type === objectPageEnum.manufacturerPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.manufaturersTableOptions.columnDefs, 0, null, vm.manufaturersTableUiGrid);
        } else if (type === objectPageEnum.manufacturerPartsPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 2, null, vm.manufacturerPartsTableUiGrid);
        } else if (type === objectPageEnum.supplierPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.supplierTableOptions.columnDefs, 4, null, vm.supplierTableUiGrid);
        } else if (type === objectPageEnum.supplierPartsPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 6, null, vm.supplierPartsTableUiGrid);
        }

        if (!state) {
          return;
        }

        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, type);
          state.pagination.paginationPageSize = 100;
        }

        if (state) grid.saveState.restore($scope, state);

      });
    }

    const matcherTableOptions = {
      mfr: vm.manufacturerPartsTableOptions,
      supp: vm.supplierPartsTableOptions,
      Suppliers: vm.supplierTableOptions,
      Manufacturers: vm.manufaturersTableOptions
    };

    function deleteItems(type) {
      bulkDelete.deleteItems(selectedRows);
      helpSettingService.getData().then(function (arr) {
        vm.sourceCount -= (arr && arr.length) || 0;
        bulkDelete.removeRows(matcherTableOptions[type].data, arr);
        bulkDelete.removeRows(selectedRows, arr);
        matcherTableOptions[type].totalParentItems = matcherTableOptions[type].data.length;
        type = type === 'mfr' ? 'Manufacturer Parts' : type === 'supp' ? 'Supplier Parts' : type;
        vm.mfrPartsFlag = false;
        vm.suppFlag = false;
        vm.suppPartsFlag = false;
        tabSourcing(type, true);
      });
    }

    function getSelectedRows() {
      return selectedRows;
    }

    function showClearButton(gridApi) {
      if (vm.sourcingName === 'Manufacturers') {
        vm.clearButtonManufacturer = false;
        vm.clearButtonManufacturer = fuseUtils.buttonForClear(gridApi, vm.clearButtonManufacturer);
      } else if (vm.sourcingName === 'Suppliers') {
        vm.clearButtonSupplier = false;
        vm.clearButtonSupplier = fuseUtils.buttonForClear(gridApi, vm.clearButtonSupplier);
      } else if (vm.sourcingName === 'Manufacturer Parts') {
        vm.clearButtonManufacturerParts = false;
        vm.clearButtonManufacturerParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonManufacturerParts);
      } else if (vm.sourcingName === 'Supplier Parts') {
        vm.clearButtonSupplierParts = false;
        vm.clearButtonSupplierParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonSupplierParts);
      }
    }

    function changesearchtext(e, type) {
      if (!angular.isUndefined(e)) {
        if (e.keyCode === 13) {
          if (vm.keyword != '') {
            if (type == 'Manufacturers') {
              type = 'manufacturer';
            } else if (type == 'Manufacturer Parts') {
              type = 'manufacturerPart';
            } else if (type == 'Suppliers') {
              type = 'supplier';
            } else {
              type = 'supplierPart';
            }
            getDataBySearch(type);
          }
        }
      }
    }

    function clearSearch(type) {
      vm.keyword = '';
      if (type == 'Manufacturers' || type == 'Manufacturer Parts') {
        type = 'mfr';
      } else {
        type = 'supp';
      }
      initManufacturesSuppliers(type);
    }

    function getDataBySearch(type) {
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          keyword: vm.keyword,
          searchType: type
        };
      } else {
        params = {
          keyword: vm.keyword,
          searchType: type
        };
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, {}, headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function (value) {
                extendSourcing(value);
              });
              response.data = _.filter(response.data, ['objectType', type]);
              response.data = _.uniqBy(response.data, 'objectId');
              setGridData(response.data, type);
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
    }

    function setGridData(arr, type) {
      if (type == 'manufacturer') {
        vm.manufaturersTableOptions.data = arr;
        fuseUtils.handleAllOptionForPagination(vm.manufaturersTableOptions, objectPageEnum.manufacturerPage);
      } else if (type == 'manufacturerPart') {
        vm.manufacturerPartsTableOptions.data = arr;
        fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.manufacturerPartsPage);
      } else if (type == 'supplier') {
        vm.supplierTableOptions.data = arr;
        fuseUtils.handleAllOptionForPagination(vm.supplierTableOptions, objectPageEnum.supplierPage);
      } else {
        vm.supplierPartsTableOptions.data = arr;
        fuseUtils.handleAllOptionForPagination(vm.supplierPartsTableOptions, objectPageEnum.supplierPartsPage);
      }
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function capitalizefirstAndLowerRest(string) {
      const lower = string.toLowerCase();
      return lower[0].toUpperCase() + lower.slice(1);
    }

  }

})();
