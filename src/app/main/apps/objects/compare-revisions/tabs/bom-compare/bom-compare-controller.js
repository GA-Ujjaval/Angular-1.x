(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('BomCompareController', BomCompareController);

  /** @ngInject */
  function BomCompareController($mdDialog, $document, hostUrlDevelopment, CustomerService, errors, AuthService, DialogService, $mdMenu,
                                $scope, $timeout, $rootScope, $window, fuseUtils, uiGridPinningConstants, BoardService, $state,
                                objectPageEnum, $cookies, attributesUtils, sourcingUtils, uiGridExporterConstants, uiGridExporterService,
                                objectsCompareService, localstorageCheckingService, exportBomService, uiGridGridMenuService) {

    var vm = this;
    vm.fuseUtils = fuseUtils;
    vm.sourcingUtils = sourcingUtils;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;
    vm.flagClearButton = false;

      //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');


    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    var data = $cookies.get('idsForCompare').split(',');
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

    //Data for bom-compare-controller
    vm.objectPageEnum = objectPageEnum;
    vm.linksInHeader = $rootScope.linksInHeader;
    vm.hierarchicalTables = [];
    vm.compareMasterList = [];
    vm.compareObjectsWithData = [];
    vm.hierarchicalCompareObjects = $rootScope.hierarchicalCompareObjects;
    vm.heightMax = document.body.scrollHeight;
    vm.bomCompareFlag = true;

    var hierarchicalId = 'grid-hierarchicalCompare',
        flatId = 'grid-flatCompare';

    //Methods
    vm.editTable = editTable;
    vm.toggleSourcingGridRow = toggleSourcingGridRow;
    vm.toggleHierarchicalAllRow = toggleHierarchicalAllRow;
    vm.clearFilters = clearFilters;
    vm.getRowIndex = getRowIndex;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.getCompareCodeTooltip = getCompareCodeTooltip;

    init();

    $scope.$watch('document.documentElement.clientHeight', () => {
      const gridElemTableOne = document.getElementById('grid-bom-compare-table-0');
      if (gridElemTableOne) {
        gridElemTableOne.style.height = `${document.documentElement.clientHeight - gridElemTableOne.offsetTop - 180}px`;
      }
      const gridElemTableTwo = document.getElementById('grid-bom-compare-table-1');
      if (gridElemTableTwo) {
        gridElemTableTwo.style.height = `${document.documentElement.clientHeight - gridElemTableTwo.offsetTop - 180}px`;
      }
      const gridElemTableThree = document.getElementById('grid-bom-compare-table-2');
      if (gridElemTableThree) {
        gridElemTableThree.style.height = `${document.documentElement.clientHeight - gridElemTableThree.offsetTop - 180}px`;
      }
      const gridElemTableFour = document.getElementById('grid-bom-compare-table-3');
      if (gridElemTableFour) {
        gridElemTableFour.style.height = `${document.documentElement.clientHeight - gridElemTableFour.offsetTop - 180}px`;
      }
      const gridElemTableFive = document.getElementById('grid-bom-compare-table-4');
      if (gridElemTableFive) {
        gridElemTableFive.style.height = `${document.documentElement.clientHeight - gridElemTableFive.offsetTop - 180}px`;
      }
    });

    function init () {
      vm.progress = true;
      $scope.$emit('setShowChangesButtonBom');

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.getcomparemasterlist, params, data, header)
        .then(function (res) {
          vm.progress = true;

          vm.compareMasterList = res.data;

          vm.compareObjectsWithData = sendDataInCompareObjects(vm.hierarchicalCompareObjects, vm.compareMasterList);
        })
        .then(function(){
          vm.compareObjectsWithData = parseAttrBomHierarchical(vm.compareObjectsWithData);
        })
        .then(function(){
          setShowChangesFlag();
        })
        .then(function(){
          vm.compareObjectsFlatten =  flattenObjects(vm.compareObjectsWithData);
        })
        .then(function(){
          vm.compareObjectsFlatten = addEmptyRows (vm.compareObjectsFlatten);
        })
        .then(function(){
          vm.compareObjectsFlatten = _.map(vm.compareObjectsFlatten, function (data) {
            return sourcingUtils.applyFlattenOnSourcing(data, true, true);
          });
        })
        .then(function(){
          vm.compareObjectsFlatten = addEmptyRowsForSourcing (vm.compareObjectsFlatten);
        })
        .then(function(){
          const matcherCompareCode = {
            CHANGE: '1',
            DISCARD: '2',
            NEW: '3'
          };
          vm.hierarchicalTables = buildHierarchicalTables(vm.compareObjectsFlatten, vm.linksInHeader);
          vm.hierarchicalTables.forEach(table => {
            table.gridOptions.data.forEach( row => {
              row.modification = row.compareCode === 'SAME' || row.compareCode === 'BASE' ? '0' : matcherCompareCode[row.compareCode];
            });
          });
        })
        .then(function(){
          vm.commonTableGridOptions.columnDefs = buildCommonTableColumns(false);
          vm.commonTableGridOptions.data = buildCommonTableData();
          $timeout(function(){
            var containerId = 'bom-compare';
            objectsCompareService.linkScrollingTables(containerId);
          });
          vm.progress = false;
        });
    }

    function getAttributes(type) {
      var attributes = {};
      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", type));
      var attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", type));
      var attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", type));
      var attributesManufacturer = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", type));
      var attributesSupplier = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", type));
      var attributesRevisions = localStorage.getItem(fuseUtils.buildAttributeName("attributesRevisions", type));

      var parsedBasicAttributes = angular.fromJson(attributesBasic);

      if (localstorageCheckingService.isLocalStorageValid({
        basicInfo: attributesBasic,
        isConfigEnabled: vm.configurationSettings,
        pageType: objectPageEnum.heirarchicalPage
      })) {
        attributes.basicInfo = parsedBasicAttributes
      } else {
        attributes.basicInfo = attributesUtils.getBOMBasicAttributes();

        var thumbObj = _.find(attributes.basicInfo,{name: 'Thumbnail'});
        var ind = _.indexOf(attributes.basicInfo, thumbObj);
        attributes.basicInfo.splice(ind, 1);

        attributes.basicInfo = _.map(attributes.basicInfo, function (attr) {
          const isDisplayed = ['Part Number', 'Revision', 'Description', 'Status', 'Ref. Des.', 'Quantity', 'Location', 'Notes', 'Compare Code']
            .some((val) => attr.name === val);

          attr.displayed = isDisplayed;
          if (attr.name === 'Location') {
            attr.value = 'location';
          }
          return attr;
        });
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
        localStorage.setItem(fuseUtils.buildAttributeName('attributesBasic', type), angular.toJson(attributes.basicInfo));
      }

      if (attributesRevisions && attributesRevisions != 'undefined') {
        attributes.revisions = angular.fromJson(attributesRevisions);
      } else {
        attributes.revisions = [
          {name: 'Created By', value: 'createdBy', displayed: false},
          {name: 'Created Date', value: 'createDate', displayed: false},
          {name: 'Modified By', value: 'modifiedBy', displayed: false},
          {name: 'Modified Date', value: 'modifiedDate', displayed: false},
          {name: 'Revision Notes', value: 'revisionNotes', displayed: false}
        ];
        $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesRevisions', type), angular.toJson(attributes.revisions));
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

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="ui-grid-cell-contents attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function buildTableColumns(type){
      var attributes = getAttributes(type);

      var columns = [];

      var expandRow = {
          enableSorting: false,
          enableFiltering: false,
          resizable: false,
          headerCellTemplate: '<div class="ui-grid-cell-contents"><div class="ui-grid-tree-base-row-header-buttons" ng-class="{\'ui-grid-icon-minus-squared\': grid.treeBase.numberLevels > 0 && grid.api.grid.allBomCollapsed, \'ui-grid-icon-plus-squared\': grid.treeBase.numberLevels > 0 && !grid.api.grid.allBomCollapsed}" ng-click="grid.appScope.vm.toggleHierarchicalAllRow()" role="button"> &nbsp;</div></div>',
          cellTemplate: 'app/main/apps/objects/module-templates/cell/tree-bom-compare.html',
          field: 'objectId',
          displayName: '',
          visible: true,
          pinnedLeft: true,
          width: 40,
          minWidth: 40,
          maxWidth: 40,
          enableHiding: false,
          enableColumnMenu: false,
          enableColumnMoving: false,
          enableCellEdit: false
        };

      columns.push(expandRow);

      if (attributes.basicInfo) {
        angular.forEach((attributes.basicInfo || []), function (o) {
          if (o.displayed) {
            let colDef = fuseUtils.parseAttributes(o);
            if (o.value === 'refDocs') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/ref-des-hierarchical-compare-cell.html';
            }
            if (o.value === 'notes') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/notes-hierarchical-compare-cell.html';
            }
            if (o.value === 'location') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/location-hierarchical-compare-cell.html';
            }
            if(o.value === 'associatedCardsList'){
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            if (o.value === 'modification'){
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/compare-code-cell.html';
              colDef.headerCellTemplate = '<div class="header-cell-wrapper"><div class="ui-grid-cell-contents"><span style="float:right; margin-right: 10px;" ui-grid-one-bind-id-grid="col.uid + \'-sortdir-text\'" ui-grid-visible="col.sort.direction" aria-label="Sort Ascending" class="" id="1538147413562-uiGrid-00VD-sortdir-text"><i ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }" title="" aria-hidden="true" class="ui-grid-icon-up-dir" style=""></i> <sub ui-grid-visible="isSortPriorityVisible()" class="ui-grid-sort-priority-number ui-grid-invisible">1</sub></span>' +
                '<md-tooltip class="md-tooltip multiline-tooltip-templates" md-direction="{{options.tooltipDir || \'top\'}}">' +
                '<div>0 - Base or Unchanged</div>' +
                '<div>1 - Modified</div>' +
                '<div>2 - Deleted</div>' +
                '<div>3 - Added</div>' +
                '</md-tooltip><div class="custom-ui-grid-header">' +
                '{{::col.displayName}}' +
                '</div><div role="button" tabindex="0" ui-grid-one-bind-id-grid="col.uid + \'-menu-button\'" class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus &amp;&amp; !col.isRowHeader  &amp;&amp; col.colDef.enableColumnMenu !== false" ng-click="toggleMenu($event); handleClick($event, col);" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}" ui-grid-one-bind-aria-label="i18n.headerCell.aria.columnMenuButtonLabel" aria-haspopup="true" id="1537884881301-uiGrid-000J-menu-button" aria-label="Column Menu"><i class="ui-grid-icon-angle-down" aria-hidden="true">&nbsp;</i></div></div>' +
                '<div ui-grid-filter=""><!----><div class="ui-grid-filter-container" ng-style="col.extraStyle" ng-repeat="colFilter in col.filters" ng-class="{\'ui-grid-filter-cancel-button-hidden\' : colFilter.disableCancelFilterButton === true }"><!----><div ng-if="colFilter.type !== \'select\'"><input type="text" class="ui-grid-filter-input ui-grid-filter-input-0" ng-model="colFilter.term" ng-attr-placeholder="{{colFilter.placeholder || \'\'}}" aria-label="Filter for column" placeholder="" aria-invalid="false"><!----><div role="button" class="ui-grid-filter-button ng-hide" ng-click="removeFilter(colFilter, $index)" ng-if="!colFilter.disableCancelFilterButton" ng-disabled="colFilter.term === undefined || colFilter.term === null || colFilter.term === \'\'" ng-show="colFilter.term !== undefined &amp;&amp; colFilter.term !== null &amp;&amp; colFilter.term !== \'\'" aria-hidden="true" aria-disabled="true" disabled="disabled"><i class="ui-grid-icon-cancel" ui-grid-one-bind-aria-label="aria.removeFilter" aria-label="Remove Filter">&nbsp;</i></div><!----></div><!----><!----></div><!----></div></div>'


            }
            colDef.name = o.value;
            columns.push( colDef );
          }
        });
      }

      if (attributes.inventory) {
        angular.forEach((attributes.inventory || []), function (o) {
          if (o.displayed) {
            columns.push( fuseUtils.parseAttributes(o) );
          }
        });
      }

      if (attributes.additional) {
        angular.forEach((attributes.additional || []), function (o) {
          if (o.displayed) {
            columns.push( fuseUtils.parseAttributes(o, true) );
          }
        });
      }

      if (attributes.manufacturer) {
        angular.forEach((attributes.manufacturer || []), function (o) {
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
            //colDef.field = 'mfrList[0].' + o.value;
            colDef.name = o.value;
            columns.push(colDef);
          }
        });
      }

      if (attributes.supplier) {
        angular.forEach((attributes.supplier || []), function (o) {
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
            //colDef.field = 'suppList[0].' + o.value;
            colDef.name = o.value;
            columns.push(colDef);
          }
        });
      }

      angular.forEach(columns, function(column){
        if ( column.field !== 'objectId' && column.field !== 'modification' && column.field !== 'refDocs') {
          column.cellClass = function (grid, row) {
            if ( (row.entity.compareCode) === 'NEW' ) return('new');
            if ( (row.entity.compareCode) === 'DISCARD' ) return('discard');
          };
        }
        if ( column.field === 'quantity' ) {
          column.cellClass = function (grid, row) {
            if ( (row.entity.quantityCompareCode) === 'NEW' ) return('new');
            if ( (row.entity.quantityCompareCode) === 'CHANGE' ) return('change');
            if ( (row.entity.quantityCompareCode) === 'DISCARD' ) return('discard');
            if ( !row.entity.quantityCompareCode && ((row.entity.compareCode) === 'NEW')) {
              return 'new';
            }
            if ( !row.entity.quantityCompareCode && ((row.entity.compareCode) === 'DISCARD')) {
              return 'discard';
            }
            if ( !row.entity.quantityCompareCode && ((row.entity.compareCode) === 'CHANGE')) {
              return 'change';
            }
          };
        }
        if ( column.field === 'location' ) {
          column.cellClass = function (grid, row) {
            if ( (row.entity.locationCompareCode) === 'NEW' ) return('new');
            if ( (row.entity.locationCompareCode) === 'CHANGE' ) return('change');
            if ( (row.entity.locationCompareCode) === 'DISCARD' ) return('discard');
          };
        }
        if ( column.field === 'notes' ) {
          column.cellClass = function (grid, row) {
            if ( (row.entity.notesCompareCode) === 'NEW' ) return('new');
            if ( (row.entity.notesCompareCode) === 'CHANGE' ) return('change');
            if ( (row.entity.notesCompareCode) === 'DISCARD' ) return('discard');
          };
        }
        if ( column.field === 'objectNumber' || column.field === 'revision') {
          column.cellClass = function (grid, row) {
            if ( (row.entity.compareCode) === 'NEW' ) return('new');
            if ( (row.entity.compareCode) === 'DISCARD' ) return('discard');
            if ( (row.entity.compareCode) === 'CHANGE' ) return('change');
          };
        }
      });

      setTemplateForAttachmentsColumn(columns);
      return columns;
    }

    function sendDataInCompareObjects(compareObjects, masterList) {

      var compareObjectsWithData = [];

      angular.forEach(compareObjects, function(object){
        var compareObject = [];

        _.forIn(object.bomHierarchicalCompare, function(value, key){
          var objFromMasterList = _.find( masterList, ['objectId', key] );

          var objFromMasterListCopy = angular.copy(objFromMasterList);
          var objFromMasterListWithData = Object.assign(objFromMasterListCopy, value);

          compareObject.push(objFromMasterListWithData);
        });
        compareObjectsWithData.push(compareObject);
      });

      return compareObjectsWithData;
    }

    function getCompareCodeTooltip(row) {
      return matcherTooltip[row.modification];
    }

    const matcherTooltip = {
      0: 'Unchanged',
      1: 'Modified',
      2: 'Deleted',
      3: 'Added'
    };

    function addEmptyRows(compareObjects) {

      angular.forEach(compareObjects, function(compareObjectFrom, i){

        angular.forEach(compareObjectFrom, function(object, k){
          if (!object.emptyRowFlag){
            angular.forEach(compareObjects, function(compareObjectTo, l){

              if  (l !== i){

                var searchObject = _.find(compareObjectTo, function(o){
                  return ( o.objectId === object.objectId &&
                  o.$$treeLevel === object.$$treeLevel &&
                  o.parentId === object.parentId &&
                  ( _.isEqual(o.ancestors, object.ancestors) || o.ancestors === object.ancestors ) )
                });

                var searchEmptyObject = _.find(compareObjectTo, function(o){
                  return ( o.emptyRowId === object.objectId &&
                  o.$$treeLevel === object.$$treeLevel && o.level === 0 &&
                  o.emptyRowParentId === object.parentId &&
                  ( _.isEqual(o.emptyRowAncestors, object.ancestors) || o.emptyRowAncestors === object.ancestors ) )
                });

                if ( searchObject === undefined && searchEmptyObject === undefined) {
                  var newRow = {
                    level: object.level,
                    leaf: true,
                    $$treeLevel: object.$$treeLevel,
                    showChangesFlag: object.showChangesFlag,
                    emptyRowId: object.objectId,
                    emptyRowParentId: object.parentId,
                    emptyRowFlag: true,
                    emptyRowAncestors: object.ancestors,
                    bomParent: object.bomParent
                  };

                  if ((object.mfrPartsList && object.mfrPartsList.length > 1) ||
                  (object.suppPartsList && object.suppPartsList.length > 1)) {
                    newRow.sourcingParent = true;
                  }

                  compareObjectTo.splice(k, 0, newRow);
                } else if ( searchObject ) {

                  var index = _.indexOf(compareObjectTo, searchObject);

                  if (index !== k){
                    compareObjectTo.splice(index, 1);
                    compareObjectTo.splice(k, 0, searchObject);
                  }
                }
              }
            });
          }
        });
      });
      return compareObjects;
    }

    function parseAttrBomHierarchical(CompareObjects){

      angular.forEach(CompareObjects, function(CompareObject){
        angular.forEach(CompareObject, function(object){

          if (object.costDetail && object.costDetail.costSetting === 'A') {
            object.costType = 'Rollup';
          } else {
            object.costType = 'Manual';
          }

          if (!!object.fuseCost) {
            let cost = parseFloat(object.fuseCost);
            let quantity = parseFloat(object.quantity.value);
            object.extendedCost = (!!cost && !!quantity) ? (cost * quantity).toFixed(2) : '0.00';
          }

          object.quantityCompareCode = object.quantity.compareCode;
          object.quantity = _.isNaN(object.quantity.value) ? object.quantity.value : Number(object.quantity.value);

          object.location = parseObjectDeep(object.location);
          object.locationCompareCode = object.location.some(function (obj) {
            return (obj.compareCode === 'NEW' ||
              obj.compareCode === 'DISCARD' ||
              obj.compareCode === 'CHANGE');
          });

          object.notes = parseObjectDeep(object.notes);
          object.notesCompareCode = object.notes.some(function (obj) {
            return (obj.compareCode === 'NEW' ||
              obj.compareCode === 'DISCARD' ||
              obj.compareCode === 'CHANGE');
          });

          object.refDocs = parseObjectDeep(object.referenceDesignator);
          object.refDocsChangeCode = object.refDocs.some(function (obj) {
                                    return (obj.compareCode === 'NEW' ||
                                        obj.compareCode === 'DISCARD' ||
                                        obj.compareCode === 'CHANGE');
                                    });

          object.compareCode = setCompareCode(object);

          let baseObj = CompareObjects[0];

          if(object.compareCode === 'DISCARD') {
            object.location = angular.copy(_.find(baseObj, ['objectId', object.objectId]).location);
            object.notes = angular.copy(_.find(baseObj, ['objectId', object.objectId]).notes);
            object.refDocs = angular.copy(_.find(baseObj, ['objectId', object.objectId]).refDocs);
            _.forEach(object.refDocs, function(ref){
              ref.compareCode = 'DISCARD';
            });
            _.forEach(object.notes, function(ref){
              ref.compareCode = 'DISCARD';
            });
            _.forEach(object.location, function(ref){
              ref.compareCode = 'DISCARD';
            });
          }
        });

      });

      return CompareObjects;
    }

    function parseAttrFromOne (object){
      if (object.hasBOM) {
        object.hasBOM = 'Yes';
      } else {
        object.hasBOM = 'No';
      }

      object.additionalInfoList.forEach(function (additionalInfoItem) {
        object[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });

      if (object.minorRevision) {
        object.revision = object.revision + '.' + object.minorRevision;
      }
      object.associatedCardsList = object.associatedCardList || [];
      object.tags = object.tags.join(', ');
      object.projectNames = object.projectNames.join(', ');
      if (object.level !== 0) {
        object.refDocs = object.referenceDesignator.join(', ');
        object.location = object.bomPackage;
      }

      sourcingUtils.extendSourcingData(object);

      return object;
    }

    function parseObjectDeep(object){
      let array = [];
      if (object.multiValueCompareData.length !== 0) {
        angular.forEach(object.multiValueCompareData, function(value){
          array = array.concat( parseObjectDeep(value) );
        });
      } else {
        if(object.value){
          let obj = {
            value: object.value,
            compareCode: object.compareCode
          };
          array = array.concat(obj);
        }
      }
      return array;
    }

    function setCompareCode(object) {
      if ( object.notesCompareCode === 'BASE' ) {
        return 'BASE';
      }

      let discardFlag = ( object.refDocs.every(obj => obj.compareCode === 'DISCARD') &&
        object.notes.every(obj => obj.compareCode === 'DISCARD') &&
        object.location.every(obj => obj.compareCode === 'DISCARD') &&
        object.quantityCompareCode === 'DISCARD');
      if ( discardFlag ) {
        return 'DISCARD';
      }

      let newFlag = ( object.refDocs.every(obj => obj.compareCode === 'NEW') &&
        object.notes.every(obj => obj.compareCode === 'NEW') &&
        object.location.every(obj => obj.compareCode === 'NEW') &&
        object.quantityCompareCode === 'NEW');
      if ( newFlag ) {
        return 'NEW';
      }

      let changeFlag = ( object.refDocs.some(obj => (obj.compareCode === 'NEW' || obj.compareCode === 'DISCARD' || obj.compareCode === 'CHANGE')) ||
        object.notes.some(obj => (obj.compareCode === 'NEW' || obj.compareCode === 'DISCARD' || obj.compareCode === 'CHANGE')) ||
        object.location.some(obj => (obj.compareCode === 'NEW' || obj.compareCode === 'DISCARD' || obj.compareCode === 'CHANGE')) ||
        (object.quantityCompareCode === 'NEW' || object.quantityCompareCode === 'DISCARD' || object.quantityCompareCode === 'CHANGE'));

      if ( changeFlag ) {
        return 'CHANGE';
      } else {
        return 'SAME';
      }
    }

    function flattenObjects(objects) {
      var newObjects = [];
      angular.forEach(objects, function(object){
        // object = _.sortBy(object, ['objectId']);
        vm.arrOfObjects  = [];
        newObjects.push( flattenBillOfMaterials(object, 0, null) || [] );
      });
      return  newObjects || [];
    }

    function flattenBillOfMaterials(obj, level, parentIndex, parentId, parentCompareCode, parentShowChangesFlag, ancestors) {

      angular.forEach(obj, function(o, idx) {
        o.bomResponse = o.bomResponse ? o.bomResponse : o.fuseObjectBOMResponseList;
        if (o.bomResponse && o.bomResponse.length !== 0) {
          o.level = level;
          o.$$treeLevel = level;
          o.leaf = false;
          o.parentIndex = !parentIndex ? ("" + (idx + 1)) : (parentIndex + "." + (idx + 1));
          o.parentId = parentId;
          o.compareCode = o.compareCode ? o.compareCode : parentCompareCode;
          o.showChangesFlag = o.showChangesFlag ? o.showChangesFlag : parentShowChangesFlag;

          o.bomParent = true;
          if (level > 0) {
            o.bomChildren = true;

            var ancestorsNew = angular.copy(ancestors);
            ancestorsNew[level - 1] = parentId;
            o.ancestors = ancestorsNew;
          }
          if (level === 0) {
            o.ancestors = {};
          }
          parseAttrFromOne(o);

          vm.arrOfObjects.push(o);
          flattenBillOfMaterials(o.bomResponse, o.level + 1, o.parentIndex, o.objectId, o.compareCode, o.showChangesFlag, o.ancestors);

        } else {
          o.level = level;
          o.$$treeLevel = level;
          o.leaf = true;
          o.parentId = parentId;
          o.parentIndex = !parentIndex ? ("" + (idx + 1)) : (parentIndex + "." + (idx + 1));
          o.objectNumber = parentIndex ? ("   " + o.objectNumber) : o.objectNumber;
          o.compareCode = o.compareCode ? o.compareCode : parentCompareCode;
          o.showChangesFlag = o.showChangesFlag ? o.showChangesFlag : parentShowChangesFlag;
          o.bomChildren = true;

          if (level === 0) {
            var ancestorsNew = ancestors ? angular.copy(ancestors) : {};
            o.ancestors = ancestorsNew;
          }

          if (level > 0) {
            var ancestorsNew = angular.copy(ancestors);
            ancestorsNew[level - 1] = parentId;
            o.ancestors = ancestorsNew;
          }

          parseAttrFromOne(o);

          vm.arrOfObjects.push(o);
        }
      });
      return vm.arrOfObjects;
    }

    function setShowChangesFlag() {
      var markedObjects = [];
        angular.forEach(vm.compareObjectsWithData, function (compareObject, i) {

          if (i > 0) {
            angular.forEach(compareObject, function(object){

              object.showChangesFlag = (object.compareCode === 'NEW' || object.compareCode === 'DISCARD' || object.compareCode === 'CHANGE' ||
                object.notes.some(function (obj) {
                  return (obj.compareCode === 'NEW' ||
                    obj.compareCode === 'DISCARD' ||
                    obj.compareCode === 'CHANGE');
                }) ||
                object.refDocs.some(function (obj) {
                  return (obj.compareCode === 'NEW' ||
                    obj.compareCode === 'DISCARD' ||
                    obj.compareCode === 'CHANGE');
                }) ||
                object.location.some(function (obj) {
                  return (obj.compareCode === 'NEW' ||
                    obj.compareCode === 'DISCARD' ||
                    obj.compareCode === 'CHANGE');
                }));

              if ( object.showChangesFlag && (_.indexOf(markedObjects, object.objectNumber) === -1) ) {
                angular.forEach(vm.compareObjectsWithData, function(compObj){
                  let obj = _.find(compObj, ['objectNumber', object.objectNumber]);
                  if (obj) {
                    obj.showChangesFlag = true;
                  }
                });
                markedObjects.push(object.objectNumber);
              }
            });
          }
        });
    }

    function buildHierarchicalTables (alldata, links) {
      var arrTables = [];
      angular.forEach(alldata, function(data, i) {
        var table = {};
        table.name = links[i].name;
        table.id = i;
        table.rightId = alldata.length > i + 1 ? (i + 1) : null;
        table.leftId = i > 0 ? (i - 1) : null;
        table.gridOptions = attributesUtils.getDefaultGridOptionsSourcing();
        table.exporterFieldCallback = function ( grid, row, col, value ) {
          if ( col.name === 'associatedCardsList' ) {
            value = !_.isEmpty(value);
          }
          return value;
        };
        //table.gridOptions.showTreeRowHeader = true;
        //table.gridOptions.showTreeExpandNoChildren = false;
        data.forEach(function(row){
          row.configurationsForDropdown = row.configName;
          row.level++;
          if (row.emptyRowFlag) {
            row.level = undefined;
          }
        });
        table.gridOptions.data = data;

        table.gridOptions.paginationPageSize = 100;
        table.gridOptions.paginationPageSizes = [
          {label: '25', value: 25},
          {label: '50', value: 50},
          {label: '75', value: 75},
          {label: '100', value: 100},
          {label: 'All', value: 3}
        ];
        table.gridOptions.paginationTemplate = 'app/main/apps/objects/module-templates/pagination/part-pagination.html';
        fuseUtils.handleAllOptionForPagination(table.gridOptions, table.gridName);

        table.gridOptions.onRegisterApi = function (gridApi) {

          gridApi.pagination.on.paginationChanged($scope, (pageNumber, rowsNumber) => {
            if(rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100){
              fuseUtils.setIsAllPaginationPageSize(true, table.gridName);
            }else{
              fuseUtils.setIsAllPaginationPageSize(false, table.gridName);
            }
            saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
          });

          table.gridName = _.camelCase(links[i].name);
          table[table.gridName] = {};
          table[table.gridName].commonUiGrid = gridApi;

          table[table.gridName].commonUiGrid.colMovable.on.columnPositionChanged($scope, function () {
            saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
          });

          table[table.gridName].commonUiGrid.colResizable.on.columnSizeChanged($scope, function () {
            vm.heightTopPanelHierarchicalCompare = $('#' + table.id + ' .ui-grid-top-panel').height();
            saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
          });
          table[table.gridName].commonUiGrid.core.on.filterChanged($scope, function () {
            $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
            saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
          });
          table[table.gridName].commonUiGrid.core.on.sortChanged($scope, function () {
            saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
          });
          table[table.gridName].commonUiGrid.pinning.on.columnPinned($scope, function (colDef) {
             if (table.gridOptions.initialized) {
              let gridCol;
              _.forEach(table[table.gridName].commonUiGrid.grid.columns, function (val) {
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
              saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);
            }
          });
          table[table.gridName].commonUiGrid.core.on.scrollBegin($scope, function () {
            $('div[ui-grid-filter]').css({
              'padding-top': 20 + 'px'
            });
            $('.ui-grid-filter-container').css({
              'position': 'absolute',
              'bottom': 0
            });
          });
          table[table.gridName].commonUiGrid.core.on.scrollEnd($scope, function () {
            $('div[ui-grid-filter]').css({
              'padding-top': 20 + 'px'
            });
            $('.ui-grid-filter-container').css({
              'position': 'absolute',
              'bottom': 0
            });
          });
          table[table.gridName].commonUiGrid.treeBase.on.rowExpanded($scope, function(row, evn) {
            countRowsOfTable(table[table.gridName].commonUiGrid, table);
          });
          table[table.gridName].commonUiGrid.treeBase.on.rowCollapsed($scope, function(row, evn) {
            countRowsOfTable(table[table.gridName].commonUiGrid, table);
          });

          // Restore previously saved state.
          restoreState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare, table.gridName);

          table[table.gridName].commonUiGrid.core.on.rowsRendered($scope, function () {
            if ((table.gridOptions.data.length > 0) && !table.gridOptions.initialized) {
              $timeout(function () {
                table.gridOptions.initialized = true;
              });
            }

            showClearButton(table[table.gridName].commonUiGrid);

            vm.heightTopPanelHierarchicalCompare = $('#' + table.id + ' .ui-grid-top-panel').height();
            $('div[ui-grid-filter]').css({
              'padding-top': 20 + 'px'
            });
            $('.ui-grid-filter-container').css({
              'position': 'absolute',
              'bottom': 0
            });
            const gridElemTableOne = document.getElementById('grid-bom-compare-table-0');
            if (gridElemTableOne) {
              gridElemTableOne.style.height = `${document.documentElement.clientHeight - gridElemTableOne.offsetTop - 180}px`;
            }
            const gridElemTableTwo = document.getElementById('grid-bom-compare-table-1');
            if (gridElemTableTwo) {
              gridElemTableTwo.style.height = `${document.documentElement.clientHeight - gridElemTableTwo.offsetTop - 180}px`;
            }
            const gridElemTableThree = document.getElementById('grid-bom-compare-table-2');
            if (gridElemTableThree) {
              gridElemTableThree.style.height = `${document.documentElement.clientHeight - gridElemTableThree.offsetTop - 180}px`;
            }
            const gridElemTableFour = document.getElementById('grid-bom-compare-table-3');
            if (gridElemTableFour) {
              gridElemTableFour.style.height = `${document.documentElement.clientHeight - gridElemTableFour.offsetTop - 180}px`;
            }
            const gridElemTableFive = document.getElementById('grid-bom-compare-table-4');
            if (gridElemTableFive) {
              gridElemTableFive.style.height = `${document.documentElement.clientHeight - gridElemTableFive.offsetTop - 180}px`;
            }
          });

          table[table.gridName].commonUiGrid.core.on.rowsRendered($scope, function() {
            countRowsOfTable(table[table.gridName].commonUiGrid, table);
          });
        };
        table.gridOptions.columnDefs = buildTableColumns(vm.objectPageEnum.hierarchicalCompare);
        arrTables.push(table);
        fuseUtils.handleAllOptionForPagination(table.gridOptions, table.gridName);
      });

      return arrTables;
    }

    function countRowsOfTable(grid, table){
      var countRows = 0;
      angular.forEach(grid.grid.rows, function(row){
        if ( !row.entity.emptyRowFlag && (row.entity.$$treeLevel === 0 || row.treeNode.parentRow.treeNode.state === 'expanded') ){
          countRows = countRows + 1;
        }
      });
      table.gridOptions.rowsCount = countRows;
    }

    function getRowIndex(grid, flag){
      var currentPage = flag === 'first' ? grid.options.paginationCurrentPage : grid.options.paginationCurrentPage + 1;
      var pageSize = grid.options.paginationPageSize;

      var startRow = 0;
      var rows = grid.rows;
      var trueVisibleRows = [];

      angular.forEach(rows, function(row){
        var rowVisibleState = (row.treeLevel === 0 || row.treeNode.parentRow.treeNode.state === 'expanded');
        if (rowVisibleState) {
          trueVisibleRows.push(row);
        }
      });

      var beforeCurrentPageRows = (currentPage - 1) * pageSize;

      angular.forEach(trueVisibleRows, function(row, i){
        if (i < beforeCurrentPageRows && !row.entity.emptyRowFlag) {startRow++}
      });

      startRow = flag === 'first' ? startRow + 1 : startRow;
      return (startRow);
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
      }).then(() => {
        if (objectPageEnum.hierarchicalCompare == flag) {
          angular.forEach(vm.hierarchicalTables, function(table){
            table.gridOptions.initialized = false;
            table.gridOptions.columnDefs = buildTableColumns(flag);
            restoreState(table[table.gridName].commonUiGrid, hierarchicalId, flag, table.gridName);
          });
        } else if (objectPageEnum.flatCompare == flag) {
          vm.flatBaseGridOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.flatBaseUiGrid, flatIdId, flag);
        }
      })
        .then(() => {
          vm.commonTableGridOptions.columnDefs = buildCommonTableColumns();
          vm.commonGridApi.grid.renderContainers.body.visibleRowCache = buildCommonTableData();
        })
    }

    function clearFilters(tables) {

      angular.forEach(tables, function(table){
        var gridApi = table[table.gridName].commonUiGrid;
        gridApi.grid.clearAllFilters();
        gridApi.grid.resetColumnSorting(gridApi.grid.getColumnSorting());
        _.forEach(gridApi.grid.columns, function(column) {
          if ( column.isPinnedLeft() || column.isPinnedRight() ) {
            gridApi.pinning.pinColumn(column, uiGridPinningConstants.container.NONE);
          }
        });
        saveState(table[table.gridName].commonUiGrid, hierarchicalId, objectPageEnum.hierarchicalCompare);
      });
    }

    function buttonForClear(flaghier, gridApi) {
      _.forEach(gridApi.grid.columns, function(column) {
        if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name != 'treeBaseRowHeaderCol' && column.field != 'objectId') {
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

    function showClearButton(gridApi) {
      vm.flagClearButton = false;
      vm.flagClearButton = buttonForClear(vm.flagClearButton, gridApi);
    }

    function restoreState(grid, id, type, tableName) {
      $timeout(function () {
        const state = angular.fromJson($window.localStorage.getItem(fuseUtils.buildAttributeName(tableName, type)));
        if (state) {
          grid.saveState.restore($scope, state);
          const pageSize = state.pagination.paginationPageSize;
          if( pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100){
            fuseUtils.setIsAllPaginationPageSize(true, tableName);
            state.pagination.paginationPageSize = 100;
          }
        }
        fuseUtils.moveColumnToFirstPosition(grid, $scope, 'associatedCardsList');
        fuseUtils.moveColumnToFirstPosition(grid, $scope, 'modification');
      });
    }

    function saveState(grid, id, type, tableName) {
      var state = grid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName(tableName, type), angular.toJson(state));
    }

    function toggleSourcingGridRow(row, grid, children, state, bomFlag) {

      var searchRow = {
        entity: {
          objectId: row.entity.objectId,
          $$treeLevel: row.entity.$$treeLevel,
          parentId: row.entity.parentId,
          ancestors: angular.copy(row.entity.ancestors)
        }
      };

      var searchEmptyRow = {
        entity: {
          $$treeLevel: row.entity.$$treeLevel,
          emptyRowId: row.entity.objectId,
          emptyRowParentId: row.entity.parentId,
          emptyRowAncestors: angular.copy(row.entity.ancestors)
        }
      };

      angular.forEach(vm.hierarchicalTables, function(table){
        var grid = table[table.gridName].commonUiGrid.grid;

        var emptyRow = _.find(grid.rows, function (o) {
          return (o.entity.emptyRowId === searchEmptyRow.entity.emptyRowId &&
          o.entity.$$treeLevel === searchEmptyRow.entity.$$treeLevel &&
          _.isEqual(o.entity.emptyRowAncestors, searchEmptyRow.entity.emptyRowAncestors) &&
          o.entity.emptyRowFlag === true)
        });

        var row = _.find(grid.rows, function(o){
          return (o.entity.objectId === searchRow.entity.objectId &&
                  o.entity.$$treeLevel === searchRow.entity.$$treeLevel &&
                  _.isEqual(o.entity.ancestors, searchRow.entity.ancestors) )
        });

        if (row) {
          sourcingUtils.toggleSourcingGridRow(row, table[table.gridName].commonUiGrid, row.treeNode.children, row.treeNode.state, bomFlag);
          //uiGridTreeBaseService.toggleRowTreeState(grid, row, evt);
        }
        if (emptyRow) {
          sourcingUtils.toggleSourcingGridRow(emptyRow, table[table.gridName].commonUiGrid, emptyRow.treeNode.children, emptyRow.treeNode.state, bomFlag);
          //uiGridTreeBaseService.toggleRowTreeState(grid, emptyRow, evt);
        }
      });
    }

    function toggleHierarchicalAllRow(sourcingFlag) {
      angular.forEach (vm.hierarchicalTables, function(table){

        var grid = table[table.gridName].commonUiGrid;

        if(sourcingFlag){
          sourcingUtils.showAllSourcingRows(grid, !grid.grid.allSourcingCollapsed, true);
        }else{
          sourcingUtils.showAllSourcingRows(grid, !grid.grid.allBomCollapsed, true, true);
        }
      });
    }

    $scope.$on('showChangesBOMCompare', function(event, data) {
      // data - true or false. true-show changes, false-show all
      toggleShowChanges (data);
    });

    $scope.$on('SendUp', function(){
      $state.go('app.objects.compare', {}, {
        notify: false,
        reload: false
      });
    });

    $scope.$on('proxyDetails', function(event, data){
      vm.configurationSettings = data.isConfigEnabled;
    });

    $scope.$emit('getProxy');

    function toggleShowChanges(flag) {
      angular.forEach(vm.hierarchicalTables, function(table){
        var rows = table[table.gridName].commonUiGrid.grid.rows;
        angular.forEach(rows, function(row){
          if (flag && !row.entity.showChangesFlag) {
            if (row.treeNode.children.length > 0) {
                recursiveSetInvisible(row.treeNode.children, table[table.gridName].commonUiGrid);
            }
            table[table.gridName].commonUiGrid.core.setRowInvisible(row);
          } else if (!flag) {
            if (row.treeNode.children.length > 0) {
              recursiveClearInvisible(row.treeNode.children, table[table.gridName].commonUiGrid);
            }
            table[table.gridName].commonUiGrid.core.clearRowInvisible(row);
          }
        });
      });
    }

    function recursiveSetInvisible(children, grid) {
      angular.forEach(children, function (item) {
        grid.core.setRowInvisible(item.row);
        if (item.children.length) {
          recursiveSetInvisible(item.children, grid)
        }
      });
    }

    function recursiveClearInvisible(children, grid) {
      angular.forEach(children, function (item) {
        grid.core.clearRowInvisible(item.row);
        if (item.children.length) {
          recursiveClearInvisible(item.children, grid)
        }
      });
    }

    function addEmptyRowsForSourcing(compareObjects) {

      angular.forEach(compareObjects, function(compareObjectFrom, i){

        if (i > 0) {

          angular.forEach(compareObjectFrom, function (object, k) {
            if (!object.emptyRowFlag  && ((object.mfrList && object.mfrList.mfrObjectId)
              || (object.suppList && object.suppList.suppObjectId)) && object.sourcingChildren) {
              angular.forEach(compareObjects, function (compareObjectTo, l) {

                if (l !== i) {

                  var id = object.mfrObjectId || object.suppObjectId;

                  var searchObject = _.find(compareObjectTo, function(o){
                    return ( (o.mfrObjectId === id || o.suppObjectId === id) &&
                    o.$$treeLevel === object.$$treeLevel &&
                    ( _.isEqual(o.ancestors, object.ancestors) || o.ancestors === object.ancestors ) )
                  });

                  var searchEmptyObject = _.find(compareObjectTo, function(o){
                    return ( o.mfrEmptyRowId === id &&
                    o.$$treeLevel === object.$$treeLevel &&
                    ( _.isEqual(o.emptyRowAncestors, object.ancestors) || o.emptyRowAncestors === object.ancestors ) )
                  });

                  if (searchObject === undefined && searchEmptyObject === undefined) {
                    var newRow = {
                      level: object.level,
                      leaf: object.leaf,
                      $$treeLevel: object.$$treeLevel,
                      showChangesFlag: object.showChangesFlag,
                      mfrEmptyRowId: object.mfrList && object.mfrList.mfrObjectId || object.suppList && object.suppList.suppObjectId,
                      emptyRowFlag: true,
                      emptyRowAncestors: object.ancestors,
                      sourcingChildren: true
                    };
                    compareObjectTo.splice(k, 0, newRow);
                  }
                }
              });
            }
          });
        }
      });
      return compareObjects;
    }

    $scope.$on('downloadPrintBOMCompare', function(event, option, format) {
      vm.commonGridApi.grid.renderContainers.body.visibleRowCache = buildCommonTableData();
      (format === 'xlsx') && downloadXlsxBom();
      (format === 'csv') && downloadCsvBom();
      (format === 'pdf') && exportBomService.downloadPrintPdfBom(option, vm.commonGridApi, vm.commonTableGridOptions, vm.linksInHeader);
    });

    function downloadXlsxBom() {
      vm.commonTableGridOptions.exporterFieldFormatCallback = function(grid, row, gridCol, cellValue) {
        let formatterId = null;
        let arrayFromField = gridCol.field.split('_');
        let rowKeys = Object.keys(row.entity);
        let compareCodeField = _.find(rowKeys, key => key.indexOf(arrayFromField[1]) !== -1 && key.indexOf('compareCode') !== -1);
        if (row.entity[compareCodeField] === 'NEW' && cellValue) {
          formatterId = formatters['new'].id;
        } else if (row.entity[compareCodeField] === 'DISCARD' && cellValue) {
          formatterId = formatters['discard'].id;
        } else if (row.entity[compareCodeField] === 'CHANGE' && cellValue && gridCol.displayName !== 'Part Name') {
          formatterId = formatters['change'].id;
        }
        if (formatterId) {
          return {metadata: {style: formatterId}};
        } else {
          return null;
        }
      };
      vm.commonTableGridOptions.exporterExcelHeader = function (grid, workbook, sheet, docDefinition) {
        let stylesheet = workbook.getStyleSheet();
        let aFormatDefn = {
          "font": { "size": 11, "fontName": "Calibri", "bold": true },
          "alignment": { "wrapText": true }
        };
        let formatterId = stylesheet.createFormat(aFormatDefn);
        let cols = [];
        _.forEach(vm.hierarchicalTables, (table, ind) => {
          let columnsCount = table.gridOptions.columnDefs.length-1;
          sheet.mergeCells(`${toColumnName((ind*columnsCount)+1)}1`, `${toColumnName((ind+1)*columnsCount)}1`);
          cols.push({ value: `${table.name}`, metadata: {style: formatterId.id} });
          for (let i=0; i < columnsCount-1; i++) {
            cols.push({ value: '' });
          }
        });
        sheet.data.push(cols);
      };
      vm.commonGridApi.exporter.excelExport('visible', 'visible');
    }

    function toColumnName(num) {
      for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
      }
      return ret;
    }

    function downloadCsvBom() {
      vm.commonTableGridOptions.exporterCsvFilename = 'BOM-Compare.csv';
      vm.commonGridApi.exporterSuppressColumns = buildColumnsForCSV();
      vm.commonGridApi.exporter.csvExport('visible', 'visible');
    }

    function buildColumnsForCSV() {
      return vm.commonTableGridOptions.columnDefs.map(function(item, i){
        return item.field
      });
    }

    let formatters = {};

    vm.commonTableGridOptions = {
      exporterFieldCallback: function ( grid, row, col, value ) {
        if ( col.name.indexOf('associatedCardsList') !== -1 ) {
          value = !_.isEmpty(value);
        }
        return value;
      },
      enableColumnReordering: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnResizing: true,
      enableSorting: true,
      enableHiding: false,
      enableCellEdit: false,
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
      exporterSuppressColumns: ['bomId', 'objectId'],
      exporterExcelFilename: 'BOM-Compare.xlsx',
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
        Object.assign(docDefinition.styles , formatters);
        return docDefinition;
      },
      exporterColumnScaleFactor: 7,
      onRegisterApi: function (gridApi) {
        vm.commonGridApi = gridApi;
      }
    };

    function buildCommonTableColumns() {
      const newColumnDefs = [];
      let columnsCountAtAll = 0;
      let newIndex = 0;
      vm.hierarchicalTables.forEach(function (table, indTable, tables) {
        columnsCountAtAll = 0;
        table.gridOptions.columnDefs.forEach(function (column, indColumn, columns) {
          if (column.field !== 'objectId') {
            const newColumn = angular.copy(column);
            newColumn.field = column.field + '_' + _.camelCase(table.name);
            newColumn.name = column.field + '_' + _.camelCase(table.name);
            newColumnDefs.push(newColumn);
            columnsCountAtAll++;
          }
        });
      });
      _.forEach(newColumnDefs, (column, index) => {
          if (column.field.indexOf('modification') !== -1) {
            newColumnDefs.move(index, newIndex*columnsCountAtAll);
            newIndex++;
          }
      });
      return newColumnDefs;
    }

    Array.prototype.move = function(from,to){
      this.splice(to,0,this.splice(from,1)[0]);
      return this;
    };

    function buildCommonTableData() {
      var newData = [];
      var columnList = [];
      var isTableRendered = vm.hierarchicalTables[0][vm.hierarchicalTables[0].gridName] ? true : false;
      var countRows = isTableRendered ? vm.hierarchicalTables[0][vm.hierarchicalTables[0].gridName].commonUiGrid.core.getVisibleRows().length :  vm.hierarchicalTables[0].gridOptions.data.length;

      vm.hierarchicalTables[0].gridOptions.columnDefs.forEach(function (column, indColumn, columns) {
        (column.field !== 'objectId') && (columnList.push(column.field));
      });

      for (var i = 0; i < countRows; i++) {

        var tempRow = vm.hierarchicalTables[0][vm.hierarchicalTables[0].gridName] ? vm.hierarchicalTables[0][vm.hierarchicalTables[0].gridName].commonUiGrid.core.getVisibleRows()[0] : {};
        var newRow = {
          getRowTemplateFn: tempRow.getRowTemplateFn,
          __proto__: tempRow.__proto__,
          grid: tempRow.grid,
          treeNode: tempRow.treeNode,
          visible: tempRow.visible,
          entity: {}
        };

        vm.hierarchicalTables.forEach(function (table, indTable, tables) {
          var dataFromTable = [];
          var visibleData = [];
          if (isTableRendered) {
            visibleData = table[table.gridName].commonUiGrid.core.getVisibleRows();
            columnList.forEach(function (requireField, indReqField, fields) {
              if (visibleData[i]) {
                if ((requireField === 'refDocs' || requireField === 'notes' || requireField === 'location') && visibleData[i].entity[requireField] && visibleData[i].treeLevel === 0 && visibleData[i].entity[requireField].length > 0) {
                  var strValue = '';
                  visibleData[i].entity[requireField].forEach(function(obj, ind, arr){
                    let compareText = '';
                    if (visibleData[i].entity['compareCode'] === 'CHANGE') {
                      if (obj.compareCode === 'NEW') {
                        compareText = 'Added: ';
                      } else if (obj.compareCode === 'DISCARD') {
                        compareText = 'Deleted: '
                      } else if (obj.compareCode === 'CHANGE') {
                        compareText = 'Modified: '
                      }
                      strValue = (visibleData[i].entity[requireField].length - 1 === ind) ? strValue + compareText + obj.value : strValue + compareText + obj.value + ',\n';
                    } else {
                      strValue = (visibleData[i].entity[requireField].length - 1 === ind) ? strValue + obj.value : strValue + obj.value + ', ';
                    }
                  });
                  newRow.entity[requireField + '_' + _.camelCase(table.name)] = strValue ? strValue : '';
                } else if (requireField === 'quantity' && visibleData[i].entity[requireField] && visibleData[i].entity['compareCode'] === 'CHANGE' && visibleData[i].treeLevel === 0) {
                  let quantityCompareText = '';
                  if (visibleData[i].entity.quantityCompareCode === 'NEW') {
                    quantityCompareText = 'Added: ';
                  } else if (visibleData[i].entity.quantityCompareCode === 'DISCARD') {
                    quantityCompareText = 'Deleted: '
                  } else if (visibleData[i].entity.quantityCompareCode === 'CHANGE') {
                    quantityCompareText = 'Modified: '
                  }
                  newRow.entity[requireField + '_' + _.camelCase(table.name)] = `${quantityCompareText} ${visibleData[i].entity[requireField]}`;
                } else if (requireField === 'objectNumber' && visibleData[i].entity[requireField]) {
                  newRow.entity[requireField + '_' + _.camelCase(table.name)] = visibleData[i].entity[requireField].trim();
                } else {
                  if (Array.isArray(visibleData[i].entity[requireField])) {
                    newRow.entity[requireField + '_' + _.camelCase(table.name)] = visibleData[i].entity[requireField].length > 0 ? visibleData[i].entity[requireField] : '';
                  } else {
                    newRow.entity[requireField + '_' + _.camelCase(table.name)] = visibleData[i].entity[requireField];
                  }

                }
                newRow.entity['compareCode_' + _.camelCase(table.name)] = visibleData[i].entity.compareCode;
                newRow.entity['location_CompareCode_' + _.camelCase(table.name)] = visibleData[i].entity.locationCompareCode;
                newRow.entity['notes_CompareCode_' + _.camelCase(table.name)] = visibleData[i].entity.notesCompareCode;
                newRow.entity['quantity_CompareCode_' + _.camelCase(table.name)] = visibleData[i].entity.quantityCompareCode;
              }
            });
          } else {
            dataFromTable = table.gridOptions.data;
            columnList.forEach(function (requireField, indReqField, fields) {
              if (dataFromTable[i]) {
                if ((requireField === 'refDocs' || requireField === 'notes' || requireField === 'location') && dataFromTable[i][requireField] && dataFromTable[i][requireField].length > 0) {
                  newRow[requireField + '_' + _.camelCase(table.name)] = dataFromTable[i][requireField][0].value ? dataFromTable[i][requireField][0].value : '';
                } else {
                  newRow[requireField + '_' + _.camelCase(table.name)] = dataFromTable[i][requireField] ? (dataFromTable[i][requireField].length > 0 ? dataFromTable[i][requireField] : '') : '';
                }
                newRow['compareCode_' + _.camelCase(table.name)] = dataFromTable[i].compareCode;
              }
            });
          }
        });
        newData.push(newRow);
      }
      return newData;
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

  } })();
