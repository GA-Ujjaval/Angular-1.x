
(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('exportBomService', objectsCompareService);


  /** @ngInject */
  function objectsCompareService(CustomerService, hostUrlDevelopment, AuthService, fuseUtils, uiGridExporterService,
                                 uiGridExporterConstants) {

    const service = {
      downloadPrintPdfBom
    };

    function downloadPrintPdfBom(option, tableApi, tableOptions, linksInHeader, compareType) {
      var gridApi = tableApi.grid;
      var gridOptions = tableOptions;
      var compareType = compareType || 'BOM';
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
                    text: `\'${compareType} Compare\' Report for ` + linksInHeader[0].partName,
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

        docDefinition.content[0].table.body = setColorForCell(tableBody, gridOptions, gridApi);

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


    function setColorForCell(tableBody, gridOptions, gridApi) {
      var newTableBody = [];

      var columnDefs = gridOptions.columnDefs;

      var visibleRows = gridApi.api.core.getVisibleRows(gridApi.grid);
      var columns = tableBody[0];
      newTableBody[0] = tableBody[0];

      visibleRows.forEach(function (row, indRow, rows){
        var newRow = [];

        columns.forEach(function(colName, ind, columns){
          var cellStyle = {};

          var separatorInd = columnDefs[ind].field.indexOf('_');

          var tableName = columnDefs[ind].field.slice(separatorInd + 1);
          var fieldName = columnDefs[ind].field.slice(0, separatorInd);

          var discardStyle = {
            color: 'red'
          };
          var newStyle = {
            color: 'green'
          };
          var changeStyle = {
            color: '#ff8302'
          };

          if (row.entity[fieldName + '_' + 'CompareCode_' + tableName]) {
            (row.entity[fieldName + '_' + 'CompareCode_' + tableName] === 'CHANGE') && (cellStyle = changeStyle);
            (row.entity[fieldName + '_' + 'CompareCode_' + tableName] === 'NEW') && (cellStyle = newStyle);
            (row.entity[fieldName + '_' + 'CompareCode_' + tableName] === 'DISCARD') && (cellStyle = discardStyle);
          }
          if (row.entity['compareCode_' + tableName] !== 'BASE' && row.entity['compareCode_' + tableName] !== 'SAME') {
            (row.entity['compareCode_' + tableName] === 'CHANGE') && (cellStyle = changeStyle);
            (row.entity['compareCode_' + tableName] === 'NEW') && (cellStyle = newStyle);
            (row.entity['compareCode_' + tableName] === 'DISCARD') && (cellStyle = discardStyle);
          }
          if(row.entity.nameCompareCode){
            const currentTableId = Math.floor(ind / 5);
            const suffix = currentTableId? '_' + currentTableId : '';

            if(row.entity['nameCompareCode' + suffix] === 'CHANGE' && colName.text.indexOf('Name') !== -1){
              cellStyle = changeStyle;
            }
            if(row.entity['nameCompareCode' + suffix] === 'NEW' && colName.text.indexOf('Name') !== -1){
              cellStyle = newStyle;
            }
            if(row.entity['nameCompareCode' + suffix] === 'DISCARD' && colName.text.indexOf('Name') !== -1){
              cellStyle = discardStyle;
            }
          }
          if(row.entity.typeCompareCode){
            const currentTableId = Math.floor(ind / 5);
            const suffix = currentTableId? '_' + currentTableId : '';

            if(row.entity['typeCompareCode' + suffix] === 'CHANGE' && colName.text.indexOf('Type') !== -1){
              cellStyle = changeStyle;
            }
            if(row.entity['typeCompareCode' + suffix] === 'NEW' && colName.text.indexOf('Type') !== -1){
              cellStyle = newStyle;
            }
            if(row.entity['typeCompareCode' + suffix] === 'DISCARD' && colName.text.indexOf('Type') !== -1){
              cellStyle = discardStyle;
            }
          }
          if(row.entity.uploadDateCompareCode){
            const currentTableId = Math.floor(ind / 5);
            const suffix = currentTableId? '_' + currentTableId : '';

            if(row.entity['uploadDateCompareCode' + suffix] === 'CHANGE' && colName.text.indexOf('Upload Date') !== -1){
              cellStyle = changeStyle;
            }
            if(row.entity['uploadDateCompareCode' + suffix] === 'NEW' && colName.text.indexOf('Upload Date') !== -1){
              cellStyle = newStyle;
            }
            if(row.entity['uploadDateCompareCode' + suffix] === 'DISCARD' && colName.text.indexOf('Upload Date') !== -1){
              cellStyle = discardStyle;
            }
          }
          if(row.entity.uploadByCompareCode){
            const currentTableId = Math.floor(ind / 5);
            const suffix = currentTableId? '_' + currentTableId : '';

            if(row.entity['uploadByCompareCode' + suffix] === 'CHANGE' && colName.text.indexOf('Upload By') !== -1){
              cellStyle = changeStyle;
            }
            if(row.entity['uploadByCompareCode' + suffix] === 'NEW' && colName.text.indexOf('Upload By') !== -1){
              cellStyle = newStyle;
            }
            if(row.entity['uploadByCompareCode' + suffix] === 'DISCARD' && colName.text.indexOf('Upload By') !== -1){
              cellStyle = discardStyle;
            }
          }
          if(row.entity.fileSizeCompareCode){
            const currentTableId = Math.floor(ind / 5);
            const suffix = currentTableId? '_' + currentTableId : '';

            if(row.entity['fileSizeCompareCode' + suffix] === 'CHANGE' && colName.text.indexOf('File Size') !== -1){
              cellStyle = changeStyle;
            }
            if(row.entity['fileSizeCompareCode' + suffix] === 'NEW' && colName.text.indexOf('File Size') !== -1){
              cellStyle = newStyle;
            }
            if(row.entity['fileSizeCompareCode' + suffix] === 'DISCARD' && colName.text.indexOf('File Size') !== -1){
              cellStyle = discardStyle;
            }
          }

          var newCell = {
            text: row.entity[columnDefs[ind].field] || ' ',
            style: cellStyle
          };
          newRow.push(newCell)
        });
        newTableBody.push(newRow);
      });

      return newTableBody;
    }

    return service;
  }
})();
