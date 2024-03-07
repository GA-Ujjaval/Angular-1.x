(function () {
  angular
    .module('app.core')
    .directive('clipboardFloatingIcon', function (clipboardService, $mdDialog) {
      var directiveScope;

      function link(scope, element, attrs) {
        directiveScope = scope;
        scope.clipboardService = clipboardService;
        scope.openPopup = openPopup;

        scope.$watch('clipboardService.getItemsCount()', function (newVal, oldVal) {
          scope.itemsCount = newVal;
        })
      }

      function openPopup(ev) {
        $mdDialog.show({
          controller: 'ClipboardDialogController',
          controllerAs: 'vm',
          multiple: true,
          templateUrl: 'app/core/directives/clipboard-floating-icon/clipboard-dialog-template.html',
          clickOutsideToClose: true,
          skipHide: !directiveScope.isCard,
          targetEvent: ev,
          locals: {
            params: {
              rowsForGrid: clipboardService.getAllSavedItems(),
              isConfigEnabled: directiveScope.isConfigEnabled,
              isCard: directiveScope.isCard,
              card: directiveScope.card,
              color: directiveScope.color
            }
          }
        }).then(function () {
        }, function () {
        });
      }

      return {
        templateUrl: 'app/core/directives/clipboard-floating-icon/clipboard-icon-template.html',
        restrict: 'E',
        link: link,
        scope: {
          isConfigEnabled: '=',
          isCard: '=',
          card: '=',
          color: '=',
          showButton: '='
        }
      };
    });
})();
