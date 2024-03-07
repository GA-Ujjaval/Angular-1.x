(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('RollupStackPlugin', RollupStackPlugin);

  /**
   * Used while calculating unit cost in bom tab. Used to store rollup quantites stack.
   */
  function RollupStackPlugin(flatRowsStage) {

    return function CostPlugin(){
      this.handleIteration = handleIteration;
      this.getStack = getStack;

      let rollupStack = [];

      function handleIteration(row, currentStage) {
        if(currentStage === flatRowsStage.rollup){
          rollupStack.push({level: row.level, quantity: +row.quantity});
        }
        if(currentStage === flatRowsStage.preRollup){
          rollupStack = rollupStack.filter((rollup) => {
            return rollup.level < row.level
          });
        }
      }

      function getStack() {
        return rollupStack;
      }

    }

  }
})();
