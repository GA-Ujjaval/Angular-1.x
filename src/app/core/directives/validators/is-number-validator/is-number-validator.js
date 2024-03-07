(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('isNumberValidator', function () {

      const error = 'isNumeric';

      function link(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (val) {
          if (!isNumber(val) || !isFinite(val)) {
            ngModel.$setValidity(error, false);
            // the value to be saved in model if input is invalid
            return;
          }
          ngModel.$setValidity(error, true);
          return val;
        });
      }

      function isNumber(value) {
        return !isNaN(value);
      }

      return {
        require: 'ngModel',
        link,
        restrict: 'A',
        priority: 2
      };

    });
})();
