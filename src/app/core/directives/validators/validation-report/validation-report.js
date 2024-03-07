(function () {
  'use strict';
  angular
    .module('app.core')
    .directive('validationReport', function () {

      const errors = [
        {name: 'isEmpty', text: 'This field is required'},
        {name: 'isNumeric', text: 'Please, provide a numeric value'},
        {name: 'isLessRunningNumber', text: 'Starting number should be greater than Running number'},
        {name: 'isNotDecimalNumeric', text: 'Please, provide an integer numeric value'},
        {name: 'isPositiveNumeric', text: 'Please, provide a positive numeric value'},
        {name: 'leadingSign', text: 'Please, provide an unsigned value'}
      ];

      function getErrorText(modelController) {
        const error = _.find(errors, function (error) {
          return modelController.$error[error.name];
        });
        return error ? error.text : null;
      }

      function link(scope, element, attrs) {
        scope.getErrorText = getErrorText;
      }

      return {
        restrict: 'E',
        scope: {
          inputController: '='
        },
        transclude: true,
        link: link,
        templateUrl: 'app/core/directives/validators/validation-report/validation-report.html'
      };
    });
})();
