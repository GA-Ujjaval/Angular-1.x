(function () {
  'use strict';

  angular
    .module('app.chat-bot', [])
    .constant("botConfig", {
      "queryType": {
        "SEARCH": "searchTasks",
        "CREATETASK": "newTask",
        "CREATECARD": "newCard",
        "TASKTITLE": "newTaskTitle",
        "TASKCOMPLETE": 'taskComplete',
        "TASKINCOMPLETE": 'taskInComplete',
        "TASKIMPORTANT": 'taskImportant',
        "TASKREMOVEIMPORTANT": 'taskRemoveImportant',
        "TASKSTARRED": 'taskStarred',
        "TASKREMOVESTARRED": 'taskRemoveStarred',
        "CARDTITLE": "newCardTitle",
        "CARDCREATION": "newCardCreated",
        "PROMOTECARDS": "promoteCards",
        "SEARCHCARDS": "searchCards",
        "PROMOTEYES": "promoteYes",
        "PROMOTENO": "promoteNo",
        "PROMOTECONFIRMYES": "promoteConfirmYes",
        "PROMOTECONFIRMNO": "promoteConfirmNo"
      },
      development: false,
      production: true
    })
    .config(config)

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/plm-chat-bot');

    // Api

    // Contacts data must be alphabatically ordered.
    msApiProvider.register('bot.chats', ['app/data/chat-bot/chats/:id.json']);

    //msApiProvider.register('bot.user', ['app/data/chat-bot/user.json']);
  }

})();

