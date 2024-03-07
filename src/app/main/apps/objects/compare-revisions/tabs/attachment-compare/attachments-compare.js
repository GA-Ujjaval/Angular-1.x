(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('AttachmentCompareController', AttachmentCompareController);

  function AttachmentCompareController($cookies, objectsCompareService, attributesUtils, fuseUtils, $scope, $timeout,
                                       attachmentsCompareService, exportBomService, $rootScope) {

    const vm = this;

    vm.openAttachment = openAttachment;

    const compare = objectsCompareService;
    vm.COMPARE_SUFFIX = 'CompareCode';

    $rootScope.$watch('linksInHeader', (linksInHeader) => {
      if (linksInHeader && vm.tables) {
        _.forEach(linksInHeader, (linkInHeader, index) => {
          vm.tables[index].name = linkInHeader.name;
        });
      }
    });

    compare.getDataForComparison({attachmentData: true}, $cookies.get('idsForCompare').split(','))
      .then(function (res) {
        const compareData = res.data.comparisonResponse.attachmentCompare;
        vm.tables = compareData.map(function (table, index) {
          const configMessage = table.configName ? ', Configuration ' + table.configName : '';
          let tableName = $rootScope.linksInHeader.length > 0 ? $rootScope.linksInHeader[index].name : table.objectNumber + configMessage + ', Revision ' + table.revision;
          return new UIGridTable(UIGridTable.id++, tableName);
        });
        vm.generalPartName = compareData[0].objectName;

        let maxRows = 0;

        attachmentsCompareService.constructTableData(compareData).forEach(function (tableData, i) {
          let count = 0;
          const tableOptions = vm.tables[i].options;
          tableOptions.data = setFuseType(tableData);
          tableOptions.data.forEach(row => {
            if (row.type) {
              count++;
            }
          });
          if (count > maxRows) {
            maxRows = count;
          }
          tableOptions.columnDefs = attachmentsCompareService.buildTableColumns(attributesUtils.getAttachmentCompare());
        });

        vm.tables.forEach(table => {
          table.options.data.length = maxRows;
        });

        const ids = vm.tables.map(function (table) {
          return table.id;
        });

        vm.exportingTable.columnDefs = attachmentsCompareService.getExportColumns(ids);
        vm.exportingTable.data = attachmentsCompareService.getExportData(vm.tables);
      });

    const documentTypeMatcher = {
      external_link: 'Link',
      link: 'Document',
    };

    function setFuseType(table) {
      table
        .filter((row) => {
          return row.type;
        })
        .forEach((row) => {
          row.type = documentTypeMatcher[row.type] || 'CAD Files';
        });
      return table;
    }



    UIGridTable.prototype.onApiRegistered = function (gridApi) {
      this.options.api = gridApi;

      $timeout(() => {
        const containerId = 'attachment-compare';
        compare.linkScrollingTables(containerId)
      });
    };

    function UIGridTable(id, name) {
      this.id = id;
      this.name = name;
      this.options = {
        onRegisterApi: (tableApi) => {
          this.onApiRegistered(tableApi);
        }
      }
    }

    UIGridTable.id = 0;

    function openAttachment(row) {
      const destination = row.type === 'document' ? 'objects/documents/' + row.name : row.value;
      const newWindow = window.open(destination, '_blank');
      newWindow.opener = null;
    }

    $scope.$on('exportAttachmentsCompare', function (event, optionFlag, formatFlag) {
      exportMatcher[formatFlag](optionFlag);
    });

    $scope.$on('showChangesAttachmentsCompare', function (event, doShowOnlyChanged) {
      vm.tables.forEach(function (table) {
        toggleShowChanges(doShowOnlyChanged, table.options.api);
      });
      toggleShowChanges(doShowOnlyChanged, vm.exportingTableApi);
    });

    function toggleShowChanges(doSchowOnlyChanged, tableApi) {
      const action = doSchowOnlyChanged ? 'setRowInvisible' : 'clearRowInvisible';
      tableApi.grid.rows
        .filter(function (row) {
          return !row.entity.isChanged
        })
        .forEach(function (row) {
          tableApi.core[action](row);
        })
    }

    const exportMatcher = {
      csv() {
        vm.exportingTableApi.exporter.csvExport('visible', 'visible');
      },
      xlsx() {
        vm.exportingTable.exporterFieldFormatCallback = function(grid, row, gridCol, cellValue) {
          let formatterId = null;
          let rowKeys = Object.keys(row.entity);
          let arrayOfField = gridCol.field.split('_');
          let compareCodeField = _.find(rowKeys, key =>  key.indexOf(arrayOfField[0]) !== -1 && key.indexOf(arrayOfField[1]) !== -1 && key.indexOf('Code') !== -1);
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
        vm.exportingTableApi.exporter.excelExport('visible', 'visible');
      },
      pdf(option) {
        exportBomService.downloadPrintPdfBom(option, vm.exportingTableApi, vm.exportingTable,
          [{partName: vm.generalPartName}], 'Attachments');
      }
    };

    let formatters = {};

    vm.exportingTable = {
      data: [],
      columnDefs: [],
      exporterCsvFilename: 'Attachments-Compare.csv',
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      exporterPdfTableStyle: {
        margin: [15, 0, 15, 0]
      },
      exporterExcelFilename: 'Attachments-Compare.xlsx',
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
      exporterSuppressColumns: ['bomId', 'objectId'],
      onRegisterApi: (gridApi) => {
        vm.exportingTableApi = gridApi;
      }
    }
  }
})();
