(function () {
    'use strict';

    angular
      .module('app.core')
      .factory('SourcerCost', function (currencyExchangeService) {

        const currExchange = currencyExchangeService;

        /**
         * The class of the source cost (same as break cost, but created from manufacturer or supplier data)
         * Used in bom costType
         */
        class SourcerCost {
          constructor(sourcer, costDef) {
            _.assign(this, costDef);
            this.id = `${sourcer.objectId}(${costDef.id})`;
            this.sourcerId = sourcer.sourcingId;
            this.sourcerName = sourcer.objectName;
            this.costType = this.getCostTypeStringForSourcing(sourcer, costDef);
          }

          getCostTypeStringForSourcing(sourcer, cost) {
            const defaultValue = 0;
            return `${sourcer.objectNumber} : ${sourcer.objectName}(MOQ ${cost.moq}:` +
              ` ${isNaN(cost.cost) ? '' : this.getCurrencySign(cost.currency)} ${cost.cost || defaultValue})`;
          }

          getCurrencySign(currencyString) {
            return currExchange.getSignByAbbreviation(currExchange.getCurrencyAbbreviation(currencyString).trim()).sign;
          }
        }

        return SourcerCost;
      });
  }
)();
