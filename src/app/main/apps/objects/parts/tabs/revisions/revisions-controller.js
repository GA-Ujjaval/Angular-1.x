(function() {
    'use strict';

    angular
        .module('app.objects')
        .controller('RevisionsController', RevisionsController);

    /** @ngInject */
    function RevisionsController($state, $mdDialog, $document, hostUrlDevelopment, CustomerService, errors,  $stateParams, $mdMenu,
                                $mdToast, AuthService, objectPageEnum, fuseUtils, uiGridExporterService, GlobalSettingsService, BoardService, DialogService,
                                uiGridExporterConstants, $window, $timeout, $scope, $q, $location, $rootScope,
                                 $cookies, $filter, sourcingUtils, attributesUtils, uiGridGridMenuService) {

        var vm = this;
        vm.objectPageEnum = objectPageEnum;
        vm.fuseUtils = fuseUtils;
        vm.sourcingUtils = sourcingUtils;
        vm.linkTarget = '_self';

        $rootScope.$watch('linkTarget', linkTarget => {
          vm.linkTarget = linkTarget ? '_blank' : '_self';
        });

        //For loader ---------------------------------------------------------------------------------------------------
        vm.progress = false;

        //For Error ----------------------------------------------------------------------------------------------------
        vm.error = errors;

        //For Session---------------------------------------------------------------------------------------------------
        vm.sessionData = {};
        vm.sessionData = AuthService.getSessionData('customerData');

        vm.readonly = fuseUtils.findAccessRights();

        //For Global Variable-------------------------------------------------------------------------------------------
        var params;
        var headers = {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.proxy
        };

        //Method
        vm.downloadTable = downloadTable;
        vm.editTable = editTable;
        vm.setTooltip = setTooltip;
        vm.isCompareEnable = isCompareEnable;
        vm.compareRevisions = compareRevisions;
        vm.getBoards = getBoards;
        vm.openCard = openCard;

        // Data
        var id = $stateParams.id;
        var isDocuments = id && id.indexOf('documents') > -1;
        var viewportEnv = 'documentsRevisions';
        var whereFromFlag;
        var revisionPageType = '';

        vm.revisions = [];
        vm.objectNumber = '';
        vm.heightMax = document.body.scrollHeight;
        vm.tooltipCompare = 'Please select at least two parts to compare';

        setWhereFrom();

        getEnvironmentData()
          .then(function(result){
            getRevisions();
          })
          .catch(function(response) {
            console.log(vm.error.erCatch);
          });

        function getEnvironmentData(){
          if (vm.sessionData.proxy === true) {
            params = {
              customerId: vm.sessionData.customerAdminId
            };
          } else {
            params = {
              customerId: vm.sessionData.userId
            };
          }
          vm.progress = true;
          return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, params, '', headers)
            .then(function(response){
              processGetAllUsers(response);
              processProxyDetails();
              return new Promise(function(resolve){
                resolve('done');
              });
            })
            .catch(function(response) {
              console.log(vm.error.erCatch);
            });
        }

        $scope.$watch(() => {
          const gridElem = document.getElementById('grid-revisions');
          if (gridElem) {
            gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 246}px`;
          }
        });

        function getRevisions() {
            if (vm.sessionData.proxy == true) {
                params = {
                    oType: 'parts',
                    oId: id,
                    oData: 'revs',
                    customerId: vm.sessionData.customerAdminId
                };
            } else {
                params = {
                    oType: 'parts',
                    oId: id,
                    oData: 'revs'
                };
            }
            vm.progress = true;
            CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', headers)
                .then(function(response) {
                    switch (response.code) {
                        case 0:
                          vm.progress = false;
                            angular.forEach(response.data, function(revision) {
                                vm.objectNumber = revision.objectNumber;
                                vm.revisions.push(extendPropertiesOfRevision(revision));
                            });
                          if (vm.revisions[0].additionalInfoList) {
                              setAttributesAdditionalRevisions(vm.revisions[0].additionalInfoList);
                          }
                            $timeout(function(){
                                setSelectedRows();
                            });
                            setCsvFilename({objectNumber: response.data[0].objectNumber}, [vm.revisionsGridOptions]);
                            fuseUtils.setProperHeaderViewportHeight(vm.revisionsGridOptions.columnDefs, isDocuments ? 1 : 3, isDocuments ? viewportEnv : null, vm.revisionsTableUiGrid);
                            fuseUtils.handleAllOptionForPagination(vm.revisionsGridOptions, objectPageEnum.revisionsPage);
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
            $timeout(function () {
                vm.progress = false;
              }, 100
            );

        }

        function extendPropertiesOfRevision(revision) {

            if (revision.additionalInfoList) {
                angular.forEach(revision.additionalInfoList, function(additionalItem) {
                    revision[additionalItem.attributeKey] = additionalItem.attributeValue;
                });
            }

            if (revision.fuseObjectHistory) {
                var creator = _.find(vm.allUsers, {userId:revision.fuseObjectHistory.createdBy});
                var editor = _.find(vm.allUsers, {userId:revision.fuseObjectHistory.modifiedBy});
                revision.createdBy = creator ? creator.firstName + ' ' + creator.lastName : '';
                revision.modifiedBy = editor ? editor.firstName + ' ' + editor.lastName : '';
                revision.modifiedDate = $filter('date')(revision.fuseObjectHistory.modifiedDate, "medium");
                revision.createDate = $filter('date')(revision.fuseObjectHistory.createDate, "medium");
                revision.revisionNotes = revision.fuseObjectHistory.revisionNotes;
            }
            if (revision.minorRevision && vm.minorRevisionSettings) {
                revision.revision = revision.revision + '.' + revision.minorRevision;
            }
            revision.configurationsForDropdown = revision.configName;
            revision.associatedCardsList = revision.associatedCardList;
            revision.partNumber = revision.objectNumber;
            revision.hasBOM = revision.hasBOM ? 'Yes' : 'No';
            revision.projectNames = revision.projectNames.join(', ');
            revision.tags = revision.tags.join(', ');

            if (revision.costDetail && revision.costDetail.costSetting == 'A') {
                revision.costType = 'Rollup';
            } else {
                revision.costType = 'Manual';
            }

            if(!_.isEmpty(revision.mfrPartsList)){
                var firstMfr = revision.mfrPartsList[0];

                if(!_.isEmpty(firstMfr.costDetail)){
                    firstMfr.moq = firstMfr.costDetail[0].moq;
                    firstMfr.currency = firstMfr.costDetail[0].currency;
                    firstMfr.cost = firstMfr.costDetail[0].cost;
                }else{
                    firstMfr.moq = '';
                }
                revision.mfrList = firstMfr;
                revision.mfrList = sourcingUtils.addSourcingPrefix('mfr', revision.mfrList);

                _.assign(revision, revision.mfrList);
            }
            if(!_.isEmpty(revision.suppPartsList)){
                if(!_.isEmpty(revision.suppPartsList[0].costDetail)){
                    revision.suppPartsList[0].moq = revision.suppPartsList[0].costDetail[0].moq;
                    revision.suppPartsList[0].currency = revision.suppPartsList[0].costDetail[0].currency;
                    revision.suppPartsList[0].cost = revision.suppPartsList[0].costDetail[0].cost;
                }else{
                    revision.suppPartsList[0].moq = '';
                }
                revision.suppList = revision.suppPartsList[0];
                revision.suppList = sourcingUtils.addSourcingPrefix('supp', revision.suppList);

                _.assign(revision, revision.suppList);
            }

            return revision;
        }

        function setAttributesAdditionalRevisions(additionalInfoList) {
            var arr = [];
            if (additionalInfoList && additionalInfoList != 'undefined') {
                angular.forEach(additionalInfoList, function(additionalItem) {
                    var item = {};
                    item.name = additionalItem.attributeKey;
                    item.value = _.camelCase(additionalItem.attributeKey);
                    item.displayed = false;
                    arr.push(item);
                });
            }

            $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesAdditional', revisionPageType), angular.toJson(arr));
        }

        vm.revisionsGridOptions = {
            exporterFieldCallback: function ( grid, row, col, value ) {
              if ( col.name === 'associatedCardsList' ) {
                value = !_.isEmpty(value);
              }
              return value;
            },
            initialized: false,
            data: vm.revisions,
            columnDefs: [],
            enableSelectAll: false,
            multiSelect: true,
            enableRowSelection: true,
            showTreeExpandNoChildren: false,
            enableHiding: false,
            showTreeRowHeader: false,
            enableColumnReordering: true,
            rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
            enableColumnResizing: true,
            enableSorting: true,
            enableCellEdit: false,
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
            rowHeight: 30,
            // 0 - disable , 1 - enable , 2 - enable when needed
            enableHorizontalScrollbar: 1,
            enableVerticalScrollbar: 2,
            //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
            paginationPageSize: 100,
            paginationPageSizes: [
                {label: '25', value: 25},
                {label: '50', value: 50},
                {label: '75', value: 75},
                {label: '100', value: 100},
                {label: 'All', value: 3}
            ],
            paginationTemplate: "<div class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div class=\"ui-grid-pager-container\"><div class=\"ui-grid-pager-control\"><button type=\"button\" ng-click=\"paginationApi.seek(1)\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle\"><div class=\"first-bar\"></div></div></button> <button type=\"button\" ng-click=\"paginationApi.previousPage()\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle prev-triangle\"></div></button> <input type=\"number\" ng-model=\"grid.options.paginationCurrentPage\" min=\"1\" max=\"{{ paginationApi.getTotalPages() }}\" required> <span class=\"ui-grid-pager-max-pages-number\" ng-show=\"paginationApi.getTotalPages() > 0\">/ {{ paginationApi.getTotalPages() }}</span> <button type=\"button\" ng-click=\"paginationApi.nextPage()\" ng-disabled=\"cantPageForward()\"><div class=\"last-triangle next-triangle\"></div></button> <button type=\"button\" ng-click=\"paginationApi.seek(paginationApi.getTotalPages())\" ng-disabled=\"cantPageToLast()\"><div class=\"last-triangle\"><div class=\"last-bar\"></div></div></button></div><div class=\"ui-grid-pager-row-count-picker\">"+

            "<select ng-model=\"grid.options.paginationPageSize\""+

            "ng-options=\"o.value as o.label for o in grid.options.paginationPageSizes\">"+

            "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
            exporterSuppressColumns: ['bomId', 'objectId'],
            onRegisterApi: function (gridApi) {

                // Keep a reference to the gridApi.
                vm.revisionsTableUiGrid = gridApi;

                // Setup events so we're notified when grid state changes.
                vm.revisionsTableUiGrid.pagination.on.paginationChanged($scope, function(pageNumber, rowsNumber){
                  if(!rowsNumber)
                    return;

                  if(rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100){
                    fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.revisionsPage);
                  }else{
                    fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.revisionsPage);
                  }
                  saveState();
                });
                vm.revisionsTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
                vm.revisionsTableUiGrid.colResizable.on.columnSizeChanged($scope, function(){
                  vm.heightTopPanelRevisions = $('#grid-revisions .ui-grid-top-panel').height();

                  fuseUtils.setProperHeaderViewportHeight(vm.revisionsGridOptions.columnDefs, isDocuments ? 1 : 3, isDocuments ? viewportEnv : null, vm.revisionsTableUiGrid);
                  saveState();
                });
                vm.revisionsTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
                vm.revisionsTableUiGrid.core.on.filterChanged($scope, function() {
                    $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
                });
                vm.revisionsTableUiGrid.core.on.sortChanged($scope, saveState);
                vm.revisionsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
                  if (vm.revisionsGridOptions.initialized) {
                    let gridCol;
                    _.forEach(vm.revisionsTableUiGrid.grid.columns, function (val) {
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

                vm.revisionsTableUiGrid.core.on.renderingComplete($scope, function() {});
                vm.revisionsTableUiGrid.core.on.scrollBegin($scope, function() {
                    $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
                    $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
                });
                vm.revisionsTableUiGrid.core.on.scrollEnd($scope, function() {
                    $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
                    $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});
                });

                vm.revisionsTableUiGrid.core.on.rowsRendered($scope, function() {
                    if ((vm.revisionsGridOptions.data.length > 0) && !vm.revisionsGridOptions.initialized) {
                        $timeout(function() {
                            vm.revisionsGridOptions.initialized = true;
                        });
                    }
                    showClearButton(vm.revisionsTableUiGrid);
                    vm.heightTopPanelRevisions = $('#grid-revisions .ui-grid-top-panel').height();
                    vm.thumbnailIndexRevisions = _.findIndex(vm.revisionsTableUiGrid.grid.columns, function (val) {
                          return val.field == 'thumbnailPath';
                      }) - 3;
                    $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
                    $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});

                });

                vm.revisionsTableUiGrid.selection.on.rowSelectionChanged($scope,function(row){
                    saveSelectedRows();
                    saveState();
                });

            }
        };

        function getRevisionsAttributes() {
            var attributes = {};

            var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", revisionPageType));
            var attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", revisionPageType));
            var attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", revisionPageType));
            var attributesManufacturer = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", revisionPageType));
            var attributesSupplier = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", revisionPageType));
            var attributesHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", revisionPageType));

            if (attributesBasic && (!vm.configurationSettings && (attributesBasic.indexOf('Configuration') === -1) && (attributesBasic.indexOf('associatedCardsList') !== -1))
            || (vm.configurationSettings && attributesBasic && (attributesBasic.indexOf('associatedCardsList') !== -1) && (attributesBasic.indexOf('Configuration') !== -1))){
                attributes.basicInfo = angular.fromJson(attributesBasic);
            } else {
                switch (revisionPageType) {
                    case vm.objectPageEnum.revisionDocumentPage:
                        attributes.basicInfo = attributesUtils.getDefaultDocumentsAttributes();
                        break;
                    case vm.objectPageEnum.revisionProductPage:
                        attributes.basicInfo = attributesUtils.getRevisionBasicAttributes();
                        break;
                    case vm.objectPageEnum.revisionPartPage:
                        attributes.basicInfo = attributesUtils.getRevisionBasicAttributes();
                        break;
                    default:
                        break;
                }
                $window.localStorage.removeItem(fuseUtils.buildAttributeName('attributesBasic', revisionPageType));
                $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesBasic', revisionPageType), angular.toJson(attributes.basicInfo));
            }


            if (attributesHistory && attributesHistory != 'undefined') {
                attributes.history = angular.fromJson(attributesHistory);
            } else {
                attributes.history = [
                    {name: 'Created By', value: 'createdBy', displayed: true},
                    {name: 'Created Date', value: 'createDate', displayed: true},
                    {name: 'Modified By', value: 'modifiedBy', displayed: true},
                    {name: 'Modified Date', value: 'modifiedDate', displayed: true},
                    {name: 'Revision Notes', value: 'revisionNotes', displayed: true}
                ];
                $window.localStorage.removeItem(fuseUtils.buildAttributeName('attributesObjectHistory', revisionPageType));
                $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesObjectHistory', revisionPageType), angular.toJson(attributes.history));
            }

            if (attributesInventory && attributesInventory != 'undefined') {
                attributes.inventory = angular.fromJson(attributesInventory);
            }
            if (attributesAdditional && attributesAdditional != 'undefined') {
                attributes.additional = angular.fromJson(attributesAdditional);
            }
            if (attributesManufacturer && attributesManufacturer != 'undefined') {
                attributes.manufacturer = angular.fromJson(attributesManufacturer);
            }
            if (attributesSupplier && attributesSupplier != 'undefined') {
                attributes.supplier = angular.fromJson(attributesSupplier);
            }

            return attributes;
        }

        function buildRevisionsTableColumns(){
            var attributes = getRevisionsAttributes();
            var columns = [];

            if (attributes.basicInfo) {
                angular.forEach((attributes.basicInfo || []), function (tableRow) {
                    if (tableRow.displayed) {
                      var colDef = fuseUtils.parseAttributes(tableRow);
                      if(tableRow.value === 'associatedCardsList'){
                        colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
                        colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
                      }

                      if(tableRow.value === 'configurationsForDropdown' ){
                        if(!vm.configurationSettings)
                          return;

                        colDef.enableCellEdit = false;
                      }
                      columns.push(colDef);
                    }
                });
            }

            if (attributes.inventory  && whereFromFlag !== 'documents') {
                angular.forEach((attributes.inventory || []), function (tableRow) {
                    if (tableRow.displayed) {
                        columns.push( fuseUtils.parseAttributes(tableRow) );
                    }
                });
            }

            if (attributes.additional) {
                angular.forEach((attributes.additional || []), function (tableRow) {
                    if (tableRow.displayed) {
                      var colDef = fuseUtils.parseAttributes(tableRow, true);
                      if(tableRow.attributeType === 'Link'){
                        colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
                      }

                      columns.push(colDef);
                    }
                });
            }

            if (attributes.manufacturer && whereFromFlag !== 'documents') {
                angular.forEach((attributes.manufacturer || []), function (tableRow) {
                    if (tableRow.displayed) {
                        var colDef = fuseUtils.parseAttributes(tableRow);
                        colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
                        if (tableRow.value === 'mfrObjectNumber') {
                            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-number-with-button-cell.html';
                        }
                        if (tableRow.value === 'mfrObjectName') {
                            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
                        }
                        //colDef.field = 'mfrList[0].' + o.value;
                        colDef.name = tableRow.value;
                        columns.push(colDef);
                    }
                });
            }

            if (attributes.supplier  && whereFromFlag !== 'documents') {
                angular.forEach((attributes.supplier || []), function (tableRow) {
                    if (tableRow.displayed) {
                        var colDef = fuseUtils.parseAttributes(tableRow);
                        colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
                        if (tableRow.value === 'suppObjectNumber') {
                            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-number-with-button-cell.html';
                        }
                        if (tableRow.value === 'suppObjectName') {
                            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
                        }
                        //colDef.field = 'suppList[0].' + o.value;
                        colDef.name = tableRow.value;
                        columns.push(colDef);
                    }
                });
            }

            if (attributes.history) {
                angular.forEach((attributes.history || []), function (tableRow, i) {
                    if (tableRow.displayed) {
                        columns.push(fuseUtils.parseAttributes(tableRow));
                    }
                });
            }

            columns.forEach(function(col, ind, columns){
                // col.headerCellClass = setHeaderHeight;
                if(!col.headerCellTemplate && col.displayName){
                  col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
                }
            });

            setTemplateForAttachmentsColumn(columns);

            return columns;
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
                  pageType: revisionPageType,
                  whereIsRevisionFrom: whereFromFlag,
                  params: {
                    isConfigEnabled: vm.configurationSettings
                  }
                }
            }).then(function() {
                getRevisionsAttributes();
                vm.revisionsGridOptions.initialized = false;
                vm.revisionsGridOptions.columnDefs = buildRevisionsTableColumns();
                restoreState();
                setSelectedRows();
            }, function() {

            });
        }

      function setCsvFilename(part, tables){
        var csvFilename = 'Revisions of ' + part.objectNumber + '.csv';
        tables.forEach(function(table){
          table.exporterCsvFilename = csvFilename;
        });
      }

        function restoreState() {
            $timeout(function() {
              var state = $window.localStorage.getItem(fuseUtils.buildAttributeName('grid-revisions', revisionPageType));
              state = state ? angular.fromJson(state) : null;

              fuseUtils.moveColumnToFirstPosition(vm.revisionsTableUiGrid, $scope, 'associatedCardsList', true);
              fuseUtils.moveAttachmentsColumn (vm.revisionsTableUiGrid, $scope, true);

              fuseUtils.setProperHeaderViewportHeight(vm.revisionsGridOptions.columnDefs, isDocuments ? 1 : 3, isDocuments ? viewportEnv : null, vm.revisionsTableUiGrid);

              if(!state){
                return;
              }

              var pageSize = state.pagination.paginationPageSize;
              if( pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100){
                fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.revisionsPage);
                state.pagination.paginationPageSize = 100;
              }

              if (state) vm.revisionsTableUiGrid.saveState.restore($scope, state);
            });
        }

        function saveState() { //after any update table
            var state = vm.revisionsTableUiGrid.saveState.save();
            $window.localStorage.setItem(fuseUtils.buildAttributeName('grid-revisions', revisionPageType), angular.toJson(state));
        }

        function saveSelectedRows() {
            var state = vm.revisionsTableUiGrid.saveState.save();
            var selectedRows = state.selection;
            var name = vm.objectNumber + '-selectedRows';
            $window.localStorage.removeItem(fuseUtils.buildAttributeName(name, revisionPageType));
            $window.localStorage.setItem(fuseUtils.buildAttributeName(name, revisionPageType), angular.toJson(selectedRows));
        }

        function setSelectedRows() {
            $timeout(function(){
                var name = vm.objectNumber + '-selectedRows';
                var rows = $window.localStorage.getItem(fuseUtils.buildAttributeName(name, revisionPageType));
                rows = angular.fromJson(rows);
                if (rows && rows.length > 0){
                    angular.forEach(rows, function(row){
                        var rowSelect = vm.revisionsGridOptions.data[row.row];
                        vm.revisionsTableUiGrid.selection.selectRow(rowSelect);
                    });
                }
            })
        }

      function setTemplateForAttachmentsColumn(arr){
        var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
        if(!attachmentsColumn)
          return;

        attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
      }

        function showClearButton(gridApi) {
            vm.clearSearchButton = false;
            vm.clearSearchButton = buttonForClear(gridApi, vm.clearSearchButton);
        }

        function buttonForClear( gridInstance, flag ) {

            _.forEach(gridInstance.grid.columns, function(column) {
                if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name !== 'treeBaseRowHeaderCol' && column.field !== 'objectId') {
                    flag = true;
                }
                if (column.filters[0].term !== undefined) {
                    flag = true;
                }
            });

            if (gridInstance.grid.getColumnSorting().length !== 0) {
                flag = true;
            }

            return flag;
        }

        //functions for compare button start
        function setTooltip() {
            var countRows = vm.revisionsTableUiGrid ? vm.revisionsTableUiGrid.selection.getSelectedCount() : 0;
            vm.tooltipCompare = (countRows < 2) ? 'Please select at least two parts to compare' : (countRows > 5) ? 'Only 5 objects or less can be compared' : 'Compare Revisions';
        }

        function isCompareEnable() {
            var countRows = vm.revisionsTableUiGrid ? vm.revisionsTableUiGrid.selection.getSelectedCount() : 0;
            return (countRows > 1 && countRows < 6);
        }

        function compareRevisions() {
            const idsCompare = vm.revisionsTableUiGrid.selection.getSelectedRows().map((row) => {
              return row.objectId;
            });
            const locHref = location.href;
            const urlParts = locHref.split('/');
            const targetUrl = urlParts[urlParts.length - 2];
            const pageType = urlParts[urlParts.length - 1];
            $cookies.put('numberForBackButton', targetUrl);
            $cookies.put('pageType', pageType);
            $cookies.put('numberForBackButton', targetUrl);
            saveSelectedRows();
            saveState();
            $cookies.put('idsForCompare', idsCompare);
            $state.go('app.objects.compare');
        }
        //functions for compare button end

        //for download start
        function getTimeZone() {
            var usertime = new Date().toLocaleString();
            var tzsregex = /\b(ACDT|ACST|ACT|ADT|AEDT|AEST|AFT|AKDT|AKST|AMST|AMT|ART|AST|AWDT|AWST|AZOST|AZT|BDT|BIOT|BIT|BOT|BRT|BST|BTT|CAT|CCT|CDT|CEDT|CEST|CET|CHADT|CHAST|CIST|CKT|CLST|CLT|COST|COT|CST|CT|CVT|CXT|CHST|DFT|EAST|EAT|ECT|EDT|EEDT|EEST|EET|EST|FJT|FKST|FKT|GALT|GET|GFT|GILT|GIT|GMT|GST|GYT|HADT|HAEC|HAST|HKT|HMT|HST|ICT|IDT|IRKT|IRST|IST|JST|KRAT|KST|LHST|LINT|MART|MAGT|MDT|MET|MEST|MIT|MSD|MSK|MST|MUT|MYT|NDT|NFT|NPT|NST|NT|NZDT|NZST|OMST|PDT|PETT|PHOT|PKT|PST|RET|SAMT|SAST|SBT|SCT|SGT|SLT|SST|TAHT|THA|UYST|UYT|VET|VLAT|WAT|WEDT|WEST|WET|WST|YAKT|YEKT)\b/gi;
            var timezonenames = {
                "UTC+0": "GMT",
                "UTC+1": "CET",
                "UTC+2": "EET",
                "UTC+3": "EEDT",
                "UTC+3.5": "IRST",
                "UTC+4": "MSD",
                "UTC+4.5": "AFT",
                "UTC+5": "PKT",
                "UTC+5.5": "IST",
                "UTC+6": "BST",
                "UTC+6.5": "MST",
                "UTC+7": "THA",
                "UTC+8": "AWST",
                "UTC+9": "AWDT",
                "UTC+9.5": "ACST",
                "UTC+10": "AEST",
                "UTC+10.5": "ACDT",
                "UTC+11": "AEDT",
                "UTC+11.5": "NFT",
                "UTC+12": "NZST",
                "UTC-1": "AZOST",
                "UTC-2": "GST",
                "UTC-3": "BRT",
                "UTC-3.5": "NST",
                "UTC-4": "CLT",
                "UTC-4.5": "VET",
                "UTC-5": "EST",
                "UTC-6": "CST",
                "UTC-7": "MST",
                "UTC-8": "PST",
                "UTC-9": "AKST",
                "UTC-9.5": "MIT",
                "UTC-10": "HST",
                "UTC-11": "SST",
                "UTC-12": "BIT"
            };
            var timezone = usertime.match(tzsregex);
            if (timezone) {
                timezone = timezone[timezone.length - 1];
            } else {
                var offset = -1 * new Date().getTimezoneOffset() / 60;
                offset = "UTC" + (offset >= 0 ? "+" + offset : offset);
                timezone = timezonenames[offset];
            }
            return timezone;
        }

        function parseImgToBase64(url, flag) {
            var deferred = $q.defer();
            var c = document.createElement('canvas');
            var ctx = c.getContext('2d');
            ctx.canvas.width = 35;
            ctx.canvas.height = 27;
            var image = new Image();
            if(flag){
                url = url.replace(/^https:\/\//i, 'http://');
                image.setAttribute('crossOrigin', 'anonymous');
            }
            image.src = url;
            image.onload = function () {
                ctx.drawImage(image, 8, 0, 25, 25);
                deferred.resolve(c.toDataURL());
            };
            return deferred.promise
        }

        function getBase64Values(doc, index) {
            var deferred = $q.defer();
            var promises = [];
            angular.forEach(doc.content[0].table.body, function (value, k) {
                if (k != 0) {
                    promises.push(value[index] ? parseImgToBase64(value[index], true) :
                      vm.partproduct == 'parts' ? parseImgToBase64('assets/images/ecommerce/part-square.png') : parseImgToBase64('assets/images/ecommerce/product-sqaure.png'));
                }
            });
            $q.all(promises).then(function(values){
                deferred.resolve(values);
            });
            return deferred.promise;
        }

        function parseThumbnailValues(doc, index, values) {
            angular.forEach(doc.content[0].table.body, function (value, k) {
                if (k != 0) {
                    value[index] = {
                        image: values[k - 1]
                    };
                }
                return value;
            });
            return doc;
        }

        function downloadTable(flag, option, gridApi, gridOptions) {
            if (flag == 'csv') {
                vm.revisionsGridOptions.exporterSuppressColumns = ['bomId', 'objectId', 'thumbnailPath'];

                gridApi.exporter.csvExport('visible', 'visible');
            } else {
                var now = new Date();
                var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A') + ' (' + getTimeZone() + ')';

                if (vm.partproduct == 'parts') {
                    var base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/part-square.png');
                } else {
                    var base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/product-sqaure.png');
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
                                        text: dateformat || ' ',
                                        margin: [0, 5, 0, 0],
                                        colSpan: 2,
                                        style: 'dateStyle'
                                    },
                                        ''
                                    ],
                                    ['',
                                        {
                                            text: [{
                                                text: vm.revisions[0].objectNumber + ', Revision ' + vm.revisions[0].revision + '\t',
                                                bold: true,
                                                margin: [4, 4, 0, 0]
                                            },
                                                {
                                                    text: ' ' + vm.revisions[0].status + ' ',
                                                    background: vm.revisions[0].status == 'InDevelopment' ? '#ffc12d' : (vm.revisions[0].status == 'Released' ? '#4caf50' : '#ff5722'),
                                                    color: vm.revisions[0].status == 'Released' ? '#fff' : '#000',
                                                    bold: true,
                                                    margin: [0, 4, 4, 0]
                                                }
                                            ]
                                        }
                                    ],
                                    [{
                                        stack: [{
                                            image: base64String,
                                            width: 25,
                                            alignment: 'center'
                                        }]
                                    },
                                        {
                                            text: vm.revisions[0].description || ' ',
                                            margin: [0, 2, 0, 0]
                                        }
                                    ],
                                    ['',
                                        {
                                            text: [{
                                                text: ' ' + vm.revisions[0].categoryHierarchy + ' ',
                                                background: '#fff',
                                                color: '#000',
                                                margin: [4, 2, 0, 4]
                                            }, {
                                                text: ' , ' + vm.revisions[0].objectName,
                                                margin: [0, 2, 4, 4]
                                            }]
                                        }
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        }]
                    };

                    gridOptions.exporterPdfCustomFormatter = function(docDefinition) {
                        docDefinition.styles.headerStyle = {
                            margin: [30, 5, 0, 0],
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
                    var exportColumnHeaders = uiGridExporterService.getColumnHeaders(gridApi, uiGridExporterConstants.VISIBLE);
                    var exportData = uiGridExporterService.getData(gridApi, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE, true);
                    var docDefinition = uiGridExporterService.prepareAsPdf(gridApi, exportColumnHeaders, exportData);

                    docDefinition.pageMargins = [0, 100, 0, 40];
                    var base64Values = getBase64Values(docDefinition, vm.thumbnailIndexHierarchical);

                    docDefinition.content[0].table.widths = 100 / docDefinition.content[0].table.widths.length + '%';

                    base64Values.then(function (values) {
                            vm.revisionsGridOptions.exporterSuppressColumns = ['bomId', 'objectId'];
                            parseThumbnailValues(docDefinition, vm.thumbnailIndexHierarchical, values);

                        if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
                            uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
                        } else {
                            if (option == 'print') {
                                pdfMake.createPdf(docDefinition).print();
                            } else {
                                pdfMake.createPdf(docDefinition).download();
                            }
                        }
                    });
                });
            }
        }

        function processGetAllUsers(response){
          switch (response.code) {
            case 0:
              vm.allUsers = response.data.Members;
              break;
            case 4006:
              break;
            default:
          }
        }

        function setWhereFrom() {
            if (id.indexOf('products') !== -1) {
                whereFromFlag = 'products';
                revisionPageType = vm.objectPageEnum.revisionProductPage;
            } else if (id.indexOf('documents') !== -1){
                whereFromFlag = 'documents';
                revisionPageType = vm.objectPageEnum.revisionDocumentPage;
            } else if (id.indexOf('parts') !== -1) {
                whereFromFlag = 'parts';
                revisionPageType = vm.objectPageEnum.revisionPartPage;
            }
        }

        function setHeaderHeight (grid, row, col, rowRenderIndex, colRenderIndex) {
            var isColumnHigh = grid.columns.some(function(col){
                return col.displayName.length > 24;
            });

            return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
        }

      function processProxyDetails(){
          $rootScope.$watch('enableMinorRev', value => {
            if (value !== undefined) {
              vm.minorRevisionSettings = $rootScope.enableMinorRev;
              vm.configurationSettings = $rootScope.configurationSettings;
              getRevisionsAttributes();
              vm.revisionsGridOptions.columnDefs = buildRevisionsTableColumns();
              restoreState();
            }
          });
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

      $scope.$on('SendUp', function(){
        $state.go('app.objects.part.parts.revisions', {id: id}, {
          notify: false,
          reload: false
        });
      });
    }

})();
