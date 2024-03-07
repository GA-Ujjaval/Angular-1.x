(function () {
  'use strict';

  angular
    .module('app.chat-bot')
    .controller('MsPlmChatBotController', MsPlmChatBotController)
    .directive('compileTemplate', compileTemplate);

  /** @ngInject */
  function compileTemplate($compile, $parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(function () {
          return scope.$eval(attrs.compileTemplate);
        }, function (value) {
          // Incase value is a TrustedValueHolderType, sometimes it
          // needs to be explicitly called into a string in order to
          // get the HTML string.
          element.html(value && value.toString());
          // If scope is provided use it, otherwise use parent scope
          var compileScope = scope;
          if (attrs.bindHtmlScope) {
            compileScope = scope.$eval(attrs.compileTemplate);
          }
          $compile(element.contents())(compileScope);
        });
      }
    };
  }

  /** @ngInject */
  function MsPlmChatBotController($q, $rootScope, $location, AuthService, BoardService, BotService, $timeout, $document,
                                  msUtils, $mdDialog, $plmBot, errors, DialogService, $mdToast, ScrumboardService,
                                  hostUrlDevelopment, AdminService, introService, $state, GlobalSettingsService) {
    var vm = this;

    /**
     * private variables
     * @type {null}
     */
    var card = null;
    var haveToBeResetYourContext = false;

    var defaultReq = {
      "id": "d1219aaa-1218-46c8-adc0-1d893c815778",
      "timestamp": "2017-01-12T17:33:59.817Z",
      "result": {
        "source": "agent",
        "resolvedQuery": "",
        "action": "",
        "actionIncomplete": false,
        "parameters": {},
        "contexts": [],
        "metadata": {
          "intentId": "49cbf56c-fd80-4668-a8f4-599dc61c3343",
          "webhookUsed": "false",
          "webhookForSlotFillingUsed": "false",
          "intentName": ""
        },
        "fulfillment": {
          "speech": "",
          "messages": []
        },
        "score": 1
      },
      "status": {
        "code": 200,
        "errorType": "success"
      },
      "sessionId": ""
    };

    /**
     * Member variables
     */
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;
    vm.user = {};
    vm.chats = BotService.chats;
    vm.chat = [];
    vm.chatResponses = null;
    vm.replyMessage = '';
    vm.tasks = [];
    vm.members = BoardService.members;
    // Tasks will be filtered against these models
    vm.taskFilters = {
      search: '',
      idChangeItems: [],
      completed: '',
      deleted: false,
      important: '',
      starred: '',
      startDate: '',
      dueDate: ''
    };
    vm.taskFiltersDefaults = angular.copy(vm.taskFilters);
    vm.taskOrder = '';
    vm.taskOrderDescending = false;
    vm.createTaskInitialised = false;
    vm.previousAction = {
      name: '',
      actionIncomplete: false
    };
    // board card items
    vm.boardData = [];
    vm.boardList = [];
    vm.newCardTitle = '';
    vm.boardId = '';

    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';
    vm.plmDataDataHint = introService.getIntroObj('plmBotHint')[0].intro;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header---------------------------------------------------------------------------------------
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    // methods
    vm.reply = reply;
    vm.preventDefault = preventDefault;
    vm.filterByStartDate = filterByStartDate;
    vm.getChat = getChat;
    vm.assignedTasks = assignedTasks;
    vm.toggleCompleted = toggleCompleted;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    vm.formatDueDate = formatDueDate;
    vm.defaultAvatar = defaultAvatar;
    vm.isHtml = isHtml;
    /* Open Task Window */
    vm.openTaskDialog = openTaskDialog;

    vm.parsechatResponse = parsechatResponse;
    vm.isOverdue = isOverdue;
    /* format date string */
    vm.formatDate = formatDate;
    vm.getLabelsByCardId = getLabelsByCardId;
    vm.getNameOftheBoard = getNameOftheBoard;
    vm.setSelectedBoard = setSelectedBoard;
    vm.toggleImportant = toggleImportant;
    vm.toggleStarred = toggleStarred;
    vm.openTask = openTask;
    vm.openCard = openCard;
    vm.openCardDialog = DialogService.openCardDialog;
    vm.removeCard = removeCard;
    vm.openExistingTask = openExistingTask;
    vm.filterCardNames = filterCardNames;
    vm.toggleCardState = toggleCardState;
    vm.displayCardInfo = displayCardInfo;
    vm.hasSatisfyCheckListRules = hasSatisfyCheckListRules;
    vm.parseValue = parseValue;
    vm.checkBoardList = checkBoardList;

    //////////

    function parseValue(value) {
      value = value || 0;
      value = parseInt((value || 0), 10);
      return value;
    }

    function hasSatisfyCheckListRules(checklists) {
      var valid = false;
      checklists = checklists || [];

      if (checklists.length > 0) {

        if (parseInt(checklists[0].checkItemsChecked, 10) || 0 !== (checklists[0].checkItems || []).length) {
          valid = true;
        }

      }
      return valid;
    }

    function displayCardInfo(list) {
      return `${list.name}.
        ${list.frozenList === 'true' ? 'List locked.' : ''}
        ${list.objectStatus ? 'Change status.' : ''}`;
    }

    /**
     * Change state names
     * @param cards
     * @param cardId
     * @returns {Array}
     */
    function filterCardNames(cards, cardId) {

      var list = [];

      angular.forEach((cards || []), function (c, i) {

        if (!((c.idCards || []).indexOf(cardId) > -1)) {
          list.push(c);
        }
      });

      return list;

    }

    /**
     * Prevent default
     *
     * @param e
     */
    function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * Get Card List
     */
    function getCardList() {
      var response;
      for (var i = 0, len = vm.board.lists.length; i < len; i++) {
        if (vm.board.lists[i].idCards.indexOf(vm.card.id) > -1) {
          response = vm.board.lists[i];
          break;
        }
      }
      return response;
    }

    /**
     * Remove card
     *
     * @param ev
     */
    function removeCard(event, card) {
      event.stopPropagation();
      var confirm = $mdDialog.confirm({
        title: 'Remove Card',
        parent: $document.find('#plm-chat-app'),
        textContent: 'Are you sure want to remove card?',
        ariaLabel: 'remove card',
        targetEvent: event,
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Remove',
        cancel: 'Cancel'
      });

      $mdDialog.show(confirm).then(function () {
        var clone = angular.copy(defaultReq);
        clone.result.parameters.cardId = card.id;
        clone.result.action = 'deleteCard';
        sendBackendXmlHttpRequest(clone, true);
      }, function () {
        // Canceled
      });
    }

    /**
     * get selected board
     */
    function setSelectedBoard(board, dialog) {

      dialog.backendOuput.disableBoard = true;
      board.selected = true;

      if ((board.list || []).length > 0) {

        $timeout(function () {

          var copy = angular.copy(defaultReq);

          copy.result.action = 'createCard';
          copy.result.parameters = {};
          copy.result.parameters.cardTitle = vm.chat[vm.chat.length - 2].resolvedQuery;
          copy.result.parameters.boardId = board.boardId;
          copy.result.parameters.listId = board.list[0].listId;

          // Call create card virtual bot api
          sendBackendXmlHttpRequest(copy);

        }, 2000);

      } else {
        $mdToast.show($mdToast.simple().textContent("Problem in creating a card, check with your administrator").action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
        //$mdToast.show($mdToast.simple().textContent("Problem in creating a card, check with your administrator").position('top right'));
      }
    }


    /**
     * Get Name Of the board
     * @param cardTypeId
     * @returns {*}
     */
    function getNameOftheBoard(board, cardId) {
      var boardName = '';
      angular.forEach(board.lists, function (i, k) {
        var listIds = i.idCards || [];
        angular.forEach(listIds, function (l, m) {
          if (l === cardId)
            boardName = i.name;
        });
      });

      return boardName;
    }

    /**
     * get labels based on card type id
     * @param cardTypeId
     * @returns {*}
     */
    function getLabelsByCardId(label, labels) {

      var colour = {};

      angular.forEach((labels || []), function (i, k) {
        if (i.id === label)
          colour = i;
      });

      return colour;

    }

    /**
     * format date
     * @param dt - date string
     * @returns {string} - valid date string
     */
    function formatDate(dt) {
      return moment(new Date(dt)).format('D MMM YYYY');
    }


    /**
     * Is the card overdue?
     *
     * @param cardDate
     * @returns {boolean}
     */
    function isOverdue(cardDate) {
      return moment() > moment(cardDate, 'x');
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    /**
     * format date
     * @param dt - date string
     * @returns {string} - valid date string
     */
    function formatDueDate(dt) {
      return moment(new Date(dt)).format('MMM D, YYYY');
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    /**
     * Toggle Starred status of the task
     * @param task
     * @param event
     */
    function toggleStarred(task, event) {
      event.stopPropagation();
      task.starred = !task.starred;
      var clone = angular.copy(defaultReq);
      clone.result.parameters.taskId = task.id;
      clone.result.action = task.starred ? 'taskStarred' : 'taskRemoveStarred';
      sendBackendXmlHttpRequest(clone, true);
    }

    const confirmTemplate = (temp, status) => {
      if (temp === 'Frozen') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br> *will be locked, can not be moved out and can not be display in PLMBot after `show my cards` command.<br/> Would you still like to proceed?</h2>';
      } else if (temp === 'FrozenAndReleased') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br/>' +
          '* will be locked, can not be moved out and can not be display in PLMBot after `show my cards` command, AND<br/>' +
          `* Affected Objects will be change status to '${status}' automatically<br/>Would you still like to proceed?</h2>`;
      } else if (temp === 'Released') {
        return '<h2 class="md-title ng-binding">Cards moved to this list:<br/>' +
          `* Affected Objects will be change status to '${status}' automatically<br/>Would you still like to proceed?</h2>`;
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
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Yes',
        cancel: 'No, move it back to original list'
      });
    };

    /**
     * Promote / Demote Card State
     * @param boardId
     * @param cardId
     * @param sourceListId
     * @param destinationListId
     */
    function toggleCardState(event, boardId, cardId, lists, destinationListId, cardList) {
      if (vm.previousAction.action !== 'searchCards') {
        $mdToast.show($mdToast.simple().textContent(`State already changed. Please enter 'show my cards' for change state again.`).position('top right'));
        return;
      }
      event.stopPropagation();
      var sourceListId = '';

      for (var index = 0; index < lists.length; index++) {
        if ((lists[index].idCards || []).indexOf(cardId) > -1) {
          sourceListId = lists[index].id;
          break;
        }
      }
      var clone = angular.copy(defaultReq);
      clone.result.parameters.boardId = boardId;
      clone.result.parameters.cardId = cardId;
      clone.result.parameters.sourceListId = sourceListId;
      clone.result.parameters.destinationListId = destinationListId;
      clone.result.action = 'promoteCard';
      const card = cardList.cards.filter(card => card.id === cardId);
      const destinationList = lists.filter(list => list.id === destinationListId);
      if (destinationList[0].objectStatus === 'Released' && destinationList[0].frozenList === 'true') {
        $mdDialog.show(confirmProcess('FrozenAndReleased', 'Released')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'Released');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].objectStatus === 'InDevelopment' && destinationList[0].frozenList === 'true') {
        $mdDialog.show(confirmProcess('FrozenAndReleased', 'InDevelopment')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'InDevelopment');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].objectStatus === 'Obsolete' && destinationList[0].frozenList === 'true') {
        $mdDialog.show(confirmProcess('FrozenAndReleased', 'Obsolete')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'Obsolete');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].objectStatus === 'Released') {
        $mdDialog.show(confirmProcess('Released', 'Released')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'Released');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].objectStatus === 'InDevelopment') {
        $mdDialog.show(confirmProcess('Released', 'InDevelopment')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'InDevelopment');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].objectStatus === 'Obsolete') {
        $mdDialog.show(confirmProcess('Released', 'Obsolete')).then(function () {
          if (card[0].idChangeItemsList.length > 0) {
            openReleaseHierarchy(card[0].idChangeItemsList, false, clone, 'Obsolete');
          } else {
            sendBackendXmlHttpRequest(clone, true);
          }
        }, function () {
        });
      } else if (destinationList[0].frozenList === 'true') {
        $mdDialog.show(confirmProcess('Frozen')).then(function () {
          sendBackendXmlHttpRequest(clone, true);
        }, function () {
        });
      } else {
        sendBackendXmlHttpRequest(clone, true);
      }
    }

    function openReleaseHierarchy(array, withoutHierarchy, clone, status) {
      $mdDialog.show({
        controller: 'ReleaseHierarchyController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/release-hierarchy/release-hierarchy-dialog.html',
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
            clickOutsideToClose: false,
            locals: {
              status: status,
              Objects: arr,
              isBulkRelease: false,
              isHierarchicalBulkRelease: false
            }
          }).then(function () {
            sendBackendXmlHttpRequest(clone, true);
          }, function () {
          });

        } else {
          sendBackendXmlHttpRequest(clone, true);
        }

      }, function () {
      });
    }


    /**
     * Toggle important status of the task
     * @param task
     * @param event
     */
    function toggleImportant(task, event) {
      event.stopPropagation();
      task.important = !task.important;
      var clone = angular.copy(defaultReq);
      clone.result.parameters.taskId = task.id;
      clone.result.action = task.important ? 'taskImportant' : 'taskRemoveImportant';
      sendBackendXmlHttpRequest(clone, true);
    }

    /**
     * Toggle completed status of the task
     *
     * @param task
     * @param event
     */
    function toggleCompleted(task, event) {
      event.stopPropagation();
      task.completed = !task.completed;
      var clone = angular.copy(defaultReq);
      clone.result.parameters.taskId = task.id;
      clone.result.action = task.completed ? 'taskComplete' : 'taskInComplete';
      sendBackendXmlHttpRequest(clone, true);
    }

    function openCard(event, cardId, exist) {
      /**
       * event prevent default
       */
      event.preventDefault();

      if (exist) {
        vm.openCardDialog(event, cardId, function () {
        }, vm.tasks, [], '', true);
      } else {
        vm.openCardDialog(event, cardId, function () {
        }, vm.tasks, [], '', false);
      }

    }

    /**
     * open Task dialog
     * @param event
     * @param taskId
     */
    function openTask(event, task) {

      /**
       * event prevent default
       */
      task.idMembers = task.ownerIdList;
      event.preventDefault();
      task.title = task.taskTitle;

      /**
       * Open Task Dialog
       */
      vm.openTaskDialog(event, task, false);
    }

    /**
     * Open new task dialog
     *
     * @param ev
     * @param task
     * @param {boolean} newTask
     */
    function openTaskDialog(ev, task, newTask) {
      vm.modalInstance = $mdDialog.show({
        controller: 'TaskDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Task: task,
          Tasks: vm.tasks,
          Tags: vm.tags || [],
          Card: vm.card || {},
          event: ev,
          $parent: vm,
          newTask: newTask,
          callback: function () {
            console.log("window closed!");
            refreshBoardOrTaskData();
          },
          Members: vm.members,
          isTemplate: false,
          isConfigEnable: ''
        }
      });
    }

    function openExistingTask(ev, task, taskList) {
      vm.modalInstance = $mdDialog.show({
        controller: 'TaskDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Task: task,
          Tasks: taskList || [],
          Tags: vm.tags || [],
          Card: vm.card || {},
          event: ev,
          $parent: vm,
          newTask: false,
          callback: function () {
            console.log("window closed!");
            refreshBoardOrTaskData();
          },
          Members: vm.members,
          isTemplate: false,
          isConfigEnable: ''
        }
      });
    }

    /**
     *
     * @param arr
     */
    function assignedTasks(arr) {
      var list = [];
      angular.forEach(arr, function (i, k) {
        angular.forEach(vm.tasks, function (task, index) {
          if (i === task.id)
            list.push(task);
        });
      });
      console.log(" Assigned tasks :" + list);
      return list;
    }


    /**
     * parse object
     * @param o
     */
    function parseObject(i) {
      return {
        "id": i.id,
        "timestamp": i.timestamp,
        "source": i.result.source,
        "resolvedQuery": i.result.resolvedQuery,
        "action": i.result.action,
        "actionIncomplete": i.result.actionIncomplete,
        "fulfillment": i.result.fulfillment,
        "status": i.status,
        "sessionId": i.sessionId,
        "userAuthToken": i.userAuthToken,
        "backendOuput": i.backendOuput
      }
    }

    /**
     * parse chat response data
     * @returns {Array}
     */
    function parsechatResponse(single, chat) {
      single = single || false;
      if (!single) {
        var c = []; // parsed chat list
        /**
         * Iterate chat response
         */
        angular.forEach(vm.chatResponses, function (i, k) {
          c.push(parseObject(i));
        });
        return c; // return converted object
      } else {
        /**
         * parse signle object
         */
        return parseObject(chat);
      }
    }

    /**
     * Get Chat by Contact id
     * @param contactId
     */
    function getChat(contactId) {
      BotService.getChat(contactId).then(function (response) {
        vm.chatContactId = contactId;
        vm.chatResponses = response;
        vm.chatResponses[0].timestamp = new Date();

        // Reset the reply textarea
        resetReplyTextarea();

        // Scroll to the last message
        scrollToBottomOfChat();

      });
    }

    /**
     * Filter by startDate
     *
     * @param item
     * @returns {boolean}
     */
    function filterByStartDate(item) {
      if (vm.taskFilters.startDate === true) {
        return item.startDate === new Date();
      }

      return true;
    }


    /**
     * generate unique id
     */
    function getUniqueId() {
      return msUtils.guidGenerator().replace(/-/g, '');
    }

    /**
     * check html existence
     * @param text
     * @returns {boolean}
     */
    function isHtml(text) {
      return /<[a-z][\s\S]*>/i.test(text);
    }

    /**
     * Process User query
     */
    function reply($event) {

      // If "shift + enter" pressed, grow the reply textarea
      if ($event && $event.keyCode === 13 && $event.shiftKey) {
        vm.textareaGrow = true;
        return;
      }

      // Prevent the reply() for key presses rather than the"enter" key.
      if ($event && $event.keyCode !== 13) {
        return;
      }

      // Check for empty messages
      if (vm.replyMessage === '') {
        resetReplyTextarea();
        return;
      }
      sendAgentXmlHttpRequest();
    }

    let isBoardList = false;

    function checkBoardList(chat) {
      _.forEach(chat, dialog => {
        if (dialog.backendOuput && dialog.backendOuput.boardList) {
          isBoardList = true;
        }
      });
      return isBoardList;
    }


    /**
     * Submit Agent query to Api.AI service
     */
    function sendAgentXmlHttpRequest() {
      // TODO need to clarify whether its frontend session Id Or api.ai

      var sessionId = 'f23dcc2c-a11e-4bfb-818c-64ef8d6e173a';


      if (!vm.previousAction.actionIncomplete) {

        $plmBot.sendAgentXmlHttpRequest(vm.replyMessage, sessionId, 'en', null, haveToBeResetYourContext)
          .success(function (data, status, headers, config) {

            var defaultResponse = false, chatResponse = {};

            chatResponse = parsechatResponse(true, data);
            if (chatResponse.source === 'domains') {
              defaultResponse = true;
            } else {
              chatResponse.fulfillment = {};
            }

            var fullfilment = chatResponse.fulfillment;

            if (!defaultResponse) {

              vm.previousAction.actionIncomplete = chatResponse.actionIncomplete;
              chatResponse.actionIncomplete = false;
              vm.chat.push(angular.copy(chatResponse));
              sendBackendXmlHttpRequest(data);
            }
            else {
              vm.chat.push(angular.copy(chatResponse));
              var domainResponse = angular.copy(chatResponse);
              domainResponse.source = 'backend';
              domainResponse.resolvedQuery = '';
              domainResponse.backendOuput = {
                information: {
                  text: domainResponse.fulfillment.speech
                }
              };
              vm.chat.push(domainResponse);
            }

            cleanDomElements(true);

          })
          .error(function (data, status, headers, config) {
            // do your failure stuff here
            $mdToast.show("something went wrong with Api.Ai!");
          })
          .finally(function () {
            // release splooer
          });

      } else {
        var chatResponse = {};
        var copy = angular.copy(defaultReq);
        copy.result.resolvedQuery = vm.replyMessage;

        copy.result.action = vm.previousAction.action;
        copy.result.parameters = {};

        chatResponse = parsechatResponse(true, copy);
        vm.chat.push(chatResponse);

        if (copy.result.action === 'newTask') {
          copy.result.parameters.taskTitle = vm.replyMessage;
        }

        if (copy.result.action === 'cardTitle') {
          copy.result.parameters = {};
          copy.result.parameters.cardTitle = vm.replyMessage;
        }

        sendBackendXmlHttpRequest(angular.copy(copy));

      }

    }


    /**
     * clean Dom Elements
     * @param scrollTo
     */
    function cleanDomElements(scrollTo) {
      // release splooer
      /**
       * reset reply text area
       */
      resetReplyTextarea();

      /**
       * scroll to bottom of chat
       */
      scrollToBottomOfChat(scrollTo);
    }


    /**
     * Read fuse response
     * @param request
     */
    function sendBackendXmlHttpRequest(request, scrollTo) {
      var action = request.result.action;
      scrollTo = scrollTo || false;
      console.log('Request Action : ' + action);

      if (Object.keys(request.result.parameters).length > 0) {
        request.result.parameters = $.extend({}, request.result.parameters, vm.sessionData);
      } else {
        request.result.parameters = vm.sessionData;
      }

      $plmBot.sendBackendXmlHttpRequest(request, action, headers)
        .success(function (data, status, headers, config) {

          var resp = data.data, clone;

          if (resp.status.code === 200) {
            // Read response
            var clone = parsechatResponse(true, resp);
            vm.previousAction.action = clone.action;
            vm.chat.push(angular.copy(clone));
            haveToBeResetYourContext = false;
            if (data.data.reset) {
              vm.previousAction.action = "";
              vm.previousAction.actionIncomplete = false;
              haveToBeResetYourContext = true;
            }
          } else {
            vm.previousAction.action = "";
            vm.previousAction.actionIncomplete = false;
            $mdToast.show($mdToast.simple().textContent(resp.status.errorType).position('top right'));
            haveToBeResetYourContext = false;
          }

        })
        .error(function (data, status, headers, config) {
          // do your failure stuff here
        })
        .finally(function () {
          cleanDomElements(scrollTo);
          refreshBoardOrTaskData();
        });
    }

    /**
     * Refresh Board Data with broadcast triggering from here
     */
    function refreshBoardOrTaskData() {
      if ($location.url().indexOf('/scrumboard/boards') > -1) {
        $rootScope.$broadcast('refreshBoard');
        $rootScope.$broadcast('refreshBoardView');
      } else if ($location.url().indexOf('/to-do') > -1) {
        $rootScope.$broadcast('refreshTaskView');
      }
    }


    /**
     * Reset reply textarea
     */
    function resetReplyTextarea() {
      vm.replyMessage = '';
      vm.textareaGrow = false;
    }


    /**
     * PLMBot Scrolling to agent question, with certain speed
     * @param speed - speed of the scroll
     */
    function scrollToAgentQuery(speed) {
      var $this = $document.find('#plm-chat-content')[0];
      if ($($this).offset() != undefined) {
        var $this_top = $($this).offset().top;
      }
      var $this_bottom = $this_top + $($this).height();
      var $elem = $document.find('#plm-chat-content div.agent:last')[0];

      if ($elem && angular.isFunction($($elem).offset)) {
        var $elem_top = $($elem).offset().top;
        var $elem_bottom = $elem_top + $($elem).height();

        if ($elem_top > $this_top && $elem_bottom < $this_bottom) {
          // in view so don't do anything
          return;
        }
        var new_scroll_top;
        if ($elem_top < $this_top) {
          new_scroll_top = {scrollTop: $($this).scrollTop() - $this_top + $elem_top};
        } else {
          new_scroll_top = {scrollTop: $elem_bottom - $this_bottom + $($this).scrollTop()};
        }
        $($this).animate(new_scroll_top, speed === undefined ? 100 : speed);
      }

    }

    /**
     * Scroll Chat Content to the bottom
     * @param speed
     */
    function scrollToBottomOfChat(scroll) {
      $timeout(function () {
        var chatContent = angular.element($document.find('#plm-chat-content'));
        (chatContent.length > 0) && chatContent.animate({
          scrollTop: chatContent[0].scrollHeight
        }, 400, function () {
          if (!scroll) {
            $timeout(function () {
              scrollToAgentQuery(400);
            }, 500);
          }
        });
      }, 0);
    }

    $rootScope.$watch('releaseHierarchy', value => {
      vm.releaseHierarchy = value;
      vm.releaseEditsHierarchy = $rootScope.releaseEditsHierarchy;
    });

    /**
     * Initialise bot chat
     */
    Init();

    function Init() {

      // Read All Members data from server
      BoardService.getAllMembers().then(function (resp) {
        vm.members = resp;
      });

      getChat('e6f46cabfeb74852b6158ed8a0056fa4');
    }

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getById = function (value) {
      return this.filter(function (x) {
        return x.id === value;
      })[0];
    };


  }


})();
