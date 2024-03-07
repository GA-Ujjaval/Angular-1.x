(function () {
  'use strict';

  angular
    .module('app.objects')
    .directive('forceAutoFocus', forceAutoFocus);

  function forceAutoFocus() {

    function link(scope, element) {
      scope.$watch(function () {
        let foundElement = element;
        while (!foundElement.hasClass('md-select-menu-container')) {
          foundElement = foundElement.parent();
        }
        return foundElement.hasClass('md-active');
      }, function (newVal) {
        if (newVal) {
          element.focus();
        }
      });
    }

    return {
      restrict: 'A',
      require: ['^^mdSelect', '^ngModel'],
      link: link
    };
  }
})();
