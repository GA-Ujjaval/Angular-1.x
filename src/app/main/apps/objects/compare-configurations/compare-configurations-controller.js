(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('CompareConfigurationsController', CompareConfigurationsController);
  /** @ngInject */
  function CompareConfigurationsController($state, $location, $filter, BoardService, uiGridGridMenuService,
                                           msUtils, $stateParams, $mdDialog, $document, hostUrlDevelopment, GlobalSettingsService,
                                           uiGridTreeBaseService, CustomerService, uiGridConstants, BomService,
                                           $mdToast, fuseUtils, AuthService, DialogService, MainTablesService,
                                           $scope, $timeout, $rootScope, $window, uiGridExporterConstants, uiGridExporterService, uiGridPinningConstants, objectPageEnum, $q, $cookies) {

    var vm = this;

    vm.toggleRowCheckboxes = toggleRowCheckboxes;
    vm.checkMainRowCheckboxes = checkMainRowCheckboxes;
    vm.updateBomSingleCheckbox = updateBomSingleCheckbox;
    vm.openConfigurationList = openConfigurationList;
    vm.toggleColumnsChosen = toggleColumnsChosen;
    vm.isAddingEnabled = isAddingEnabled;
    vm.addPartToMatrix = addPartToMatrix;
    vm.isAllColumnsChecked = isAllColumnsChecked;
    vm.isColumnDisabled = isColumnDisabled;
    vm.downloadTable = downloadTable;
    vm.backPartFunction = backPartFunction;
    vm.prepareDataToDisplayInDialog = prepareDataToDisplayInDialog;
    vm.fuseUtils = fuseUtils;
    vm.openCard = openCard;
    vm.getBoards = getBoards;

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    var configurationMatrix;

    $scope.$watch(() => {
      const gridElem = document.getElementById('grid-configurations-compare');
      if (gridElem) {
        gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 123}px`;
      }
    });

    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    var idsForCompare = $cookies.get('idsForCompareConfigurations').split(',');

    proxyDetails();
    getMatrixData();

    vm.configurationsCompareGridOptions = {
      exporterFieldCallback: function ( grid, row, col, value ) {
        if ( col.name === 'associatedCardsList' ) {
          value = !_.isEmpty(value);
        }

        if( col.name.indexOf('parts') !== -1 || col.name.indexOf('products') !== -1){
          value = value.exists ? 'X' : '';
        }
        return value;
      },
      exporterSuppressColumns: ['selectWholeRow', 'bomId', 'objectId'],
      columnDefs: [],
      data: [],
      exporterCsvFilename: 'BOM Matrix.csv',
      enableFiltering: true,
      showTreeExpandNoChildren: false,
      showTreeRowHeader: true,
      enableColumnReordering: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnResizing: true,
      enableSorting: true,
      enableHiding: false,
      //enableCellEdit: true,
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

      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.configurationsCompareTableUiGrid = gridApi;

        $timeout(function(){
          vm.configurationsCompareTableUiGrid.treeBase.expandAllRows();
        },100);

        // Setup events so we're notified when grid state changes.
        vm.configurationsCompareTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.configurationsCompareTableUiGrid.colResizable.on.columnSizeChanged($scope, function(){
          vm.heightTopPanelAttributes = $('#grid-attributes-compare .ui-grid-top-panel').height();
          saveState();
        });

        vm.configurationsCompareTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.configurationsCompareTableUiGrid.core.on.filterChanged($scope, function() {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.configurationsCompareTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.configurationsCompareTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          let gridCol;
          _.forEach(vm.configurationsCompareTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.name) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
          saveState();
        });


        vm.configurationsCompareTableUiGrid.core.on.scrollBegin($scope, function() {
          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });
        vm.configurationsCompareTableUiGrid.core.on.scrollEnd($scope, function() {
          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });

        vm.configurationsCompareTableUiGrid.core.on.renderingComplete($scope, function(){
          vm.heightMax = document.documentElement.clientHeight - document.getElementById('grid-configurations-compare').offsetTop - 33*2;
          restoreState();
        });

        vm.configurationsCompareTableUiGrid.core.on.rowsRendered($scope, function() {
          if ((vm.configurationsCompareGridOptions.data.length > 0) && !vm.configurationsCompareGridOptions.initialized) {
            $timeout(function() {
              vm.configurationsCompareGridOptions.initialized = true;
              vm.configurationsCompareTableUiGrid.core.handleWindowResize()
            });
          }
          vm.heightTopPanelAttributes = $('#grid-configurations-compare .ui-grid-top-panel').height();

          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
        });

      }
    };

    function saveState() {
      var state = vm.configurationsCompareTableUiGrid.saveState.save();
      $window.localStorage.setItem('ConfigurationsCompareGridState', angular.toJson(state));
    }

    function restoreState() {
      $timeout(function() {
        var state = $window.localStorage.getItem('ConfigurationsCompareGridState');
        if (state) vm.configurationsCompareTableUiGrid.saveState.restore($scope, angular.fromJson(state));
      });
    }

    function downloadTable (selectTab, formatFlag, optionFlag) {
      if (selectTab === 0) {
        (formatFlag === 'csv') && downloadCsvAttr();
        (formatFlag === 'pdf') && downloadPrintPdfAttr(optionFlag, vm.configurationsCompareTableUiGrid.grid, vm.configurationsCompareGridOptions);
      } else if (selectTab === 1) {
        $scope.$broadcast('downloadPrintBOMCompare', optionFlag, formatFlag);
      }
    }

    function backPartFunction (){
      var number = $cookies.get('numberForBackButtonConfigurations');

      if ( number.indexOf('part') !== -1 ) {
        $state.go('app.objects.part.parts.configurations', {
          id: number,
          revisionFlag: false,
          targetPageIndex: 2
        });
      }
      if ( number.indexOf('product') !== -1 ) {
        $state.go('app.objects.products.details.configurations', {
          id: number,
          revisionFlag: false,
          targetPageIndex: 2
        });
      }
      if ( number.indexOf('document') !== -1 ) {
        $state.go('app.objects.documents.details.configurations', {
          id: number,
          revisionFlag: false,
          targetPageIndex: 2
        });
      }
    }

    function proxyDetails() {
      GlobalSettingsService.getProxydetails()
        .then(function (response) {
          switch (response.code) {
            case 0:
              if (response.data.systemSettings) {
                vm.editReleased = response.data.systemSettings.releaseSettings ?
                  (response.data.systemSettings.releaseSettings.allowEdit == 'true') : false;

                vm.editReleasedBom = response.data.systemSettings.releaseBomSettings ?
                  (response.data.systemSettings.releaseBomSettings.allowEdit == 'true') : false;

                vm.priceBreakSetting = response.data.systemSettings.costSplitSettings ?
                  (response.data.systemSettings.costSplitSettings.allowCostSplit == 'true') : false;

                vm.releaseBomSettings = response.data.systemSettings && response.data.systemSettings.releaseBomSettings ?
                  (response.data.systemSettings.releaseBomSettings.allowEdit == 'true') : false;

                vm.manualRelease = response.data.systemSettings.releaseSettings ?
                  response.data.systemSettings.releaseSettings.manualRelease !== 'false' : true;

                vm.releaseHierarchy = response.data.systemSettings.releaseSettings ?
                  (response.data.systemSettings.releaseSettings.releaseHierarchy == 'true') : false;

                vm.releaseAttachmentSettings = response.data.systemSettings.releaseAttachmentSettings ?
                  (response.data.systemSettings.releaseAttachmentSettings.allowEdit == 'true') : false;

                vm.releaseSourcingSettings = response.data.systemSettings.releaseSourcingSettings ?
                  (response.data.systemSettings.releaseSourcingSettings.allowEdit == 'true') : false;

                vm.configurationSettings = response.data.systemSettings.configurationSetting ?
                  (response.data.systemSettings.configurationSetting.configurationEnabled === 'true') : false;
              }
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function getMatrixData() {
      var params = '';
      vm.progress = true;
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          requestCompareObjectIds: idsForCompare
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          requestCompareObjectIds: idsForCompare
        };
      }
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getconfigurationsmatrix, params, '', header)
        .then(function(response){
          if(response.code !== 0){
            $mdToast.show($mdToast.simple().textContent('Error occured. Refresh the page, please').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            return;
          }

          configurationMatrix = response.data.matrix;
          var columnInfo = response.data.columnInfo;

          if (configurationMatrix.length === 0) {
            buildColumnsForConfigurationsCompare([columnInfo]);
            vm.progress = false;
            return;
          }

          buildColumnsForConfigurationsCompare(configurationMatrix);
          buildRowsForConfigurationsCompare(configurationMatrix);
          vm.progress = false;
        })
    }

    function buildColumnsForConfigurationsCompare(parts){
      var columns = [];
      var cardsColumn = new NewColumn.withoutCheckbox({displayName: 'Associated Cards'}, 'associatedCardsList', 110);
      cardsColumn.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
      columns.push(cardsColumn);
      columns.push(new NewColumn.withoutCheckbox({displayName: 'Part Number'}, 'objectNumber', 110));
      columns[1].enableFiltering = true;
      columns.push(new NewColumn.withoutCheckbox({displayName: 'Configuration'}, 'configName', 120));
      columns.push(new NewColumn.withoutCheckbox({displayName: 'Revision'}, 'revision', 100));
      columns.push(new NewColumn.withoutCheckbox({displayName: 'Part Name'}, 'objectName', 100));
      columns.push(new NewColumn.withoutCheckbox({displayName: 'Status'}, 'status', 110));
      var checkAllColumn = new NewColumn.withCheckbox({displayName: ''}, 'selectWholeRow', 80);
      checkAllColumn.enableFiltering = false;
      checkAllColumn.headerCellTemplate = '<div ng-click="grid.appScope.vm.runSorting()"  class="aligned-checkbox-container align-center padding-5">' +
        '<md-tooltip class="two-line-compare-tooltip md-tooltip">Check box to add part to all configs which are missing this part.<br>' +
        'Uncheck box to remove part from all configs</md-tooltip>' +
        '<input checked disabled id="checkbox-column-header" class="custom-checkbox" \n' +
        'type="checkbox">\n' +
        '<label for="checkbox-column-header" class="myCheckbox myCheckbox--grey" ></label>' +
        '<i title="" ng-if="grid.appScope.vm.sortingType === -1" aria-hidden="true" class="custom-sorting ui-grid-icon-down-dir" style=""></i>' +
        '<i title="" ng-if="grid.appScope.vm.sortingType === 1" aria-hidden="true" class="custom-sorting ui-grid-icon-up-dir" style=""></i>' +
        '</div>';
      columns.push(checkAllColumn);

      angular.forEach(parts[0].matrixColumnData || parts[0], function(value, key, obj){
        columns.push(new NewColumn.withCheckbox(value, value.objectId));
      });

      vm.configurationsCompareGridOptions.columnDefs = columns;
    }

    vm.sortingType = 0;

    vm.runSorting = runSorting;
    function runSorting(){
      var tableData = vm.configurationsCompareGridOptions.data;
      if(!vm.initialArray || (vm.initialArray && vm.initialArray.length !== tableData.length)){
        vm.initialArray = angular.copy(tableData);
      }

      vm.sortingType = vm.sortingType === 0 ? 1 :
                       vm.sortingType === 1 ? -1
                          : 0;
      if(vm.sortingType === 1){
        sortArrayAsc(tableData);
      }else if(vm.sortingType === -1){
        sortArrayDesc(tableData);
      }else{
        vm.configurationsCompareGridOptions.data = angular.copy(vm.initialArray);
      }
    }

    function sortArrayAsc(array){
      var sortedArray = angular.copy(array);
      sortedArray.sort(function (a, b) {
        if (a.allChecked > b.allChecked) {
          return 1
        } else {
          return -1;
        }
      });
      vm.configurationsCompareGridOptions.data = sortedArray;
    }

    function sortArrayDesc(array){
      var sortedArray = angular.copy(array);
      sortedArray.sort(function (a, b) {
        if (a.allChecked > b.allChecked) {
          return -1
        } else {
          return 1;
        }
      });
      vm.configurationsCompareGridOptions.data = sortedArray;
    }

    function NewColumn(configuration, value){
      if(configuration.revision) {
        this.displayName = configuration.objectNumber + ', ' + configuration.configName + ', Revision ' + configuration.revision + ' [' + configuration.status + ']';
      }else{
        this.displayName = (configuration.configName || configuration.displayName);
      }
      this.objectId = configuration.objectId;
      this.name = value;
      this.value = value;
      this.enableCellEdit = false;
      this.headerCellClass = setHeaderHeight;
      this.configName = configuration.configName;
      this.status = configuration.status || null;
      this.enableFiltering = false;
    }

    NewColumn.withCheckbox = function(configuration, value, width){
      var column = new NewColumn(configuration, value);
      column.cellTemplate = 'app/main/apps/objects/compare-configurations/cell-templates/checkbox-cell-template.html';
      column.width = width;
      return column;
    };

    NewColumn.withoutCheckbox = function(configuration, value, width){
      var column = new NewColumn(configuration, value);
      column.cellTemplate = 'app/main/apps/objects/compare-configurations/cell-templates/description-column-template.html';
      column.width = width;
      return column;
    };

    function buildRowsForConfigurationsCompare(parts){
      var rows = [];
      parts.forEach(function(part){
        rows.push(newRow(part));
      });
      var tableData = vm.configurationsCompareGridOptions.data;
      var newlyAddedRows = _.differenceBy(rows, tableData, 'id');
      vm.configurationsCompareGridOptions.data = tableData.concat(newlyAddedRows);
      if(_.find(vm.configurationsCompareGridOptions.paginationPageSizes, {label: 'All'})){
        return;
      }else{
        vm.configurationsCompareGridOptions.paginationPageSizes.push({label: 'All', value: vm.configurationsCompareGridOptions.data.length})
      }
    }


    function newRow(part){
      var row = {};
      var partParams = part.matrixRowData;
      row.allChecked = true;
      angular.forEach(part.matrixColumnData, function(value, key, obj){
        if(value.exists === false){
          row.allChecked = false;
        }
        row[key] = value;
      });
      row.objectNumber = partParams.objectNumber;
      row.revision = partParams.revision + '.' + partParams.minorRevision;
      row.objectName = partParams.objectName;
      row.id = partParams.objectId;
      row.configName = partParams.configName;
      row.status = partParams.status;
      row.associatedCardsList = partParams.associatedCardList;
      return row;
    }

    function setHeaderHeight (grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function(col){
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function toggleRowCheckboxes(row){
      if(row.allChecked === true){
        openRowWarningChecked(row);
      } else{
        openRowWarningUnchecked(row, getBomIdsOfRow(row));
      }
    }

    function makeRowChecked(row){
      angular.forEach(row, function(value, key, obj){
        if(isColumnDisabled(key))
          return;
        if(value.hasOwnProperty('exists')){
          value.exists = true;
        }
      });
    }

    function makeRowUnchecked(row){
      angular.forEach(row, function(value, key, obj){
        if(value.hasOwnProperty('exists') && !isColumnDisabled(key)){
          value.exists = false;
        }
      });
      removeRowFromMatrix(row);
    }

    function removeRowFromMatrix(row){
      vm.configurationsCompareGridOptions.data = _.filter(vm.configurationsCompareGridOptions.data, function(r){ return r.id !== row.id });
    }

    function checkMainRowCheckboxes(row){
      row.allChecked = true;
      angular.forEach(row, function(value, key, obj){
        if(value.hasOwnProperty('exists') && value.exists !== true){
          row.allChecked = false;
        }
      })
    }

    function checkRowIsEmpty(row){
      var isEmpty = true;
      angular.forEach(row, function(value, key, obj){
        if(value.hasOwnProperty('exists') && value.exists === true){
          isEmpty = false;
        }
      });

      return isEmpty;
    }

    function updateBomSingleCheckbox(row, colName){
      if(row.id === 'checkAll' && row[colName].exists === true){
        console.log('strange');
      }else if(row.id === 'checkAll' && row[colName].exists === false){
        console.log('strange');
      }else if(row[colName].exists === true){
        openDialogChecked('', colName, row);
      }else{
        openDialogUnchecked('', colName, row, findBomId(row, colName));
      }
    }

    function findBomId(currentRow, colName){
      var bomId;
      configurationMatrix.forEach(function(row){
        if(row.matrixRowData.objectId == currentRow.id){
          bomId = row.matrixColumnData[colName].bomId;
        }
      });
      return bomId;
    }

    function openDialogChecked(editData, objectId, row) {
      var settings = {
        controller: 'billofmaterialController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/billofmaterial.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          event: null,
          editData: editData || '',
          $parent: vm,
          callback: null,
          ObjectId: objectId,
          BOMS: vm.boms,
          isConfigurationCompare: true,
          isCheckboxChecked: true,
          row: row,
          bomId: null,
          columns: vm.configurationsCompareGridOptions.columnDefs,
          editReleased : vm.editReleased,
          allFuseObjects: vm.allFuseObjects,
          isConfigEnabled: vm.configurationSettings,
          addedit: ''
        }
      };

      openDialog(settings, function () {
        if (objectId === null) {
          makeRowChecked(row);
          checkMainRowCheckboxes(row);
        }
      }, function () {
        row.allChecked = false;
        if(objectId)
          row[objectId].exists = false;
      });
    }

    function openDialogUnchecked(editData, objectId, row, bomId) {
      var settings = {
        controller: 'billofmaterialController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/billofmaterial.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          event: null,
          editData: editData || '',
          $parent: vm,
          callback: null,
          ObjectId: objectId,
          Data: {objectId: objectId},
          BOMS: vm.boms,
          isConfigurationCompare: true,
          isCheckboxChecked: false,
          row: row,
          bomId: bomId,
          columns: [],
          editReleased : vm.editReleased,
          allFuseObjects: vm.allFuseObjects,
          isConfigEnabled: vm.configurationSettings,
          addedit: ''
        }
      };

      openDialog(settings, function(){
        vm.progressProcess = !row[objectId].exists;
      }, function(){
        row[objectId].exists = true;
        checkMainRowCheckboxes(row);
      });
    }

    $scope.$on('recheck checkbox', function(event, data){
      data.row[data.colName].exists = true;
      checkMainRowCheckboxes(data.row);
    });

    $scope.$on('part added', function(event, data){
      setBomId(data.rowId, data.colName, data.bomId);
    });

    $scope.$on('row added', function () {
      getMatrixData();
    });

    $scope.$on('turn off circular', function(event, row){
      vm.progressProcess = false;
      if(checkRowIsEmpty(row)){
        removeRowFromMatrix(row);
      }
    });

    function setBomId(rowId, colName, bomId){
      vm.configurationsCompareGridOptions.data.forEach(function(row){
        if(row.id == rowId){
          row[colName].bomId = bomId;
        }
      });
    }

    function openDialog(settings, onResolve, onReject){
      $mdDialog.show(settings).then(onResolve, onReject)
    }

    function openRowWarningChecked(row){
      var message;
      message = 'Do you want to add this part to each configuration?';
      var confirm = $mdDialog.confirm()
        .title(message)
        .ariaLabel('bulk checkbox')
        .ok('Yes')
        .cancel('No');
      openDialog(confirm, function(){
        openDialogChecked('', null, row)},
        function(){row.allChecked = false});
    }

    function openRowWarningUnchecked(row, partsToRemove){
      var message;
      message = 'Do you want to remove this part from ALL configurations?';
      var confirm = $mdDialog.confirm()
        .title(message)
        .ariaLabel('bulk checkbox')
        .ok('Yes')
        .cancel('No');

      openDialog(confirm, function(){
        removeParts(partsToRemove);
        makeRowUnchecked(row);
        }, function(){row.allChecked = true});
    }

    function getBomIdsOfRow(row){
      var ids = [];
      if(vm.editReleased) {
        angular.forEach(row, function (value, key, obj) {
          if ((key.indexOf('parts') != -1) && value.exists) {
            ids.push(value.bomId);
          }
        });
      }
      else{
        angular.forEach(row, function (value, key, obj) {
          if ((key.indexOf('parts') != -1) && value.exists && !isColumnDisabled(key)) {
            ids.push(value.bomId);
          }
        });
      }
      return ids;
    }

    function removeParts(bomIds){
      var promises = [];
      bomIds.forEach(function(id){
        promises.push(BomService.removePartFromBom(id));
      });
      vm.progressProcess = true;

      Promise.all(promises)
        .then(function(response){
          vm.progressProcess = false;
          $mdToast.show($mdToast.simple().textContent("Object Removed Successfully.").position('top right').hideDelay(1000));
        }, function(){
          $mdToast.show($mdToast.simple().textContent("Error occurred, please refresh the page.").position('top right').hideDelay(1000)).toastClass("md-error-toast-theme");
        });
    }

    function openConfigurationList(){
      var settings = {
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/apps/objects/compare-configurations/dialogs/add-row-to-matrix-template.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true
      };

      openDialog(settings, function(){}, function(){});
    }

    function toggleColumnsChosen(isChecked){
      vm.configurationsCompareGridOptions.columnDefs.forEach(function(col){
        if(col.name.indexOf('part') === -1 && col.name.indexOf('product') === -1){
          return;
        }
        if(vm.editReleased) {
          col.chosen = isChecked;
        }else{
          if (col.status === 'InDevelopment') {
            col.chosen = isChecked;
          }
        }
      });
    }

    /*
    * this is needed to work around the ui grid bug, where if we dont
    * have any columns initially, then table header collapses vertically
    * */

    function setProperHeaderViewportHeigh(columns, index){
      var viewports = $('.ui-grid-header-viewport');
      if(columns.some(function(col){
        return col.displayName.length > 23
      })){
        viewports[index].style.height = '70px';
        viewports[index+1].style.height = '70px';
      }else{
        viewports[index].style.height = '50px';
        viewports[index+1].style.height = '50px';
      }

    }

    function isAddingEnabled(){
      var configs = vm.configurationsCompareGridOptions.columnDefs;
      for(var i = 0; i < configs.length; i++){
        if(configs[i].chosen){
          return false;
        }
      }
      return true;
    }

    function addPartToMatrix() {
      vm.allColumnsChecked = false;
      var objectIds = [];
      vm.configurationsCompareGridOptions.columnDefs.forEach(function(col){
        if(col.chosen && (col.name.indexOf('part') !== -1 || col.name.indexOf('product') !== -1)){
          var partNumber = col.displayName.split(',')[0].trim();
          var revision = col.displayName.split('[')[0].split(',')[2].trim().split(' ')[1];
          objectIds.push({
            id: col.name,
            objectNumber: partNumber,
            revision: revision,
            configName: col.configName});
        }
      });
        var settings = {
          controller: 'billofmaterialController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/billofmaterial.html',
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          locals: {
            event: 'download all objects',
            editData: '',
            $parent: vm,
            callback: null,
            ObjectId: objectIds,
            BOMS: vm.boms,
            isConfigurationCompare: true,
            isCheckboxChecked: true,
            row: null,
            bomId: null,
            columns: [],
            editReleased : vm.editReleased,
            allFuseObjects: vm.allFuseObjects,
            isConfigEnabled: vm.configurationSettings,
            addedit: ''
          }
        };

        openDialog(settings, function () {}, function () {});
    }

    function isAllColumnsChecked(){
      var counter = 0;
      var colNumber = 0;
      var cols = vm.configurationsCompareGridOptions.columnDefs;
      if(vm.editReleased){
        cols.forEach(function(col){
          if(col.status)
            colNumber++;
        });
      }else{
        cols.forEach(function(col){
          if(col.status === 'InDevelopment')
            colNumber++;
        });
      }

      for(var i = 0; i < cols.length; i++){
        if(cols[i].chosen){
          counter++;
        }
      }

      if(counter == colNumber){
        vm.allColumnsChecked = true;
      }else{
        vm.allColumnsChecked = false;
      }
    }

    function isColumnDisabled(colName){
      if(vm.editReleased){
        return false;
      }else{
        var isColDisabled = false;
        vm.configurationsCompareGridOptions.columnDefs.forEach(function(col){
          if(col.name == colName && col.status !== 'InDevelopment'){
            isColDisabled = true;
          }
        });
        return isColDisabled;
      }
    }

    function prepareDataToDisplayInDialog(col){
      var toDisplay = col.displayName;
      toDisplay = toDisplay.split(',');
      toDisplay.shift();
      toDisplay = toDisplay.join();
      return toDisplay;
    }

    vm.cardDialogResponses = [];
    function getBoards(row) {
      var cardIds = row.entity.associatedCardsList;
      var promises = [];
      if(cardIds[0] === 'no access'){
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
            if(r.code !== 0){
              cardIds[i] = '-1';
              return;
            }
            vm.cardDialogResponses.push(r);
            row.entity.cardsInfo.push(r.data);
          });
          cardIds = _.filter(cardIds, function(id){ return id !== '-1' });
          if(cardIds.length === 0){
            cardIds[0] = 'no access';
            showOkPopup('Can not display card name because you do not have access to this board');
            return;
          }
          cardIds.forEach(function(card, i){
            row.entity.cardsInfo[i].chosenCard = getCard(card, row.entity.cardsInfo[i]);
          });
          $scope.$digest();
        }, function () {
        })
    }

    function showOkPopup(message){
      $mdMenu.hide();
      $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text">' + message + '</div><div><md-button class="show-ok-popup-button" ng-click="close()">Ok</md-button></div>',
        controller: function DialogController($scope, $mdDialog){
          $scope.close = function(){
            $mdDialog.hide();
          }
        }
      }).then(function () {}, function(){});
    }

    function getCard(cardId, board){
      var neededCard = _.find(board.cards, {id: cardId});
      return neededCard
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected){
      var response = _.find(vm.cardDialogResponses, function(res){
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }

  }
})();
