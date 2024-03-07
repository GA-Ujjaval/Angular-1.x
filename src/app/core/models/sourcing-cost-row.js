(function () {
    'use strict';

    class SourcingCostRow{
      constructor(costDetail, sourcer){
        const defaultValue = 0;
        this.id = costDetail.id;
        this.name = sourcer.objectNumber;
        this.currency = costDetail.currency;
        this.cost = costDetail.cost || defaultValue;
        this.moq = costDetail.moq;
        this.sourcerdId = sourcer.objectId;
        this.sourcerName = sourcer.objectName;
        this.firstSourcerId = sourcer.sourcingId;
        this.sourceType = sourcer.sourceType;
      }
    }

    angular
      .module('app.core')
      .factory('SourcingCostRow', function () {
        return SourcingCostRow;
      });
  }
)();
