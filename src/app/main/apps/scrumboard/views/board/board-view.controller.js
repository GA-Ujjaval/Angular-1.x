(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .controller('BoardViewController', BoardViewController);

  /** @ngInject */
  function BoardViewController($scope, $rootScope, BoardService, $document, $window, $timeout, $mdDialog, msUtils,
                               hostUrlDevelopment, CustomerService, ScrumboardService, errors, AuthService, $state, $mdToast,
                               BoardData, CardFilters, DialogService, GlobalSettingsService, $stateParams) {
    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    vm.enableOptionsForTemplate = false;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header---------------------------------------------------------------------------------------
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //For Service Call Parameter
    var params = '';

    //For payload Call
    var data = '';
    vm.newCardName = '';
    // Data

    vm.currentView = 'board';
    vm.boardData = BoardData;
    vm.board = BoardService.data || {};
    vm.boardCopy = angular.copy(vm.board);
    vm.tasksCouner = 0;

    $rootScope.$watch('releaseHierarchy', value => {
      vm.releaseHierarchy = value;
      vm.releaseEditsHierarchy = $rootScope.releaseEditsHierarchy;
    });


    vm.boardBackup = angular.copy(BoardService.data) || {};

    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';

    vm.cardFilters = CardFilters;
    if ($state.params.priority !== undefined) {
      vm.cardFilters.labels = [$state.params.priority];
    }
    vm.card = {};
    vm.cardOptions = {};
    vm.newListName = '';
    vm.update = {};
    vm.tasks = null;
    vm.allLists = [];
    vm.flagIdCardsNoFilter = false;
    $rootScope.flagIdCardsFilterOn = false;
    var filterDate = {};
    $rootScope.filterCardDate = filterCardDate;
    var now = new Date(),
      oneDay = 86400000,
      threeDays = 259200000,
      sevenDays = 604800000,
      twoweeks = 1209600000,
      month = 2678400000,
      tomorrow = now.setHours(24, 0, 0, 0),
      next3days = tomorrow + threeDays,
      next7days = tomorrow + sevenDays,
      next2weeks = tomorrow + twoweeks,
      nextmonth = tomorrow + month,
      yesterday = now.setDate(now.getDate() - 2);
    vm.today = new Date();

    vm.filterByDate = {
      currentRange: null,
      dueCards: {
        ALL: {
          cards: []
        },
        TD: {
          cards: []
        },
        N3D: {
          cards: []
        },
        N7D: {
          cards: []
        },
        OD: {
          cards: []
        },
        N2W: {
          cards: []
        }
      }
    };
    var dateFilter = [{
      key: 'N3D',
      value: 'Next 3 days'
    },
      {
        key: 'N7D',
        value: 'Next 7 days'
      }, {
        key: 'TD',
        value: 'Today'
      }, {
        key: 'OD',
        value: 'Overdue'
      }, {
        key: 'ALL',
        value: 'All'
      }, {
        key: 'N2W',
        value: 'Next 2 weeks'
      }
    ];

    function currentFilter() {
      dateFilter.forEach(function (date) {
        if (date.key == $state.params.date) {
          filterDate = date;
          vm.stateParams = $state.params.date;
        }
      });
      if (Object.getOwnPropertyNames(filterDate).length < 1) {
        filterDate = dateFilter[4];
      }
    }

    currentFilter();
    $rootScope.selectedFilter = {
      dueDate: filterDate.key
    };

    /*if(BoardService.data.id === undefined){
     }
     else{
     getAllTask();
     }*/

    vm.showPopup = function () {
      $('.md-active').addClass('visible-drop-down');
      $('.md-active').removeClass('md-leave');
      $('.item').css('opacity', '1');
      $('.md-open-menu-container').css('opacity', '1');
    };

    vm.hidePopup = function () {
      $('.md-open-menu-container').removeClass('visible-drop-down');
    };

    vm.addClassForSelect = addClassForSelect;

    function addClassForSelect() {
      let element = function () {
        return document.getElementsByClassName('md-menu-backdrop');
      }
      let watch = $scope.$watch(element, function() {
        $('.md-menu-backdrop').addClass('md-menu-for-board');
        watch();
      });

    }

    vm.sortableListOptions = {
      axis: 'x',
      delay: 75,
      distance: 7,
      items: '> .list-wrapper',
      handle: '.list-header',
      placeholder: 'list-wrapper list-sortable-placeholder',
      tolerance: 'pointer',
      start: function (event, ui) {
        vm.update.bid = BoardService.data.id;
        vm.update.sid = ui.item.find('.list-id').text().trim();
        vm.update.sindex = ui.item.find('.list-index').text();
        var width = ui.item[0].children[0].clientWidth;
        var height = ui.item[0].children[0].clientHeight;
        ui.placeholder.css({
          'min-width': width + 'px',
          'width': width + 'px',
          'height': height + 'px'
        });
      },
      stop: function (ev, ui) {
        vm.board = BoardService.data;
        var sid = vm.update.sid;
        angular.forEach(vm.board.lists, function (value, key) {
          if (value.id == sid) {
            if (vm.board.lists[key - 1] == undefined) {
              vm.update.psid = null;
            } else {
              vm.update.psid = vm.board.lists[key - 1].id;
            }
          }
        });
        if (vm.sessionData.proxy === true) {
          params = {
            boardId: vm.update.bid,
            sourceListId: vm.update.sid,
            listId: vm.update.sid,
            previousListId: vm.update.psid,
            customerId: vm.sessionData.customerAdminId
          };
        } else {
          params = {
            boardId: vm.update.bid,
            sourceListId: vm.update.sid,
            listId: vm.update.sid,
            previousListId: vm.update.psid
          };
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.promotedemotelist, params, '', header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              case 4006:
                vm.update = {};
                console.log(response.message);
                break;
              case 4004:
                console.log(response.message);
                vm.update = {};
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      }
    };

    const confirmTemplate = (temp, status) => {
      if (temp === 'Frozen') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br/>' +
          ' *will be locked and can not be moved out.<br/>' +
          ' Would you still like to proceed?</h2>';
      } else if (temp === 'FrozenAndReleased') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br/>' +
          '* will be locked and can not be moved out, AND<br/>' +
          `* 'Affected Objects' status will be changed to ${status} automatically<br/>` +
          'Would you still like to proceed?</h2>';
      } else if (temp === 'Released') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br/>' +
          `* 'Affected Objects' status will be changed to ${status} automatically<br/>` +
          'Would you still like to proceed?</h2>';
      } else if (temp === 'FromFrozen') {
        return '<h2 class="md-title ng-binding">The list from which you move the card is frozen.<br/>*' +
          'Would you still like to proceed?</h2>';
      }
    };

    const confirmProcess = (temp, status) => {
      return $mdDialog.confirm({
        template: '<md-dialog md-theme="default" aria-label="Release List" ng-class="dialog.css" class="_md md-default-theme md-transition-in" role="dialog" tabindex="-1" aria-describedby="dialogContent_25">' +
          '<md-dialog-content class="md-dialog-content" role="document" tabindex="-1" id="dialogContent_25">' +
          confirmTemplate(temp, status) +
          '<div class="md-dialog-content-body ng-scope">' +
          '<p class="ng-binding"></p>' +
          '</div>' +
          '</md-dialog-content>' +
          '<md-dialog-actions>' +
          '<button class="md-primary md-cancel-button md-button ng-scope md-default-theme md-ink-ripple" type="button" ng-click="dialog.abort()"><span class="ng-binding ng-scope">No, move it back to original list</span></button><button class="md-primary md-confirm-button md-button md-ink-ripple md-default-theme" type="button" ng-click="dialog.hide()" ">' +
          '<span class="ng-binding ng-scope">Yes</span>' +
          '</button>' +
          '</md-dialog-actions>' +
          '</md-dialog>',
        parent: $document.find('#scrumboard'),
        ariaLabel: 'Lock list',
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Yes',
        cancel: 'No, move it back to original list'
      });
    };

    const confirmFrozenProcess = () => {
      $mdDialog.show(confirmProcess('Frozen')).then(function () {
        confirmDragYes();
      }, function () {
        confirmDragNo();
      });
    };

    const confirmFrozenAndReleasedProcess = (val, status) => {
      $mdDialog.show(confirmProcess('FrozenAndReleased', status)).then(function () {
        dragToReleaseList(val, true, status);
      }, function () {
        confirmDragNo();
      });
    };

    const confirmReleasedProcess = (val, status) => {
      $mdDialog.show(confirmProcess('Released', status)).then(function () {
        dragToReleaseList(val, true, status);
      }, function () {
        confirmDragNo();
      });
    };

    const confirmFromFrozenToReleaseAndFrozenProcess = (val, status) => {
      $mdDialog.show(confirmProcess('FromFrozen')).then(function () {
        confirmFrozenAndReleasedProcess(val, status);
      }, function () {
        confirmDragNo();
      });
    };

    const confirmFromFrozenToFrozenProcess = () => {
      $mdDialog.show(confirmProcess('FromFrozen')).then(function () {
        confirmFrozenProcess();
      }, function () {
        confirmDragNo();
      });
    };

    const confirmFromFrozenToReleaseProcess = (val, status) => {
      $mdDialog.show(confirmProcess('FromFrozen')).then(function () {
        confirmReleasedProcess(val, status);
      }, function () {
        confirmDragNo();
      });
    };

    const confirmFromFrozenProcess = () => {
      $mdDialog.show(confirmProcess('FromFrozen')).then(function () {
        confirmDragYes();
      }, function () {
        confirmDragNo();
      });
    };

    const matcherPopup = {
      Frozen: confirmFrozenProcess,
      FrozenAndReleased: confirmFrozenAndReleasedProcess,
      Released: confirmReleasedProcess,
      FromFrozenToReleaseAndFrozen: confirmFromFrozenToReleaseAndFrozenProcess,
      FromFrozenToFrozen: confirmFromFrozenToFrozenProcess,
      FromFrozenToRelease: confirmFromFrozenToReleaseProcess,
      FromFrozen: confirmFromFrozenProcess,
      DragNo: confirmDragNo,
      DragYes: confirmDragYes
    };

    const checkLists = (values) => {
      if (values.frozenList === 'true' && !values.objectStatus &&
        vm.valueSid.frozenList === 'false') {
        return 'Frozen';
      } else if (values.frozenList === 'true' && values.objectStatus &&
        vm.valueSid.frozenList === 'false') {
        return 'FrozenAndReleased';
      } else if (values.frozenList === 'false' && values.objectStatus &&
        vm.valueSid.frozenList === 'false') {
        return 'Released';
      } else if (values.objectStatus && values.frozenList === 'true' &&
        values.id !== vm.update.sid && vm.valueSid.frozenList === 'true' &&
        vm.sessionData.userRoleSet[0] === 'customer_admin') {
        return 'FromFrozenToReleaseAndFrozen';
      } else if (values.frozenList === 'true' && !values.objectStatus &&
        values.id !== vm.update.sid && vm.valueSid.frozenList === 'true' &&
        vm.sessionData.userRoleSet[0] === 'customer_admin') {
        return 'FromFrozenToFrozen';
      } else if (values.frozenList === 'false' && values.objectStatus &&
        values.id !== vm.update.sid && vm.valueSid.frozenList === 'true' &&
        vm.sessionData.userRoleSet[0] === 'customer_admin') {
        return 'FromFrozenToRelease';
      } else if (values.id !== vm.update.sid && vm.valueSid.frozenList === 'true' &&
        vm.sessionData.userRoleSet[0] === 'customer_admin') {
        return 'FromFrozen';
      } else if (vm.valueSid.frozenList === 'true' && vm.sessionData.userRoleSet[0] !== 'customer_admin') {
        return 'DragNo';
      } else {
        return 'DragYes';
      }
    };

    vm.sortableCardOptions = {
      appendTo: 'body',
      delay: 75,
      distance: 7,
      forceHelperSize: true,
      forcePlaceholderSize: true,
      connectWith: '.list-cards',
      handle: msUtils.isMobile() ? '.list-card-sort-handle' : false,
      disabled: false,
      helper: function (event, el) {
        return el.clone().addClass('list-card-sort-helper');
      },
      placeholder: 'list-card card-sortable-placeholder',
      tolerance: 'pointer',
      scroll: false,
      sort: function (event, ui) {
        var listContentEl = ui.placeholder.closest('.list-content');
        var boardContentEl = ui.placeholder.closest('#board');
        if (listContentEl) {
          var listContentElHeight = listContentEl[0].clientHeight,
            listContentElScrollHeight = listContentEl[0].scrollHeight;

          if (listContentElHeight !== listContentElScrollHeight) {
            var itemTop = ui.position.top,
              itemBottom = itemTop + ui.item.height(),
              listTop = listContentEl.offset().top,
              listBottom = listTop + listContentElHeight;

            if (itemTop < listTop + 25) {
              listContentEl.scrollTop(listContentEl.scrollTop() - 25);
            }

            if (itemBottom > listBottom - 25) {
              listContentEl.scrollTop(listContentEl.scrollTop() + 25);
            }
          }
        }

        if (boardContentEl) {
          var boardContentElWidth = boardContentEl[0].clientWidth;
          var boardContentElScrollWidth = boardContentEl[0].scrollWidth;

          if (boardContentElWidth !== boardContentElScrollWidth) {
            var itemLeft = ui.position.left,
              itemRight = itemLeft + ui.item.width(),
              boardLeft = boardContentEl.offset().left,
              boardRight = boardLeft + boardContentElWidth;

            if (itemLeft < boardLeft + 25) {
              boardContentEl.scrollLeft(boardContentEl.scrollLeft() - 25);
            }

            if (itemRight > boardRight) {
              boardContentEl.scrollLeft(boardContentEl.scrollLeft() + 25);
            }
          }
        }
      },
      create: function (ev, ui) {
        vm.allLists.push($(this));
      },
      start: function (ev, ui) {
        $scope.startElem = $(this);
        vm.update.bid = BoardService.data.id;
        vm.update.sid = ui.item.find('.list-list-id').text().trim();
        vm.update.cid = ui.item.find('.list-card-id').text();
        vm.update.name = ui.item.find('.list-card-name').text();
        $scope.currentCard = ui.item.find('.list-card-name');
        vm.hidePopup();
      },
      stop: function (ev, ui) {
        angular.forEach(vm.board.lists, function (values, keys) {
          if (values.id == vm.update.sid) {
            vm.valueSid = values;
          }
        });

        if (vm.sessionData.proxy === true) {
          params = {
            boardId: vm.update.bid,
            cardId: vm.update.cid,
            customerId: vm.sessionData.customerAdminId
          };
        } else {
          params = {
            boardId: vm.update.bid,
            cardId: vm.update.cid
          };
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.checkuseraccessforcard, params, '', header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.progressEmail = false;
                angular.forEach(vm.board.lists, function (values, keys) {
                  angular.forEach(values.idCards, function (val, key) {
                    if (val === vm.update.cid) {
                      const objectStatus = values.objectStatus ? values.objectStatus : '';
                      if (objectStatus) {
                        matcherPopup[checkLists(values)](val, objectStatus);
                      } else {
                        matcherPopup[checkLists(values)](val);
                      }
                    }
                  });
                });
                break;
              case 1006:
                confirmDragNo(true);
                //For Progress Loader
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              case 4006:
                vm.update = {};
                console.log(response.message);
                break;
              case 4004:
                console.log(response.message);
                vm.update = {};
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });

      }
    };

    // Methods
    vm.openCardDialog = DialogService.openCardDialog;
    vm.changePath = changePath;
    //vm.addNewList = addNewList;
    vm.updateBoardList = updateBoardList;
    vm.removeList = removeList;
    vm.cardFilter = cardFilter;
    vm.isOverdue = isOverdue;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    /* format date string */
    vm.formatDate = formatDate;
    vm.ListSetting = ListSetting;
    vm.ListReleaseObject = ListReleaseObject;
    vm.Listapprove = Listapprove;
    vm.checkBoardName = checkBoardName;

    function checkBoardName(boardName, list) {
      if (boardName.trim && (boardName.trim().length === 0)) {
        list.incorrectNameChosen = true;
        return '';
      }
    }

    /**
     * format date
     * @param dt - date string
     * @returns {string} - valid date string
     */
    function changePath() {
      $state.go('app.customer.scrumboard.boards.board', {
        cardId: undefined
      }, {
        notify: false
      }, {
        reload: false
      });
      introJs().hideHint(0);
      getBoardsData();
    }

    //handle SendUp event
    $scope.$on("SendCardData", (event, val) => {
      vm.board.cards.forEach(card => {
        if (val.id === card.id) {
          card.idChangeItems = val.idChangeItems;
          card.idChangeItemsList = val.idChangeItemsList;
        }
      });
    });

    function formatDate(dt) {
      return moment(new Date(dt)).format('D MMM YYYY'); //.format('DD-MM-YYYY');
    }

    if ($state.params.cardId !== undefined) {
      vm.openCardDialog(null, $state.params.cardId, vm.changePath, vm.tasks, '');
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (angular.isDefined(nameOfOwner)) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    vm.boardList = ScrumboardService.allBoardsData;
    vm.boardIdFunction = boardIdFunction;
    $rootScope.updateBoardAfterRemovingCard = updateBoardAfterRemovingCard;

    ////////
    init();

    $scope.$on('refreshBoardView', refreshBoardView);

    function refreshBoardView() {
      $rootScope.$emit('boardLoaded', true);
      boardIdFunction(true);
    }

    /**
     * Initialize
     */
    function init() {
      $rootScope.$emit('boardLoaded', true);
      getBoardsData();

      $timeout(function () {
        // IE list-content max-height hack
        if (angular.element('html').hasClass('explorer')) {
          // Calculate the height for the first time
          calculateListContentHeight();

          // Attach calculateListContentHeight function to window resize
          $window.onresize = function () {
            calculateListContentHeight();
          };
        }
      }, 0);

    }

    function getBoardsData(update) {
      boardIdFunction(update);
    }

    $rootScope.filterCardDate($rootScope.selectedFilter.dueDate);

    function filterCardDate(range) {
      if (range != 'ALL') {
        $rootScope.flagIdCardsFilterOn = true;
      } else {
        $rootScope.flagIdCardsFilterOn = false;
      }

      if (vm.flagIdCardsNoFilter) {
        angular.forEach(vm.board.lists, function (list) {
          list.idCards = list.idCardsNoFilter;
        });
      }
      vm.filterByDate.currentRange = range;
      if (vm.board.cards) {
        vm.filterByDate.dueCards[vm.filterByDate.currentRange].cards = [];
        angular.forEach(vm.board.cards, function (card) {
          vm.filterByDate.dueCards.ALL.cards.push(card.id);
          if (card.due >= tomorrow - oneDay && card.due < tomorrow) {
            vm.filterByDate.dueCards.TD.cards.push(card.id);
          }
          if (card.due < next3days && card.due >= tomorrow - oneDay) {
            vm.filterByDate.dueCards.N3D.cards.push(card.id);
          }
          if (card.due < next7days && card.due >= tomorrow - oneDay) {
            vm.filterByDate.dueCards.N7D.cards.push(card.id);
          }
          if ((card.due < (yesterday + oneDay)) && (card.due > 0)) {
            vm.filterByDate.dueCards.OD.cards.push(card.id);
          }
          if (card.due < next2weeks && card.due >= tomorrow - oneDay) {
            vm.filterByDate.dueCards.N2W.cards.push(card.id);
          }
        });
        angular.forEach(vm.board.lists, function (list) {
          vm.flagIdCardsNoFilter = true;
          list.idCardsNoFilter = list.idCards;
          var cardsId = [];
          angular.forEach(list.idCards, function (id) {
            angular.forEach(vm.filterByDate.dueCards[vm.filterByDate.currentRange].cards, function (filterId) {
              if (id == filterId) {
                cardsId.push(filterId);
              }
            });
          });
          list.idCards = cardsId;
        });
        vm.filterLists = vm.board.lists;
      }
    };

    function boardIdFunction(update) {
      vm.progress = true;
      angular.forEach(vm.board.cards, function(value, key){
        value.idAttachmentCover = '';
        value.checkItems = 0;
        value.checkItemsChecked = 0;
      });

      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : undefined,
        boardId: BoardService.data.id !== undefined ? BoardService.data.id : $stateParams.id
      };

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.boardbyidnew, params, '', header, update)
        .then(function (response) {
          switch (response.code) {
            case 0:
              angular.forEach(response.data.cards, function (value, key) {
                value.cardTypeId = 'c6f3f5aee4974d27862e7dc2c483c3df';
                if (value.description == null) {
                  value.description = '';
                }
              });
              vm.allowChoosingTemplates = response.data.allowChoosingTemplates;
              if (response.data.allowChoosingTemplates) {
                vm.templateCardsList = response.data.templatesCardList;
              }
              if (response.data.settings.cardCoverImages === 'true') {
                response.data.settings.cardCoverImages = true;
              }
              if (response.data.settings.cardCoverImages === 'false') {
                response.data.settings.cardCoverImages = false;
              }
              if (response.data.isWhereused === 'true') {
                vm.isWhereused = true;
              } else {
                vm.isWhereused = false;
              }
              if (response.data.isResolutionTask === 'true') {
                vm.isResolutionTask = true;
              } else {
                vm.isResolutionTask = false;
              }
              if (response.data.isRevModification === 'true') {
                vm.isRevModification = true;
              } else {
                vm.isRevModification = false;
              }
              vm.board = {
                id: response.data.id,
                name: response.data.name,
                boardRole: response.data.boardRole,
                cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3dh',
                settings: {
                  color: response.data.settings.color,
                  subscribed: response.data.settings.subscribed,
                  cardCoverImages: response.data.settings.cardCoverImages
                },
                isWhereused: vm.isWhereused,
                isResolutionTask: vm.isResolutionTask,
                isRevModification: vm.isRevModification,
                lists: response.data.lists,
                cards: response.data.cards,
                members: response.data.members,
                labels: response.data.labels,
                changeItems: response.data.changeItems
              };
              if (vm.flagIdCardsNoFilter) {
                //vm.board.lists = vm.filterLists ;
                angular.forEach(vm.board.lists, function (list) {
                  list.idCardsNoFilter = list.idCards;
                });
                $rootScope.filterCardDate($rootScope.selectedFilter.dueDate);
              }
              BoardService.data = vm.board;
              vm.board = response.data;
              vm.defaultcardId = response.data.defaultCard;
              vm.sortableCardOptions.disabled = false;
              $scope.$emit('promoteDemoteInProgress', vm.sortableCardOptions.disabled);
              $rootScope.$emit('boardLoaded', false);
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        }).catch(function (response) {
        console.log(response.message);
      });
    }

    function updateBoardAfterRemovingCard() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          boardId: BoardService.data.id
        };
      } else {
        params = {
          boardId: BoardService.data.id
        };
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.boardbyidnew, params, '', header, true)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.board = {
                id: response.data.id,
                name: response.data.name,
                boardRole: response.data.boardRole,
                cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3dh',
                settings: {
                  color: response.data.settings.color,
                  subscribed: response.data.settings.subscribed,
                  cardCoverImages: response.data.settings.cardCoverImages
                },
                isWhereused: vm.isWhereused,
                isResolutionTask: vm.isResolutionTask,
                isRevModification: vm.isRevModification,
                lists: response.data.lists,
                cards: response.data.cards,
                members: response.data.members,
                labels: response.data.labels,
                changeItems: response.data.changeItems
              };
              BoardService.data = vm.board;
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        }).catch(function (response) {
        console.log(response.message);
      });
    }

    /**
     * IE ONLY
     * Calculate the list-content height
     * IE ONLY
     */
    function calculateListContentHeight() {
      var boardEl = angular.element('#board');
      var boardElHeight = boardEl.height();

      boardEl.find('.list-wrapper').each(function (index, el) {
        // Get the required heights for calculations
        var listWrapperEl = angular.element(el),
          listHeaderElHeight = listWrapperEl.find('.list-header').height(),
          listFooterElHeight = listWrapperEl.find('.list-footer').height();

        // Calculate the max height
        var maxHeight = boardElHeight - listHeaderElHeight - listFooterElHeight;

        // Add the max height
        listWrapperEl.find('.list-content').css({
          'max-height': maxHeight
        });
      });
    }

    /**
     * Update list
     */
    function updateBoardList(list) {
      $rootScope.$emit('boardLoaded', true);

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        };
      }

      if (list) {
        if (list.id) {
          data = {
            boardId: vm.board.id,
            list: [{
              listId: list.id,
              listTitle: list.name
            }]
          };

        }
      } else {
        data = {
          boardId: BoardService.data.id,
          list: [{
            listTitle: vm.newListName
          }]
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:

              var lists = [];
              var cardList = [];
              if (response.data.list) {
                if (response.data.list.length > 0) {
                  angular.forEach(response.data.list, function (value, key) {
                    if (value.cardList) {
                      if (value.cardList.length > 0) {
                        angular.forEach(value.cardList, function (value2, key2) {
                          var idChangeItems = [];
                          angular.forEach(value2.changeItemList, function (value3, key3) {
                            idChangeItems.push(value3.id);
                          });
                          cardList.push({
                            id: value2.cardId,
                            name: value2.cardTitle,
                            description: value2.cardDescription,
                            idAttachmentCover: value2.idAttachmentCover,
                            idMembers: value2.idMembers,
                            idLabels: value2.idLabels,
                            cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                            idChangeItems: idChangeItems,
                            idChangeItemsList: value2.changeItemList,
                            attachments: value2.attachments,
                            subscribed: false,
                            checklists: value2.checklists,
                            checkItems: value2.checkItems.length,
                            checkItemsChecked: value2.checkItemsChecked,
                            comments: value2.comments,
                            activities: value2.activities,
                            due: value2.dueDate,
                            resolutionTasksTab: response.data.isResolutionTask,
                            modificationsTab: response.data.isRevModification,
                            whereUsedTab: response.data.isWhereused,
                            modifications: value2.modifications,
                            resolutionTasks: value2.resolutionTasks,
                            whereUsed: value2.whereUsed
                          });
                        });
                      }
                    }
                    lists.push({
                      id: value.listId,
                      name: value.listTitle,
                      frozenList: value.frozenList,
                      approveMandatory: value.approveMandatory,
                      idCards: value.cardIdSet
                    });
                  });
                }
              }

              vm.board = BoardService.data;
              vm.board.id = response.data.boardId;
              vm.board.isWhereused = BoardService.data.isWhereused;
              vm.board.isResolutionTask = BoardService.data.isResolutionTask;
              vm.board.isRevModification = BoardService.data.isRevModification;
              vm.board.lists = lists;
              vm.newListName = '';
              getBoardsData(true);
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              break;
            case 1006:
              vm.board = vm.boardCopy;
              var lists = [];
              var cardList = [];
              if (vm.boardCopy.lists) {
                if (vm.boardCopy.lists.length > 0) {
                  angular.forEach(vm.boardCopy.lists, function (value, key) {
                    lists.push({
                      id: value.id,
                      name: value.name,
                      frozenList: value.frozenList,
                      approveMandatory: value.approveMandatory,
                      idCards: value.idCards
                    });
                  });
                }
              }
              if (vm.boardCopy.cards) {
                if (vm.boardCopy.cards.length > 0) {
                  angular.forEach(vm.boardCopy.cards, function (value2, key2) {
                    var idChangeItems = [];
                    angular.forEach(value2.idChangeItems, function (value3, key3) {
                      idChangeItems.push(value3.idChangeItems);
                    });
                    cardList.push({
                      id: value2.id,
                      name: value2.name,
                      description: value2.description,
                      idAttachmentCover: value2.idAttachmentCover,
                      idMembers: value2.idMembers,
                      idLabels: value2.idLabels,
                      cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                      idChangeItems: idChangeItems,
                      attachments: value2.attachments,
                      subscribed: false,
                      checklists: value2.checklists,
                      checkItems: value2.checkItems,
                      checkItemsChecked: value2.checkItemsChecked,
                      comments: value2.comments,
                      activities: value2.activities,
                      due: value2.due,
                      resolutionTasksTab: response.data.isResolutionTask,
                      modificationsTab: response.data.isRevModification,
                      whereUsedTab: response.data.isWhereused,
                      modifications: value2.modifications,
                      resolutionTasks: value2.resolutionTasks,
                      whereUsed: value2.whereUsed
                    });
                  });
                }
              }
              vm.board = BoardService.data;
              vm.board.id = vm.boardCopy.id;
              vm.board.isWhereused = vm.boardCopy.isWhereused;
              vm.board.isResolutionTask = vm.boardCopy.isResolutionTask;
              vm.board.isRevModification = vm.boardCopy.isRevModification;
              vm.board.lists = lists;
              vm.board.cards = cardList;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            case 4006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
        });
    }

    /**
     * Remove list
     *
     * @param ev
     * @param list
     */
    function removeList(ev, index) {
      vm.hidePopup();
      var confirm = $mdDialog.confirm({
        title: 'Remove List',
        parent: $document.find('#scrumboard'),
        textContent: 'Are you sure want to remove list?',
        ariaLabel: 'remove list',
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Remove',
        cancel: 'Cancel'
      });
      $mdDialog.show(confirm).then(function () {
        var list = vm.board.lists.splice(index, 1);
        var id = list[0].id;

        if (vm.sessionData.proxy === true) {
          params = {
            boardId: BoardService.data.id,
            listId: id,
            customerId: vm.sessionData.customerAdminId
          };
        } else {
          params = {
            boardId: BoardService.data.id,
            listId: id,
            customerId: vm.sessionData.userId
          };
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removelist, params, '', header)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                $mdToast.show($mdToast.simple().textContent('Remove List Successfully...').position('top right'));
                break;
              case 21:
                boardIdFunction(true);
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              case 4004:
                console.log(response.message);
                break;
              case 1006:
                console.log(response.message);
                break;
              case 4006:
                console.log(response.message);
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
          });

      }, function () {
        // Canceled
      });
    }

    function Listapprove(lists, event, index) {
      $scope.flagApprove = true;
      if (lists.approveMandatory == 'false') {
        lists.approveMandatory = 'true';
      } else {
        lists.approveMandatory = 'false';
      }

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        };
      }
      vm.board = BoardService.data;
      var checkedArr = [];
      for (var i = 0; i < lists.idCards.length; ++i) {
        if (vm.board.cards.getById(lists.idCards[i]).checkItemsChecked === vm.board.cards.getById(lists.idCards[i]).checkItems) {
          checkedArr.push('true');
        }
      }

      data = {
        boardId: BoardService.data.id,
        list: [{
          listId: lists.id,
          approveMandatory: lists.approveMandatory
        }]
      };
      vm.showPopup();
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              var lists = [];
              var cardList = [];
              if (response.data.list) {
                if (response.data.list.length > 0) {
                  angular.forEach(response.data.list, function (value, key) {
                    if (value.cardList) {
                      if (value.cardList.length > 0) {
                        var flag = false;
                        angular.forEach(value.cardList, function (value2, key2) {
                          var idChangeItems = [];
                          var total = 0;
                          var checked = 0;
                          if (value2.cardDescription === null) {
                            value2.cardDescription = '';
                          }
                          angular.forEach(vm.tasks, function (val) {
                            if (value2.cardId === val.cardId) {
                              total++;
                              if (val.completed === true) {
                                checked++;
                              }
                              flag = true;
                            }
                          });
                          angular.forEach(value2.changeItemList, function (value3, key3) {
                            idChangeItems.push(value3.id);
                          });
                          cardList.push({
                            id: value2.cardId,
                            name: value2.cardTitle,
                            description: value2.cardDescription,
                            idAttachmentCover: value2.idAttachmentCover,
                            idMembers: value2.membersIdList,
                            idLabels: value2.idLabels,
                            cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                            idChangeItems: idChangeItems,
                            idChangeItemsList: value2.changeItemList,
                            attachments: value2.attachmentsList,
                            subscribed: false,
                            checklists: value2.changeItemList,
                            checkItems: total || 0,
                            checkItemsChecked: checked || 0,
                            comments: value2.comments,
                            activities: value2.activities,
                            due: value2.dueDate,
                            resolutionTasksTab: response.data.isResolutionTask,
                            modificationsTab: response.data.isRevModification,
                            whereUsedTab: response.data.isWhereused,
                            modifications: value2.modifications,
                            resolutionTasks: value2.resolutionTasks,
                            whereUsed: value2.whereUsed
                          });
                        });
                      }
                    }
                    lists.push({
                      id: value.listId,
                      name: value.listTitle,
                      frozenList: value.frozenList,
                      objectStatus: value.objectStatus,
                      approveMandatory: value.approveMandatory,
                      idCards: value.cardIdSet
                    });
                  });
                }
              }

              vm.board = BoardService.data;
              vm.board.id = response.data.boardId;
              vm.board.isWhereused = BoardService.data.isWhereused;
              vm.board.isResolutionTask = BoardService.data.isResolutionTask;
              vm.board.isRevModification = BoardService.data.isRevModification;
              vm.board.lists = lists;
              vm.board.cards = cardList;
              getBoardsData(true);
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              break;
            case 1006:
              vm.newListName = '';
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            case 4006:
              console.log(response.message);
              break;
            case 4004:
              vm.newListName = '';
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function ListSetting(lists, event, index) {
      if ($scope.flagApprove == true) {
        if (lists.frozenList == 'false') {
          vm.hidePopup();
        } else {
          vm.showPopup();
        }
      }
      var lockList = function () {
        if (lists.frozenList == 'false') {
          lists.frozenList = 'true';
        } else {
          lists.frozenList = 'false';
        }
        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId
          };
        } else {
          params = {
            customerId: vm.sessionData.userId
          };
        }

        data = {
          boardId: BoardService.data.id,
          list: [{
            listId: lists.id,
            frozenList: lists.frozenList
          }]
        };
        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                var lists = [];
                var cardList = [];
                if (response.data.list) {
                  if (response.data.list.length > 0) {
                    angular.forEach(response.data.list, function (value, key) {
                      if (value.cardList) {
                        if (value.cardList.length > 0) {
                          var flag = false;
                          angular.forEach(value.cardList, function (value2, key2) {
                            var idChangeItems = [];
                            var total = 0;
                            var checked = 0;
                            if (value2.cardDescription === null) {
                              value2.cardDescription = '';
                            }
                            angular.forEach(vm.tasks, function (val) {
                              if (value2.cardId === val.cardId) {
                                total++;
                                if (val.completed === true) {
                                  checked++;
                                }
                                flag = true;
                              }
                            });
                            angular.forEach(value2.changeItemList, function (value3, key3) {
                              idChangeItems.push(value3.id);
                            });
                            cardList.push({
                              id: value2.cardId,
                              name: value2.cardTitle,
                              description: value2.cardDescription,
                              idAttachmentCover: value2.idAttachmentCover,
                              idMembers: value2.membersIdList,
                              idLabels: value2.idLabels,
                              cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                              idChangeItems: idChangeItems,
                              idChangeItemsList: value2.changeItemList,
                              attachments: value2.attachmentsList,
                              subscribed: false,
                              checklists: value2.changeItemList,
                              checkItems: total || 0,
                              checkItemsChecked: checked || 0,
                              comments: value2.comments,
                              activities: value2.activities,
                              due: value2.dueDate,
                              resolutionTasksTab: response.data.isResolutionTask,
                              modificationsTab: response.data.isRevModification,
                              whereUsedTab: response.data.isWhereused,
                              modifications: value2.modifications,
                              resolutionTasks: value2.resolutionTasks,
                              whereUsed: value2.whereUsed
                            });
                          });
                        }
                      }
                      lists.push({
                        id: value.listId,
                        name: value.listTitle,
                        frozenList: value.frozenList,
                        objectStatus: value.objectStatus,
                        approveMandatory: value.approveMandatory,
                        idCards: value.cardIdSet
                      });
                    });
                  }
                }

                vm.board = BoardService.data;
                vm.board.id = response.data.boardId;
                vm.board.isWhereused = BoardService.data.isWhereused;
                vm.board.isResolutionTask = BoardService.data.isResolutionTask;
                vm.board.isRevModification = BoardService.data.isRevModification;
                vm.board.lists = lists;
                vm.board.cards = cardList;
                getBoardsData(true);
                $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
                break;
              case 1006:
                vm.newListName = '';
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              case 4006:
                console.log(response.message);
                break;
              case 4004:
                vm.newListName = '';
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      };
      lockList();
    }

    vm.changeProgress = changeProgress;

    function changeProgress() {
      vm.progress = false;
    }

    function ListReleaseObject(lists, event, check) {
      if ($scope.flagApprove === true) {
        if (lists.objectStatus !== 'Released') {
          vm.hidePopup();
        } else {
          vm.showPopup();
        }
      }
      vm.previousStatus = vm.boardCopy.lists.find(item => item.id === lists.id) ? vm.boardCopy.lists.find(item => item.id === lists.id).objectStatus : null;
      let confirm;
      if (vm.previousStatus && !check) {
        confirm = $mdDialog.confirm()
          .ariaLabel('Change Status')
          .htmlContent(`<h2 class=\'md-title ng-binding\'>Are you sure you want to change 'change status' value from '${vm.previousStatus}' to '${lists.objectStatus}'</h2>`)
          .ok('Yes, change value')
          .cancel('No');
      } else if (vm.previousStatus && check) {
        confirm = $mdDialog.confirm()
          .ariaLabel('Change Status')
          .htmlContent(`<h2 class=\'md-title ng-binding\'>Are you sure you want to disable 'change status'?</h2>`)
          .ok('Yes')
          .cancel('No');
      } else if (!vm.previousStatus && check) {
        confirm = $mdDialog.confirm()
          .ariaLabel('Change Status')
          .htmlContent(`<h2 class=\'md-title ng-binding\'>Are you sure you want to enable 'change status'?</h2>`)
          .ok('Yes')
          .cancel('No');
      } else {
        confirm = $mdDialog.confirm()
          .ariaLabel('Change Status')
          .htmlContent(`<h2 class=\'md-title ng-binding\'>Are you sure you want to change 'change status' value to '${lists.objectStatus}'</h2>`)
          .ok('Yes, change value')
          .cancel('No');
      }
      $('.md-open-menu-container').addClass('dialog-z-index');
      $mdDialog.show(confirm)
        .then(() => {
          $('.md-open-menu-container').removeClass('dialog-z-index');
          ReleaseObject();
        }, ()=> {
          $('.md-open-menu-container').removeClass('dialog-z-index');
          lists.objectStatus = vm.previousStatus ? vm.previousStatus : '';
        });




      var ReleaseObject = function () {
        if (check && (lists.objectStatus === 'Released' || lists.objectStatus === 'InDevelopment' || lists.objectStatus === 'Obsolete')) {
          lists.objectStatus = '';
        }

        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId
          };
        }

        data = {
          boardId: BoardService.data.id,
          list: [{
            listId: lists.id,
            frozenList: lists.frozenList,
            objectStatus: lists.objectStatus
          }]
        };

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                var lists = [];
                var cardList = [];
                if (response.data.list) {
                  if (response.data.list.length > 0) {
                    angular.forEach(response.data.list, function (value, key) {
                      if (value.cardList) {
                        if (value.cardList.length > 0) {
                          var flag = false;
                          angular.forEach(value.cardList, function (value2, key2) {
                            var idChangeItems = [];
                            var total = 0;
                            var checked = 0;
                            if (value2.cardDescription === null) {
                              value2.cardDescription = '';
                            }
                            angular.forEach(vm.tasks, function (val) {
                              if (value2.cardId === val.cardId) {
                                total++;

                                if (val.completed === true) {
                                  checked++;
                                }
                                flag = true;
                              }
                            });
                            angular.forEach(value2.changeItemList, function (value3, key3) {
                              idChangeItems.push(value3.id);
                            });
                            cardList.push({
                              id: value2.cardId,
                              name: value2.cardTitle,
                              description: value2.cardDescription,
                              idAttachmentCover: value2.idAttachmentCover,
                              idMembers: value2.membersIdList,
                              idLabels: value2.idLabels,
                              cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                              idChangeItems: idChangeItems,
                              idChangeItemsList: value2.changeItemList,
                              attachments: value2.attachmentsList,
                              subscribed: false,
                              checklists: value2.changeItemList,
                              checkItems: total || 0,
                              checkItemsChecked: checked || 0,
                              comments: value2.comments,
                              activities: value2.activities,
                              due: value2.dueDate,
                              resolutionTasksTab: response.data.isResolutionTask,
                              modificationsTab: response.data.isRevModification,
                              whereUsedTab: response.data.isWhereused,
                              modifications: value2.modifications,
                              resolutionTasks: value2.resolutionTasks,
                              whereUsed: value2.whereUsed
                            });
                          });
                        }
                      }
                      lists.push({
                        id: value.listId,
                        name: value.listTitle,
                        frozenList: value.frozenList,
                        objectStatus: value.objectStatus,
                        approveMandatory: value.approveMandatory,
                        idCards: value.cardIdSet
                      });
                    });
                  }
                }
                vm.board = BoardService.data;
                vm.board.id = response.data.boardId;
                vm.board.isWhereused = BoardService.data.isWhereused;
                vm.board.isResolutionTask = BoardService.data.isResolutionTask;
                vm.board.isRevModification = BoardService.data.isRevModification;
                vm.board.lists = lists;
                vm.board.cards = cardList;
                vm.boardCopy = vm.board;
                getBoardsData(true);
                $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
                break;
              case 1006:
                vm.newListName = '';
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              case 4006:
                console.log(response.message);
                break;
              case 4004:
                vm.newListName = '';
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      };
    }

    /**
     * Card filter
     *
     * @param cardId
     * @returns {*}
     */
    function cardFilter(cardId) {
      var card = vm.board.cards.getById(cardId);
      vm.tasksCoutner = function (list) {
        return list.idCards.length;
      };
      try {
        if (angular.lowercase(card.name).indexOf(angular.lowercase(vm.cardFilters.name)) < 0
          || filterCardsByNumber(card) || filterCardsByPartNumber(card) || filterCardsByPartName(card)) {
          throw false;
        }

        angular.forEach(vm.cardFilters.labels, function (label) {
          if (label === 'undefined') {
            if (card.idLabels.length != 0) {
              if (!msUtils.exists(label, card.idLabels)) {
                throw false;
              }
            }
          } else {
            if (!msUtils.exists(label, card.idLabels)) {
              throw false;
            }
          }
        });

        angular.forEach(vm.cardFilters.members, function (member) {
          if (!msUtils.exists(member, card.idMembers)) {
            throw false;
          }
        });
      } catch (err) {
        return err;
      }
      return true;
    }

    function filterCardsByNumber(card) {
      var inputText = vm.cardFilters.companySeqId;
      return inputText.length ? angular.lowercase(card.companySeqId).indexOf(angular.lowercase(inputText)) === -1 : false;
    }

    function filterCardsByPartNumber(card) {
      const inputText = vm.cardFilters.partNumber;
      const cardsIds = vm.cardFilters.cardIds;
      if (inputText.length !== 0 && cardsIds.length === 0) {
        return true;
      }
      let filterResult = !cardsIds.some( id => id === card.id.toString());
      return inputText.length !== 0 ?  filterResult : false;
    }

    function filterCardsByPartName(card) {
      const inputText = vm.cardFilters.partName;
      const cardsIds = vm.cardFilters.cardIds;
      if (inputText.length !== 0 && cardsIds.length === 0) {
        return true;
      }
      let filterResult = !cardsIds.some( id => id === card.id.toString());

      return inputText.length !== 0 ?  filterResult : false;
    }

    /**
     * Is the card overdue?
     *
     * @param cardDate
     * @returns {boolean}
     */
    function isOverdue(cardDate) {
      if (angular.isDate(cardDate)) {
        return new Date() > cardDate;
      } else {
        return moment() > moment(cardDate, 'x');
      }
    }

    function dragToReleaseList(val, withoutConfirmFlag, status) {
      var card = _.find(vm.board.cards, function (card) {
        return card.id === val;
      });
      if (card.idChangeItems.length > 0) {
        openReleaseHierarchy(card.idChangeItems, false, status);
      } else {
        confirmDragYes();
      }
    }

    function openReleaseHierarchy(array, withoutHierarchy, status) {
      $mdDialog.show({
        controller: 'ReleaseHierarchyController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/release-hierarchy/release-hierarchy-dialog.html',
        parent: angular.element($document.find('#content-container')),
        clickOutsideToClose: false,
        locals: {
          Object: {
            status: status,
            arr: array,
            releaseHierarchy: vm.releaseHierarchy,
            releaseEditsHierarchy: vm.releaseEditsHierarchy,
            fromCards: true,
            withoutHierarchy: !vm.releaseHierarchy
          }
        }
      }).then(function (arr) {

        if (arr && arr.length > 0) {

          $mdDialog.show({
            controller: 'BulkReleaseController',
            controllerAs: 'vm',
            templateUrl: 'app/main/apps/objects/parts/tabs/bulk-release/bulk-release-hierarchy.html',
            parent: angular.element($document.find('#content-container')),
            clickOutsideToClose: false,
            locals: {
              status: status,
              Objects: arr,
              isBulkRelease: false,
              isHierarchicalBulkRelease: false
            }
          }).then(function () {
            confirmDragYes();
          }, function () {
          });

        } else {
          confirmDragYes();
        }

      }, function () {
        confirmDragNo();
      });
    }

    function confirmReleaseCard(array, withoutConfirmFlag) {
      if (withoutConfirmFlag && array) {
        array.forEach(function (row) {
          if (row.status === 'InDevelopment') {
            releasPartFunction(row);
          }
        });
        confirmDragYes();
      } else {
        var confirm = $mdDialog.confirm()
          .ariaLabel('Change Status')
          .htmlContent('<h2 class=\'md-title ng-binding\'>Cards moved to this list: <br>' +
            '*will be locked and can not be moved out, AND<br>' +
            '*Affected Objects will be released automatically <br> Would you still like to proceed?</h2>')
          .ok('Yes')
          .cancel('No, move it back to origin list');

        $mdDialog.show(confirm).then(function () {
          if (array) {
            array.forEach(function (row) {
              if (row.status === 'InDevelopment') {
                releasPartFunction(row);
              }
            });
            confirmDragYes();
          }
        }, function () {
          confirmDragNo();
        });
      }
    }

    function confirmDragNo(withoutMessageFlag) {
      vm.sortableCardOptions.disabled = true;
      $rootScope.$emit('boardLoaded', true);
      $scope.$emit('promoteDemoteInProgress', vm.sortableCardOptions.disabled);
      vm.progressEmail = true;
      angular.forEach(vm.board.lists, function (values, keys) {
        var did = values.id;
        angular.forEach(values.idCards, function (val, key) {
          if (val == vm.update.cid) {
            vm.update.did = did;
            if (values.idCards[key - 1] == undefined) {
              vm.update.pcid = null;
            } else {
              vm.update.pcid = values.idCards[key - 1];
            }
          }
        });
      });

      if (vm.sessionData.proxy === true) {
        params = {
          boardId: vm.update.bid,
          sourceListId: vm.update.sid,
          destinationListId: vm.update.sid,
          cardId: vm.update.cid,
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          boardId: vm.update.bid,
          sourceListId: vm.update.sid,
          destinationListId: vm.update.sid,
          cardId: vm.update.cid
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.promotedemote, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;

              angular.forEach(response.data.lists, function (value, key) {
                angular.forEach(response.data.cards, function (val, keys) {
                  if (vm.update.cid == val.id && vm.update.did == value.id) {
                    if (value.objectStatus === 'Released' && val.idChangeItems.length > 0) {
                      $mdToast.show($mdToast.simple().textContent('Card Affected Object is Released...').position('top right'));
                    }
                  }
                });
              });
              getBoardsData(true);
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              getBoardsData();
              break;
            case 4006:
              vm.update = {};
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              vm.update = {};
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function confirmDragYes() {
      vm.sortableCardOptions.disabled = true;
      $rootScope.$emit('boardLoaded', true);
      $scope.$emit('promoteDemoteInProgress', vm.sortableCardOptions.disabled);
      vm.progressEmail = true;
      var cid = vm.update.cid;
      angular.forEach(vm.board.lists, function (values, keys) {
        var did = values.id;
        angular.forEach(values.idCards, function (val, key) {
          if (val == vm.update.cid) {
            vm.update.did = did;
            if (values.idCards[key - 1] == undefined) {
              vm.update.pcid = null;
            } else {
              vm.update.pcid = values.idCards[key - 1];
            }
          }
        });
      });

      if (vm.sessionData.proxy === true) {
        params = {
          boardId: vm.update.bid,
          sourceListId: vm.update.sid,
          destinationListId: vm.update.did,
          cardId: vm.update.cid,
          previousCardId: vm.update.pcid,
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          boardId: vm.update.bid,
          sourceListId: vm.update.sid,
          destinationListId: vm.update.did,
          cardId: vm.update.cid,
          previousCardId: vm.update.pcid
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.promotedemote, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;
              angular.forEach(response.data.lists, function (value) {
                angular.forEach(response.data.cards, function (val) {
                  if (vm.update.cid === val.id && vm.update.did === value.id) {
                    if (value.objectStatus === 'Released' && val.idChangeItems.length > 0) {
                      $mdToast.show($mdToast.simple().textContent('Card Affected Object is Released...').position('top right'));
                    }
                  }
                });
              });
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              getBoardsData(true);
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              getBoardsData();
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            case 4006:
              vm.update = {};
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              vm.update = {};
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function releasPartFunction(row) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          isReleased: false
        };
      } else {
        params = {
          isReleased: false
        };
      }

      data = {
        objectId: row.id,
        status: 'Released'
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.changestatus, params, data, header)
        .then(function (response) {
          if (response.code == 0) {
          } else {
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    vm.changesDefaultTemplate = changesDefaultTemplate;
    vm.openCardTemplateTitle = openCardTemplateTitle;
    vm.closeCardTemplateTitle = closeCardTemplateTitle;
    vm.showFormCreateTemplateCard = showFormCreateTemplateCard;

    // vm.toggleCardTemplate = false;
    vm.toggleFormCreateTemplateCard = false;

    function openCardTemplateTitle(templateCardId, templateCardName) {
      // vm.toggleCardTemplate = vm.toggleCardTemplate ? false : true;
      vm.templateCardId = templateCardId;
      vm.templateCardName = templateCardName;
    }

    function showFormCreateTemplateCard() {
      vm.toggleFormCreateTemplateCard = true;
    }

    function closeCardTemplateTitle() {
      vm.newCardName = '';
      vm.defaultcardId = '';
      vm.toggleFormCreateTemplateCard = false;
    }

    function changesDefaultTemplate(templateCardId, templateCardName) {
      vm.progress = true;

      if (templateCardName === '') {
        return;
      }
      vm.listId = vm.board.lists['0'].id;
      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id,
          listId: vm.listId,
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          boardId: vm.board.id,
          listId: vm.listId,
          customerId: vm.sessionData.userId
        };
      }
      data = {
        cardTitle: templateCardName,
        isTemplate: false,
        fromTemplateCardId: templateCardId
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.progress = false;
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
                    description: '',
                    idAttachmentCover: '',
                    cardTypeId: vm.board.cardTypeId,
                    idMembers: [],
                    idLabels: [],
                    idChangeItems: [],
                    attachments: [],
                    subscribed: false,
                    checklists: [],
                    checkItems: '',
                    checkItemsChecked: '',
                    comments: [],
                    activities: [],
                    additionalInfo: response.data.additionalInfoList,
                    due: null,
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
              vm.newCardName = '';
              vm.defaultcardId = '';
              vm.openCardDialog(null, response.data.cardId, vm.changePath, vm.tasks, '');
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              break;
            case 1006:
              vm.newCardName = '';
              vm.defaultcardId = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass('md-error-toast-theme').position('top right').hideDelay(0));
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
})();
