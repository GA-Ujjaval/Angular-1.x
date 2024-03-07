(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('FlatRowQuantityPlugin', FlatRowQuantityPlugin);

  /**
   * Used while calculating unit cost in bom tab. Used to store rollup quantites stack.
   * So the cost of nested part is multiplied by the quantity of their assemblies (parent parts)
   */
  function FlatRowQuantityPlugin(flatRowsStage, RollupStackPlugin) {

    return function CostPlugin(){
      this.handleIteration = handleIteration;
      this.getQuantity = getQuantity;

      const rollupStack = new RollupStackPlugin();

      function handleIteration(row, currentStage) {
        rollupStack.handleIteration(row, currentStage);
      }
      /**
       * Gets the total quantity of a part in hierarchical array considering parents' quantities
       * @param rowQuantity {number} - the quantity of the initial row
       * @returns {*}
       */
      function getQuantity(rowQuantity = 1) {
        return rollupStack.getStack().reduce((totalQuantity, rollupPoint) => {
          return totalQuantity * rollupPoint.quantity;
        }, rowQuantity)
      }
    }
  }
})();
