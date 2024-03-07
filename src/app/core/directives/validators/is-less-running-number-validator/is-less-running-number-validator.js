(function () {
  angular
    .module('app.core')
    .directive('isLessRunningNumberValidator', function () {

      var error = 'isLessRunningNumber';

      function link(scope, element, attrs, ngModel){
        ngModel.$parsers.push(function(val){
          val = +val;
          var runningNumber = +attrs.runningNumber || 0;
          if( !val || val < runningNumber){
            ngModel.$setValidity(error, false);
            // the value to be saved in model if input is invalid
            return;
          }
          ngModel.$setValidity(error, true);
          return val;
        })
      }

      return {
        require: 'ngModel',
        link: link,
        restrict: 'A',
        priority: 3
      }

    })
})();
