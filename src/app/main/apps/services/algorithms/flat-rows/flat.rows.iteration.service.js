(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('flatRowsIterationService', partCostService);

  function partCostService(currencyExchangeService, errors, helperData, UnitCostPlugin, flatRowsStage) {

    const service = {
      getIterator
    };

    function getIterator(plugins) {
      return new FlatRowsIterator(plugins);
    }

    /**
     * Iterates over only flat rows in the array from hierarchical tab of bom
     * (the array actually is flat, but with property like 'level', which identifies the nesting level)
     * @param params {object} with properies:
     *   -- costCalculation {boolean} - activates costPlugin
     * @constructor
     */
    function FlatRowsIterator(plugins = []) {
      this.iterateOverFlatRows = iterateOverFlatRows;

      /**
       *
       * @param arr {array} - the array like what we have in hierarchical bom tab
       * @param cb {function} - the callback to be executed for every flat row
       * @returns {*}
       */
      function iterateOverFlatRows(arr, cb) {
        let levelPoint = 1;
        return arr.map((row) => {
          if (!row.costType || row.level > levelPoint) return;
          const argumentsArr = [row].concat(plugins);
          if(row.level < levelPoint){
            handlePlugins(plugins, flatRowsStage.preRollup, row);
          }
          if (row.costType === helperData.rollupCostId && !row.leaf) {
            handlePlugins(plugins, flatRowsStage.rollup, row);
            levelPoint++;
            return;
          }
          levelPoint = row.level;
          return cb.apply(this, argumentsArr);
        })
          .filter((row) => {
            return row
          });
      }

      function handlePlugins(plugins, stage, row){
        plugins.forEach((plugin) => {
          plugin.handleIteration(row, stage);
        });
      }
    }

    return service;
  }})();
