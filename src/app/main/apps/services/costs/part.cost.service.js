(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('partCostService', partCostService);

  function partCostService(currencyExchangeService, errors, flatRowsIterationService, UnitCostPlugin) {

    const service = {
      getConvertedCost,
      getConvertedFuseCost,
      getRollupCostChange,
      getUnitCost,
      retrieveCost,
      getNotScientificNumber
    };

    const currExchange = currencyExchangeService;

    /**
     * Returns converted cost for the part in format '$ 14.65'
     * @param fullSystemCurrency
     * @param appliedCostDef
     * @returns {*}
     */
    function getConvertedFuseCost(appliedCostDef) {
      const convertedCost = getConvertedCost(appliedCostDef) || '0.00';
      if (isNaN(convertedCost)) {
        return convertedCost;
      }
      return `${currencyExchangeService.getSystemCurrency().sign} ${convertedCost}`;
    }

    function getRollupCostChange(appliedCostDef, row) {
      const oldRowCost = retrieveCost(row.fuseCost);
      const newRowCost = getConvertedCost(appliedCostDef);
      if (newRowCost === errors.noAvailableCurrency) {
        return -oldRowCost;
      }
      let copyOldRowCost = _.cloneDeep(oldRowCost);
      let copyNewRowCost = _.cloneDeep(newRowCost);
      copyOldRowCost = isNaN(copyOldRowCost) ? 0 : copyOldRowCost;
      copyNewRowCost = isNaN(copyNewRowCost) ? 0 : copyNewRowCost;
      return copyNewRowCost - copyOldRowCost;
    }

    /**
     * Function to extract cost form a string.
     * @param cost {string} - the string to extract number from. e.x. '$ 12323' or '4545.45'
     *  if input is just a text, then default 0 is returned
     * @returns {number}
     */
    function retrieveCost(cost) {
      const defaultCost = 0;
      if (!cost) {
        return defaultCost;
      }
      if (!isNaN(cost)) {
        return +cost;
      }
      const probableNumber = cost.split(' ')[1];
      if (!isNaN(probableNumber)) {
        return +probableNumber;
      }
      return defaultCost;
    }

    /**
     * Converts cost denoted set in other currency to system currency
     * @param costAbbreviation - the abbreviation of the cost of the part
     * @param systemCurrencySign - the sign of the cost applied in system
     * @param cost - the number to be processed
     * @returns {string}
     */
    function getConvertedCost(appliedCostDef) {
      const defaultCost = 0;
      const fullSystemCurrency = currExchange.getSystemCurrencyView();
      const {currency, cost} = appliedCostDef || {};
      const currencyAbbreviation = currExchange.getCurrencyAbbreviation(currency || fullSystemCurrency);
      if (currencyAbbreviation === currExchange.getCurrencyAbbreviation(fullSystemCurrency)) {
        return cost || defaultCost;
      }
      if (!currExchange.isCurrencyAvailable(currencyAbbreviation)) {
        return errors.noAvailableCurrency;
      }
      if (isNaN(cost)) {
        return cost;
      }
      const convertedCost = currExchange.convertFrom(currencyAbbreviation, cost);
      if (convertedCost === errors.noAvailableCurrency) {
        return errors.noAvailableCurrency
      }
      return convertedCost;
    }

    /**
     * Calculates unit cost for BOM. uses hierarchicalGridOptions.data
     * @param arr {array} - hierarchical array to retrieve cost from
     * @returns {number}
     */
    function getUnitCost(arr, decimals) {
      const costsArr = flatRowsIterationService.getIterator([new UnitCostPlugin()])
        .iterateOverFlatRows(arr, (row, costPlugin) => {
          return costPlugin.getCost(retrieveCost(row.extendedCost));
        });
      if (decimals === 'No Limit') {
        return costsArr.reduce((sum, val) => {
          return sum + val;
        }, 0);
      } else {
        return costsArr.reduce((sum, val) => {
          return sum + val;
        }, 0).toFixed(Number(decimals));
      }
    }

    /**
     * Multiplies base by quantity and returns '0.00000024' instead of '2.4E-8'
     * @param base - the base for multiplication
     * @param multiplication - the number to multiply by
     * @returns {string}
     */
    function getNotScientificNumber(base, multiplication) {
      if(isNaN(multiplication)) {
        return currencyExchangeService.getSystemCurrency().sign + ' 0.00';
      }
      const scientific = base * multiplication;
      const exponent = Math.abs(+(scientific + '').split('e')[1]) + 1;
      const initialZeros = exponent ? (scientific + '').split('e')[0].split('.')[1].length : 0;
      if(base && multiplication){
        return currencyExchangeService.getSystemCurrency().sign + ' ' +
          (exponent ? scientific.toFixed(exponent + initialZeros) : scientific)
      }
      return currencyExchangeService.getSystemCurrency().sign + ' 0.00';
    }

    return service;
  }
})();
