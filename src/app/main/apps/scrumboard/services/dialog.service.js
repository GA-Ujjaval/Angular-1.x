(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .factory('DialogService', DialogService);

  /** @ngInject */
  function DialogService($mdDialog, $document, $rootScope, $timeout, $state, $location) {
    var service = {
      openCardDialog: openCardDialog
    };

    //////////

    /**
     * Open card dialog
     *
     * @param ev
     * @param cardId
     * @param response this is when card dialog is opened from table, so all needed info presents already
     */
    function openCardDialog(ev, cardId, changePath, Tasks, Tags, standardView, affected, response, isTemplate) {
      var currentState = $state.current.name;

      if ($rootScope.plmBotPanelOpen && currentState === 'app.customer.scrumboard.boards.board') {
        $document.find('#plmBot').css({
          'z-index': '79'
        });
      }

      $mdDialog.show({
        templateUrl: 'app/main/apps/scrumboard/dialogs/card/card-dialog.html',
        controller: 'ScrumboardCardDialogController',
        controllerAs: 'vm',
        parent: $document.find('#scrumboard'),
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        skipHide: true,
        locals: {
          cardId: cardId,
          Tasks: Tasks,
          Tags: Tags,
          showView: (standardView || false),
          defualts: affected,
          response: response,
          isTemplate: isTemplate
        },
        onRemoving: function () {
          if (_.includes($location.path(), 'scrumboard')) {
            changePath();
          }
          $timeout(function () {

            // set default md-dialog window z-index
            $document.find('#plmBot').css({
              'z-index': '80'
            });

          }, 1000);

        }
      }).then(function (val) {
        if (val) {
          $rootScope.$broadcast("SendCardData", val);
        }
        if (!isTemplate) {
          $rootScope.$broadcast("SendUp", "some data");
        }
      }, function () {
        if (!isTemplate) {
          $rootScope.$broadcast("SendUp", "some data");
        }
      });
    }

    return service;
  }
})();
