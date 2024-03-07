(function () {
  angular
    .module('app.core')
    .directive('mfUpdateTitle', function ($rootScope, $timeout, pageTitles) {

      function link(scope, element) {

        var listener = function (event, toState) {
          if (toState.pageTitle === pageTitles.dontChangeTitle) {
            return;
          }

          var title = 'FusePLM';
          if (toState.pageTitle) {
            title = toState.pageTitle;
          }

          $timeout(function () {
            element.text(title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
        $rootScope.$on('changeTitleInDetails', listener);
      }

      return {
        restrict: 'A',
        link: link,
        scope: {}
      }
    });
})();
