(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('CompareController', CompareController);

  /** @ngInject */
  function CompareController($state, $location, $filter, uiGridGridMenuService,
                             msUtils, $stateParams, $mdDialog, $document, hostUrlDevelopment,
                             uiGridTreeBaseService, CustomerService, GlobalSettingsService,
                             errors, $mdToast, fuseUtils, AuthService, DialogService, objectsCompareService,
                             $scope, $timeout, $rootScope, $window, uiGridExporterConstants,
                             uiGridExporterService, uiGridPinningConstants, objectPageEnum, $q, $cookies) {

    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;


    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;
    /**
     * Sourcing Tab Configuration
     * @type {Array}
     */

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    var params = '';

    if (vm.sessionData.proxy == true) {
      params = {
        customerId: vm.sessionData.customerAdminId,
        requestCompareObjectIds: $cookies.get('idsForCompare').split(',')
      }
    } else {
      params = {
        requestCompareObjectIds: $cookies.get('idsForCompare').split(',')
      }
    }

    var data = {
      additionalInfo: true,
      attachmentData: false,
      basicInfo: true,
      bomFlatCompare: false,
      bomHierarchicalCompare: true
    };
    vm.objectsIdsForCompare = params.requestCompareObjectIds;

    //data
    /**
     * $stateParams is an object with properties:
     * 1)targetPageIndex - shows the tab from which compare revisions page was invoked
     * 2)idsForCompare is not used field. legacy code, what I dont want to touch
     */
    var id = $stateParams.id;
    var previousTabIndex = $stateParams.targetPageIndex || 0;

    vm.heightMax = document.body.scrollHeight;
    vm.linksInHeader = [];
    vm.heightMax = document.body.scrollHeight;
    vm.selectedTab = 0;
    $rootScope.linksInHeader = [];
    $rootScope.hierarchicalCompareObjects = [];

    var SHOW_ALL = 'Show All';
    vm.showAllButtonBom = SHOW_ALL;
    vm.showAllButtonAttachments = SHOW_ALL;
    vm.showAllButtonAttr = SHOW_ALL;

    //Methods
    vm.backPartFunction = backPartFunction;
    vm.clearFilters = clearFilters;
    vm.showChangesBom = showChangesBom;
    vm.showChangesAttr = showChangesAttr;
    vm.showChangesAttachments = showChangesAttachments;
    vm.downloadTable = downloadTable;
    vm.isDocument = isDocument;

    function showChangesAttachments(showChangesFlag){
      vm.showAllButtonAttachments = showChangesFlag ? 'Show only differences' : 'Show All';
      $scope.$broadcast('showChangesAttachmentsCompare', showChangesFlag);
    }

    GlobalSettingsService.getProxydetails()
      .then(function(response){
        if(response.code === 0){
          vm.configurationSettings = response.data.systemSettings.configurationSetting ?
            (response.data.systemSettings.configurationSetting.configurationEnabled === 'true') : false;
        }else{
          console.log(response.message);
        }

        init();
      });


    function init () {
      vm.progress = true;
      vm.showAllButtonAttr = 'Show All';
      objectsCompareService.getDataForComparison(data, $cookies.get('idsForCompare').split(','))
        .then(function (res) {

          $rootScope.hierarchicalCompareObjects = res.data.comparisonResponse.hierarchicalCompare;

          vm.linksInHeader = makeLinksInHeader(res.data.comparisonResponse.attributeCompare);

          $rootScope.linksInHeader = vm.linksInHeader;

          vm.attributesGridOptions.data = buildAttributesData(res.data.comparisonResponse.attributeCompare);
          vm.attributesGridOptions.columnDefs = buildAttributesColumns();
        }).then(function(){
          vm.attributesGridOptions.data = setShowChangesFlagAttr(vm.attributesGridOptions.data);
          //because buildAttributesData is not fast
          $timeout(function () {
              vm.attributesTableUiGrid && vm.attributesTableUiGrid.treeBase.expandAllRows();
              vm.progress = false;
            }, 100
          );
        })
    }

    vm.attributesGridOptions = {
      //columnDefs: buildAttributesColumns(),
      //exporterCsvFilename: 'function()',
      showTreeExpandNoChildren: false,
      showTreeRowHeader: true,
      enableColumnReordering: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnResizing: true,
      enableSorting: true,
      enableHiding: false,
      enableCellEdit: false,
      //enableFiltering: true,
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      exporterPdfTableStyle: {
        margin: [15, 0, 15, 0]
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'LETTER',
      rowHeight: 30,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 1,
      //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
      paginationPageSize: 100,
      paginationPageSizes: [
        {label: '25', value: 25},
        {label: '50', value: 50},
        {label: '75', value: 75},
        {label: '100', value: 100}
      ],
      paginationTemplate: "<div class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div class=\"ui-grid-pager-container\"><div class=\"ui-grid-pager-control\"><button type=\"button\" ng-click=\"paginationApi.seek(1)\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle\"><div class=\"first-bar\"></div></div></button> <button type=\"button\" ng-click=\"paginationApi.previousPage()\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle prev-triangle\"></div></button> <input type=\"number\" ng-model=\"grid.options.paginationCurrentPage\" min=\"1\" max=\"{{ paginationApi.getTotalPages() }}\" required> <span class=\"ui-grid-pager-max-pages-number\" ng-show=\"paginationApi.getTotalPages() > 0\">/ {{ paginationApi.getTotalPages() }}</span> <button type=\"button\" ng-click=\"paginationApi.nextPage()\" ng-disabled=\"cantPageForward()\"><div class=\"last-triangle next-triangle\"></div></button> <button type=\"button\" ng-click=\"paginationApi.seek(paginationApi.getTotalPages())\" ng-disabled=\"cantPageToLast()\"><div class=\"last-triangle\"><div class=\"last-bar\"></div></div></button></div><div class=\"ui-grid-pager-row-count-picker\">"+

      "<select ng-model=\"grid.options.paginationPageSize\""+

      "ng-options=\"o.value as o.label for o in grid.options.paginationPageSizes\">"+

      "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
      exporterExcelFilename: 'Attribute-Compare.xlsx',
      exporterExcelSheetName: 'Sheet1',
      exporterExcelCustomFormatters: function ( grid, workbook, docDefinition ) {
        let stylesheet = workbook.getStyleSheet();
        let newStyle = stylesheet.createFontStyle({
          color: 'FF008000'
        });
        let newStyleFormatDefn = {
          "font": newStyle.id,
          "alignment": { "wrapText": true }
        };
        let sectionStyleFormatDefn = {
          "fill": { "type": "pattern", "patternType": "solid", "fgColor": "FFE5E5E5" },
          "alignment": { "wrapText": true }
        };
        let discardStyle = stylesheet.createFontStyle({
          color: 'FFFF0000'
        });
        let discardStyleFormatDefn = {
          "font": discardStyle.id,
          "alignment": { "wrapText": true }
        };
        let changeStyle = stylesheet.createFontStyle({
          color: 'FFFF8302'
        });
        let changeStyleFormatDefn = {
          "font": changeStyle.id,
          "alignment": { "wrapText": true }
        };
        formatters['new'] = stylesheet.createFormat(newStyleFormatDefn);
        formatters['discard'] = stylesheet.createFormat(discardStyleFormatDefn);
        formatters['change'] = stylesheet.createFormat(changeStyleFormatDefn);
        formatters['section'] = stylesheet.createFormat(sectionStyleFormatDefn);
        Object.assign(docDefinition.styles , formatters);
        return docDefinition;
      },
      exporterColumnScaleFactor: 7,
      exporterSuppressColumns: ['bomId', 'objectId'],

      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.attributesTableUiGrid = gridApi;

        $timeout(function(){
          vm.attributesTableUiGrid.treeBase.expandAllRows();
        },100);

        // Setup events so we're notified when grid state changes.
        vm.attributesTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.attributesTableUiGrid.colResizable.on.columnSizeChanged($scope, function(){
          vm.heightTopPanelAttributes = $('#grid-attributes-compare .ui-grid-top-panel').height();
          saveState();
        });
        //vm.hierarchicalUiGrid.grouping.on.aggregationChanged($scope, saveState);
        //vm.hierarchicalUiGrid.grouping.on.groupingChanged($scope, saveState);
        vm.attributesTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.attributesTableUiGrid.core.on.filterChanged($scope, function() {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.attributesTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.attributesTableUiGrid.pinning.on.columnPinned($scope, function(colDef) {
          if (vm.attributesGridOptions.initialized) {
            let gridCol;
            _.forEach(vm.attributesTableUiGrid.grid.columns, function (val) {
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

        vm.attributesTableUiGrid.core.on.renderingComplete($scope, function() {
          $timeout(function(){
            showChangesAttr(vm.showChangesAttributes);
          });
        });

        vm.attributesTableUiGrid.core.on.scrollBegin($scope, function() {
          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });
        vm.attributesTableUiGrid.core.on.scrollEnd($scope, function() {
          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });

        // Restore previously saved state.
        restoreState();

        vm.attributesTableUiGrid.core.on.rowsRendered($scope, function() {
          if ((vm.attributesGridOptions.data.length > 0) && !vm.attributesGridOptions.initialized) {
            $timeout(function() {
              vm.attributesGridOptions.initialized = true;
            });
          }
          showClearButton(vm.attributesTableUiGrid);
          vm.heightTopPanelAttributes = $('#grid-attributes-compare .ui-grid-top-panel').height();

          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });

      }
    };

    function buildAttributesColumns () {
      var columns = [];
      columns[0] = {
        name: 'attributeName',
        displayName: 'Attribute Name',
        field: 'attributeName',
        enableHiding: false,
        enableColumnMoving:false
      };

      angular.forEach(vm.objectsIdsForCompare, function(id, i) {
        var object = {};

        object.field = _.camelCase(id);
        object.name = id;
        object.displayName = vm.linksInHeader[i].name;
        object.enableColumnMoving = (i != 0);
        object.enableHiding = false;

        object.cellClass = function (grid, row) {
          if ( (row.entity[_.camelCase(id) + 'Code']) == 'NEW' ) return('new');
          if ( (row.entity[_.camelCase(id) + 'Code']) == 'CHANGE' ) return('change');
          if ( (row.entity[_.camelCase(id) + 'Code']) == 'DISCARD' ) return('discard');
        };

        columns.push(object);
      });
      return columns;
    }

    function buildAttributesData (allObjects) {

      var dataReturn = [];
      var arrayOfAllBasic = [];
      var arrayOfAllAdditional = [];

      angular.forEach(allObjects, function(obj){
        arrayOfAllBasic.push(obj.basicInfo);
        arrayOfAllAdditional.push(obj.additionalInfo);
      });

      var basicInfo = [ {attributeName: 'Basic Info', $$treeLevel: 0} ];
      var inventory = [ {attributeName: 'Inventory', $$treeLevel: 0} ];
      var cost = [ {attributeName: 'Cost', $$treeLevel: 0} ];
      var additionalInfo = [ {attributeName: 'Additional Info', $$treeLevel: 0} ];
      var creationHistory = [ {attributeName: 'History', $$treeLevel: 0} ];

      basicInfo =  basicInfo.concat( expandBasicAttributes(arrayOfAllBasic) );
      var objectsAfterParseBasic = expandAttrFromObjects(allObjects, 'basicInfo');

      additionalInfo =  additionalInfo.concat( expandAdditionalAttributes(arrayOfAllAdditional) );
      var objectsAfterParseAdditional = expandAttrFromObjects(allObjects, 'additionalInfo');

      var objectAfterAllParse =  objectsAfterParseBasic.concat(objectsAfterParseAdditional);

      dataReturn = dataReturn.concat(basicInfo, cost, inventory, additionalInfo, creationHistory);

      dataReturn = getRowsWithAttrOfOdjects(dataReturn, objectAfterAllParse);

      if (!isDocument()) {
        let indexArray = [];
        let newArray = [];
        let additionalInfoExist = false;
        dataReturn.forEach(object => {
          if (object.attributeName === 'Cost' || object.attributeName === 'Break Cost' ||
            object.attributeName === 'Manual Cost' || object.attributeName === 'Rollup Cost' ||
            object.attributeName === 'Cost Settings' || object.attributeName === 'Uom' ||
            object.attributeName === 'Procurement Type' || object.attributeName === 'Qty On Hand' ||
            object.attributeName === 'Qty On Order' || object.attributeName === 'Qty Total' ||
            object.attributeName === 'Inventory') {
            indexArray.push(dataReturn.indexOf(object));
          }
          if (object.parent === 'Additional Info') {
            additionalInfoExist = true;
          }
        });
        dataReturn.forEach((object, index) => {
          if (indexArray.indexOf(index) === -1) {
            newArray.push(object);
          }
        });
        newArray.forEach(object => {
          if (object.attributeName === 'Additional Info' && !additionalInfoExist) {
            newArray.splice(newArray.indexOf(object), 1);
          }
        });
        dataReturn = newArray;
      }

      dataReturn = sortForGrid(dataReturn);

      return  dataReturn;
    }

    function combineSameAttributes (expandList) {
      var newArray = [];
      angular.forEach(expandList, function(attr){
        var similarAttrInList = _.find(newArray, { 'attributeName': attr.attributeName });

        if ( _.findIndex(newArray, { 'attributeName': attr.attributeName }) == -1 ) {
          newArray = newArray.concat(attr);
        } else {
          (attr.$$treeLevel) && (similarAttrInList.$$treeLevel = similarAttrInList.$$treeLevel ? similarAttrInList.$$treeLevel : attr.$$treeLevel);
        }
      });
      return newArray;
    }

    function getRowsWithAttrOfOdjects (listOfAllAttributes, arrOfParseAttrObjects) {
      //join attributes with data from objects
      angular.forEach(listOfAllAttributes, function(attr){

        angular.forEach(arrOfParseAttrObjects, function(obj){
          var rowObj = _.find(obj, ['attributeName', attr.attributeName]);
          Object.assign(attr, rowObj);
        });
      });

      listOfAllAttributes = _.sortBy(listOfAllAttributes, ['$$treeLevel']);
      return listOfAllAttributes;
    }

    function sortForGrid (arrOfRows) {
      //sort item in grid. for expand/collapse
      arrOfRows = _.sortBy(arrOfRows, ['$$treeLevel']);

      angular.forEach(arrOfRows, function(row){
        if (row.parent) {
          var oldIndexRow = _.findIndex(arrOfRows, row);
          arrOfRows.splice(oldIndexRow, 1);
          var parentIndex = _.findIndex(arrOfRows, { 'attributeName': row.parent });
          var newIndexRow = parentIndex + 1;
          arrOfRows.splice(newIndexRow, 0, row);
        }
      });
      return arrOfRows;
    }

    function expandAttrFromObjects (objects, flag) {
      var newArr = [];

      angular.forEach(objects, function(obj){
        newArr.push(parseOneObjAttr (obj[flag], obj.objectId))
      });

      return newArr;
    }

    function parseOneObjAttr (attrList, idOfRevision) {
      var arr = [];

      angular.forEach(attrList, function(attr){
        if (attr.multiValueCompareData.length > 0) {
          var objBeforeDeep = {
            attributeName: _.startCase(attr.toCompareData)
          };
          objBeforeDeep[ _.camelCase(idOfRevision) ] = attr.value;
          objBeforeDeep[ _.camelCase(idOfRevision) + 'Code' ] = attr.compareCode;

          arr.push(objBeforeDeep);
          var deepAttr = parseOneObjAttr (attr.multiValueCompareData, idOfRevision);
          arr = arr.concat(deepAttr);
        } else {
          var objNoDeep = {
            attributeName: _.startCase(attr.toCompareData)
          };
          objNoDeep[ _.camelCase(idOfRevision) ] = attr.value;
          objNoDeep[ _.camelCase(idOfRevision) + 'Code' ] = attr.compareCode;
          arr.push(objNoDeep);
        }
      });
      return arr;
    }

    function expandBasicAttributes (arrayBasicInfos) {
      var newArray = [];

      angular.forEach(arrayBasicInfos, function(attrList){
        var expandList = expandFromOneBasic(attrList, 1, 'Basic Info');
        newArray = newArray.concat(expandList);
      });

      newArray = combineSameAttributes(newArray);
      return newArray;
    }

    function expandFromOneBasic (attrList, level, parent) {
      var arr = [];
      angular.forEach(attrList, function(attr){
        if (attr.multiValueCompareData.length > 0) {
          var objBeforeDeep = {
            attributeName: _.startCase(attr.toCompareData),
            $$treeLevel: level,
            parent: parent
          };

          arr.push(objBeforeDeep);
          var deepAttr = expandFromOneBasic (attr.multiValueCompareData, level+1, _.startCase(attr.toCompareData));
          arr = arr.concat(deepAttr);
        } else {
          var objNoDeep = {
            attributeName: _.startCase(attr.toCompareData),
            parent: parent
          };
          switch (attr.toCompareData) {
            case 'objectName':
            case 'description':
            case 'procurementType':
            case 'uom':
            case 'projectNames':
            case 'tag':
              objNoDeep.parent = 'Basic Info';
              objNoDeep.attributeName =  _.startCase(attr.toCompareData);
              break;
            case 'rollupCost':
            case 'manualCost':
            case 'costSettings':
            case 'breakCost':
              objNoDeep.parent = 'Cost';
              objNoDeep.attributeName =  _.startCase(attr.toCompareData);
              break;
            case 'qtyOnHand':
            case 'qtyOnOrder':
            case 'qtyTotal':
              objNoDeep.parent = 'Inventory';
              objNoDeep.attributeName =  _.startCase(attr.toCompareData);
              break;
            case 'createdBy':
            case 'createDate':
            case 'modifiedBy':
            case 'modifiedDate':
            case 'revisionNotes':
              objNoDeep.parent = 'History';
              objNoDeep.attributeName =  _.startCase(attr.toCompareData);
              break;
            default:
              //parent = 'Basic Info' can set in switch only. If it set non in switch, we don't add this attribute
              if (objNoDeep.parent == 'Basic Info') {
                objNoDeep.dontAdd = true;
              }
              break;
          }
          (!objNoDeep.dontAdd) && arr.push(objNoDeep);
        }
      });
      return arr;
    }

    function expandAdditionalAttributes (arrayAdditionalInfo) {
      var newArray = [];

      angular.forEach(arrayAdditionalInfo, function(attrList){
        var expandList = expandFromOneAdditional(attrList, 1, 'Additional Info');
        newArray = newArray.concat(expandList);
      });

      newArray = combineSameAttributes(newArray);

      //delete field
      var delIndex =  _.findIndex(newArray, { 'attributeName': 'Additional Info' });
      newArray.splice(delIndex, 1);

      return newArray;
    }

    function expandFromOneAdditional (attrList, level, parent) {
      var arr = [];
      angular.forEach(attrList, function(attr){
        if (attr.multiValueCompareData.length > 0) {
          var objBeforeDeep = {
            attributeName: _.startCase(attr.toCompareData),
            $$treeLevel: level,
            parent: parent
          };

          arr.push(objBeforeDeep);
          var deepAttr = expandFromOneAdditional (attr.multiValueCompareData, level+1, _.startCase(attr.toCompareData));
          arr = arr.concat(deepAttr);
        } else {
          var objNoDeep = {
            attributeName: _.startCase(attr.toCompareData),
            parent: parent
          };
          arr.push(objNoDeep);
        }
      });
      return arr;
    }

    function makeLinksInHeader(objects) {
      var links = [];
      angular.forEach(objects, function(object){
        var link = {};
        link.objectId = object.objectId;
        link.partName = object.basicInfo.objectNumber.value;
        var configMessage = vm.configurationSettings ? ', Configuration ' + object.configName : '';
        if(object.configName){
          link.name = object.basicInfo.objectNumber.value + configMessage + ', Revision ' + object.basicInfo.revision.value + '.' + object.basicInfo.minorRevision.value;
        }else{
          link.name = object.basicInfo.objectNumber.value + ', Revision ' + object.basicInfo.revision.value + '.' + object.basicInfo.minorRevision.value;
        }
        links.push(link);
      });
      return links;
    }

    function clearFilters(gridApi) {
      gridApi.grid.clearAllFilters();
      gridApi.grid.resetColumnSorting(gridApi.grid.getColumnSorting());
      _.forEach(gridApi.grid.columns, function(column) {
        if ( column.isPinnedLeft() || column.isPinnedRight() ) {
          if (column.field === 'treeBaseRowHeaderCol') {
            return;
          }
          gridApi.pinning.pinColumn(column, uiGridPinningConstants.container.NONE);
        }
      });
      saveState();
    }

    function buttonForClear(flaghier, gridApi) {
      _.forEach(gridApi.grid.columns, function(column) {
        if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name !== 'treeBaseRowHeaderCol' && column.field !== 'objectId') {
          flaghier = true;
        }
        if (column.filters[0].term !== undefined) {
          flaghier = true;
        }
      });
      if (gridApi.grid.getColumnSorting().length !== 0) {
        flaghier = true;
      }
      return flaghier;
    }

    function showClearButton(gridApi) {
        vm.flagClearButton = false;
        vm.flagClearButton = buttonForClear(vm.flagClearButton, gridApi);
      }

    //For Back Button individual page.
    function backPartFunction (){
      const pageType = $cookies.get('pageType');
      const number = $cookies.get('numberForBackButton');
      if ( number.indexOf('part') !== -1 && pageType === 'revisions') {
        $state.go('app.objects.part.parts.revisions', {
          id: number
        });
      } else if ( number.indexOf('part') !== -1) {
        $state.go('app.objects.part.parts.configurations', {
          id: number
        });
      }
      if ( number.indexOf('product') !== -1 && pageType === 'revisions') {
        $state.go('app.objects.products.details.revisions', {
          id: number
        });
      } else if ( number.indexOf('product') !== -1) {
        $state.go('app.objects.products.details.configurations', {
          id: number
        });
      }
      if ( number.indexOf('document') !== -1 && pageType === 'revisions') {
        $state.go('app.objects.documents.details.revisions', {
          id: number
        });
      } else if ( number.indexOf('document') !== -1) {
        $state.go('app.objects.documents.details.configurations', {
          id: number
        });
      }
      if ( number.indexOf('product') !== -1 && number.indexOf('-') === -1) {
        $state.go('app.objects.products');
      }
      if ( number.indexOf('document') !== -1 && number.indexOf('-') === -1) {
        $state.go('app.objects.documents');
      }
      if ( number.indexOf('part') !== -1 && number.indexOf('-') === -1) {
        $state.go('app.objects.part');
      }
    }

    function saveState() {
      var state = vm.attributesTableUiGrid.saveState.save();
      $window.localStorage.setItem('attributesCompareGridState', angular.toJson(state));
    }

    function restoreState() {
      $timeout(function() {
        var state = $window.localStorage.getItem('attributesCompareGridState');
        if (state) vm.attributesTableUiGrid.saveState.restore($scope, angular.fromJson(state));
      });
    }

    function showChangesBom (showChangesFlag) {
      // true-show changes, false-show all
      vm.showAllButtonBom = showChangesFlag ? 'Show only differences' : 'Show All';
      $scope.$broadcast('showChangesBOMCompare', showChangesFlag);
    }

    $scope.$on('setShowChangesButtonBom', function() {
      vm.showAllButtonBom = 'Show All';
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      vm.selectedTab = toState.data ? toState.data.selectedTab : vm.selectedTab;
    });

    $scope.$on('getProxy', function(){
      $scope.$broadcast('proxyDetails', {isConfigEnabled: vm.configurationSettings})
    });

    function showChangesAttr(flag) {
      vm.showChangesAttributes = flag;
      vm.showAllButtonAttr = flag ? 'Show only differences' : 'Show All';

      var rows = vm.attributesTableUiGrid.grid.rows;
      angular.forEach(rows, function(row){
        if (flag && !row.entity.showChangesFlag) {
          vm.attributesTableUiGrid.core.setRowInvisible(row);
        } else if (!flag) {
          vm.attributesTableUiGrid.core.clearRowInvisible(row);
        }
      });
    }

    function setShowChangesFlagAttr (data) {
      angular.forEach(data, function(row){

        angular.forEach(row, function(prop){
          if (prop === 'CHANGE' || prop === 'DISCARD' || prop === 'NEW'){
            row.showChangesFlag = true;
          }
        });
      });

      return data;
    }

    function buildColumnsForCSV() {
      var columns = [];
      vm.attributesGridOptions.columnDefs.forEach(function(item, i){
        columns.push(item.field);
      });
      return columns
    }

    function setColorForCell(tableBody, gridOptions) {
      var newTableBody = [];
      var gridData = angular.copy(gridOptions.data);
      var gridColumns = angular.copy(gridOptions.columnDefs);
      var gridFieldsArray = [];

      gridColumns.forEach(function(column){
          gridFieldsArray.push(column.field);
      });

      let attributeNameIndex = _.findIndex(tableBody[0], {text: 'Attribute Name'});
      arrayMove(gridFieldsArray, 0, attributeNameIndex);

      tableBody.forEach(function(bodyRow, ind){

        if (ind === 0) {
          newTableBody.push(tableBody[0]);
        }

        if (ind !== 0) {
          var newRow = [];

          if ( bodyRow[attributeNameIndex] === 'Basic Info' ||
               bodyRow[attributeNameIndex] === 'Cost' ||
               bodyRow[attributeNameIndex] === 'Inventory' ||
               bodyRow[attributeNameIndex] === 'Additional Info' ||
               bodyRow[attributeNameIndex] === 'History'){

            bodyRow.forEach(function(cell){
              var newCell = {};
              newCell.text = cell || ' ';
              newCell.fillColor = '#E5E5E5';
              newRow.push(newCell);
            });

          } else {
            var rowFromGridData = _.find(gridData, {attributeName: bodyRow[attributeNameIndex]});
            gridFieldsArray.forEach(function(field, ind){
              var newCell = {};
              newCell.text = rowFromGridData[field] || ' ';
              if (rowFromGridData[field + 'Code']) {
                (rowFromGridData[field + 'Code'] === 'CHANGE') && (newCell.color = '#ff8302');
                (rowFromGridData[field + 'Code'] === 'NEW') && (newCell.color = 'green');
                (rowFromGridData[field + 'Code'] === 'DISCARD') && (newCell.color = 'red');
              }
              newRow.push(newCell);
            });
          }
          newTableBody.push(newRow);
        }
      });
      return newTableBody;
    }

    function arrayMove(arr, fromIndex, toIndex) {
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    function isDocument() {
      var number = $cookies.get('numberForBackButton');
      return !(number.indexOf('document') !== -1);
    }


    function downloadCsvAttr () {
      vm.attributesGridOptions.exporterCsvFilename = 'Revisions of ' + vm.linksInHeader[0].partName + '.csv';
      vm.attributesTableUiGrid.exporterSuppressColumns = buildColumnsForCSV();
      vm.attributesTableUiGrid.exporter.csvExport('visible', 'visible');
    }

    let formatters = {};

    function downloadXlsx() {
      vm.attributesGridOptions.exporterFieldFormatCallback = function(grid, row, gridCol, cellValue) {
        let formatterId = null;
        if (row.entity.attributeName === 'Basic Info' ||
          row.entity.attributeName === 'Cost' ||
          row.entity.attributeName === 'Inventory' ||
          row.entity.attributeName === 'Additional Info' ||
          row.entity.attributeName === 'History') {
          formatterId = formatters['section'].id;
        }
        let rowKeys = Object.keys(row.entity);
        let compareCodeField = _.find(rowKeys, key =>  key.indexOf(gridCol.field) !== -1 && key.indexOf('Code') !== -1);
        if (row.entity[compareCodeField] === 'NEW' && cellValue) {
          formatterId = formatters['new'].id;
        } else if (row.entity[compareCodeField] === 'DISCARD' && cellValue) {
          formatterId = formatters['discard'].id;
        } else if (row.entity[compareCodeField] === 'CHANGE' && cellValue) {
          formatterId = formatters['change'].id;
        }
        if (formatterId) {
          return {metadata: {style: formatterId}};
        } else {
          return null;
        }
      };
      excelExport(vm.attributesTableUiGrid.grid, 'visible', 'visible');
    }

    function excelExport(grid, rowTypes, colTypes) {
      uiGridExporterService.loadAllDataIfNeeded(grid, rowTypes, colTypes).then(function() {
        let exportColumnHeaders = grid.options.showHeader ? uiGridExporterService.getColumnHeaders(grid, colTypes) : [];

        let workbook = new ExcelBuilder.Workbook();
        let aName = grid.options.exporterExcelSheetName ? grid.options.exporterExcelSheetName : 'Sheet1';
        let sheet = new ExcelBuilder.Worksheet({name: aName});
        workbook.addWorksheet(sheet);
        let docDefinition = uiGridExporterService.prepareAsExcel(grid, workbook, sheet);
        let colWidths = [];
        let startDataIndex = grid.treeBase ? grid.treeBase.numberLevels - 1 : (grid.enableRowSelection ? 1 : 0);
        for (let i = startDataIndex; i < grid.columns.length; i++) {
          if (grid.columns[i].field !== uiGridExporterConstants.rowHeaderColName &&
            grid.columns[i].field !== uiGridExporterConstants.selectionRowHeaderColName) {
            colWidths.push({width: (grid.columns[i].drawnWidth / grid.options.exporterColumnScaleFactor)});
          }
        }
        sheet.setColumns(colWidths);
        let exportData = uiGridExporterService.getData(grid, rowTypes, colTypes, grid.options.exporterFieldApplyFilters);
        let excelContent = uiGridExporterService.formatAsExcel(exportColumnHeaders, exportData, workbook, sheet, docDefinition);
        sheet.setData(sheet.data.concat(excelContent));

        ExcelBuilder.Builder.createFile(workbook, {type: 'blob'}).then(function(result) {
          uiGridExporterService.downloadFile (grid.options.exporterExcelFilename, result, grid.options.exporterCsvColumnSeparator,
            grid.options.exporterOlderExcelCompatibility);
        });
      });
    }

    function downloadTable (selectTab, formatFlag, optionFlag) {
      if (selectTab === 0) {
        (formatFlag === 'xlsx') && downloadXlsx();
        (formatFlag === 'csv') && downloadCsvAttr();
        (formatFlag === 'pdf') && downloadPrintPdfAttr(optionFlag, vm.attributesTableUiGrid.grid, vm.attributesGridOptions);
      } else if (selectTab === 2) {
        $scope.$broadcast('downloadPrintBOMCompare', optionFlag, formatFlag);
      } else{
        $scope.$broadcast('exportAttachmentsCompare', optionFlag, formatFlag);
      }
    }

    function downloadPrintPdfAttr(option, gridApi, gridOptions) {
      var now = new Date(),
        dateFormat = moment(now).format('MMMM Do YYYY, h:mm:ss A') + ' (' + fuseUtils.getTimeZone() + ')';
      gridOptions.exporterPdfHeader = {
        columns: [{
          style: 'headerStyle',
          table: {
            widths: [50, '*'],
            body: [
              [{
                text: dateFormat || ' ',
                margin: [0, 5, 0, 0],
                colSpan: 2,
                style: 'dateStyle'
              },
                ''
              ],
              ['',
                {
                  text: [{
                    text: '\'Attributes Compare\' Report for ' + vm.linksInHeader[0].partName,
                    fontSize: 16
                  }],
                  margin: [0, 10, 10, 10]
                }
              ]
            ]
          },
          layout: 'noBorders'
        }]
      };

      gridOptions.exporterPdfCustomFormatter = function (docDefinition) {
        docDefinition.styles.headerStyle = {
          margin: [10, 10, 10, 0],
          fillColor: '#208abe',
          color: '#fff',
          height: 100
        };
        docDefinition.styles.dateStyle = {
          color: '#000',
          fillColor: '#fff'
        };

        var tableBody = angular.copy(docDefinition.content[0].table.body);

        docDefinition.content[0].table.body = setColorForCell(tableBody, gridOptions);

        return docDefinition;
      };
      var exportColumnHeaders = uiGridExporterService.getColumnHeaders(gridApi, uiGridExporterConstants.VISIBLE),
        exportData = uiGridExporterService.getData(gridApi, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE, true),
        docDefinition = uiGridExporterService.prepareAsPdf(gridApi, exportColumnHeaders, exportData);

      docDefinition.pageMargins = [0, 100, 0, 40];

      docDefinition.content[0].table.widths = 100 / docDefinition.content[0].table.widths.length + '%';

      if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
        uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
      } else {
        if (option == 'print') {
          pdfMake.createPdf(docDefinition).print();
        } else {
          pdfMake.createPdf(docDefinition).download();
        }
      }
    }

  } })();
