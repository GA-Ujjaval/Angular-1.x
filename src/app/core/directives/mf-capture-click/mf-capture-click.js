(function () {
  angular
    .module('app.core')
    .directive('captureClick', function ($parse) {
      return {
        restrict: 'A',
        compile: function (element, attrs) {
          const fn = $parse(attrs.captureClick);
          return function (scope, element) {
            element[0].addEventListener('click', function (event) {
              scope.$apply(function () {
                fn(scope, {
                  $event: event
                });
              });
            }, true);
          };
        }
      }
    })
})();
