(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('flatViewService', flatViewService);

  function flatViewService(flatRowsIterationService, FlatRowQuantityPlugin) {
    const service = {
      getFlatViewRows,
      iterateOverFlatRows
    };

    /**
     * Iterates over flat rows in hierarchical array (array from hierarchical tab)
     * @param arr - arr same as we have in hierarchical tab
     * @param cb  - callback to be invoked for every flat row with parameters (row) - row object
     * @returns {*}
     */
    function iterateOverFlatRows(arr, cb) {
      return flatRowsIterationService.getIterator().iterateOverFlatRows(arr, cb);
    }

    /**
     * Returns array to be shown in flat view bom tab
     * @param options - with properties:
     *   - targetQuantity {number} - the target quantity chosen by user
     *   - arr {array} - hierarchical arr save as we have in hierarchical bom tab
     * @returns {*}
     */
    function getFlatViewRows(options) {
      const {targetQuantity} = options;
      const flatRows = getFlatRowsWithSourcers(options);
      flatRows
        .filter((row) => {
          return row.hasOwnProperty('uniqueIdentity');
        })
        .forEach(handleRow.bind(this, targetQuantity));
      return flatRows;
    }

    function handleRow(targetQuantity, row, index) {
      const defaultVal = 0;
      row.requiredQty = isNaN(row.quantity) ? defaultVal : targetQuantity * row.quantity;
      row.uniqueIdentity = ++index;
      row.shortage = (row.qtyTotal || defaultVal) - row.requiredQty;
      row.totalCost = row.requiredQty * row.fuseCost;
      row.configurationsForDropdown = row.configName;
    }

    function getFlatRowsWithSourcers(options) {
      const {arr = []} = options;
      const flatRows = getUniqueFlatRows(options);
      const notFlatResultArr = flatRows.map((flatRow) => {
        return [flatRow].concat(getSourcers(flatRow.objectId, arr));
      });
      return _.flatten(notFlatResultArr);
    }

    function getSourcers(rowObjectId, hierarchicalArr) {
      return _.uniqWith(hierarchicalArr.filter((row) => {
        return row.parentObjectId === rowObjectId;
      }), uniqSourcerComparator)
    }

    function uniqSourcerComparator(arrVal, othVal) {
      return arrVal.mfrObjectId === othVal.mfrObjectId && arrVal.suppObjectId === othVal.suppObjectId;
    }

    function getUniqueFlatRows(options) {
      const allFlatRows = getRawFlatRows(options);
      const uniqueRows = [];
      allFlatRows.forEach((row) => {
        const uniqueRow = _.find(uniqueRows, {objectId: row.objectId, costType: row.costType});
        if (uniqueRow) {
          uniqueRow.quantity = sumQuantities(uniqueRow.quantity, row.quantity);
          uniqueRow.refDocs = concatRefDes(uniqueRow.refDocs, row.refDocs);
        } else {
          uniqueRows.push(row);
        }
      });
      return uniqueRows;
    }

    function concatRefDes(firstRefDes, secondRefDes) {
      const firstMap = firstRefDes ? firstRefDes.split(',').map((val) => val.trim()) : [];
      const secondMap = secondRefDes ? secondRefDes.split(',').map((val) => val.trim()) : [];
      return _.uniq(firstMap.concat(secondMap)).join(', ');
    }

    function sumQuantities(a, b) {
      a = isNaN(a) ? 0 : a;
      b = isNaN(b) ? 0 : b;
      return +a + +b;
    }

    /**
     * Returns all flat rows from hierarchical array with possible duplications
     * @param options
     * @returns {*}
     */
    function getRawFlatRows(options) {
      return flatRowsIterationService.getIterator([new FlatRowQuantityPlugin()]).iterateOverFlatRows(options.arr, applyPlugins);
    }

    function applyPlugins(row, flatRowQuantity) {
      const flatRow = _.cloneDeep(row);
      flatRow.quantity = flatRowQuantity.getQuantity(row.quantity);
      delete flatRow.$$hashKey;
      flatRow.$$treeLevel = 0;
      return flatRow;
    }

    return service;
  }
})();
