(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('leadingSignValidator', function () {

      const error = 'leadingSign';

      function link(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (val) {
          const signs = attrs.leadingSignValidator;
          const inputSign = val[0];
          if (signs.indexOf(inputSign) !== -1) {
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
        priority: 4
      };

    });
})();
