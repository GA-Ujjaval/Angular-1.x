(function() {
  'use strict';

  angular
    .module('app.objects')
    .directive('onlyNumber', onlyNumber)

  function onlyNumber() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        element.on('keypress', function(event) {

          if (!isIntegerChar())
            return false;

          function isIntegerChar() {
            return /[0-9\b]/.test(
              String.fromCharCode(event.which))
          }

        })

      }
    }
  }

})();
