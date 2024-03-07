(function () {
  'use strict';

  angular
    .module('app.objects')
    .directive('noResultsFound', noResultsFound);

  function noResultsFound(){

    function link(scope){
      scope.areThereVisibleRows = true;
      scope.$watch('gridApi', function(newValue, oldValue) {
        if(newValue){
          scope.gridApi.core.on.rowsVisibleChanged(scope, function(){
            if(scope.gridOptions.initialized && scope.gridOptions.data.length)
              scope.areThereVisibleRows = scope.gridApi.core.getVisibleRows().length ? true : false;
          })
        }
      });
    }

    return {
      restrict: 'E',
      template: '<div class="watermark" ng-show="!areThereVisibleRows">No results found</div>',
      scope: {
        gridApi: '=',
        gridOptions: '='
      },
      link: link
    }
  }
})();
