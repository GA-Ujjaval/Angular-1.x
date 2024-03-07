(function () {
  'use strict';

  angular
    .module('app.chat-bot')
    .service('$plmBot', apiService);

  /** @ngInject */
  function apiService($http, hostUrlDevelopment) {

    /**
     * instance for this current service
     * @type {{}}
     */
    var api = {};

    // version
    api.version = 20150910;

    // Base Url
    api.baseUrl = 'https://api.api.ai/v1';

    /**
     * The above service handles plmbot request, such as
     * [ "searchTasks","newTask","newTaskTitle","searchCards" and "newCard" ]
     * @type {string}
     */
    api.botHandlerUrl = hostUrlDevelopment.baseUrl + "bothandler";

    api.botHandlerList = ["searchTasks", "newTask", "newTaskTitle", "searchCards", "newCard"];

    /**
     *  This service handles request to actionbot like
     *  [ "newCardTitle","newCardCreated","taskComplete","taskInComplete","taskImportant","taskRemoveImportant",
     *    "taskStarred","taskRemoveStarred","promoteYes","promoteNo" and "promoteCards"]
     * @type {string}
     */
    api.actionBotHandlerUrl = hostUrlDevelopment.baseUrl + "actionbothandler";
    api.actionBotHandlerList = ["newCardTitle", "newCardCreated", "taskComplete", "taskInComplete", "taskImportant", "taskRemoveImportant", "taskStarred", "taskRemoveStarred", "promoteYes", "promoteNo", "promoteCards"];

    /**
     * api.ai params request values
     * @type {{q: string, timezone: *, lang: string, sessionId: string, resetContexts: boolean}}
     */
    api.params = {
      "query": "",
      "resetContexts": false
    };

    /**
     * default language
     * @type {string}
     */
    api.defaultLanguage = "en";

    /**
     * default time zone based on end user time zone
     */
    api.defaultTimeZone = new moment().format();

    /**
     * plm bot client access token
     * @type {string}
     */
    api.clientAccessToken = "0e54ab036e7e4f498bf000e2071aee2d";

    /**
     *  plm bot developer access token
     * @type {string}
     */
    api.developerAccessToken = "77f1420bf6b84c9aa487cbdd3c87bc0e";

    /**
     * api.ai request headers
     * @type {{Authorization: string, Content-Type: string}}
     */
    api.headers = {
      "Authorization": "Bearer " + api.clientAccessToken,
      "Content-Type": "application/json; charset=utf-8"
    };


    api.sendAgentXmlHttpRequest = function (message, session_id, language, timezone, haveToBeResetYourContext) {

      if (!message) throw new Error();

      /**
       * default language
       * @type {string}
       */
      api.params.lang = "en";

      /**
       * default time zone
       */
      api.params.timezone = api.defaultTimeZone;

      /**
       * time zone present ? then add it into the parameter sesionId = session_id ); */
      api.params.sessionId = session_id ? session_id : "87a4dad0-2e53-40b5-9d9b-dd78e0ffbccd";

      /**
       * its required field user must send to api.ai service
       */
      api.params.query = message;

      /**
       * language present ? then add it into the parameter request
       */
      language && (api.params.lang = language);

      api.params.resetContexts = haveToBeResetYourContext || false;

      /**
       * timezone present ? then add it into the parameter request
       */
      timezone && (api.params.timezone = timezone);

      return $http.post(api.baseUrl + '/query' + '/?v=' + api.version, api.params, {
        headers: api.headers
      });
    }

    /**
     *
     * fule plm bothandler & actionbothandler calls
     *
     * @param request
     * @param target
     * @returns {*}
     */
    api.sendBackendXmlHttpRequest = function (request, action, headers) {

      var targetUrl = '';
      //if($.inArray(action, api.botHandlerList)>-1)
      targetUrl = api.botHandlerUrl;
      //else if($.inArray(action, api.actionBotHandlerList)>-1)
      //targetUrl = api.actionBotHandlerUrl;

      var data = {
        "requestJson": JSON.stringify(request)
      }

      return $http.post(targetUrl, JSON.stringify(request), {
        headers: headers
      });
    }


    return api;
  }

})();
