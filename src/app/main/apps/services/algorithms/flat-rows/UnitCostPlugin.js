(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('UnitCostPlugin', unitCostPlugin);

  /**
   * Used while calculating unit cost in bom tab. Used to store rollup quantites stack.
   * So the cost of nested part is multiplied by the quantity of their assemblies (parent parts)
   */
  function unitCostPlugin(flatRowsStage, RollupStackPlugin) {

    return function CostPlugin(){
      this.handleIteration = handleIteration;
      this.getCost = getCost;

      const rollupStack = new RollupStackPlugin();

      function handleIteration(row, currentStage) {
        rollupStack.handleIteration(row, currentStage);
      }
      /**
       * multiplies base cost by quantities of upper levels' rollups
       * @param cost {number} - the base cost to be applied
       * @returns {*}
       */
      function getCost(cost = 1) {
        return rollupStack.getStack().reduce((sum, rollupPoint) => {
          return sum * rollupPoint.quantity;
        }, cost)
      }

    }

  }
})();
