(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('attachmentsCompareService', attachmentsCompareService);


  /** @ngInject */
  function attachmentsCompareService(objectsCompareService, fuseUtils, attributesUtils) {

    const compare = objectsCompareService;
    const COMPARE_SUFFIX = 'CompareCode';
    /**
     * Gets the array of compared objects to be processed.
     * The data there is in tree structure.
     * @param sourceData [{}{}]
     * @returns {({object}[])[]|*}
     */
    function constructTableData(sourceData) {
      return compare.compareTables({
        tablesData: buildTableData(sourceData),
        codeFieldName: 'nameCompareCode',
        dataFieldName: 'toCompareData',
        compareSuffix: 'CompareCode',
        newValue: 'NEW',
        discard: 'DISCARD',
        change: 'CHANGE',
        changedRowMark: 'isChanged'
      });
    }

    /**
     * Has fuseobjects to be compared in tables.
     * The data for every object is a tree, which is flattened in the function
     * @param sourceData [{}{}]
     * @returns {*}
     */
    function buildTableData(sourceData) {
      return sourceData.map(({attachmentData}) => {
        return compare.getFlatArray({
          hierarchicalArr: _.map(attachmentData, (value) => {
            return value;
          }),
          parentFieldName: 'lol',
          subNodesArrayName: 'multiValueCompareData',
          callBack: (flatRow, hierarchicalRow, getDepthLevel, getRootParent) => {
            const parent = getRootParent(hierarchicalRow);
            if (parent !== hierarchicalRow) {
              parent[hierarchicalRow.toCompareData] = hierarchicalRow.value;
              parent[hierarchicalRow.toCompareData + COMPARE_SUFFIX] = hierarchicalRow.compareCode;
            }
            return parent === hierarchicalRow ? hierarchicalRow : null;
          }
        });
      });
    }

    function getExportData(tables) {
      const baseTableIndex = 0;
      const newData = fuseUtils.getFilledArr(tables[baseTableIndex].options.data.length, {});
      return newData.map((row, i) => {
        return getExportingRow(i, tables);
      });
    }

    function getExportingRow(i, tables) {
      const sameLevelRows = tables.map((table) => {
        const sameLevelRow = _.cloneDeep(table.options.data[i]);
        sameLevelRow.tableId = table.id;
        return sameLevelRow;
      });
      return assignCustom(sameLevelRows, 'tableId');
    }

    function assignCustom(sources, suffixProp) {
      let result = {};
      sources.forEach((row) => {
        angular.forEach(row, (value, key, obj) => {
          const suffix = obj[suffixProp] ? '_' + obj[suffixProp] : '';
          result[key + suffix] = value;
        });
      });
      return result;
    }

    const compareCellTemplate = 'app/main/apps/objects/compare-revisions/tabs/attachment-compare/cell-templates/compare-cell-template.html';
    const attachmentCellTemplate = 'app/main/apps/objects/compare-revisions/tabs/attachment-compare/cell-templates/attachment-link.html';
    const COLUMN_MATCHER = {
      name: {cellTemplate: attachmentCellTemplate},
      type: {cellTemplate: compareCellTemplate},
      uploadDate: {cellTemplate: compareCellTemplate},
      fileSize: {cellTemplate: compareCellTemplate},
      uploadBy: {cellTemplate: compareCellTemplate}
    };

    function buildTableColumns(attributes) {
      return attributes.map(function (attr) {
        return Object.assign(fuseUtils.parseAttributes(attr), COLUMN_MATCHER[attr.value]);
      });
    }

    function getExportColumns(ids) {
      const exportCols = ids.map(function (id) {
        const suffix = id ? '_' + id : '';
        const baseColumns = buildTableColumns(attributesUtils.getAttachmentCompare());
        baseColumns.forEach(function (col) {
          col.field = col.field + suffix;
        });
        return baseColumns;
      });
      return _.flattenDeep(exportCols);
    }

    return {
      constructTableData: constructTableData,
      getExportData: getExportData,
      buildTableColumns: buildTableColumns,
      getExportColumns: getExportColumns
    }

  }
})();
