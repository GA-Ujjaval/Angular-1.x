(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('isPositiveNumberValidator', function () {

      const error = 'isPositiveNumeric';

      function link(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (val) {
          if (val && val <= 0) {
            // the value to be saved in model if input is invalid
            ngModel.$setValidity(error, false);
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
        priority: 3
      };

    });
})();
