(function () {
  angular
    .module('app.core')
    .directive('isEmptyValidator', function () {

      var error = 'isEmpty';

      function link(scope, element, attrs, ngModel){
        function validate(val){
          if(!val){
            ngModel.$setValidity(error, false);
            // the value to be saved in model if input is invalid
            return;
          }
          ngModel.$setValidity(error, true);
          return val;
        }
        ngModel.$parsers.push(validate);
      }

      return {
        require: 'ngModel',
        link,
        restrict: 'A',
        priority: 1
      };

    });
})();
