(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('isNotDecimalNumberValidator', function () {

      const error = 'isNotDecimalNumeric';

      function link(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (val) {
          if (val.indexOf('.') !== -1) {
            ngModel.$setValidity(error, false);
            // the value to be saved in model if input is invalid
            return;
          }
          ngModel.$setValidity(error, true);
          return val;
        });
      }

      return {
        require: 'ngModel',
        link,
        restrict: 'A',
        priority: 5
      };

    });
})();
