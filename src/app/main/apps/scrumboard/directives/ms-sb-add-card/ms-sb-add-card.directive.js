(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .controller('msSbAddCardController', msSbAddCardController)
    .directive('msSbAddCard', msSbAddCardDirective)
    .directive('msCardEllipsis', msCardEllipsis);

  /** @ngInject */
  function msSbAddCardController($scope, $rootScope, hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, $timeout, BoardService, msUtils, DialogService) {
    var vm = this;

    vm.newCardName = '';
    vm.listId = $scope.msListId;
    vm.board = BoardService.data || {};

    vm.cards = vm.board.cards;
    vm.list = vm.board.lists.getById(vm.listId);

    //For Error Constnat
    vm.error = errors;

    //For Session
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //For Service Call Parameter
    var params = '';
    var data = '';

    // Methods
    vm.addNewCard = addNewCard;
    vm.openCardDialog = DialogService.openCardDialog;

    function changePath() {
      $state.go('app.customer.scrumboard.boards.board', {
        cardId: undefined
      }, {
        notify: false
      }, {
        reload: false
      });
    }

    /**
     * Add New Card
     */
    function addNewCard(listCards) {
      vm.progress = true;
      if (vm.newCardName === '') {
        return;
      }

      if (vm.sessionData.proxy == true) {
        params = {
          boardId: BoardService.data.id,
          listId: vm.listId,
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: BoardService.data.id,
          listId: vm.listId,
          customerId: vm.sessionData.userId
        }
      }

      data = {
        cardTitle: vm.newCardName,
        isTemplate: false
      };


      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(BoardService.data.lists, function (value, key) {
                if (value.id == vm.listId) {
                  value.idCards.push(response.data.cardId);
                }
              });
              angular.forEach(BoardService.data.lists, function (value, key) {
                if (value.id == vm.listId) {
                  BoardService.data.cards.push({
                    id: response.data.cardId,
                    name: response.data.cardTitle,
                    description: response.data.cardDescription,
                    idAttachmentCover: response.data.idAttachmentCover,
                    cardTypeId: vm.board.cardTypeId,
                    idMembers: response.data.membersIdList,
                    idLabels: response.data.idLabels,
                    idChangeItems: [],
                    attachments: response.data.attachmentsList,
                    subscribed: response.data.subscribed,
                    checklists: response.data.checklists,
                    checkItems: [],
                    checkItemsChecked: response.data.checkItemsChecked,
                    comments: response.data.comments,
                    activities: response.data.activities,
                    additionalInfo: response.data.additionalInfoList,
                    due: response.data.dueDate,
                    resolutionTasksTab: BoardService.data.isResolutionTask,
                    modificationsTab: BoardService.data.isRevModification,
                    whereUsedTab: BoardService.data.isWhereused,
                    modifications: [],
                    resolutionTasks: [],
                    whereUsed: []
                  });
                }
              });

              vm.board = BoardService.data;

              $timeout(function () {
                var listCards = $($('.list-wrapper')[0]).find('.list-cards');
                $scope.scrollListContentBottom(listCards);
              }, 100);
              // $rootScope.$broadcast('SendUp', 'some data');
              vm.openCardDialog(null, response.data.cardId, changePath, vm.tasks, '');
              vm.newCardName = '';

              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.newCardName = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }
  }

  /** @ngInject */
  function msSbAddCardDirective($document, $window, $timeout) {
    return {
      restrict: 'E',
      controller: 'msSbAddCardController as vm',
      templateUrl: 'app/main/apps/scrumboard/directives/ms-sb-add-card/ms-sb-add-card.html',
      scope: {
        msListId: '='
      },
      link: function (scope, iElement) {
        scope.formActive = false;
        scope.toggleForm = toggleForm;
        scope.scrollListContentBottom = scrollListContentBottom;

        var buttonEl = iElement.find('.ms-sb-add-card-button'),
          formEl = iElement.find('.ms-sb-add-card-form'),
          listCards = iElement.parent().parent().prev().find('.list-cards');

        /**
         * Click Event
         */
        buttonEl.on('click', toggleForm);

        /**
         * Toggle Form
         */
        function toggleForm() {
          scope.$evalAsync(function () {
            scope.formActive = !scope.formActive;

            if (scope.formActive) {
              $timeout(function () {
                formEl.find('input').focus();

                scrollListContentBottom(listCards);
              });

              $document.on('click', outSideClick);
            } else {
              PerfectScrollbar.update(listCards[0]);
              $document.off('click', outSideClick);
            }

            $timeout(function () {
              // IE list-content max-height hack
              if (angular.element('html').hasClass('explorer')) {
                angular.element($window).trigger('resize');
              }
            });

          });
        }

        /**
         * Scroll List to the Bottom
         */
        function scrollListContentBottom(listCards) {
          if (listCards && listCards.find(".list-card").last()[0]) {
            listCards.find(".list-card").last()[0].scrollIntoView();
          }
        }

        /**
         * Click Outside Event Handler
         * @param event
         */
        var outSideClick = function (event) {
          var isChild = formEl.has(event.target).length > 0;
          var isSelf = formEl[0] === event.target;
          var isAddCardButton = $(event.target).parent(buttonEl).length;
          var isInside = isChild || isSelf || isAddCardButton;

          if (!isInside) {
            toggleForm();
          }
        };
      }
    };
  }

  /** @ngInject */
  function msCardEllipsis($document, $window, $timeout, $filter) {
    return {
      restrict: 'A',
      scope: {
        msLineCount: '@'
      },
      link: function (scope, iElement) {

        /**
         * fine line count
         * @param el
         * @returns {number}
         */
        function findLineCount(el) {
          if (el) {
            var l = $(el).css("line-height");
            if (l === 'normal') {
              return $(el).height() / parseFloat(16 * 1.5);
            } else {
              return $(el).height() / parseFloat($(el).css("line-height"));
            }
          }
          return 0;
        }

        /**
         *
         * @param el
         * @param count
         */
        function substring(el, count) {
          var current = $(el);
          var len = 0;
          var text = current.text();
          len = text.length;

          var words = text.split(' ');

          current.text(words[0]);
          var height = current.height();

          if (findLineCount(el)) {
            var counter = 0;

            for (var i = 1; i < words.length; i++) {
              //
              current.text(current.text() + ' ' + words[i]);

              if (current.height() > height) {
                height = current.height();
                counter++;

                if (counter > (count - 1)) {
                  len = current.text().length - i;
                }

              }

            }
            return len;
          }
          return text;
        }

        $timeout(function () {
          $(iElement).html($filter('ellipsis')($(iElement).html(), true, substring(iElement, 2)));
        }, 1000);

        angular.element($window).bind('resize', function () {
          $(iElement).html($filter('ellipsis')($(iElement).html(), true, substring(iElement, 2)));
        });

      }
    }
  }
})();
