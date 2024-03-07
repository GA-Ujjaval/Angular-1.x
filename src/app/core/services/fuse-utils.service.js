(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('fuseUtils', fuseUtils);

  /** @ngInject */
  function fuseUtils(AuthService, uiGridPinningConstants, uiGridExporterService, uiGridConstants, gridUtil,
                     uiGridExporterConstants, objectPageEnum, $timeout) {


    var service = {
      defaultUiGridAttributes: defaultUiGridAttributes,
      parseAttributes: parseAttributes,
      findAccessRights: findAccessRights,
      searchByFreeText: searchByFreeText,
      buildAttributeName: buildAttributeName,
      getTimeZone: getTimeZone,
      clearFilters: clearFilters,
      buttonForClear: buttonForClear,
      downloadTable: downloadTable,
      autoAdjustHeight: autoAdjustHeight,
      sortCost: sortCost,
      sortingPartNumber: sortingPartNumber,
      moveAttachmentsColumn: moveAttachmentsColumn,
      isMultipleSupp: isMultipleSupp,
      moveColumnToFirstPosition: moveColumnToFirstPosition,
      setProperHeaderViewportHeight: setProperHeaderViewportHeight,
      getCommonHeaderTemplate: getCommonHeaderTemplate,
      handleAllOptionForPagination: handleAllOptionForPagination,
      setIsAllPaginationPageSize: setIsAllPaginationPageSize,
      arrangeColumns: arrangeColumns,
      getFilledArr: getFilledArr,
      isChangeLogo: false,
      isNumber,
      alphanumericSort,
      sortLeadTime,
      sortWithNegative,
      capitalizeFirstLetter,
      isFuseAdmin,
      downloadAllCsv,
      downloadAllPdf
    };


    //////////

    function isNumber(value) {
      return !isNaN(value);
    }

    function autoAdjustHeight(gridApi) {
      var grid = gridApi.grid;

      // Set the grid's height ourselves in the case that its height would be unusably small
      // Figure out the new height
      var contentHeight = grid.options.minRowsToShow * grid.options.rowHeight;
      var headerHeight = grid.options.showHeader ? grid.options.headerRowHeight : 0;
      var footerHeight = grid.calcFooterHeight();
      var scrollbarHeight = 0;
      if (grid.options.enableHorizontalScrollbar === uiGridConstants.scrollbars.ALWAYS) {
        scrollbarHeight = gridUtil.getScrollbarWidth();
      }
      var maxNumberOfFilters = 0;
      // Calculates the maximum number of filters in the columns
      angular.forEach(grid.options.columnDefs, function (col) {
        if (col.hasOwnProperty('filter')) {
          if (maxNumberOfFilters < 1) {
            maxNumberOfFilters = 1;
          }
        }
        else if (col.hasOwnProperty('filters')) {
          if (maxNumberOfFilters < col.filters.length) {
            maxNumberOfFilters = col.filters.length;
          }
        }
      });
      if (grid.options.enableFiltering) {
        var allColumnsHaveFilteringTurnedOff = grid.options.columnDefs.every(function (col) {
          return col.enableFiltering === false;
        });

        if (!allColumnsHaveFilteringTurnedOff) {
          maxNumberOfFilters++;
        }
      }
      var filterHeight = maxNumberOfFilters * headerHeight;
      var newHeight = headerHeight + contentHeight + footerHeight + scrollbarHeight + filterHeight;
      var $elm = $(grid.element);
      $elm.css('height', newHeight + 'px');
      grid.gridHeight = gridUtil.elementHeight($elm);
    }

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
        // to send not the (i.e. EEDD), but just UTC+X
        // timezone = timezonenames[offset];
        timezone = offset;
      }
      return timezone;
    }

    /**
     * build attribute name
     * @param attr
     * @param to
     * @returns {*}
     */
    function buildAttributeName(attr, to) {
      var sessionData = AuthService.getSessionData('customerData');
      sessionData = (sessionData || {});
      return attr + "_" + (to || '') + ((to || '') ? '_' : '') + sessionData.userId;
    }

    /**
     * Read default attributes
     * @returns
     * {{
     *  resizable: boolean,
     *  cellTemplate: string,
     *  field: string,
     *  displayName: string,
     *  visible: boolean,
     *  enableColumnMenu: boolean,
     *  enableHiding: boolean,
     *  width: number
     *  }}
     */
    function defaultUiGridAttributes() {
      return {
        resizable: true,
        cellTemplate: '',
        field: '',
        displayName: '',
        visible: true,
        enableColumnMenu: true,
        enableHiding: false,
        width: 150
      };
    }

    /**
     * Parse Attributes
     * @param o
     * @param addtionalAttrs
     */
    function parseAttributes(o, addtionalAttrs) {
      var cloneObject = angular.copy(defaultUiGridAttributes());
      addtionalAttrs = addtionalAttrs || false;
      if (addtionalAttrs) {
        cloneObject.field = o.name;
        cloneObject.displayName = o.attribute;
        cloneObject.cellTemplate = "<div class='ui-grid-text-overflow'>{{(row.entity['" + o.name + "']||'') ? row.entity['" + o.name + "']:''}}</div>";
      } else {
        cloneObject.field = o.value;
        cloneObject.displayName = o.name;
        if (o.value === 'objectNumber') {
          cloneObject.sortingAlgorithm = sortingPartNumber;
          cloneObject.cellTemplate = 'app/main/apps/objects/module-templates/cell/object-number-cell.html';
        }
        if (o.value === 'refDocs') {
          cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/ref-docs.html';
        }
        if (o.value === 'uniqueIdentity') {
          cloneObject.cellTemplate = '<div>{{ row.entity.uniqueIdentity}} </div>';
          cloneObject.enableSorting = false;
        }
        if (o.value === 'parentIndex') {
          cloneObject.enableSorting = false;
          cloneObject.enableFiltering = false;
        }
        if (o.value === 'fuseCost') {
          cloneObject.type = 'numberStr';
        }
        if (o.value === 'website') {
          cloneObject.cellTemplate = 'app/main/apps/objects/module-templates/cell/website-cell.html';
        }
        if (o.value == 'hasAttachments') {
          cloneObject.displayName = ' ';
          cloneObject.enableSorting = true;
          cloneObject.enableFiltering = false;
          cloneObject.cellTemplate = 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/attachments-cell.html';
        }
      }

      angular.isDefined(o.defaultValue) && (cloneObject.defaultValue = o.defaultValue);
      angular.isDefined(o.tooltipText) && (cloneObject.tooltipText = o.tooltipText);
      angular.isDefined(o.tooltipDirection) && (cloneObject.tooltipDirection = o.tooltipDirection);
      return cloneObject;
    }

    /**
     * find access rights for currently logged in users
     * @returns {boolean}
     */
    function findAccessRights() {
      var sessionData = AuthService.getSessionData('customerData');
      sessionData = (sessionData || {});

      return ((sessionData.userRoleSet || []).indexOf('read_only') > -1);
    }

    function isFuseAdmin() {
      var sessionData = AuthService.getSessionData('customerData');
      sessionData = (sessionData || {});

      return ((sessionData.userRoleSet || []).indexOf('fuse_admin') > -1);
    }

    /**
     * search by free text
     * @param event - this object will be associated for current object
     * @param cb - callback for the object.
     */
    function searchByFreeText(event, cb) {
      if (event.keyCode === 13 && angular.element(event.target).val()) {
        event.stopPropagation();
        angular.isFunction(cb) && (cb());
      }
    }

    /**
     * clear grid instances
     * @param gridInstance
     * @param callback
     * @param exceptionFields
     */
    function clearFilters(gridInstance, exceptionFields, callback) {
      gridInstance.grid.clearAllFilters();
      gridInstance.grid.resetColumnSorting(gridInstance.grid.getColumnSorting());
      _.forEach(gridInstance.grid.columns, function (column) {
        if ((column.isPinnedLeft() || column.isPinnedRight()) && (!(exceptionFields || []).indexOf(column.field) > -1)) {
          gridInstance.pinning.pinColumn(column, uiGridPinningConstants.container.NONE);
        }
      });

      if (angular.isFunction(callback)) {
        callback(gridInstance);
      }

    }

    function buttonForClear(gridInstance, flag) {

      _.forEach(gridInstance.grid.columns, function (column) {

        if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name !== 'treeBaseRowHeaderCol' && column.name !== 'selectionRowHeaderCol' && column.field !== 'objectId') {
          flag = true;
        }

        if (column.filters[0].term) {
          flag = true;
        }

      });

      if (gridInstance.grid.getColumnSorting().length !== 0) {
        flag = true;
      }

      return flag;
    }

    function getData(grid) {
      let rows = grid.getVisibleRows();
      let leftColumns = grid.renderContainers.left ? grid.renderContainers.left.visibleColumnCache.filter( function( column ){ return column.visible; } ) : [];
      let bodyColumns = grid.renderContainers.body ? grid.renderContainers.body.visibleColumnCache.filter( function( column ){ return column.visible; } ) : [];
      let rightColumns = grid.renderContainers.right ? grid.renderContainers.right.visibleColumnCache.filter( function( column ){ return column.visible; } ) : [];
      let columns = leftColumns.concat(bodyColumns,rightColumns);
      return _.map(rows, row => {
        if (row.exporterEnableExporting !== false) {
          return _.map( columns,  gridCol => {
            if ((gridCol.visible) && gridCol.colDef.exporterSuppressExport !== true &&
              grid.options.exporterSuppressColumns.indexOf( gridCol.name ) === -1 ){
              let cellValue = grid.getCellValue( row, gridCol );
              let extractedField = { value: grid.options.exporterFieldCallback( grid, row, gridCol, cellValue ) };
              if ( gridCol.colDef.exporterPdfAlign ) {
                extractedField.alignment = gridCol.colDef.exporterPdfAlign;
              }
              return extractedField;
            }
          }).filter(value => value !== undefined);
        }
      }).filter(value => value !== undefined);
    }

    function downloadAllCsv(gridApi) {
      const copyGrid = _.cloneDeep(gridApi);
      copyGrid.grid.rows = copyGrid.grid.rows.filter(row => {
        return row.entity.hasOwnProperty('objectId');
      });
      $timeout(() => {
        let exportColumnHeaders = copyGrid.grid.options.showHeader ? uiGridExporterService.getColumnHeaders(copyGrid.grid, uiGridExporterConstants.VISIBLE) : [];
        let exportData = getData(gridApi.grid);
        let csvContent = uiGridExporterService.formatAsCsv(exportColumnHeaders, exportData, copyGrid.grid.options.exporterCsvColumnSeparator);
        uiGridExporterService.downloadFile (copyGrid.grid.options.exporterCsvFilename, csvContent, copyGrid.grid.options.exporterCsvColumnSeparator, copyGrid.grid.options.exporterOlderExcelCompatibility, copyGrid.grid.options.exporterIsExcelCompatible);
      }, 100);
    }

    function downloadAllPdf(gridApi, gridOptions) {
      const copyGrid = _.cloneDeep(gridApi);
      copyGrid.grid.rows = copyGrid.grid.rows.filter(row => {
        return row.entity.hasOwnProperty('objectId');
      });
      $timeout(() => {
        let exportColumnHeaders = copyGrid.grid.options.showHeader ? uiGridExporterService.getColumnHeaders(copyGrid.grid, uiGridExporterConstants.VISIBLE) : [];
        let exportData = getData(gridApi.grid);
        let docDefinition = uiGridExporterService.prepareAsPdf(copyGrid.grid, exportColumnHeaders, exportData);
        docDefinition.pageMargins = [0, 40, 0, 40];
        docDefinition.content[0].table.widths = _.map(docDefinition.content[0].table.widths, function (column) {
          return 100 / docDefinition.content[0].table.widths.length + '%';
        });
        if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
          uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
        } else {
          pdfMake.createPdf(docDefinition).download();
        }
      }, 100);
    }

    function downloadTable(flag, option, gridApi, gridOptions) {
      if (flag === 'csv') {
        gridApi.exporter.csvExport('visible', 'visible');
      } else {
        let exportColumnHeaders = uiGridExporterService.getColumnHeaders(gridApi, uiGridExporterConstants.VISIBLE);
        let exportData = getData(gridApi);
        let docDefinition = uiGridExporterService.prepareAsPdf(gridApi, exportColumnHeaders, exportData);
        docDefinition.pageMargins = [0, 40, 0, 40];
        docDefinition.content[0].table.widths = _.map(docDefinition.content[0].table.widths, function (column) {
          return 100 / docDefinition.content[0].table.widths.length + '%';
        });
        if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
          uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
        } else {
          if (option === 'print') {
            pdfMake.createPdf(docDefinition).print();
          } else {
            pdfMake.createPdf(docDefinition).download();
          }
        }
      }
    }

    /**
     * sorting of cost which is string in table with value of currency
     * @param currency - this is current currency
     * @param a - value of cell
     * @param b - value of cell
     */
    function sortCost(currency, a, b) {
      if (!a) {
        return -1;
      }
      if (!b) {
        return 1;
      }

      var aParse = isNaN(a) ? parseFloat((a.replace(',', '')).split(currency).join("")) : a;
      var bParse = isNaN(b) ? parseFloat((b.replace(',', '')).split(currency).join("")) : b;

      if (aParse === '') {
        return -1;
      }
      if (bParse === '') {
        return 1;
      }

      if (aParse == bParse) {
        return 0;
      }
      if (aParse > bParse) {
        return 1;
      } else {
        return -1;
      }
    }

    function sortLeadTime(a = '', b = '') {
      let ax = [], bx = [];
        a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
        b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

      while(ax.length && bx.length) {
        let an = ax.shift();
        let bn = bx.shift();
        let nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
      }

      return ax.length - bx.length;
    }

    function sortingPartNumber(a, b, rowA, rowB, direction) {

      var aIsNumber = !a.match(/[^0-9]/g);
      var bIsNumber = !b.match(/[^0-9]/g);

      //sequential chechup of value
      if (aIsNumber && bIsNumber) {
        return (Number(a) > Number(b) ? 1 :
          Number(a) < Number(b) ? (-1) : 0);
      }

      return (a > b ? 1 :
        a < b ? -1 : 0);
    }

    function isMultipleSupp(tableApi, tableOptions) {
      return ((tableOptions.totalParentItems !== tableOptions.data.length) && (tableApi.getLastRowIndex() + 1) === tableOptions.totalItems);
    }

    function moveAttachmentsColumn(tableUiGrid, selfScope, revisionFlag) {
      var state = tableUiGrid.saveState.save();
      var attach = _.find(state.columns, {name: 'hasAttachments'});
      if (attach) {
        var ind = _.indexOf(state.columns, attach);
        state.columns.splice(ind, 1);
        if (revisionFlag) {
          state.columns.unshift(attach);
          tableUiGrid.saveState.restore(selfScope, state);
        } else {
          state.columns.splice(1, 0, attach);
          tableUiGrid.saveState.restore(selfScope, state);
        }
      }
    }

    /**
     * Sets the proper height for the grid after the content loaded
     * @param columnDefs - gridOptions.data objects
     * @param index - this index of the ui-grid viewport to be changed
     * @param description - {string} which contain description of the environment from which
     *                       the function is called. It is needed to handle situations when we
     *                       have ui grid with not exactly 2 viewports. (less or more)
     * @param gridApi - {object} - grid api of the grid we want to process.
     */
    function setProperHeaderViewportHeight(columnDefs, index, description, gridApi) {
      const viewports = $('.ui-grid-header-viewport');
      if (viewports.length === 0 || !gridApi) {
        return;
      }

      if (description === 'documentsRevisions' || description === 'documentsConfigurations') {
        index--;
      }

      if (description === 'searchSourcingTable') {
        setViewportHeight(viewports[index], null, gridApi, columnDefs);
      } else {
        setViewportHeight(viewports[index + 1], viewports[index], gridApi, columnDefs);
      }
    }

    /**
     * checks if the grid header rendered completely (including filter inputs) and only then is executed
     * @param viewportWithContent - the viewport of the table. This viewport's height should be changed. The viewport contain
     * tables data. (dont include first one or two columns, depends on the table)
     * @param previousViewport - the viewport just before the vieport with data. It contain pencil, checkboxes and such a stuff
     * @param gridApi - the gridApi of the grid, for which we set proper height
     * @param columnDefs - column defs of the table
     */
    function setViewportHeight(viewportWithContent, previousViewport, gridApi, columnDefs) {
      if (!viewportWithContent && !previousViewport) {
        return;
      }

      const firstLineHeight = 70;
      const oneLineHeight = 30;
      const widthCoefficient = 11; // width for one literal
      const maxHeight = 150;

      // This hack is needed in order to let ui grid to calculate the width of columns after the page is loaded
      setTimeout(() => {
        const columns = getTableState(gridApi, columnDefs);
        const requestedHeight = columns.reduce((accumulator, column) => {
          const widthForAllName = widthCoefficient * column.displayName.length || 0;
          const height = Math.ceil(widthForAllName / column.width) * oneLineHeight;
          return Math.min(Math.max(accumulator, height, firstLineHeight), maxHeight);
        }, 0);
        setViewportHeightValue(viewportWithContent, requestedHeight, gridApi);
        if (previousViewport) {
          setViewportHeightValue(previousViewport, requestedHeight, gridApi);
        }
      }, 10);
    }

    function getTableState(gridApi, columnDefs) {
      const columnsState = gridApi.saveState.save().columns;
      columnsState.forEach(function (colState) {
        const colDef = _.find(columnDefs, {name: colState.name});
        colState.displayName = colDef ? colDef.displayName : '';
      });
      return columnsState;
    }

    /**
     * @param viewport - html object, for which we set a height
     * @param height - {number} - the height which should be set to the viewport
     */
    function setViewportHeightValue(viewport, height, gridApi) {
      if (!viewport)
        return;

      viewport.style.height = height + 'px';
      viewport.childNodes[0].style.height = height + 'px';
      if (gridApi) {
        gridApi.core.handleWindowResize()
          .then(null, null);
      }
    }

    /**
     * Template for the ui grid header, which contain also a tooltip
     * with all the built-in functionality such as filtering and sorting
     * @returns {string} HTML
     */
    function getCommonHeaderTemplate(setting) {
      setting = setting || {
        style: '',
        text: '',
        isTooltipNeeded: true
      };
      return '<mf-common-header-template ' +
        'col="col" grid="grid" i18n="i18n" ' +
        'toggle-menu="toggleMenu" is-last-col="isLastCol" ' +
        'is-sort-priority-visible="isSortPriorityVisible" ' +
        'asc="asc" desc="desc" custom-text="\'' + setting.text + '\'" custom-style="\'' + setting.style + '\'"' +
        'is-tooltip-needed="\'' + setting.isTooltipNeeded + '\'">' +
        '</mf-common-header-template>';
    }

    var isAllPaginationPageSize = {};

    /**
     *
     * @param tableOptions - ui grid options object. f.e. vm.partTableOptions
     */
    function changePageSizes(tableOptions) {
      if (_.last(tableOptions.paginationPageSizes).label == 'All') {
        tableOptions.paginationPageSizes.pop();
        tableOptions.paginationPageSizes.push({
          label: 'All',
          value: tableOptions.data.length
        });
      } else {
        tableOptions.paginationPageSizes.push({
          label: 'All',
          value: tableOptions.data.length
        });
      }
    }

    /**
     * Adds and removes 'all' option from pagination dropdown
     * and keeps it consistent with current rows amount
     * @param tableOptions
     * @param tableId - {string} which describes the table.
     */
    function handleAllOptionForPagination(tableOptions, tableId) {
      changePageSizes(tableOptions);
      if (isAllPaginationPageSize[tableId]) {
        tableOptions.paginationPageSize = tableOptions.data.length;
      }
    }

    /**
     * @param val - {boolean}
     * @param tableId - {string} which describes the table.
     */
    function setIsAllPaginationPageSize(val, tableId) {
      isAllPaginationPageSize[tableId] = val;
    }

    /**
     *  Function places mentioned columns in order of `cols` array in the start of the columns array
     * @param tableUiGrid
     * @param selfScope
     * @param cols - [string] - the array of columns to be arranged at the start in needed order
     * @param noImageColumn - {boolean} a flag, wich says if we have the very first column with part icon (like coggs) or not
     */
    function arrangeColumns(tableUiGrid, selfScope, cols, noImageColumn) {
      var start = noImageColumn ? 0 : 1;
      var isStateChanged = false;
      var state = tableUiGrid.saveState.save();
      var columns = state.columns;
      _.forEachRight(cols, function (colVal) {
        var columnIndex = _.findIndex(columns, {name: colVal});
        if (columnIndex !== -1) {
          isStateChanged = true;
          var column = columns[columnIndex];
          columns.splice(columnIndex, 1);
          columns.splice(start, 0, column);
        }
      });

      isStateChanged && tableUiGrid.saveState.restore(selfScope, state);
    }

    /**
     * Moves column of the grid to the first position in the table
     * @param tableUiGrid - {gridApi} the gridapi of the table, where we want to move the column
     * @param selfScope - {object} the scope of the controller, where the grid is located
     * @param columnValue - {string} the ui grid value of the column to be found (example: 'objectId')
     * @param noImageColumn - {boolean} a flag, wich says if we have the very first column with part icon (like coggs) or not
     */
    function moveColumnToFirstPosition(tableUiGrid, selfScope, columnValue, noImageColumn) {
      var start = noImageColumn ? 0 : 1;
      var state = tableUiGrid.saveState.save();
      var column = _.find(state.columns, {name: columnValue});
      if (column) {
        var ind = _.indexOf(state.columns, column);
        state.columns.splice(ind, 1);
        state.columns.splice(start, 0, column);
        tableUiGrid.saveState.restore(selfScope, state);
      }
    }

    function isNumber(string) {
      return !isNaN(string) ? true : '';
    }

    function sortWithNegative(a, b) {
      return !isNaN(a) && !isNaN(b) ? Number(a)-Number(b) : a.localeCompare(b, undefined, { sensitivity: 'base'});
    }

    function alphanumericSort(a, b, rowA, rowB, direction) {
      if (!a) {  // pushing empty rows to the end
        return -1;
      }
      if (!b) {  // pushing empty rows to the end
        return 1;
      }

      var parsedA = getParsedAlphaNumeric(a);
      var parsedB = getParsedAlphaNumeric(b);

      var length = Math.min(parsedA.length, parsedB.length);

      for (var i = 0; i < length; i++) {
        var typeA = getType(parsedA[i]);
        var typeB = getType(parsedB[i]);

        if (typeA !== typeB) {
          return typeA === 'string' ? 1 : -1;
        }
        if (parsedA[i] !== parsedB[i]) {
          return parsedA[i] > parsedB[i] ? 1 : -1;
        }
      }

      return parsedA.length > parsedB.length ? 1 : -1;
    }

    function getParsedAlphaNumeric(string) {
      var buffer = {
        type: getType(string[0]),
        value: string[0]
      };
      var parsedString = [];

      for (var i = 1; i < string.length; i++) {
        var char = string[i];
        if (char === '.' && buffer.type === 'number') {
          buffer.value += char;
          continue;
        }
        var charType = getType(char);
        if (charType === buffer.type) {
          buffer.value += char;
        } else {
          parsedString.push(buffer.value);
          buffer.value = char;
          buffer.type = charType;
        }
      }
      if (buffer.value) {
        parsedString.push(buffer.type === 'number' ? +buffer.value : buffer.value);
      }
      return parsedString;
    }

    function getType(val) {
      return !isNaN(val) ? 'number' : 'string';
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getFilledArr(length, valueToBeCopied) {
      const arr = new Array(length);
      for (let i = 0; i < length; i++) {
        arr[i] = _.cloneDeep(valueToBeCopied);
      }
      return arr;
    }

    return service;

  }

}());
