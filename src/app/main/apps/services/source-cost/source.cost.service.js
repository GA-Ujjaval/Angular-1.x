(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('sourceCostService', sourceCostService);


  /** @ngInject */
  function sourceCostService(fuseType, SourcerCost, partCostService, flatViewService) {

    const tableRowTooltip = 'Erroneous cost because there is no exchange rate defined for the selected Supplier Part / Manufacturer Part cost.';
    const unitCostTooltip  = 'Erroneous cost because there is no exchange rate defined for one or more selected Supplier Part / Manufacturer Part cost.';
    const paidActionSuggestion = 'Fix this by defining exchange rate for the selected currency, in the Settings';
    const unpaidActionSuggestion = `‘Exchange rate functionality’ is not available with your current license. Upgrade to the next tier to add it.`;

    let sourceCostSetting = null;

    function getActionSuggestion(){
      return sourceCostSetting ? paidActionSuggestion : unpaidActionSuggestion;
    }

    /**
     * Sets the currenct state of setting for the user
     * @param string - the setting value to be set
     */
    function setSetting(string) {
      sourceCostSetting = string === 'true';
    }

    /**
     * To get tooltip for row in case, when exchange rate is not provided
     * for a chosen cost type in the bom
     * @returns {*[]}
     */
    function getRowTooltipText() {
      return [tableRowTooltip, getActionSuggestion()]
    }

    /**
     * To get tooltip for unit cost in case, when exchange rate is not provided
     * for any cost type in the bom
     * @returns {*[]}
     */
    function getUnitCostTooltipText() {
      return [unitCostTooltip, getActionSuggestion()]
    }

    /**
     * To get the currenct state of the feature (enabled / disabled)
     * @returns {*}
     */
    function getFeatureState (){
      return sourceCostSetting;
    }

    /**
     * Public function. Used to get the list of all sourcer without duplications.
     * E.x. we have two costs from supplier 'Kemet', then only one item in the list will be related to 'Kemet'
     * @param arr [{}] - array of objects to retrieve data from
     * @param propertyToTrack {string} - property to track identity by
     * @param type {string} - the type of sourcer (manufacturer or supplier)
     * @returns {any[]}
     */
    function getPackedSourcers({arr, propertyToTrack, type}) {
      const sourcerName = 'sourcerName';
      const sourcers = getUniqueSourcersCosts(arr, propertyToTrack, type);
      const uniqueSourcers = _.uniqBy(sourcers, sourcerName);
      return uniqueSourcers.map((sourcerCost) => {
        sourcerCost.id = sourcerCost.sourcerId;
        sourcerCost.costType = sourcerCost[sourcerName];
        return sourcerCost;
      });
    }

    /**
     * Used to get the list of unique sourcers.
     * @param rows [{object}] - the array to retrieve data from
     * @param propertyToTrack {string} - the property to track identity by
     * @param type {string} - the type of sourcer (manufacturer or supplier)
     * @returns {Array}
     */
    function getUniqueSourcersCosts(rows, propertyToTrack, type) {
      return _.uniqBy(getAllCosts(rows, type), propertyToTrack);
    }

    /**
     * Used to get the full list of all available source costs for manufacturers or suppliers.
     * Probably, with duplications.
     * @param rows
     * @param type
     * @returns {Array}
     */
    function getAllCosts(rows, type) {
      return _.flatten(rows.map((row) => {
        return getSourcerCosts(row, type);
      }))
    }

    /**
     * Used to get all supplier or manufacturer costs for the particular row.
     * Probably, with duplications
     * @param row {object} - the row to retrieve source costs from
     * @param type {string} - the type of sourcer (manufacturer or supplier)
     * @returns {Array} array of source costs (probably, with duplications)
     */
    function getSourcerCosts(row, type){
      const manufacturerCostsList = 'mfrPartsList';
      const supplierCostsList = 'suppPartsList';
      const prop = type === fuseType.manufacturer ? manufacturerCostsList : supplierCostsList;
      return row[prop] ? getCosts(row[prop]) : [];
    }

    /**
     * Used to get source costs array from an object
     * @param sourcers [{object}]- the array of break costs from suppliers or manufacturers
     * @returns {*}
     */
    function getCosts(sourcers) {
      return sourcers.map((sourcer) => {
        const singlePriceIndex = 0;
        return new SourcerCost(sourcer, sourcer.costDetail[singlePriceIndex]);
      });
    }

    /**
     * Adds info about all available break costs to the array.
     * @param arr
     * @returns {Array}
     */
    function addCostsInfo(arr) {
      return _.map(arr, setAvailableBreakCosts);
    }

    /**
     * Creates new property named 'availableBreakCosts' and store there all the available costs
     * (together with source cost) for the particular row.
     * @param row
     * @returns {*}
     */
    function setAvailableBreakCosts(row) {
      if (row.suppPartsList || row.mfrPartsList) {
        row.availableBreakCosts = getAllCostTypes(row);
      }
      return row;
    }

    /**
     * Retrieves all available break costs for the particalar row
     * @param row {object} - the row to retrieve data from
     * @returns {Array}
     */
    function getAllCostTypes(row) {
      const selfCost = _.cloneDeep(row.breakCost);
      const suppliersCost = getCosts(row.suppPartsList);
      const manufacturerCost = getCosts(row.mfrPartsList);
      return _.concat(selfCost, suppliersCost, manufacturerCost);
    }

    /**
     * Returns cost definition to apply to a part
     * @param row {object} - the part to work with
     * @param costTypeId {string] - the id of the cost def to be applied
     * @returns {*}
     */
    function getCostDefApplied(row, costTypeId) {
      if (!row.availableBreakCosts) {
        return null;
      }
      return getCostDefAppliedImplementation(row.availableBreakCosts, costTypeId);
    }

    /**
     * Returns cost definition object to be applied
     * @param availableCostDefs {array} - array of cost definitions, available for the part
     * @param costTypeId {string} - the id of the cost definition to be applied
     * @returns {*}
     */
    function getCostDefAppliedImplementation(availableCostDefs, costTypeId) {
      const probableCostTypes = availableCostDefs.filter((costDef) => {
        return costDef.sourcerId === costTypeId || costDef.id === costTypeId;
      });
      const convertedFuseCosts = probableCostTypes.map((appliedCostDef) => {
        return partCostService.getConvertedCost(appliedCostDef)
      });
      const minCost = _.minBy(convertedFuseCosts, (string) => {
        return +string;
      });
      if (!minCost && convertedFuseCosts.length > 0) {
        const singleAvailableCostDefIndex = 0;
        return probableCostTypes[singleAvailableCostDefIndex];
      }
      const sourceCostIndex = _.findIndex(convertedFuseCosts, (number) => {
        return number === minCost;
      });
      return sourceCostIndex >= 0 ? probableCostTypes[sourceCostIndex] : null;
    }

    /**
     * Used to return max length of manufacturer or supplier parts lists in the current row
     * @param row {object} - the current row
     * @returns {number}
     */
    function setRelatedSourcersLength(row) {
      const manufacturers = row.mfrPartsList;
      const suppliers = row.suppPartsList;
      return manufacturers.length > suppliers.length ? manufacturers.length : suppliers.length;
    }

    /**
     * Used to find the row index in the sourcers list, to use it as an offset
     * @param {object}:
     *        sourcersList - the array of manufacturers and suppliers
     *        costTypeId - id of the selected cost type
     *        sourcerListProp - prop of the sourcer list such as 'suppList' or 'mfrList'
     *        objectIdProp - prop of the object id such as 'suppObjectId' or 'mfrObjectId'
     * @returns {number}
     */
    function getSourcerOffset({sourcersList, costTypeId, sourcerListProp, objectIdProp}) {
      return _.findIndex(sourcersList, (row) => {
        return row[sourcerListProp][objectIdProp] === costTypeId;
      });
    }

    /**
     * Used to set sourcer index in accordance with the selected cost type in the current row
     * @param sourcerOffsetOptions - {object} Used to set sourcer offset options
     * @param currentPartIndex - index of the current row
     * @return {number}
     */
    function setSourcerIndex(sourcerOffsetOptions, currentPartIndex) {
      return currentPartIndex + getSourcerOffset(sourcerOffsetOptions);
    }

    /**
     * Used to change sourcer list of the current row in accordance with selected cost type
     * @param {object}:
     *        row - the current row
     *        sourcerRow - row in accordance with selected cost type
     *        sourcerListProp - prop of the sourcer list such as 'suppList' or 'mfrList'
     */
    function getChangedSourcersData({row, sourcerRow, sourcerListProp}) {
      return {partSourcers: sourcerRow[sourcerListProp], sourcerRowSourcers: row[sourcerListProp]};
    }

    /**
     * Used to set prop of the sourcer list in accordance with sourcer type
     * @param sourcerType {string} - sourcer type such as 'manufacturer' or 'supplier'
     * @return {string}
     */
    function setSourcerListProp(sourcerType) {
      return sourcerType === fuseType.supplier ? 'suppList' : 'mfrList';
    }

    /**
     * Used to set prop of the object Id in accordance with sourcer type
     * @param sourcerType {string} - sourcer type such as 'manufacturer' or 'supplier'
     * @return {string}
     */
    function setObjectIdProp(sourcerType) {
      return sourcerType === fuseType.supplier ? 'suppObjectId' : 'mfrObjectId';
    }

    /**
     * Used to set index of the current row in accordance with slNo property of the selected row
     * @param gridRows - array of rows
     * @param changedRow - the current row
     */
    function setCurrentPartIndex(gridRows, changedRow) {
      return _.findIndex(gridRows, (row) => {
        return row.slNo === changedRow.slNo;
      });
    }

    /**
     * Used to set sourcer type in accordance with selected cost type
     * @param costType - selected cost type
     * @return {string || null} Return null if selected cost type doesn't have sourcer prefix
     */
    function setSourcerType(costType) {
      const mfrPrefix = 'mfr';
      const suppPrefix = 'supp';
      if (costType.indexOf(mfrPrefix) !== -1) {
        return fuseType.manufacturer;
      }
      if (costType.indexOf(suppPrefix) !== -1) {
        return fuseType.supplier;
      }
      return null;
    }

    /**
     * Used to set options of sourcers offset as object
     * @param gridRows - array of rows
     * @param currentPartIndex - index of current row
     * @param sourcerType - sourcer type such as 'manufacturer' or 'supplier'
     * @param sourcerListProp - prop of the sourcer list such as 'suppList' or 'mfrList'
     * @param costType - selected cost type
     * @return {object}
     */
    function getSourcerOffsetOptions(gridRows, currentPartIndex, sourcerType, sourcerListProp, costType) {
      const notUsedTailLength = 3;
      const partsListLength = currentPartIndex + setRelatedSourcersLength(gridRows[currentPartIndex]);
      return {
        sourcersList: gridRows.slice(currentPartIndex, partsListLength),
        costTypeId: costType.substring(0, costType.length - notUsedTailLength),
        objectIdProp: setObjectIdProp(sourcerType),
        sourcerListProp
      };
    }

    /**
     * Used to set options of sourcer for change
     * @param gridRows - array of rows
     * @param currentPartIndex - index of current row
     * @param sourcerOffsetOptions - options of sourcer offset as object
     * @param sourcerListProp - prop of the sourcer list such as 'suppList' or 'mfrList'
     * @return {object}
     */
    function getSourcerOptionts(gridRows, currentPartIndex, sourcerOffsetOptions, sourcerListProp) {
      return {
        row: gridRows[currentPartIndex],
        sourcerRow: gridRows[setSourcerIndex(sourcerOffsetOptions, currentPartIndex)],
        sourcerListProp
      };
    }

    /**
     * Used to init change sourcer list of the current row in accordance with selected cost type
     * @param costType {string} - selected cost type
     * @param gridRows {array} - array of rows
     * @param changedRow {object} - the current row
     */
    function initChangeSourcer(costType, gridRows, changedRow) {
      const sourcerType = setSourcerType(costType);
      const currentPartIndex = setCurrentPartIndex(gridRows, changedRow);
      if (currentPartIndex === -1 || sourcerType === null) {
        return;
      }
      const sourcerListProp = setSourcerListProp(sourcerType);
      const sourcerIndexOptions = getSourcerOffsetOptions(gridRows, currentPartIndex, sourcerType, sourcerListProp, costType);
      const sourcerOptions = getSourcerOptionts(gridRows, currentPartIndex, sourcerIndexOptions, sourcerListProp);
      const sourcersData = getChangedSourcersData(sourcerOptions);
      const {row, sourcerRow} = sourcerOptions;
      row[sourcerListProp] = sourcersData.partSourcers;
      sourcerRow[sourcerListProp] = sourcersData.sourcerRowSourcers;
    }

    function initChangeAllSourcer(gridRows, costTypeId) {
      gridRows.forEach((row) => {
        const appliedCostDef = getCostDefApplied(row, costTypeId);
        if (appliedCostDef) {
          initChangeSourcer(appliedCostDef.id, gridRows, row);
        }
      });
    }

    function initChangeFlatSourcer(gridRows, costTypeId) {
      flatViewService.iterateOverFlatRows(gridRows, (row) => {
        const appliedCostDef = getCostDefApplied(row, costTypeId);
        if (appliedCostDef) {
          initChangeSourcer(appliedCostDef.id, gridRows, row);
        }
      });
    }

    return {
      setSetting,
      getRowTooltipText,
      getUnitCostTooltipText,
      getFeatureState,
      getPackedSourcers,
      addCostsInfo,
      getCostDefApplied,
      initChangeSourcer,
      initChangeAllSourcer,
      initChangeFlatSourcer
    };
  }
})();
