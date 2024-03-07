(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('BomController', BomController);

  /** @ngInject */
  function BomController($state, $location, $filter, $mdMenu, BomService,
                         msUtils, $stateParams, $mdDialog, $document, hostUrlDevelopment,
                         uiGridTreeBaseService, CustomerService, helpSettingService, clipboardService,
                         errors, $mdToast, AuthService, DialogService, GlobalSettingsService,
                         $scope, $timeout, $rootScope, $window, uiGridExporterConstants, uiGridExporterService, uiGridPinningConstants,
                         objectPageEnum, $q, fuseUtils, attributesUtils, sourcingUtils,
                         BoardService, defaultTemplateService, templatesProcessingService, helperData, objectsCompareService,
                         currencyExchangeService, sourceCostService, fuseType, UserActionStoryStorage,
                         partCostService, flatViewService, localstorageCheckingService, algorithmsService, uiGridGridMenuService, bulkDelete) {

    var vm = this;
    vm.objectPageEnum = objectPageEnum;
    vm.fuseUtils = fuseUtils;
    vm.sourcingUtils = sourcingUtils;
    vm.helperData = helperData;
    vm.linkTarget = '_self';

    /**
     * Sourcing Tab Configuration
     * @type {Array}
     */
    vm.flatViewProgressBar = false;
    vm.hierarchicalViewProgressBar = false;
    vm.sourcingViewProgressBar = false;

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    vm.targetQuatity = 1;
    vm.appliedQuantity = 1;
    vm.unitCostValue = "";
    vm.flatViewNodes = {};
    vm.costAttrinute = null;
    vm.flatViewBasicAttrinutes = null;
    vm.flatViewAdditionalAttrinutes = null;
    vm.lastLevelLoaded = 0;
    vm.clipboardService = clipboardService;
    let selectedRows = [];

    var tooltipHeaderTemplates = 'app/main/apps/objects/parts/tabs/bill-of-materials/column-templates/md-tooltip-header.html';
    var dollarCellRenderer = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/cost-render-cell-template.html';
    var zeroCellRenderer = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/zero-render-cell-template.html';

    vm.error = errors;
    vm.progress = false;
    var params = '';
    var data = '';
    vm.changeConfiguration = changeConfiguration;
    vm.setGridHeight = setGridHeight;
    var selectedRowsFlatView = [];

    vm.defualtValue = 'affected';
    vm.changeItems = [];

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    angular.forEach(vm.sessionData.userRoleSet, function (value, key) {
      if (value === 'read_only') {
        vm.readonly = true;
        vm.SaveDisabled = true;
        vm.DeleteDisalbed = true;
      } else {
        vm.readonly = false;
        vm.SaveDisabled = false;
        vm.DeleteDisalbed = false;
      }
    });

    $scope.$watch(() => {
      if (vm.bomTab === 'hierarchical') {
        const gridElem = document.getElementById('grid-hierarchical');
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 275}px`;
        }
      }
    });

    $scope.$watch('vm.bomTab', (old) => {
      if (old === 'flat' && vm.maxLevel === 0) {
        CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbomlevel, {
          objectId: id
        })
          .then( response => {
            let value = response.data.level;
            vm.maxLevel = response.data.level;
            if (vm.lastLevelLoaded < value) {
              init(value, false, null, null, true);
            }
          });
      }
    });

    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    var id = $stateParams.id;
    vm.id = id;
    vm.manufactures = [];
    vm.supplier = [];
    vm.timeline = [];
    vm.boms = [];
    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';
    vm.productsassociatedCardList = [];
    vm.whereUsedIncrementRevision = [];
    vm.allUsers = [];
    vm.currencySetting = '$';
    vm.currencyDecimalSetting = 'No Limit';
    vm.priceBreakNames = [];
    vm.priceBreakSetting = false;
    vm.bomFlag = true;
    vm.selectTabsBOM = '';
    vm.selectTabsRev = '';
    vm.isFlatVisited = false;
    vm.leftSideProgress = false;
    var tabs = {
      HIERARCHICAL_TAB_INDEX: 0,
      FLAT_VIEW_TAB_INDEX: 1
    };
    vm.selectedBomTab = tabs.HIERARCHICAL_TAB_INDEX;

    function callSelecttionTab(configSettings) {
      if (configSettings) {
        vm.selectTabsBOM = 6;
        vm.selectTabsRev = 3;
        if ($rootScope.tabFlag) {
          vm.selectedTab = 3;
          $rootScope.$on('$locationChangeStart', function () {
            vm.selectedTab = 0;
          });
        }
      } else {
        vm.selectTabsBOM = 5;
        vm.selectTabsRev = 3;
        if ($rootScope.tabFlag) {
          vm.selectedTab = 2;
          $rootScope.$on('$locationChangeStart', function () {
            vm.selectedTab = 0;
          });
        }
      }
    }

    vm.bomTab = 'hierarchical';
    vm.allPartsFlag = false;
    vm.flatPartsFlag = false;
    var originalBoms = {
      hierarchical: [],
      sourcing: [],
      flat: [],
      flatRows: []
    };

    vm.calculateFlatView = calculateFlatView;
    vm.openCardDialog = DialogService.openCardDialog;
    vm.addNewComment = addNewComment;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    vm.importBOMFunction = importBOMFunction;
    vm.backFunction = backFunction;
    vm.OpenLinkFunction = OpenLinkFunction;
    vm.hasSourcingRecord = hasSourcingRecord;
    vm.onPaginate = onPaginate;
    vm.onFlatViewPaginate = onFlatViewPaginate;
    vm.onHierarchicalPaginate = onHierarchicalPaginate;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.openClipboardTable = openClipboardTable;
    vm.buildHierarchicalGridColumns = buildHierarchicalGridColumns;
    vm.buildFlatViewGridColumns = buildFlatViewGridColumns;

    /* Change Items */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.changeItemsIDQuerySearch = changeItemsIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.numberInteger = numberInteger;
    $scope.onlyNumbers = /^\d+$/;
    vm.editTable = editTable;
    vm.printTable = printTable;
    vm.downloadTable = downloadTable;
    vm.clearFilters = clearFilters;
    vm.initAttributes = initAttributes;
    vm.calculateAfterChangingCostType = calculateAfterChangingCostType;
    vm.calculateAll = calculateAll;
    vm.tabSearch = tabSearch;
    vm.toggleSourcingGridRow = toggleSourcingGridRow;
    vm.resetToDefault = resetToDefault;
    vm.calculateFlatRows = calculateFlatRows;
    vm.removeQuantitiesFlatView = removeQuantitiesFlatView;
    vm.setSourceCosts = setSourceCosts;
    vm.deleteBOMParts = deleteBOMParts;
    vm.deleteItems = deleteItems;
    vm.getSelectedRows = getSelectedRows;

    vm.setHeightImg = setHeightImg;

    vm.getObjectId = getObjectId;

    vm.parseFloatToFixed = parseFloatToFixed;

    getEnvironMentData()
      .then(function (result) {
        init();
      })
      .catch(function (err) {
        $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        console.error(err);
      });

    function getEnvironMentData() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, params, '', header)
        .then(function (response) {
          processGetAllUsers(response);
          processProxyDetails();

          return new Promise(function (resolve, reject) {
            resolve('done');
          })
        })
    }

    function numberInteger(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }

    function setBomTabSelect(configSetting) {
      if (configSetting) {
        if ($location.url().substring($location.url().indexOf('bom')) == 'bom') {
          vm.selectedTab = 6;
          vm.calculateFlatView();
        }
      } else {
        if ($location.url().substring($location.url().indexOf('bom')) == 'bom') {
          vm.selectedTab = 5;
          vm.calculateFlatView();
        }
      }
    }

    function getSelectedRows() {
      return selectedRows;
    }

    function deleteItems() {
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        const confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure want to edit?',
          ariaLabel: 'delete fuse object Bill of Material',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          bulkDelete.deleteItems(selectedRows, true);
          helpSettingService.getData().then(function (arr) {
            vm.sourceCount -= (arr && arr.length) || 0;
            bulkDelete.removeRows(vm.hierarchicalGridOptions.data, arr);
            bulkDelete.removeRows(selectedRows, arr);
            vm.hierarchicalGridOptions.totalParentItems = vm.hierarchicalGridOptions.data.length;
            init();
          })
        });
      } else {
        bulkDelete.deleteItems(selectedRows, true);
        helpSettingService.getData().then(function (arr) {
          vm.sourceCount -= (arr && arr.length) || 0;
          bulkDelete.removeRows(vm.hierarchicalGridOptions.data, arr);
          bulkDelete.removeRows(selectedRows, arr);
          vm.hierarchicalGridOptions.totalParentItems = vm.hierarchicalGridOptions.data.length;
          init();
        })
      }
    }

    function editTable(ev, flag) {
      if (vm.flatViewGrid) {
        saveFlatViewState();
      }
      saveState();
      var oldTableColumns = copyTableColumns(flag);
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
          User: vm.user,
          Contacts: vm.contacts,
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function (data) {

        vm.flatViewProgressBar = true;
        vm.hierarchicalViewProgressBar = true;
        vm.sourcingViewProgressBar = true;

        if (vm.bomTab === 'hierarchical') {
          vm.hierarchicalGridOptions.initialized = false;
          vm.hierarchicalGridOptions.columnDefs = buildHierarchicalGridColumns(initAttributes(vm.objectPageEnum.heirarchicalPage));
          restoreState();
        }
        if (vm.bomTab === 'flat') {
          vm.flatViewGridOptions.initialized = false;
          vm.flatViewGridOptions.columnDefs = buildFlatViewGridColumns(initAttributes(vm.objectPageEnum.flatPage));
          restoreFlatViewState();
        }

        if (!checkColumnsEquality(oldTableColumns, copyTableColumns(flag))) {
          templatesProcessingService.setAppliedTemplateId(flag);
        }
        $timeout(function () {
          vm.flatViewProgressBar = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
        }, 100);

      }, function () {
      });
    }

    function checkColumnsEquality(oldCols, newCols) {
      for (var i = 0; i < Math.max(oldCols.length, newCols.length); i++) {
        if (!newCols[i] || !oldCols[i] || oldCols[i].field !== newCols[i].field) {
          return false;
        }
      }
      return true;
    }

    function copyTableColumns(pageType) {
      if (pageType === objectPageEnum.heirarchicalPage) {
        return angular.copy(vm.hierarchicalGridOptions.columnDefs);
      } else if (pageType === objectPageEnum.flatPage) {
        return angular.copy(vm.flatViewGridOptions.columnDefs);
      } else {
        throw new Error('wrong page type passed');
      }
    }

    function addScrollToPinnedIfNeccessary(type) {
      $timeout(function () {
        if (type == "hierarchical") {
          var tableNotPinned = $("#grid-hierarchical .ui-grid-viewport")[1];
          var tablePinned = $("#grid-hierarchical .ui-grid-viewport")[0];
        } else if (type == "sourcing") {
          var tableNotPinned = $("#grid-sourcing .ui-grid-viewport")[1];
          var tablePinned = $("#grid-sourcing .ui-grid-viewport")[0];
        }

        if (!tableNotPinned) {
          return;
        }

        if (tableNotPinned.scrollWidth > tableNotPinned.offsetWidth) {
          tablePinned.classList.add('overflow-x-scroll');
        } else {
          tablePinned.classList.remove('overflow-x-scroll');
        }
      })
    }

    function printTable(id, obj, rev, txt) {
      var divToPrint = document.getElementById(id);
      var newWin = window.open("");
      var now = new Date();
      var dateFormat = moment(now).format('MMMM Do YYYY, h:mm:ss A');
      newWin.document.write('<html><head><title>' + obj + ', Revision ' + rev + ' - ' + txt + '</title>' + '<style>@page { size: auto;  margin: 0mm; }</style>' +
        '</head><body>' + '<div style="padding: 5px;">' + dateFormat + '<span style="left: 40%; position: absolute;">' + obj + ', Revision ' + rev + ' - ' + txt + '</span>' + '</div>' + divToPrint.outerHTML + '</body></html>');
      newWin.print();
      newWin.close();
    }

    function onPaginate(page, limit) {

      vm.promise = $timeout(function () {

      }, 2000);
    }

    function onFlatViewPaginate(page, limit) {

      vm.promise = $timeout(function () {

      }, 2000);
    }

    $rootScope.$on('updateBOM', () => {
      init();
    });

    function onHierarchicalPaginate(page, limit) {

      vm.hierarchicalPromise = $timeout(function () {

      }, 2000);
    }

    /**
     * validate sourcing record existance
     * @param sourceList
     * @returns {boolean} - true - exist , false - not exist
     */
    function hasSourcingRecord(sourceList) {
      sourceList = sourceList || [];
      if (sourceList.length > 0) {
        return true;
      }
      return false;
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    function initAttributes(pageType) {
      var sections = {};

      var basicInfoAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasicBOM", pageType)),
        inventoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventoryBOM", pageType)),
        additionalAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditionalBOM", pageType)),
        mfrPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturerBOM", pageType)),
        suppPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplierBOM", pageType)),
        objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistoryBOM", pageType));

      if (localstorageCheckingService.isLocalStorageValid({
        basicInfo: basicInfoAttributes,
        isConfigEnabled: vm.configurationSettings,
        pageType: pageType
      }) && basicInfoAttributes.indexOf('isLatest') !== -1) {
        sections.attrBasicBOM = JSON.parse(basicInfoAttributes);
      } else {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasicBOM", pageType));
        if (pageType === 'heirarchical')
          localStorage.removeItem("gridState");

        if (pageType === 'flat') {
          localStorage.removeItem("gridFlatViewState");
        }

        sections.attrBasicBOM = attributesUtils.getBOMBasicAttributes();
        if (pageType === vm.objectPageEnum.heirarchicalPage || pageType === vm.objectPageEnum.flatPage) {
          var extendCostObj = _.find(sections.attrBasicBOM, ['value', 'extendedCost']);
          extendCostObj.displayed = true;
        }
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasicBOM", pageType), JSON.stringify(sections.attrBasicBOM));
      }

      if (inventoryAttributes != 'undefined' && inventoryAttributes != null) {
        sections.attrInventoryBOM = JSON.parse(inventoryAttributes);
      } else {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventoryBOM", pageType));
        sections.attrInventoryBOM = attributesUtils.getBomInventory();

        if (pageType === vm.objectPageEnum.flatPage) {
          sections.attrInventoryBOM.forEach(function (o) {
            o.displayed = true;
          })
        }

        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventoryBOM", pageType), JSON.stringify(sections.attrInventoryBOM));
      }

      if (additionalAttributes != 'undefined' && additionalAttributes != null) {
        sections.attrAdditionalBOM = JSON.parse(additionalAttributes);
      }

      if (mfrPartsAttributes != 'undefined' && mfrPartsAttributes != null) {
        sections.mfrParts = JSON.parse(mfrPartsAttributes);
      }

      if (suppPartsAttributes != 'undefined' && suppPartsAttributes != null) {
        sections.suppParts = JSON.parse(suppPartsAttributes);
      }

      if (objectHistoryAttributes != 'undefined' && objectHistoryAttributes != null) {
        sections.attrObjectHistoryBOM = JSON.parse(objectHistoryAttributes);
      }

      if (pageType === vm.objectPageEnum.flatPage) {
        sections.attrAdditionalBOM = (sections.attrAdditionalBOM || []).filter(function (o) {
          return (o.objectType === "products" || o.objectType === "parts");
        });
      }
      return sections;
    }

    function getExtendedBomObject(bom) {

      bom.refDocs = ((bom.referenceDesignator || []).length > 0) ? bom.referenceDesignator.join(',') : '';

      if (bom.fuseCost != null && bom.fuseCost != undefined && bom.fuseCost != "") {
        bom.fuseCost = vm.currencySetting + ' ' + bom.fuseCost;
      } else {
        bom.fuseCost = "";
      }

      if (bom.costDetail && bom.costDetail.costSetting === helperData.backendRollupCostId) {
        bom.costType = helperData.rollupCostId;
      } else {
        bom.costType = bom.costDetail.costSetting;
      }
      if (bom.hasBOM) {
        bom.hasBOM = 'Yes';
      } else {
        bom.hasBOM = 'No';
      }
      if (vm.products.fuseObjectNumberSetting.enableMinorRev) {
        bom.revision = bom.revision + '.' + bom.minorRevision;
      }
      bom.associatedCardsList = bom.associatedCardList;
      bom.tags = bom.tags.join(', ');
      bom.projectNames = bom.projectNames.join(', ');
      bom.additionalInfoList.forEach(function (additionalInfoItem) {
        bom[_.camelCase(additionalInfoItem.attributeKey)] = additionalInfoItem.attributeValue;
      });
      bom.breakCost = angular.copy(vm.priceBreakNames);
      if (bom.breakCost && vm.priceBreakSetting) {
        _.forIn(bom.breakCost, function (o) {
          _.forIn(bom.costDetail.breakCost, function (obj, key) {
            if (key == o.id) {
              o.cost = obj;
            }
          });
          if (o.id == 'M') {
            o.cost = bom.costDetail.manualCost;
          }
          if (o.id === helperData.rollupCostId) {
            o.cost = bom.costDetail.rollupCost;
          }
        });
      }
      if (bom.fuseObjectHistory) {
        var creator = _.find(vm.allUsers, {
          userId: bom.fuseObjectHistory.createdBy
        });
        var editor = _.find(vm.allUsers, {
          userId: bom.fuseObjectHistory.modifiedBy
        });
        bom.createdBy = creator ? (creator.firstName + " " + creator.lastName) : '';
        bom.modifiedBy = editor ? (editor.firstName + " " + editor.lastName) : '';
        bom.modifiedDate = $filter('date')(bom.fuseObjectHistory.modifiedDate, "medium");
        bom.createDate = $filter('date')(bom.fuseObjectHistory.createDate, "medium");
        bom.revisionNotes = bom.fuseObjectHistory.revisionNotes;
      }

      _.forEach(bom.breakCost, value => {
        if (!bom.costDetail.breakCost) {
          value.cost = 0;
        }
      });

      bom.breakCost = setCostDetail(bom.breakCost, bom.costDetail.manualCost, bom.costDetail.rollupCost);
      bom.breakCost = parsePriseBreak(bom.breakCost);

      sourcingUtils.extendSourcingData(bom);

      return bom;
    }

    // update time line after remove quantities from inventory.
    $rootScope.$on('updateTimeLIne', function (event, data) {
      vm.timeline = transformJsonTimeLine(data.timeLineList);
      $rootScope.$emit('updateTimeline', data);
    });

    // call BOM Dialog to BOM.
    $rootScope.$on('invokePartInitializeShit', function () {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectId: id
        };
      } else {

        params = {
          fuseObjectId: id
        };
      }
      vm.hierarchicalViewProgressBar = true;
      vm.sourcingViewProgressBar = true;

      vm.sessionData = {};
      vm.sessionData = AuthService.getSessionData('customerData');

      var headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', headers)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdDialog.hide();
              vm.partproduct = response.data.objectType;
              vm.isBOM = (response.data.isBomEnable === 'true');

              if (response.data.fuseCost == null || response.data.fuseCost == '') {
                vm.cost = '';
              } else {
                vm.cost = $filter('number')(response.data.fuseCost.replace(',', ''), vm.currencyDecimalSetting === 'No Limit' ? 2 : Number(vm.currencyDecimalSetting));
              }
              vm.products = response.data;
              vm.status = response.data.status;
              vm.objectType = response.data.objectType;
              vm.selectedRevision = vm.products.revision;
              $rootScope.productHirarcy = vm.products.categoryHierarchy;
              vm.timeline = transformJsonTimeLine(vm.products.timeLineList);
              $rootScope.$emit('updateTimeline', vm.products);
              vm.fuseObjectHistory = response.data.fuseObjectHistory;
              vm.thumbnailSrc = response.data.thumbnailPath;

              vm.boms = angular.copy(vm.products.bomResponse);

              vm.additionalInfoList = vm.products.additionalInfoList;

              if (vm.products.status === 'Released') {
                vm.released = true;
                vm.SaveDisabled = true;
                vm.DeleteDisalbed = true;

              } else {
                if (vm.products.status == 'Obsolete') {
                  vm.released = true;
                  vm.SaveDisabled = true;
                  vm.DeleteDisalbed = true;
                  vm.ChangeStatusDisabled = true;
                }
              }
              vm.manufactures = [];
              vm.supplier = [];
              vm.comments = vm.products.commentsList;
              angular.forEach(vm.products.sourcingList, function (value) {
                if (value.type === "manufacturer") {
                  vm.manufactures.push(value);
                }
                if (value.type === "supplier") {
                  vm.supplier.push(value);
                }
              });

              $rootScope.progressAddToBom = true;
              vm.hierarchicalViewProgressBar = true;
              vm.sourcingViewProgressBar = true;

              vm.boms = applyFlattenOnBillOfMaterials(buildExtendedObject(vm.boms));

              vm.hierarchicalGridOptions.data = angular.copy(vm.boms);

              vm.hierarchicalGridOptions.data = sourceCostService.addCostsInfo(
                sourcingUtils.applyFlattenOnSourcing(vm.hierarchicalGridOptions.data, true));
              if (expandedRows.length) {
                expandPreviouslyExpandedRows(vm.hierarchicalUiGrid, expandedRows);
              }
              originalBoms.hierarchical = angular.copy(vm.hierarchicalGridOptions.data);
              vm.calculateFlatView();
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
          $rootScope.progressAddToBom = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
        })
        .catch(function (response) {
          vm.progress = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
          console.error(vm.error.erCatch);
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    });

    $scope.$on('expandAllToLevel', (event, value) => {
      if (vm.lastLevelLoaded < value) {
        init(value);
      }
    });

    vm.openCurrencyMenu = openCurrencyMenu;
    vm.maxLevel = 0;

    function openCurrencyMenu($mdOpenMenu, ev) {
      if (vm.maxLevel === 0) {
        CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbomlevel, {
          objectId: id
        })
          .then( response => {
            let value = response.data.level;
            vm.maxLevel = response.data.level;
            if (vm.lastLevelLoaded < value) {
              init(value, true, $mdOpenMenu, ev);
            }
          });
      } else {
        $mdOpenMenu(ev);
      }
    }

    function init(level = 1, isCost = false, $mdOpenMenu = null, ev = null, isFlat = false) {
      vm.hierarchicalViewProgressBar = true;

      BomService.getFuseObjectById(id, level)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.lastLevelLoaded = vm.lastLevelLoaded < level ? level : vm.lastLevelLoaded;
              $mdDialog.hide();
              $scope.$emit('loading of parts ended');
              setCsvFilename(response.data, [vm.flatViewGridOptions, vm.hierarchicalGridOptions]);

              vm.partproduct = response.data.objectType;
              vm.isBOM = (response.data.isBomEnable === 'true');

              if (response.data.fuseCost == null || response.data.fuseCost == '') {
                vm.cost = '';
              } else {
                vm.cost = $filter('number')(response.data.fuseCost.replace(',', ''), vm.currencyDecimalSetting === 'No Limit' ? 2 : Number(vm.currencyDecimalSetting));
              }
              vm.products = response.data;
              vm.status = response.data.status;
              vm.objectType = response.data.objectType;
              vm.selectedRevision = vm.products.revision;
              $rootScope.productHirarcy = vm.products.categoryHierarchy;
              vm.timeline = transformJsonTimeLine(vm.products.timeLineList);
              if (level === 1) {
                $rootScope.$emit('updateTimeline', vm.products);
              }
              vm.fuseObjectHistory = response.data.fuseObjectHistory;
              vm.thumbnailSrc = response.data.thumbnailPath;

              vm.boms = angular.copy(vm.products.bomResponse);

              vm.additionalInfoList = vm.products.additionalInfoList;

              if (vm.products.status === 'Released') {
                vm.released = true;
                vm.SaveDisabled = true;
                vm.DeleteDisalbed = true;

              } else {
                if (vm.products.status == 'Obsolete') {
                  vm.released = true;
                  vm.SaveDisabled = true;
                  vm.DeleteDisalbed = true;
                  vm.ChangeStatusDisabled = true;
                }
              }
              vm.manufactures = [];
              vm.supplier = [];
              vm.comments = vm.products.commentsList;
              angular.forEach(vm.products.sourcingList, function (value) {
                if (value.type === "manufacturer") {
                  vm.manufactures.push(value);
                }
                if (value.type === "supplier") {
                  vm.supplier.push(value);
                }
              });

              $rootScope.progressAddToBom = true;
              vm.hierarchicalViewProgressBar = true;
              vm.sourcingViewProgressBar = true;

              vm.boms = applyFlattenOnBillOfMaterials(buildExtendedObject(vm.boms));

              vm.hierarchicalGridOptions.data = sourceCostService.addCostsInfo(
                sourcingUtils.applyFlattenOnSourcing(angular.copy(vm.boms), true))
                .map(setCostToPart);
              fuseUtils.handleAllOptionForPagination(vm.hierarchicalGridOptions, objectPageEnum.heirarchicalPage);
              vm.hierarchicalGridOptions.data.forEach(function (row) {
                row.configurationsForDropdown = row.configName;
              });

              if (expandedRows.length) {
                expandPreviouslyExpandedRows(vm.hierarchicalUiGrid, expandedRows);
              }
              if (vm.hierarchicalGridOptions.data.length === 0) {
                $scope.$emit('allBomRemoved');
              }
              originalBoms.hierarchical = angular.copy(vm.hierarchicalGridOptions.data);
              if (isCost) {
                vm.setSourceCosts();
                $mdOpenMenu(ev);
              }
              vm.calculateFlatView();
              if (isFlat) {
                const gridElem = document.getElementById('grid-flat');
                const filter = document.getElementById('clear-filter-flat');
                if (gridElem) {
                  if (filter) {
                    gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 300}px`;
                  } else {
                    gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 275}px`;
                  }
                }
              }
              $scope.$broadcast('bom loading ended', vm.hierarchicalUiGrid);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
          $rootScope.progressAddToBom = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
        })
        .catch(function () {
          vm.progress = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function setCostToPart(row) {
      if (row.slNo) {
        row.fuseCost = row.fuseCost ? row.fuseCost : partCostService.getConvertedFuseCost();
      }
      return row;
    }

    function setSourceCosts() {
      const propertyToTrack = 'id';
      vm.supplierCosts = sourceCostService.getPackedSourcers({
        arr: vm.hierarchicalGridOptions.data,
        propertyToTrack,
        type: fuseType.supplier
      });
      vm.manufacturersCosts = sourceCostService.getPackedSourcers({
        arr: vm.hierarchicalGridOptions.data,
        propertyToTrack,
        type: fuseType.manufacturer
      });
    }

    function setCsvFilename(part, tables) {
      const csvFilename = 'BOM ' + part.objectNumber + '_Rev_' + part.revision + ' - ' + part.minorRevision + '.csv';
      tables.forEach(function (table) {
        table.exporterCsvFilename = csvFilename;
      });
    }

    function addNewComment() {

      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId,
        objectId: id
      };

      data = {
        message: vm.newCommentText
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.commentonfuseobject, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.comments = response.data.commentsList;
              init();
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4006:
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
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

    /// For importBOMFunction
    function importBOMFunction(releaseBomSettings) {
      if (releaseBomSettings) {
        if (vm.products.status !== 'InDevelopment') {
          var confirm = $mdDialog.confirm({
            title: 'WARNING: Object is ' + vm.products.status + ', are you sure want to edit?',
            ariaLabel: 'edit fuse object Bill of Material',
            ok: 'Yes',
            cancel: 'No'
          });
          $mdDialog.show(confirm).then(function () {
            if (vm.products.objectType === 'products') {
              if (vm.products.bomResponse == 0) {
                $state.go('app.objects.products.import', {
                  'id': id,
                  obj: vm.products
                });
              } else {
                $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                $state.go('app.objects.products.import', {
                  'id': id,
                  obj: vm.products
                });
              }
            } else {
              if (vm.products.bomResponse == 0) {
                $state.go('app.objects.part.import', {
                  'id': id,
                  obj: vm.products
                });
              } else {
                $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                $state.go('app.objects.part.import', {
                  'id': id,
                  obj: vm.products
                });
              }
            }
          }, function () {

          });
        } else {
          importBomWithCheckRelease();
        }
      } else {
        importBomWithCheckRelease();
      }
    }

    // Function for ImportBOM check for release or obsulate
    function importBomWithCheckRelease() {
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.checkrelease, params, '', header)
        .then(function (response) {
          vm.progress = false;

          switch (response.code) {
            case 0:
              if (response.data.objectType === 'products') {
                if (vm.products.bomResponse == 0) {
                  $state.go('app.objects.products.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                } else {
                  $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                  $state.go('app.objects.products.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                }
              } else {
                if (vm.products.bomResponse == 0) {
                  $state.go('app.objects.part.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                } else {
                  $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                  $state.go('app.objects.part.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                }
              }
              break;
            case 4006:
              console.log(response.message);
              break;
            case 19:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
            case 17:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
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
          vm.progress = false;
          console.error('catch');
        });
    }

    vm.openManufactureDialog = openManufactureDialog;
    vm.openSupplierDialog = openSupplierDialog;
    vm.datasheetDialog = datasheetDialog;
    vm.supplierAtthachment = supplierAtthachment;
    vm.editPartNumberingDialog = editPartNumberingDialog;

    function openManufactureDialog(ev, manufature, objectId) {
      $mdDialog.show({
        controller: 'manufactureController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/manufactures/manufactures.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Manufature: manufature,
          User: vm.user,
          Manufatures: vm.manufactures,
          objectId: objectId
        }
      }).then(function () {
        init();
      }, function () {

      });
    }

    function openSupplierDialog(ev, supplier, objectId) {
      $mdDialog.show({
        controller: 'supplierController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/supplier/supplier.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Supplier: supplier,
          Suppliers: vm.supplier,
          objectId: objectId
        }
      }).then(function () {
        init();
      }, function () {
      });
    }

    function datasheetDialog(ev, objectId, sourcing) {
      $mdDialog.show({
        controller: 'DatasheetController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/datasheets/datasheet-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Sourcing: sourcing,
          objectId: objectId,
          Contacts: vm.contacts
        }
      }).then(function () {
        init();
      }, function () {

      });
    }

    function supplierAtthachment(ev, objectId, sourcing) {
      $mdDialog.show({
        controller: 'SupplierAttachmentController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/supplierattachment/supplieratachment-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Sourcing: sourcing,
          objectId: objectId,
          Suppliers: vm.supplier
        }
      }).then(() => {
        init();
      });
    }

    vm.showTabDialog = function (ev, editData, objectId, addedit) {

      if (editData) editData.isChangeOnlyNotes = (editData.level !== 1 && !vm.editSubLevelPartsSetting);
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure want to ' + addedit + '?',
          ariaLabel: 'edit fuse object Bill of Material',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          openDialog(ev, editData, objectId, addedit);
        });
      } else {
        openDialog(ev, editData, objectId, addedit);
      }
    };

    function getObjectId(editData) {
      return editData.parentBomId ? _.find(vm.boms, {bomId: editData.parentBomId}).objectId : '';
    }

    function openDialog(ev, editData, objectId, addedit) {
      var editDataCopy = angular.copy(editData);
      $mdDialog.show({
        controller: 'billofmaterialController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/billofmaterial.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          event: ev,
          editData: editDataCopy || '',
          $parent: vm,
          callback: null,
          ObjectId: objectId,
          Data: vm.products,
          BOMS: vm.boms,
          isConfigurationCompare: false,
          isCheckboxChecked: null,
          row: null,
          bomId: null,
          columns: [],
          editReleased: vm.editReleased,
          allFuseObjects: vm.allFuseObjects,
          isConfigEnabled: vm.configurationSettings,
          addedit: addedit
        }
      }).then(function () {
        $scope.$emit('addBOM');
        init();
      });
    }

    /**
     * This function works if the user expands some of rows, then edits a part,
     * so after recalling init() all the expanded rows will be collapsed. To avoid this confusion
     * this function takes an array of rows, which are expanded, end expands them after reloading.
     * @param tableOptions - uiGridOptions, like vm.hierarchicalGridOptions
     * @param tableApi - api for the grid. like vm.hierarchicalUiGrid
     * @param expandedRows - the array of row entities.
     */
    function expandPreviouslyExpandedRows(tableApi, expandedRows) {
      setTimeout(function () {
        expandedRows.forEach(function (expandedRow) {
          var rowToExpand = _.find(tableApi.grid.rows, function (gridRow) {
            return gridRow.entity.objectId === expandedRow.entity.objectId && gridRow.entity.slNo === expandedRow.entity.slNo;
          });
          if (rowToExpand) {
            vm.toggleSourcingGridRow(rowToExpand, tableApi, rowToExpand.treeNode.children, rowToExpand.treeNode.state, true)
          }
        });
      }, 0);
    }

    function editPartNumberingDialog(ev) {
      $mdDialog.show({
        controller: 'editPartNumberingDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          objectType: vm.objectType,
          objects: vm.products,
          fuseobjectId: vm.fuseobjectId,
          objectName: vm.products.objectName,
          objectNumber: vm.products.objectNumber,
          revision: vm.products.revision,
          editPart: false
        }
      }).then(function (data) {
        init();
      }, function () {

      });
    }

    function transformJsonTimeLine(response) {
      var data = [];
      angular.forEach(response, function (val) {
        if (val.title === 'IMPORT') {
          vm.line1 = val.action.split('#');
          val.action = vm.line1;
        }
        data.push({
          'card': {
            'template': 'app/core/directives/ms-card/templates/template-5/template-5.html',
            'title': val.title,
            'event': val.message,
            'action': val.action,
            'media': {
              'image': {
                'src': val.avatar || 'assets/images/avatars/profile.jpg',
                'alt': val.idMember
              }
            }
          },
          'name': val.title,
          'icon': iconSelect(val.title),
          'time': val.time,
          'event': val.message,
          'action': val.action,
          'member': val.idMember
        });
      });
      return data;
    }


    function iconSelect(response) {
      var data = '';
      switch (response) {
        case 'create':
          data = 'icon-clock';
          break;
        case 'edit':
          data = 'icon-pencil';
          break;
        case 'comments':
          data = 'icon-message';
          break;
        case 'associated':
          data = 'icon-trello';
          break;
        case 'addAt':
          data = 'icon-paperclip';
          break;
        case 'removeAttachment':
          data = 'icon-paperclip';
          break;
        case 'changeStatus':
          data = 'icon-flip-to-front';
          break;
        case 'ADD':
          data = 'icon-document';
          break;
        case 'UPDATE':
          data = 'icon-document';
          break;
        case 'IMPORT':
          data = 'icon-document';
          break;
        case 'REMOVE':
          data = 'icon-document';
          break;
        case 'Import overwrite':
          data = 'icon-document';
          break;
        case 'Updated BOM':
          data = 'icon-document';
          break;
        default:
          data = 'icon-account-alert';
      }
      return data;
    }

    //For Back Button individual page.
    function backFunction(objectType) {
      if (objectType === 'parts') {
        $state.go('app.objects.part');
      } else {
        if (objectType === 'documents') {
          $state.go('app.objects.documents');
        } else {
          $state.go('app.objects.products');
        }
      }
      $rootScope.changeLengthEntries = true;
    }

    function OpenLinkFunction(url) {

      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
        window.open(url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {
      return query ? vm.changeItems.filter(createFilterFor(query)) : [];
    }

    /**
     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function changeItemsIDQuerySearch(query) {
      return query ? changeItemsQuerySearch(query).map(function (item) {
        return item.displayObjectId;
      }) : [];
    }

    vm.parseStrings = function (str1, str2) {
      var startStringSecond = (str1 || '').substring((str1 || '').indexOf("-"), (str1 || '').indexOf("]") + 1) + " ";
      var startStringFirst = (str1 || '').substring(0, (str1 || '').indexOf("-")) + " ";
      var startString = startStringFirst + startStringSecond;
      var middleString = "\xa0\xa0\xa0" + "[" + str2 + "]" + "\xa0\xa0\xa0";
      var endString = " " + (str1 || '').substring((str1 || '').indexOf("]") + 1);
      return startString + middleString + endString;
    };
    vm.parseChip = function (chip) {
      return vm.parseStrings(chip.displayObjectId || chip, changeItemsIDQuerySearchStatus(chip.displayObjectId || chip));
    };

    /**
     * Change Items filter
     *
     * @param change item
     * @returns {boolean}
     */
    function filterChangeItem(changeItem) {
      if (!vm.changeItemSearchText || vm.changeItemSearchText === '') {
        return true;
      }
      return angular.lowercase(changeItem.displayObjectId).indexOf(angular.lowercase(vm.changeItemSearchText)) >= 0;
    }

    /**
     * Build Extended Object
     * @param obj
     * @returns {*}
     */
    function buildExtendedObject(obj) {

      angular.forEach(obj, function (o, idx) {
        if (o.fuseObjectBOMResponseList && o.fuseObjectBOMResponseList.length != 0) {

          o = getExtendedBomObject(o);

          buildExtendedObject(o.fuseObjectBOMResponseList);
        } else {
          o = getExtendedBomObject(o);
        }
      });

      return obj;
    }

    function calculateFlatView(initial = false) {
      $timeout(() => {
        calculateExtendedCost(vm.hierarchicalGridOptions.data);
        vm.flatViewGridOptions.data = flatViewService.getFlatViewRows({
          arr: vm.hierarchicalGridOptions.data,
          targetQuantity: vm.targetQuatity
        });
        calculateExtendedCost(vm.flatViewGridOptions.data);
        vm.unitCostValue = getUnitCost(vm.hierarchicalGridOptions.data);
        vm.targetCostValue = vm.unitCostValue * vm.targetQuatity;
        if (initial) {
          $rootScope.$emit('updateRollupCost', vm.unitCostValue);
        }
        fuseUtils.handleAllOptionForPagination(vm.flatViewGridOptions, objectPageEnum.flatPage);
      });
    }

    function handleSourcerChange(selectedRow, isFlat, costType) {
      if (isFlat) {
        sourceCostService.initChangeFlatSourcer(vm.hierarchicalGridOptions.data, costType);
        return;
      }
      if (selectedRow) {
        sourceCostService.initChangeSourcer(costType, vm.hierarchicalGridOptions.data, selectedRow);
        return;
      }
      sourceCostService.initChangeAllSourcer(vm.hierarchicalGridOptions.data, costType);
    }

    function getUnitCost(hierarchicalArr) {
      const isWithError = hierarchicalArr.some((row) => {
        return row.fuseCost === vm.error.noAvailableCurrency
      });
      if (isWithError) {
        return vm.error.noAvailableCurrency;
      }
      return partCostService.getUnitCost(hierarchicalArr, vm.currencyDecimalSetting);
    }

    /**
     * parse flat view object
     * @param o
     */
    function parseFlatObject(o) {

      var cloneObject = angular.copy(o);

      cloneObject.totalCost = null;
      cloneObject.requiredQty = null;
      cloneObject.shortage = null;

      cloneObject.qtyOnHand = o.qtyOnHand || "";
      cloneObject.qtyOnOrder = o.qtyOnOrder || "";
      cloneObject.qtyTotal = o.qtyTotal || "";
      cloneObject.stackObj = new Array();

      return cloneObject;
    }

    var flattenArr = null;

    /**
     * Apply Flatten On Bill Of Materials
     * @param targetArr
     * @returns {*|Array}
     */
    function applyFlattenOnBillOfMaterials(targetArr) {
      flattenArr = [];
      flattenBillOfMaterials(targetArr, 0, null);
      return flattenArr || [];
    }

    /**
     * flatten Bill Of Materials
     * @param obj
     * @param level
     * @param parentIndex
     * @param parentBomId
     */
    function flattenBillOfMaterials(obj, level, parentIndex, parentBomId) {

      angular.forEach(obj, function (o, idx) {
        if (o.fuseObjectBOMResponseList && o.fuseObjectBOMResponseList.length != 0) {
          o.$$treeLevel = level;
          o.leaf = false;
          o.parentIndex = !parentIndex ? ("" + (idx + 1)) : (parentIndex + "." + (idx + 1));
          o.parentBomId = parentBomId;
          o.bomParent = true;
          if (level > 0) o.bomChildren = true;

          flattenArr.push(o);

          flattenBillOfMaterials(o.fuseObjectBOMResponseList, o.level, o.parentIndex, o.bomId);

        } else {
          o.$$treeLevel = level;
          o.leaf = true;
          o.parentBomId = parentBomId;
          o.parentIndex = !parentIndex ? ("" + (idx + 1)) : (parentIndex + "." + (idx + 1));
          o.objectNumber = parentIndex ? ("   " + o.objectNumber) : o.objectNumber;
          o.bomChildren = true;

          flattenArr.push(o);
        }
      });
    }

    /**
     * generic attributes
     * @type {{resizable: boolean, cellTemplate: string, field: string, displayName: string,
     * visible: boolean, enableColumnMenu: boolean, width: number}}
     */
    var attrs = {
      resizable: true,
      cellTemplate: '',
      field: '',
      displayName: '',
      visible: true,
      enableColumnMenu: true,
      enableHiding: false,
      width: 150
    };

    /**
     * Parse Attributes
     * @param o
     */
    function parseAttributes(o, addtionalAttrs) {
      var cloneObject = angular.copy(attrs);
      addtionalAttrs = addtionalAttrs || false;
      if (addtionalAttrs) {
        cloneObject.field = o.name;
        cloneObject.displayName = o.attribute;
        cloneObject.cellTemplate = "<div class='ui-grid-text-overflow'>{{(row.entity['" + o.name + "']||'') ? row.entity['" + o.name + "']:''}}</div>"
        cloneObject.enableCellEdit = false;
      } else {
        cloneObject.field = o.value;
        cloneObject.displayName = o.name;
        if (o.value == 'refDocs') {
          cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/ref-docs.html';
        }
        if (o.value == 'uniqueIdentity') {
          cloneObject.cellTemplate = '<div>{{ row.entity.uniqueIdentity}} </div>';
          cloneObject.enableSorting = false;
        }
        if (o.value == 'parentIndex') {
          cloneObject.enableSorting = false;
          cloneObject.enableFiltering = false;
        }
        if (o.value == 'thumbnailPath') {
          cloneObject.displayName = '';
          cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/thumbnail-cell-template.html';
          cloneObject.enableSorting = false;
          cloneObject.enableFiltering = false;
          cloneObject.width = 70;
          cloneObject.cellClass = 'thumbnail-overflow';
        }
        if (o.value == 'hasAttachments') {
          cloneObject.enableSorting = true;
          cloneObject.enableFiltering = false;
          cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/attachments-cell.html';
        }
      }
      if (o.value == 'costType') {
        cloneObject.enableCellEdit = false;
        cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/editing-cell-template.html';
      }
      if (o.value == 'configurationsForDropdown') {
        cloneObject.enableCellEdit = false;
        cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/editing-cell-configurations.html';
      }


      angular.isDefined(o.defaultValue) && (cloneObject.defaultValue = o.defaultValue);
      angular.isDefined(o.tooltipText) && (cloneObject.tooltipText = o.tooltipText);
      angular.isDefined(o.tooltipDirection) && (cloneObject.tooltipDirection = o.tooltipDirection);
      return cloneObject;
    }

    function buildMfrSuppAttributes(sections, arr) {
      if (sections.mfrParts) {
        angular.forEach((sections.mfrParts || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
            if (o.value === 'mfrObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/mfr-object-number-for-bom-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'mfrObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
            }
            if (o.value === 'mfrLeadTime') {
              colDef.sortingAlgorithm = fuseUtils.sortLeadTime;
            }
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }

      if (sections.suppParts) {
        angular.forEach((sections.suppParts || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
            if (o.value === 'suppObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/supp-object-number-for-bom-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'suppObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
            }
            if (o.value === 'suppLeadTime') {
              colDef.sortingAlgorithm = fuseUtils.sortLeadTime;
            }
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }
      return arr;
    }

    /**
     * build Hierarchical Grid Columns
     * @returns {Array}
     */
    function buildHierarchicalGridColumns(sections) {

      var arr = [];
      arr = angular.copy(attributesUtils.getDefaultHierarchicalColumnDefs());

      if (sections.attrBasicBOM) {
        angular.forEach((sections.attrBasicBOM || []), function (o, i) {
          if (o.displayed) {
            var colDef = parseAttributes(o);
            if (o.value === 'totalCost') {
              colDef.visible = false;
            }
            if (o.value === 'shortage') {
              colDef.sortingAlgorithm = fuseUtils.sortWithNegative;
              colDef.visible = false;
            }
            if (o.value === 'requiredQty') {
              colDef.visible = false;
            }
            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }
            if (o.value === 'thumbnailPath') {
              vm.doubleHierarchicalHeightFlag = true;
              if (vm.hierarchicalGridOptions) {
                vm.hierarchicalGridOptions.rowHeight = 60;
              }
            }
            if (o.value === 'objectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/part-number.html';
              colDef.sortingAlgorithm = fuseUtils.sortingPartNumber;
            }
            if (o.value === 'extendedCost') {
              setExtendedCostProps(colDef);
            }
            if (o.value === 'fuseCost' || o.value === 'extendedCost') {
              colDef.sortingAlgorithm = sortingCosts;
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/exchange-currency-cell.html';
            }
            if (o.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }

            if (o.value === 'configurationsForDropdown' && !vm.configurationSettings) {
              return;
            }

            if(o.value === 'bomPackage'){
              colDef.sortingAlgorithm = algorithmsService.alphanumericSort;
            }

            arr.push(colDef);
          } else if (o.value == 'thumbnailPath') {
            vm.doubleHierarchicalHeightFlag = false;
            if (vm.hierarchicalGridOptions) {
              vm.hierarchicalGridOptions.rowHeight = 30;
            }
          }
        });
      }

      if (sections.attrInventoryBOM) {
        angular.forEach((sections.attrInventoryBOM || []), function (o, i) {
          if (o.displayed) {
            let colDef = parseAttributes(o);
            colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            arr.push(colDef);
          }
        });
      }

      if (sections.attrAdditionalBOM) {
        angular.forEach((sections.attrAdditionalBOM || []), function (o, i) {
          if (o.displayed) {
            const colDef = fuseUtils.parseAttributes(o, true);
            colDef.field = _.camelCase(colDef.field);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            } else {
              colDef.cellTemplate = "<div class='ui-grid-cell-contents ui-grid-text-overflow'>{{(row.entity['" + colDef.field + "']||'') ? row.entity['" + colDef.field + "']:''}}</div>";
            }
            arr.push(colDef);
          }
        });
      }

      if (sections.attrObjectHistoryBOM) {
        angular.forEach((sections.attrObjectHistoryBOM || []), function (o, i) {
          if (o.displayed) {
            arr.push(parseAttributes(o));
          }
        });
      }

      arr = buildMfrSuppAttributes(sections, arr);

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName && !col.headerCellTemplate) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForNumberColumn(arr);
      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    function setTemplateForNumberColumn(arr) {
      var numberColumn = _.find(arr, {displayName: 'Sl.No'});
      if (!numberColumn)
        return;

      numberColumn.headerCellTemplate = '<div class="custom-column-header-container"><md-tooltip class="md-tooltip">Item No</md-tooltip><span>{{col.displayName}}</span></div>';
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function sortingCosts(a, b, rowA, rowB, direction) {
      return fuseUtils.sortCost(vm.currencySetting, a, b);
    }

    function parseFloatToFixed(number) {
      if (vm.currencyDecimalSetting === 'No Limit') {
        return number;
      } else {
        return $filter('number')(number, Number(vm.currencyDecimalSetting));
      }
    }

    /**
     * build Sourcing Grid Columns
     * @returns {Array}
     */
    function buildFlatViewGridColumns(sections) {

      var isEmptyColumns = true;

      for (var key in sections) {
        if (isEmptyColumns && sections[key] != null && sections[key] != 'undefined') {
          isEmptyColumns = sections[key].every(function (obj) {
            return !obj.displayed;
          })
        }
      }

      var arr = [];

      if (sections.attrBasicBOM) {
        angular.forEach((sections.attrBasicBOM || []), function (o, i) {
          if (isEmptyColumns && o.value === 'extendedCost') {
            o.displayed = true;
          }
          if (o.displayed) {
            if (o.value == 'parentIndex') {
              o.value = 'uniqueIdentity';
            }
            var colDef = parseAttributes(o);
            if (o.value === 'uniqueIdentity') {
              colDef.enableFiltering = false;
            }
            if (o.value === 'quantity') {
              colDef.type = 'number';
              colDef.tooltipDirection = 'top';
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              colDef.tooltipText = 'Rolled up quantity per line item';
              colDef.headerCellTemplate = tooltipHeaderTemplates;
            }
            if (o.value === 'totalCost') {
              colDef.type = 'number';
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              colDef.tooltipDirection = 'top';
              colDef.tooltipText = "'Cost' * 'Total Required Quantity'. $0.00, when cost is not available.";
              colDef.headerCellTemplate = tooltipHeaderTemplates;
              colDef.cellTemplate = dollarCellRenderer;
              colDef.visible = true;
              colDef.width = 130;
            }
            if (o.value === 'shortage') {
              colDef.type = 'number';
              colDef.tooltipDirection = 'top';
              colDef.sortingAlgorithm = fuseUtils.sortWithNegative;
              colDef.tooltipText = "'Total Available Quantity' – 'Total Required Quantity'";
              colDef.headerCellTemplate = tooltipHeaderTemplates;
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/shortage-cell.html';
              colDef.visible = true;
              colDef.width = 130;
            }
            if (o.value === 'configurationsForDropdown') {
              if (vm.configurationSettings) {
                colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/flat-view-cell-template.html';
              } else {
                return;
              }
            }
            if (o.value === 'level') {
              return;
            }
            if (o.value === 'requiredQty') {
              colDef.type = 'number';
              colDef.tooltipDirection = 'top';
              colDef.tooltipText = "'Target Quantity' * 'Quantity'";
              colDef.headerCellTemplate = tooltipHeaderTemplates;
              colDef.visible = true;
              colDef.width = 130;
            }
            if (o.value === 'thumbnailPath') {
              vm.doubleFlatHeightFlag = true;
              if (vm.flatViewGridOptions) {
                vm.flatViewGridOptions.rowHeight = 60;
              }
            }
            if (o.value === 'objectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/part-number-flat-view.html';
              colDef.sortingAlgorithm = fuseUtils.sortingPartNumber;
            }
            if (o.value === 'extendedCost') {
              setExtendedCostProps(colDef);
            }
            if (o.value === 'fuseCost' || o.value === 'extendedCost') {
              colDef.sortingAlgorithm = sortingCosts;
              colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/exchange-currency-cell.html';
            }
            if (o.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            arr.push(colDef);
          } else if (o.value === 'thumbnailPath') {
            vm.doubleFlatHeightFlag = false;
            if (vm.flatViewGridOptions) {
              vm.flatViewGridOptions.rowHeight = 30;
            }
          }
        });
      }

      if (sections.attrInventoryBOM) {
        angular.forEach((sections.attrInventoryBOM || []), function (o, i) {
          if (o.displayed) {
            var colDef = parseAttributes(o);
            colDef.type = 'number';
            colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            colDef.headerCellTemplate = tooltipHeaderTemplates;
            if (o.value === 'qtyTotal') {
              colDef.cellTemplate = zeroCellRenderer;
            }
            arr.push(colDef);
          }
        });
      }

      if (sections.costAttribute && sections.costAttribute.displayed) {
        var obj = parseAttributes(sections.costAttribute);
        obj.headerCellTemplate = tooltipHeaderTemplates;
        obj.type = 'number';
        obj.tooltipText = "Object’s Cost Attribute in the 'Basic Info' section. $0.00, when cost is not available.";
        obj.tooltipDirection = "top";
        obj.cellTemplate = dollarCellRenderer;
        arr.push(obj);
      }

      if (sections.attrAdditionalBOM) {
        angular.forEach((sections.attrAdditionalBOM || []), function (o, i) {
          if (o.displayed) {
            const colDef = fuseUtils.parseAttributes(o, true);
            colDef.field = _.camelCase(colDef.field);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            } else {
              colDef.cellTemplate = "<div class='ui-grid-cell-contents ui-grid-text-overflow'>{{(row.entity['" + colDef.field + "']||'') ? row.entity['" + colDef.field + "']:''}}</div>";
            }
            arr.push(colDef);
          }
        });
      }

      if (sections.attrObjectHistoryBOM) {
        angular.forEach((sections.attrObjectHistoryBOM || []), function (o, i) {
          if (o.displayed) {
            arr.push(parseAttributes(o));
          }
        });
      }

      arr = buildMfrSuppAttributes(sections, arr);

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForNumberColumn(arr);
      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    function deleteBOMParts(ev) {
      if (vm.boms.length === 0) {
        $mdToast.show($mdToast.simple().textContent('No parts in the bill of material.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
      } else {
        var confirm = $mdDialog.confirm({
          title: 'Are you sure you want to delete all parts from this Bill of Material?',
          textContent: 'WARNING: This action cannot be reversed!',
          ariaLabel: 'delete fuse object Bill of Material',
          targetEvent: ev,
          clickOutsideToClose: true,
          escapeToClose: true,
          ok: 'Delete all parts from BOM',
          cancel: 'Cancel'
        });

        $mdDialog.show(confirm).then(function () {

          vm.progress = true;

          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              objectId: id
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              objectId: id
            }
          }

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeallbom, params, '', header)
            .then(function (response) {

              vm.progress = false;

              switch (response.code) {
                case 0:
                  $scope.$emit('allBomRemoved');
                  init();
                  $mdToast.show($mdToast.simple().textContent("All parts from Bill of Material Removed Successfully.").position('top right'));
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
                case 16:
                  console.log(response.message);
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                default:
                  console.log(response.message);
              }
            })
            .catch(function (response) {
              vm.progress = false;
              console.log('catch');
            });
        });
      }
    }

    //the array to store rows, which were expanded
    var expandedRows = [];

    const exportMatcher = {
      associatedCardsList(grid, row, col, value) {
        return !_.isEmpty(value);
      },
      isLatest(grid, row, col, value) {
        return value === 'true' ? 'Yes' : 'No';
      },
      costType(grid, row, col, value) {
        const costDef = _.find(row.availableBreakCosts, {id: value});
        return costDef ? costDef.costType : '';
      }
    };

    vm.scrollToParent = scrollToParent;

    function scrollToParent(grid, row) {
      const visibleRows = grid.api.core.getVisibleRows(grid.api.grid);
      const checkPage = visibleRows.findIndex(value => {
        return value.entity.bomId === row.parentBomId && row.slNo.indexOf(value.entity.slNo) !== -1;
      });
      if (checkPage === -1 && grid.options.paginationCurrentPage !== 1) {
        grid.options.paginationCurrentPage = grid.options.paginationCurrentPage - 1;
        $timeout(() => {
          scrollToParent(grid, row);
        }, 1000);
      } else {
          let index = grid.options.data.findIndex(value => {
            return value.bomId === row.parentBomId && row.slNo.indexOf(value.slNo) !== -1;
          });
          grid.api.core.scrollTo(grid.options.data[index]);
      }
    }

    function exporterFieldCallback(grid, row, col, value) {
      if (exportMatcher[col.name]) {
        value = exportMatcher[col.name](grid, row.entity, col, value);
      }
      return value;
    }



    function doDebounceShowToast() {
      $mdToast.show($mdToast.simple()
        .textContent('NOTE: This box filters objects from level 1 to the expanded level of hierarchy.' +
          ' To filter across the entire hierarchy, expand all levels of hierarchy and then perform search.')
        .position('top right')
        .toastClass('md-multiline-toast-theme'));
    }

    const debounceShowToast = _.debounce(doDebounceShowToast, 1000);

    function dodebounceshowtoast() {
      debounceShowToast.cancel();
      debounceShowToast();
    }

    vm.hierarchicalGridOptions = {
      exporterFieldCallback,
      flatEntityAccess: true,
      enableCellEdit: false,
      initialized: false,
      columnDefs: [],
      enableRowSelection: true,
      enableSelectAll: true,
      multiSelect: true,
      showTreeExpandNoChildren: false,
      showTreeRowHeader: false,
      data: [],
      enableColumnReordering: true,
      enableColumnResizing: true,
      enableSorting: true,
      enableFiltering: true,
      exporterOlderExcelCompatibility: true,
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      isRowSelectable: function(row) {
        if (vm.editSubLevelPartsSetting) {
          return true;
        } else {
          return row.entity.level <= 1;
        }
      },
      exporterPdfTableStyle: {
        margin: [30, 30, 0, 30]
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'LETTER',
      rowHeight: vm.doubleHierarchicalHeightFlag ? 60 : 30,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 1,
      enableVerticalScrollbar: 2,
      paginationPageSize: 100,
      paginationPageSizes: [{
        label: '25',
        value: 25
      },
        {
          label: '50',
          value: 50
        },
        {
          label: '75',
          value: 75
        },
        {
          label: '100',
          value: 100
        },
        {
          label: '1000',
          value: 1000
        }
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      exporterSuppressColumns: ['bomId', 'objectId'],
      onRegisterApi: function (gridApi) {
        vm.hierarchicalUiGrid = gridApi;
        vm.hierarchicalUiGrid.treeBase.on.rowCollapsed($scope, function (row) {
          expandedRows = _.filter(expandedRows, function (expandedRow) {
            return expandedRow.entity.objectId !== row.entity.objectId;
          });
        });
        vm.hierarchicalUiGrid.treeBase.on.rowExpanded($scope, function (row) {
          var isThisRowSaved = _.find(expandedRows, function (expandedRow) {
            return expandedRow.entity.objectId === row.entity.objectId;
          });
          if (!isThisRowSaved) {
            expandedRows.push(row);
          }
        });
        vm.hierarchicalUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.heirarchicalPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.heirarchicalPage);
          }
          saveState();
        });
        vm.hierarchicalUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.hierarchicalUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          fuseUtils.setProperHeaderViewportHeight(vm.hierarchicalGridOptions.columnDefs, 3, null, vm.hierarchicalUiGrid);
          vm.heightTopPanelHierarchical = $('#grid-hierarchical .ui-grid-top-panel').height();
          saveState();
        });
        vm.hierarchicalUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.hierarchicalUiGrid.core.on.filterChanged($scope, function () {
          angular.forEach(vm.hierarchicalUiGrid.grid.columns, function( col ) {
            if(col.filters[0].term){
              dodebounceshowtoast();
            }
          });
          vm.hierarchicalUiGrid.grid.rows.forEach((row) => vm.hierarchicalUiGrid.core.clearRowInvisible(row));

          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.hierarchicalUiGrid.core.on.sortChanged($scope, saveState);
        vm.hierarchicalUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.hierarchicalGridOptions.initialized) {
            let gridCol;
            _.forEach(vm.hierarchicalUiGrid.grid.columns, function (val) {
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
          saveState();
        });

        vm.hierarchicalUiGrid.core.on.renderingComplete($scope, function () {
        });
        vm.hierarchicalUiGrid.core.on.scrollBegin($scope, function () {
        });
        vm.hierarchicalUiGrid.core.on.scrollEnd($scope, function () {
        });

        vm.hierarchicalUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.hierarchicalGridOptions.data.length > 0) && !vm.hierarchicalGridOptions.initialized) {
            $timeout(function () {
              vm.hierarchicalGridOptions.initialized = true;
            });
          }
          showClearButton(vm.hierarchicalUiGrid);
          vm.heightTopPanelHierarchical = $('#grid-hierarchical .ui-grid-top-panel').height();
          vm.hierarchicalGridOptions.totalParentItems = vm.hierarchicalGridOptions.totalItems;
        });
        vm.hierarchicalUiGrid.core.on.renderingComplete($scope, function () {
        });
        fuseUtils.setProperHeaderViewportHeight(vm.hierarchicalGridOptions.columnDefs, 3, null, vm.hierarchicalUiGrid);
        vm.hierarchicalUiGrid.selection.on.rowSelectionChanged($scope, function () {
          selectedRows = _.filter(vm.hierarchicalUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
        });
        vm.hierarchicalUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
          selectedRows = _.filter(vm.hierarchicalUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
        });
      }
    };

    vm.flatViewGridOptions = {
      exporterFieldCallback,
      flatEntityAccess: true,
      isFlatTable: true,
      initialized: false,
      enableCellEdit: false,
      columnDefs: [],
      data: [],
      enableColumnReordering: true,
      enableColumnResizing: true,
      enableSorting: true,
      enableFiltering: true,
      exporterOlderExcelCompatibility: true,
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      exporterPdfTableStyle: {
        margin: [30, 30, 0, 30]
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'LETTER',
      showTreeExpandNoChildren: false,
      showTreeRowHeader: false,
      rowHeight: vm.doubleFlatHeightFlag ? 60 : 30,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
      paginationPageSize: 100,
      paginationPageSizes: [{
        label: '25',
        value: 25
      },
        {
          label: '50',
          value: 50
        },
        {
          label: '75',
          value: 75
        },
        {
          label: '100',
          value: 100
        },
        {
          label: '1000',
          value: 1000
        },
        {
          label: 'All',
          value: 3
        }
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      exporterSuppressColumns: ['bomId'],
      onRegisterApi: function (gridApi) {
        vm.flatViewGrid = gridApi;
        vm.flatViewGrid.treeBase.on.rowCollapsed($scope, function (row) {
          expandedRows = _.filter(expandedRows, function (expandedRow) {
            return expandedRow.entity.objectId !== row.entity.objectId;
          });
        });
        vm.flatViewGrid.treeBase.on.rowExpanded($scope, function (row) {
          var isThisRowSaved = _.find(expandedRows, function (expandedRow) {
            return expandedRow.entity.objectId === row.entity.objectId;
          });
          if (!isThisRowSaved) {
            expandedRows.push(row);
          }
        });
        $scope.$emit('flatViewGrid API is instantiated');
        vm.flatViewGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.flatPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.flatPage);
          }
          saveFlatViewState();
        });
        vm.flatViewGrid.colMovable.on.columnPositionChanged($scope, saveFlatViewState);
        vm.flatViewGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightSourcingTopPanelFlat = $('#grid-flat .ui-grid-top-panel').height();
          fuseUtils.setProperHeaderViewportHeight(vm.flatViewGridOptions.columnDefs, 6, objectPageEnum.flatPage, vm.flatViewGrid);
          saveFlatViewState();
        });
        vm.flatViewGrid.core.on.columnVisibilityChanged($scope, saveFlatViewState);
        vm.flatViewGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.flatViewGrid.core.on.sortChanged($scope, saveFlatViewState);
        vm.flatViewGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.flatViewGridOptions.initialized) {
            let gridCol;
            _.forEach(vm.flatViewGrid.grid.columns, function (val) {
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
          saveFlatViewState();
        });
        vm.flatViewGrid.core.on.scrollBegin($scope, function () {
        });
        vm.flatViewGrid.core.on.scrollEnd($scope, function () {
        });

        vm.flatViewGrid.core.on.rowsRendered($scope, function () {
          if ((vm.flatViewGridOptions.data.length > 0) && !vm.flatViewGridOptions.initialized) {
            $timeout(function () {
              vm.flatViewGridOptions.initialized = true;
            });
          }
          showClearButton(vm.flatViewGrid);
          vm.heightSourcingTopPanelFlat = $('#grid-flat .ui-grid-top-panel').height();
          $('.ui-grid-filter-container').css({
            'position': 'absolute',
            'bottom': 0
          });
          vm.flatViewGridOptions.totalParentItems = vm.flatViewGridOptions.totalItems;
        });
        fuseUtils.setProperHeaderViewportHeight(vm.flatViewGridOptions.columnDefs, 6, objectPageEnum.flatPage, vm.flatViewGrid);
      }
    };

    /**
     * this additional variable is needed to pass applied templateId to the directive for flat view.
     * This templateId can not be passed as it is done for hierarchical view, because we have already instantiated directive in hierarchical view,
     * but not instantiated directive in flat view
     */
    var defaultTemplateIdFlat;
    $scope.$on('flatViewGrid API is instantiated', function () {
      restoreFlatViewState();
      $scope.$broadcast('template applied', {templateId: defaultTemplateIdFlat});
    });

    function toggleSourcingGridRow(row, grid, children, state, bomFlag, fromToggle = false) {
      sourcingUtils.toggleSourcingGridRow(row, grid, children, state, bomFlag);
      if (fromToggle && row.entity.hasBOM === 'Yes' && vm.lastLevelLoaded < row.entity.level + 1) {
        init(row.entity.level + 1);
      }
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    /**
     * Save current state ( Pagination, grouping, sorting, column re ordering and etc ...)
     * of the grid in either local storage or cookies. Here we are using localstorage
     * purposefully
     */
    function saveState() {
      var state = vm.hierarchicalUiGrid.saveState.save();
      $window.localStorage.setItem('gridState', angular.toJson(state));
    }

    function saveFlatViewState() {
      if (!vm.flatViewGrid) {
        return;
      }
      var state = vm.flatViewGrid.saveState.save();
      if (!state) {
        return;
      }
      $window.localStorage.setItem('gridFlatViewState', angular.toJson(state));
    }

    function restoreState() {
      $timeout(function () {
        var state = $window.localStorage.getItem('gridState');

        if (state) {
          var pinnedBomId = checkPinnedBomId(angular.fromJson(state));
          if (pinnedBomId) {
            vm.hierarchicalUiGrid.saveState.restore($scope, angular.fromJson(state));
          } else {
            $window.localStorage.removeItem('gridState');
          }
        }

        fuseUtils.arrangeColumns(vm.hierarchicalUiGrid, $scope, ['parentIndex', 'level', 'hasAttachments', 'associatedCardsList']);
        fuseUtils.setProperHeaderViewportHeight(vm.hierarchicalGridOptions.columnDefs, 3, null, vm.hierarchicalUiGrid);
      });
    }

    function restoreFlatViewState() {
      $timeout(function () {
        var state = $window.localStorage.getItem('gridFlatViewState');
        state && vm.flatViewGrid.saveState.restore($scope, angular.fromJson(state));
        fuseUtils.moveColumnToFirstPosition(vm.flatViewGrid, $scope, 'associatedCardsList');
        fuseUtils.moveAttachmentsColumn(vm.flatViewGrid, $scope);
        fuseUtils.moveColumnToFirstPosition(vm.flatViewGrid, $scope, 'uniqueIdentity', true);

        fuseUtils.setProperHeaderViewportHeight(vm.flatViewGridOptions.columnDefs, 6, objectPageEnum.flatPage, vm.flatViewGrid);
      });
    }

    function checkPinnedBomId(state) {
      return _.find(state.columns, function (item) {
        return (item.name === 'bomId' && item.pinned === 'left');
      })
    }

    function downloadTable(flag, option, gridApi, gridOptions, flatFlag) {
      if (flag === 'csv') {
        vm.hierarchicalGridOptions.exporterSuppressColumns = ['bomId', 'objectId', 'thumbnailPath'];
        vm.flatViewGridOptions.exporterSuppressColumns = ['bomId', 'thumbnailPath'];
        uiGridExporterService.loadAllDataIfNeeded(gridApi.grid, 'visible', 'visible').then(function() {
          let exportColumnHeaders = gridApi.grid.options.showHeader ? uiGridExporterService.getColumnHeaders(gridApi.grid, 'visible') : [];
          let exportData = uiGridExporterService.getData(gridApi.grid, 'visible', 'visible');
          _.forEach(exportData, row => {
            _.forEach(row, field => {
              if (field.value) {
                field.value = field.value.toString().replace(/(^\s*)|(\s*)$/g, '');
              }
            })
          });
          let csvContent = uiGridExporterService.formatAsCsv(exportColumnHeaders, exportData, gridApi.grid.options.exporterCsvColumnSeparator);
          uiGridExporterService.downloadFile (gridApi.grid.options.exporterCsvFilename, csvContent, gridApi.grid.options.exporterCsvColumnSeparator, gridApi.grid.options.exporterOlderExcelCompatibility, gridApi.grid.options.exporterIsExcelCompatible);
        });
      } else {
        var now = new Date(),
          dateFormat = moment(now).format('MMM D YYYY, hh:mm:ss') + ' ' + fuseUtils.getTimeZone(),
          base64String;

        if (vm.partproduct === 'parts') {
          base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/part-square.png');
        } else {
          base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/product-sqaure.png');
        }

        base64String.then(function (value) {

          base64String = value;
          gridOptions.exporterPdfHeader = {
            columns: [{
              style: 'headerStyle',
              table: {
                widths: [50, '*'],
                body: [
                  [{
                    text: dateFormat + ' ' + GlobalSettingsService.getUserFullName() || ' ',
                    margin: [0, 5, 0, 0],
                    colSpan: 2,
                    style: 'dateStyle'
                  },
                    ''
                  ],
                  ['',
                    {
                      table: {
                        headerRows: 0,
                        widths: [130, 150],
                        body: [
                          [{
                            text: [vm.products.objectNumber, {
                              text: ', Revision ',
                              italics: true
                            }, vm.products.revision],
                            fontSize: 10
                          },
                            {
                              table: {
                                headerRows: 0,
                                widths: [85],
                                heights: [15],
                                body: [
                                  [{
                                    text: vm.products.status,
                                    fillColor: '#ffc12d',
                                    color: '#000',
                                    fontSize: 10,
                                    alignment: 'center',
                                    margin: [0, 2, 0, 0]
                                  }]
                                ]
                              },

                              layout: 'noBorders'
                            }
                          ]
                        ]
                      },

                      layout: 'noBorders'
                    }
                  ],
                  [{
                    stack: [{
                      image: base64String,
                      width: 25,
                      alignment: 'center',
                      marginBottom: -8,
                      marginTop: -5
                    }]
                  },
                    {
                      text: [{text: 'Description: ', italics: true}, vm.products.description || ' '],
                      margin: [0, -10, 0, 0]
                    }
                  ],
                  ['',
                    {
                      table: {
                        headerRows: 0,
                        widths: [150, 'auto'],
                        heights: [18, 'auto'],
                        body: [
                          [{
                            text: [{
                              text: 'Category: ',
                              italics: true,
                              fontSize: 9
                            }, {text: vm.products.categoryHierarchy, fontSize: 9}],
                            margin: [1, 5, 1, 1],
                            fillColor: '#ffffff',
                            color: '#000',
                            fontSize: 10
                          },
                            {
                              text: [{text: ' Part name : ', italics: true}, vm.products.objectName],
                              fontSize: 9,
                              margin: [0, 5, 0, 0]
                            }
                          ]
                        ]
                      },

                      marginTop: -6,
                      marginBottom: 8,
                      layout: 'noBorders'
                    }
                  ]
                ]
              },
              layout: 'noBorders'
            }]
          };
          gridOptions.exporterPdfCustomFormatter = function (docDefinition) {
            docDefinition.styles.headerStyle = {
              margin: [30, 5, 10, 0],
              fillColor: '#208abe',
              color: '#fff'
            };
            docDefinition.styles.flatStyle = {
              color: '#000',
              margin: [0, 2, 4, 2],
              fillColor: '#fff'
            };
            docDefinition.styles.flatValueStyle = {
              color: '#000',
              margin: [0, 0, 4, 0],
              bold: true,
              fillColor: '#fff'
            };
            docDefinition.styles.dateStyle = {
              color: '#000',
              fillColor: '#fff'
            };
            return docDefinition;
          };

          const defaultOffset = 5;
          const subtraction = Math.ceil((vm.targetQuatity || '').toString().length * 2) - 'Target Quantity:'.length;
          const targetCostOffset = subtraction > 0 ? subtraction : 0;
          const targetCostOffsetString = targetCostOffset > 0 ? new Array(targetCostOffset).join('  ') : '';
          const targetCostValueOffset = Math.abs(subtraction) + defaultOffset;
          const targetCostValueString = new Array(targetCostValueOffset).join('  ');

          let exportColumnHeaders = uiGridExporterService.getColumnHeaders(gridApi, uiGridExporterConstants.VISIBLE);
          let exportData = uiGridExporterService.getData(gridApi, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE, true);
          _.forEach(exportData, row => {
            _.forEach(row, field => {
              if (field.value) {
                field.value = field.value.toString().replace(/(^\s*)|(\s*)$/g, '');
                field.value = field.value.toString().replace(/\u200e/g, '');
              }
            })
          });
          let docDefinition = uiGridExporterService.prepareAsPdf(gridApi, exportColumnHeaders, exportData);
          let countSpace = targetCostOffset;
          let base64Values;

          let thumbnailIndex = _.findIndex(exportColumnHeaders, {name: "thumbnailPath"});

          if (flatFlag === 'flat') {
            var unitCostVal = vm.unitCostValue ? $filter('number')(vm.unitCostValue, vm.currencyDecimalSetting === 'No Limit' ? 2 : Number(vm.currencyDecimalSetting)) : '';
            var targetCostVal = vm.targetCostValue ? $filter('number')(vm.targetCostValue, vm.currencyDecimalSetting === 'No Limit' ? 2 : Number(vm.currencyDecimalSetting)) : '';
            gridOptions.exporterPdfHeader.columns[0].table.body.push(
              [{
                text: 'Unit Cost:',
                style: 'flatStyle'
              },
                {
                  text: [{
                    text: 'Target Quantity:  '
                  }, {
                    text: '\u200B' + targetCostOffsetString + 'Target Cost:'
                  }],
                  style: 'flatStyle'
                }
              ], [{
                text: vm.currencySetting + ' ' + unitCostVal,
                style: 'flatValueStyle'
              },
                {
                  text: [{
                    text: vm.targetQuatity || ' '
                  }, {
                    text: '\u200B' + targetCostValueString + '$ ' + targetCostVal
                  }],
                  style: 'flatValueStyle'
                }
              ]
            );
            docDefinition.pageMargins = [0, 125, 10, 40];
            base64Values = getBase64Values(docDefinition, thumbnailIndex);
          } else {
            docDefinition.pageMargins = [0, 100, 10, 40];
            if (flatFlag == 'hierarchical') {
              base64Values = getBase64Values(docDefinition, thumbnailIndex);
            } else {
              base64Values = getBase64Values(docDefinition, thumbnailIndex);
            }
          }
          docDefinition.content[0].table.widths = 100 / docDefinition.content[0].table.widths.length + '%';

          base64Values.then(function (values) {
            if (flatFlag == 'flat') {
              vm.flatViewGridOptions.exporterSuppressColumns = ['bomId'];
              parseThumbnailValues(docDefinition, thumbnailIndex, values);
            } else {
              vm.hierarchicalGridOptions.exporterSuppressColumns = ['bomId', 'objectId'];
              parseThumbnailValues(docDefinition, thumbnailIndex, values);
            }

            if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
              uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
            } else {
              if (option === 'print') {
                pdfMake.createPdf(docDefinition).print();
              } else {
                pdfMake.createPdf(docDefinition).download();
              }
            }
          });
        });
      }
    }

    function getBase64Values(doc, index) {
      var promises = [];
      angular.forEach(doc.content[0].table.body, function (value, k) {
        if (k != 0) {
          promises.push(value[index] ? parseImgToBase64(value[index], true) :
            vm.partproduct == 'parts' ? parseImgToBase64('assets/images/ecommerce/part-square.png')
              : parseImgToBase64('assets/images/ecommerce/product-sqaure.png'));
        }
      });

      return Promise.all(promises);
    }

    function parseThumbnailValues(doc, index, values) {
      angular.forEach(doc.content[0].table.body, function (contentItem, k) {
        if (k == 0)
          return;

        if (values[k - 1]) {
          contentItem[index] = {
            image: values[k - 1]
          };
        } else {
          contentItem[k - 1] = 'No image available'
        }
        return contentItem;
      });
      return doc;
    }

    function parseImgToBase64(url, flag) {
      return new Promise(function (resolve, reject) {
        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');
        ctx.canvas.width = 35;
        ctx.canvas.height = 27;
        var image = new Image();
        if (flag) {
          url = url.replace(/^https:\/\//i, 'http://');
          image.setAttribute('crossOrigin', 'anonymous');
        }
        image.src = url;
        image.onload = function () {
          ctx.drawImage(image, 8, 0, 25, 25);
          resolve(c.toDataURL());
        };
      });
    }

    function showClearButton(gridApi) {
      if (gridApi === vm.hierarchicalUiGrid) {
        vm.flaghierHierr = false;
        vm.flaghierHierr = buttonForClear(vm.flaghierHierr);
      } else if (gridApi === vm.sourcingUiGrid) {
        vm.flaghierSourcing = false;
        vm.flaghierSourcing = buttonForClear(vm.flaghierSourcing);
      } else {
        vm.flaghierFlat = false;
        vm.flaghierFlat = buttonForClear(vm.flaghierFlat);
      }

      function buttonForClear(flaghier) {
        _.forEach(gridApi.grid.columns, function (column) {
          if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name != 'treeBaseRowHeaderCol' &&
            column.field != 'objectId' && column.field != 'bomId' && column.name != 'selectionRowHeaderCol') {
            flaghier = true;
          }
          if (column.filters[0].term != undefined) {

            flaghier = true;
          }
        });
        if (gridApi.grid.getColumnSorting().length != 0) {
          flaghier = true;
        }
        return flaghier;
      }
    }

    function clearFilters(gridApi) {
      gridApi.grid.clearAllFilters();
      gridApi.grid.resetColumnSorting(gridApi.grid.getColumnSorting());
      _.forEach(gridApi.grid.columns, function (column) {
        if ((column.isPinnedLeft() || column.isPinnedRight()) && column.field !== 'objectId' && column.name !== 'treeBaseRowHeaderCol' && column.name !== 'selectionRowHeaderCol' &&
          column.field !== 'bomId') {
          gridApi.pinning.pinColumn(column, uiGridPinningConstants.container.NONE);
        }
      });
      saveState();
      saveFlatViewState();
    }

    function setGridHeight(gridApi, tableId) {
      const tableHeaderHeight = 150;
      const outerHeight = tableId === 'grid-hierarchical' ? 0 : 30;
      const actualHeight = getVisibleRows(gridApi) * vm.hierarchicalGridOptions.rowHeight + tableHeaderHeight;
      const maxheight = getMaxgridHeight(tableId) - outerHeight;
      return Math.min(actualHeight, maxheight) + 'px';
    }

    function getMaxgridHeight(tableId) {
      let offsetHeight;
      if (!getMaxgridHeight.lastHeight) {
        getMaxgridHeight.lastHeight = {};
      }
      if (getMaxgridHeight.lastHeight[tableId]) {
        offsetHeight = getMaxgridHeight.lastHeight[tableId];
      } else {
        offsetHeight = document.getElementById(tableId).offsetHeight;
        getMaxgridHeight.lastHeight[tableId] = offsetHeight;
      }
      return document.documentElement.clientHeight - offsetHeight;
    }

    function getVisibleRows(gridApi) {
      return gridApi.core.getVisibleRows(gridApi.grid).length;
    }

    $rootScope.$on('updateThumbnail', function (event, thumbnail) {
      vm.thumbnailSrc = thumbnail;
    });


    $scope.$on('quantities removed', function (event, incomingData) {
      processRemoveQuantities(incomingData);
      calculateFlatView(true);
    });

    function processRemoveQuantities(incomingData) {
      const tableData = vm.hierarchicalGridOptions.data;
      _.forEach(tableData, tableRow => {
        _(incomingData)
          .filter(['objectId', tableRow.objectId])
          .forEach(incomingRow => {
            tableRow = _.assign(tableRow, incomingRow);
            tableRow.shortage = (tableRow.qtyTotal || 0) - tableRow.requiredQty;
          });
      });
    }

    $scope.$on('refreshContent', function () {
      var confirm = $mdDialog.confirm()
        .title('Do you want to clear the clipboard?')
        .ariaLabel('clear the clipboard?')
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function () {
        clipboardService.removeAllItems();
        init();
      }, function () {
        init();
      })
    });

    $scope.$on('reloadBOMTable', function () {
      init();
    });

    $scope.$on('configuration is changed', function () {
      init();
    });

    $scope.$on('progress: true', function () {
      vm.hierarchicalViewProgressBar = true;
    });

    $scope.$on('loading started', function () {
      vm.leftSideProgress = true;
    });

    $scope.$on('loading done', function () {
      vm.leftSideProgress = false;
    });

    function processProxyDetails() {
      $rootScope.$watch('systemSetting', value => {
        if (value !== undefined) {
          let systemSettings = value;
          vm.currencySetting = systemSettings && systemSettings.currencySettings ?
            (systemSettings.currencySettings.currencyChoice.split(' ')[0]) : '$';

          vm.currencyDecimalSetting = systemSettings && systemSettings.currencyDecimals && systemSettings.currencyDecimals.currencyDecimals ?
            systemSettings.currencyDecimals.currencyDecimals === 'No Limit'? 'No Limit' : (Number(systemSettings.currencyDecimals.currencyDecimals)) : 'No Limit';

          vm.fullSystemCurrency = (systemSettings.currencySettings && systemSettings.currencySettings.currencyChoice)
            || currencyExchangeService.getDefaultCurrencyString();

          vm.priceBreakSetting = systemSettings && systemSettings.costSplitSettings ?
            (systemSettings.costSplitSettings.allowCostSplit === 'true') : false;

          vm.releaseBomSettings = systemSettings && systemSettings.releaseBomSettings ?
            (systemSettings.releaseBomSettings.allowEdit === 'true') : false;

          vm.configurationSettings = systemSettings.configurationSetting ?
            (systemSettings.configurationSetting.configurationEnabled === 'true') : false;

          vm.editSubLevelPartsSetting = systemSettings.editSubLevelParts && systemSettings.editSubLevelParts.editSubLevelParts === 'true';

          vm.sourceCostRowTooltipText = sourceCostService.getRowTooltipText();
          vm.unitCostTooltipText = sourceCostService.getUnitCostTooltipText();

          callSelecttionTab(vm.configurationSettings);
          setBomTabSelect(vm.configurationSettings);
          vm.editReleased = systemSettings.releaseSettings ?
            (systemSettings.releaseSettings.allowEdit === 'true') : false;

          if (vm.priceBreakSetting) {
            _.forIn(systemSettings, function (o) {
              if (_.has(o, 'id') && _.has(o, 'name')) {
                if (o.id === 'M') {
                  if (vm.priceBreakNames[0] && vm.priceBreakNames[0].id === helperData.rollupCostId) {
                    vm.priceBreakNames.splice(1, 0, o);
                  } else {
                    vm.priceBreakNames.unshift(o);
                  }
                } else if (o.id === helperData.rollupCostId) {
                  vm.priceBreakNames.unshift(o);
                } else {
                  vm.priceBreakNames.push(o);
                }
              }
            });
          }
          vm.breakCostArray = setCostDetail(angular.copy(vm.priceBreakNames));

          if (defaultTemplateService.isDefaultTemplateUpdated(objectPageEnum.heirarchicalPage)) {
            buildHierarchicalTableUsingDefaultTemplate();
          } else {
            renderHierarchicalTable();
          }

          if (defaultTemplateService.isDefaultTemplateUpdated(objectPageEnum.flatPage)) {
            buildFlatTableUsingDefaultTemplate();
          } else {
            renderFlatTable();
          }
        }
      });
    }

    /**
     * builds hierarchical table applying default template to it
     */
    function buildHierarchicalTableUsingDefaultTemplate() {
      getGridStateAndAttributes(objectPageEnum.heirarchicalPage)
        .then(function (responses) {
          if (!responses[1].data || responses[1].code !== 0) {
            renderHierarchicalTable();
            return;
          }

          applyDefaultTemplate({
            sections: responses[0],
            templateState: responses[1].data,
            gridOptions: vm.hierarchicalGridOptions,
            gridApi: vm.hierarchicalUiGrid,
            pageType: vm.objectPageEnum.heirarchicalPage
          });

          fuseUtils.setProperHeaderViewportHeight(vm.hierarchicalGridOptions.columnDefs, 3, null, vm.hierarchicalUiGrid);
          setTemplatePopup('loading of parts ended');
          templatesProcessingService.setAppliedTemplateId(objectPageEnum.heirarchicalPage, responses[1].data.templateId);
        });
    }

    /**
     * build flat table applying default template to it
     */
    function buildFlatTableUsingDefaultTemplate() {
      getGridStateAndAttributes(objectPageEnum.flatPage)
        .then(function (responses) {
          if (!responses[1].data || responses[1].code !== 0) {
            renderFlatTable();
            return;
          }

          applyDefaultTemplate({
            sections: responses[0],
            templateState: responses[1].data,
            gridOptions: vm.flatViewGridOptions,
            gridApi: vm.flatViewGrid,
            pageType: vm.objectPageEnum.flatPage
          });

          var sections = responses[0];
          var gridState = responses[1].data.templateData;

          templatesProcessingService.matchDisplayedAttributes(gridState.columns, sections);
          vm.flatViewGridOptions.columnDefs = buildFlatViewGridColumns(sections);

          fuseUtils.setProperHeaderViewportHeight(vm.flatViewGridOptions.columnDefs, 6, objectPageEnum.flatPage);
          templatesProcessingService.setBomAttributesToLocalstorage(sections, objectPageEnum.flatPage, vm.configurationSettings);
          $window.localStorage.setItem('gridFlatViewState', angular.toJson(gridState));
          setTemplatePopup('flatViewGrid API is instantiated');
          defaultTemplateIdFlat = responses[1].data.templateId;
          templatesProcessingService.setAppliedTemplateId(objectPageEnum.flatPage, responses[1].data.templateId);
        })
    }

    function setTemplatePopup(eventName) {
      var unsubscribeFromEvent = $scope.$on(eventName, function () {
        showOkPopup('Admin has set a default template for this table and it will be loaded. ' +
          'Any changes made to it will be retained in this browser for this user only', true)
          .then(function () {
            unsubscribeFromEvent();
          })
      })
    }

    /**
     * builds table ignoring default template, but using user's settings
     */
    function renderHierarchicalTable() {
      vm.hierarchicalGridOptions.columnDefs = buildHierarchicalGridColumns(initAttributes(vm.objectPageEnum.heirarchicalPage));
      restoreState();
    }

    /**
     * builds table ignoring default template, but using user's settings
     */
    function renderFlatTable() {
      vm.flatViewGridOptions.columnDefs = buildFlatViewGridColumns(initAttributes(vm.objectPageEnum.flatPage));
      fuseUtils.setProperHeaderViewportHeight(vm.flatViewGridOptions.columnDefs, 6, objectPageEnum.flatPage);
    }

    /**
     * Builds hierarchical table and applies default template to it
     * @param options
     */
    function applyDefaultTemplate(options) {
      var gridState = options.templateState.templateData;
      var sections = options.sections;
      var gridOptions = options.gridOptions;
      var gridApi = options.gridApi;
      var pageType = options.pageType;

      templatesProcessingService.matchDisplayedAttributes(gridState.columns, sections);

      gridOptions.columnDefs = buildHierarchicalGridColumns(sections);
      templatesProcessingService.setBomAttributesToLocalstorage(sections, pageType, vm.configurationSettings);
      setTimeout(function () {
        gridApi.saveState.restore($scope, gridState);
      }, 100);
    }

    function getGridStateAndAttributes(pageType) {
      var promises = [];

      promises.push(templatesProcessingService.getAllBomAttributes(pageType));
      promises.push(defaultTemplateService.getDefaultTemplate(pageType));

      return Promise.all(promises);
    }

    function calculateAfterChangingCostType(costType, availableCostDefs, row, isFlatChanged, oldCostType) {
      if (isFlatChanged) {
        switchCostInFlatView(costType, availableCostDefs, row, isFlatChanged, oldCostType);
      } else {
        recalculateOneRow(costType, availableCostDefs, row, isFlatChanged, oldCostType);
      }
      handleSourcerChange(row, null, costType);
      vm.calculateFlatView(true);
    }

    function switchCostInFlatView(costType, availableCostDefs, row, isFlatChanged, oldCostType) {
      vm.hierarchicalGridOptions.data.filter((hierarchicalRow) => {
        return hierarchicalRow.objectId === row.objectId && hierarchicalRow.costType === oldCostType;
      })
        .forEach((hierarchicalRow) => {
          recalculateOneRow(costType, hierarchicalRow.availableCostDefs, hierarchicalRow, isFlatChanged, oldCostType);
        });
    }

    function recalculateOneRow(costType, availableCostDefs, row, isFlatChanged, oldCostType) {
      vm.changeOneCostFlag = true;
      const costDef = sourceCostService.getCostDefApplied(row, costType);
      changeGridAfterChangingCostType(vm.hierarchicalGridOptions.data, costDef, row.bomId, costType, 0, null, null, null, row.parentIndex, isFlatChanged, row, oldCostType);
    }

    function setCostDetail(arr, manualCost, rollupCost) {
      manualCost = manualCost || '';
      rollupCost = rollupCost || '';
      if (_.find(arr, function (val) {
        return val.id == 'M';
      }) == undefined) {
        if (_.find(arr, function (val) {
          return val.id === helperData.rollupCostId;
        }) == undefined) {
          arr.unshift({
            id: 'M',
            name: 'Manual',
            value: 1,
            cost: manualCost
          });
        } else {
          arr.splice(1, 0, {
            id: 'M',
            name: 'Manual',
            value: 1,
            cost: manualCost
          });
        }
      }
      if (_.find(arr, function (val) {
        return val.id === helperData.rollupCostId;
      }) == undefined) {
        arr.unshift({
          id: helperData.rollupCostId,
          name: 'Rollup',
          value: '',
          cost: rollupCost
        });
      }
      return arr;
    }

    function parsePriseBreak(arr = []) {
      return arr.map((costDefinition) => {
        costDefinition.costType = getFormattedCostType(costDefinition);
        return costDefinition;
      });
    }

    function getFormattedCostType(costDef) {
      const {name, costType} = costDef;
      return name ? getFormattedCostTypeForPartCost(costDef) : costType;
    }

    function getFormattedCostTypeForPartCost(costDef) {
      const moqDisplayName = 'MOQ';
      const {name, id, cost} = costDef;
      return name + ' (' + (costDef[id] ? `${moqDisplayName} ` +
        +costDef[id] + ': ' : moqDisplayName + ' : ') + `${isNaN(cost) ? '' : vm.currencySetting}` + (cost ? cost : 0) + ')';
    }

    function changeGridAfterChangingCostType(arr, appliedCostDef, id, costType, diff, flat, all, isRecursiveCall, parentIndex, isFlatChanged, clickedRow, oldCostType) {
      _.forEach(arr, function (row) {
        const exactMatchCheck = parentIndex && ((parentIndex !== row.parentIndex));
        // const flatViewCostChangeCheck = !(isFlatChanged && row.costType === oldCostType && row.objectId === clickedRow.objectId);
        const flatViewCostChangeCheck = true;
        if (exactMatchCheck && flatViewCostChangeCheck) {
          return;
        }
        if (flat ? ((row.objectId === id) || (row.bomId === id && diff)) : (row.bomId === id) || !flatViewCostChangeCheck) {
          let costDifference;
          if (diff || isRecursiveCall) {
            row.availableBreakCosts = _.map(row.availableBreakCosts, modifyRollupCost.bind(this, row, diff));
            if (row.costType === helperData.rollupCostId) {
              costDifference = diff;
            }
            parsePriseBreak(row.availableBreakCosts);
          } else if (!all) {
            if (appliedCostDef) {
              costDifference = partCostService.getRollupCostChange(appliedCostDef, row);
              row.fuseCost = partCostService.getConvertedFuseCost(appliedCostDef);
              if (_.find(row.availableBreakCosts, {id: appliedCostDef.id})) {
                row.costType = appliedCostDef.id;
              }
            }
          }

          if (row.parentBomId) {
            costDifference = costDifference * parseFloat(row.quantity);
            let reducedParentIndex;
            if (parentIndex) {
              reducedParentIndex = parentIndex.split('.').slice(0, -1).join('.');
            }
            changeGridAfterChangingCostType(arr, appliedCostDef, row.parentBomId, costType, costDifference, flat, true, null, reducedParentIndex, isFlatChanged, clickedRow, oldCostType)
          }
        }
      });
    }

    function modifyRollupCost(row, diff, costDef) {
      if (costDef.id === helperData.rollupCostId) {
        const fixed = 10000000000000000;
        costDef.cost = Math.abs(diff) ? (((costDef.cost === '' || !costDef.cost) ? 0 :
          parseFloat(isNaN(costDef.cost) ? costDef.fuseCost.split(vm.currencySetting).join("") : costDef.cost))*fixed + diff*fixed)/fixed : '';
        if (costDef.cost < 0) {
          costDef.cost = 0;
        }
      }
      if (row.costType === costDef.id) {
        row.fuseCost = partCostService.getConvertedFuseCost(costDef);
      }
      return costDef;
    }

    function calculateAll(costTypeId) {
      vm.breakFlag = costTypeId;
      vm.allPartsFlag = true;
      vm.flatPartsFlag = false;
      changeAllCostTypes(vm.hierarchicalGridOptions.data, costTypeId);
      vm.calculateFlatView(true);
    }

    function changeAllCostTypes(arr, costType) {
      arr.forEach((row) => {
        const appliedCostDef = sourceCostService.getCostDefApplied(row, costType);
        if (arr === vm.hierarchicalGridOptions.data && appliedCostDef) {
          changeGridAfterChangingCostType(arr, appliedCostDef, row.objectId, costType, 0, true);
          handleSourcerChange(null, null, appliedCostDef.id);
          return;
        }
        if (appliedCostDef) {
          row.costType = appliedCostDef.id;
          changeCostAfterChangingCostType(vm.originalFlatViewRows, appliedCostDef, row, costType);
          changeGridAfterChangingCostType(vm.hierarchicalGridOptions.data, appliedCostDef, row.bomId, costType, 0, null, null, null, row.parentIndex);
          changeGridAfterChangingCostType(vm.flatViewGridOptions.data, appliedCostDef, row.bomId, costType, 0, null, null);
          var difference = partCostService.getRollupCostChange(appliedCostDef, row);
          row.fuseCost = partCostService.getConvertedFuseCost(appliedCostDef);
        }
        if (costType === helperData.rollupCostId) {
          parsePriseBreak(row.availableBreakCosts);
          changeGridAfterChangingCostType(arr, appliedCostDef, row.objectId, costType, difference, true, true);
        }
      });
    }


    /**
     * @param parts - the subObjects, which are included into the main fuseObject
     */

    function tabSearch(val) {
      if (!vm.isFlatVisited && val === 'flat') {
        vm.isFlatVisited = true;
      }
      vm.bomTab = val;
    }

    function resetToDefault() {
      if (vm.changeOneCostFlag || vm.allPartsFlag || vm.flatPartsFlag) {
        vm.hierarchicalGridOptions.data = angular.copy(originalBoms.hierarchical);
        vm.calculateFlatView(true);
      }
      vm.breakFlag = '';
      vm.allPartsFlag = false;
      vm.flatPartsFlag = false;
      vm.changeOneCostFlag = false;
    }

    function calculateFlatRows(chosenCostDef) {
      vm.breakFlag = chosenCostDef.id;
      vm.flatPartsFlag = true;
      vm.allPartsFlag = false;
      flatViewService.iterateOverFlatRows(vm.hierarchicalGridOptions.data, (row) => {
        handleSourcerChange(row, true, chosenCostDef.id);
        recalculateOneRow(chosenCostDef.id, row.availableCostDefs, row, false);
      });
      vm.calculateFlatView(true);
    }

    function setExtendedCostProps(colDef) {
      colDef.type = 'number';
      colDef.tooltipDirection = 'top';
      colDef.tooltipText = "'Cost' * 'Quantity'. $0.00 when cost is not available.";
      colDef.headerCellTemplate = tooltipHeaderTemplates;
      colDef.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/exchange-currency-cell.html';
    }

    function calculateExtendedCost(arr) {
      angular.forEach(arr, (row) => {
        if (!row.slNo) {
          return;
        }
        const cost = partCostService.retrieveCost(row.fuseCost);
        row.extendedCost = row.fuseCost === vm.error.noAvailableCurrency ? row.fuseCost :
          initLeaveMeaningfulDigits(cost, row.quantity);
        row.totalCost = initLeaveMeaningfulDigits(cost, row.requiredQty);
        row.fuseCost = typeof row.fuseCost === 'number' ? initLeaveMeaningfulDigits(row.fuseCost, 1) : row.fuseCost;
      })
    }

    function initLeaveMeaningfulDigits(base, multiplicator) {
      const systemCurrency = currencyExchangeService.getSystemCurrency().sign;
      const multiplication = base * multiplicator;
      if(isNaN(multiplication)) {
        return `${systemCurrency} ${0}`;
      }
      return `${systemCurrency} ${leaveMeaningfulDigits(multiplication)}`;
    }

    function leaveMeaningfulDigits(number) {
      const base = number.toFixed(14);
      for( var i = base.length - 1; base[i] === '0'; i--);
      const result = base.slice(0, ++i);
      return result[result.length - 1] === '.' ? result.slice(0, -1) : result;
    }

    function setHeightImg(ev) {
      if (!ev) {
        var ev = window.event
      }
      var img = ev.target;

      if (img.className.indexOf('thumbnail-bom-tooltip') === -1) {
        var parentImg = img.parentElement;
        var wrapp = document.getElementsByClassName('bom-table')[0];
        var diff = img.getBoundingClientRect().y - wrapp.getBoundingClientRect().y;
        var bigImgs = Array.prototype.slice.call(parentImg.getElementsByClassName('thumbnail-bom-tooltip'));

        bigImgs.forEach(function (img, i, imgs) {
          if (diff < 500) {
            img.style.bottom = '-' + (550 - diff) + 'px';
          }
        });
      }
    }

    vm.cardDialogResponses = [];

    function getBoards(row) {
      var cardIds = row.entity.associatedCardsList;
      var promises = [];
      if (cardIds[0] === 'no access') {
        showOkPopup('Can not display card name because you do not have access to this board');
        return;
      }

      row.entity.cardsInfo = [];
      cardIds.forEach(function (cardId) {
        promises.push(BoardService.getBoardBycardId(cardId))
      });

      Promise.all(promises)
        .then(function (res) {
          row.entity.cardsDownloaded = true;
          res.forEach(function (r, i) {
            if (r.code !== 0) {
              cardIds[i] = '-1';
              return;
            }
            vm.cardDialogResponses.push(r);
            row.entity.cardsInfo.push(r.data);
          });
          cardIds = _.filter(cardIds, function (id) {
            return id !== '-1'
          });
          if (cardIds.length === 0) {
            cardIds[0] = 'no access';
            showOkPopup('Can not display card name because you do not have access to this board');
            return;
          }
          cardIds.forEach(function (card, i) {
            row.entity.cardsInfo[i].chosenCard = getCard(card, row.entity.cardsInfo[i]);
          });
          $scope.$digest();
        }, function () {
        })
    }

    function showOkPopup(message, customReaction) {
      $mdMenu.hide();
      var messages = message.split('.');
      var dialog = $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text"><div>' + messages[0] + '.</div> <div>' + messages[1] + '.</div></div><div><md-button class="show-ok-popup-button md-accent md-raised  md-button md-default-theme md-ink-ripple" ng-click="close()">Ok</md-button></div>',
        controller: function DialogController($scope, $mdDialog) {
          $scope.close = function () {
            $mdDialog.hide();
          }
        }
      });

      if (customReaction) {
        return dialog;
      }
      dialog.then(function () {
      }, function () {
      });
    }

    function getCard(cardId, board) {
      var neededCard = _.find(board.cards, {id: cardId});
      return neededCard
    }

    function processGetAllUsers(response) {
      switch (response.code) {
        case 0:
          vm.allUsers = response.data.Members;
          break;
        case 4006:
          break;
        default:
      }
    }

    function removeQuantitiesFlatView() {
      selectedRowsFlatView = _.filter(vm.flatViewGridOptions.data, function (row) {
        return row.objectId;
      });

      var note = vm.editReleased ? 'NOTE: The Setting \'Editing Released Objects > Allow edits to certain attributes\' ' +
        'is ENABLED. Clicking Yes, will update the inventory values for all objects (including Released) in this BOM.'
        : 'NOTE: The Setting \'Editing Released Objects > Allow edits to certain attributes\' is DISABLED. ' +
        'Clicking Yes, will NOT update the inventory values for Released objects in this BOM.';
      var confirm = $mdDialog.confirm()
        .htmlContent('<div class="remove-quantities-confirm-container"><h2>Are you sure you want to remove BOM quantities from inventory?</h2>' + '<h2>' + note + '</h2></div>')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {

        $mdDialog.show({
          controller: 'BulkDeleteController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/bulk-delete/bulk-delete.html',
          clickOutsideToClose: false,
          locals: {
            selectedRows: selectedRowsFlatView,
            isRemoveQuantitiesFlatView: true,
            params: {},
            targetQuatity: vm.targetQuatity
          }
        }).then(function (val) {
          helpSettingService.addData(val);
        });
      });
    }

    function changeConfiguration(newConfigurationId, row) {
      vm.hierarchicalViewProgressBar = true;
      vm.sourcingViewProgressBar = true;
      vm.flatViewProgressBar = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id
        }
      }

      var data = {
        bomId: row.bomId,
        objectKey: newConfigurationId,
        bomPackage: row.bomPackage,
        referenceDesignator: row.referenceDesignator,
        quantity: row.quantity,
        notes: row.notes
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatebom, params, data, header)
        .then(function (response) {
          init();
        })
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }


    function openClipboardTable() {
      $mdDialog.show({
        controller: 'ClipboardDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/core/directives/clipboard-floating-icon/clipboard-dialog-template.html',
        clickOutsideToClose: false,
        locals: {
          params: {
            rowsForGrid: clipboardService.getAllSavedItems(),
            isConfigEnabled: vm.configurationSettings,
            isBom: true
          }
        }
      }).then(function () {
      }, function () {
      });
    }

    vm.userActionsRegistry = new UserActionStoryStorage(vm);

  }
})();
