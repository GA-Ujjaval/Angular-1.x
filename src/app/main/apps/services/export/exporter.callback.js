(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('exporterCallbackService', exporterCallbackService);


  /** @ngInject */
  function exporterCallbackService() {

    const service = {
      mainTable
    };

    function mainTable(grid, row, col, value) {
      if(exportMatcher[col.name]){
        return exportMatcher[col.name](grid, row, col, value);
      }
      return value;
    }

    const exportMatcher = {
      isLatest: (grid, row, col, value) => value === 'true' ? 'Yes' : 'No',
      associatedCardsList: (grid, row, col, value) => !_.isEmpty(value)
    };

    return service;
  }
})();
