(function ()
{
  'use strict';

  angular
      .module('app.chat-bot')
      .factory('BotService', BotService);

  /** @ngInject */
  function BotService($q, msApi, hostUrlDevelopment, AuthService, ScrumboardService, $mdToast)
  {

    var service = {
      chats         : {},
      user : {},
      backendChatOutput : [],
      agentChatOutput : [],
      ecoChangeItems : [],
      ecrChangeItems : [],
      boardList : [],
      getChat: getChat,
      getEcrChangeItems : getEcrChangeItems,
      getEcoChangeItems : getEcoChangeItems
    };

    /**
     * Read All Tasks
     * @returns {*}
     */
    function getEcoChangeItems(){

      // Create a new deferred object
      var deferred = $q.defer();

      // Request the contacts data from json
      msApi.request('scrumboard.board.card.ecoChangeItems@get', null,

          // SUCCESS
          function (response)
          {
            // Attach the contacts
            service.ecoChangeItems = response.data;

            // Resolve the promise
            deferred.resolve(service.ecoChangeItems);
          },

          // ERROR
          function (response)
          {
            deferred.reject(response);
          }
      );
      return deferred.promise;
    }

    /**
     * Read All Tasks
     * @returns {*}
     */
    function getEcrChangeItems(){

      // Create a new deferred object
      var deferred = $q.defer();

      // Request the contacts data from json
      msApi.request('scrumboard.board.card.ecrChangeItems@get', null,

          // SUCCESS
          function (response)
          {
            // Attach the contacts
            service.ecrChangeItems = response.data;

            // Resolve the promise
            deferred.resolve(service.ecrChangeItems);
          },

          // ERROR
          function (response)
          {
            deferred.reject(response);
          }
      );
      return deferred.promise;
    }

    /**
     * Get contact chat from the server
     *
     * @param contactId
     * @returns {*}
     */
    function getChat(contactId)
    {

      // Create a new deferred object
      var deferred = $q.defer();

      // If the chat exist in the service data, do not request
      if ( service.chats[contactId] )
      {
        deferred.resolve(service.chats[contactId]);

        return deferred.promise;
      }

      // Request the chat with the contactId
      msApi.request('bot.chats@get', {id: contactId},

          // SUCCESS
          function (response)
          {
            // Attach the chats
            service.chats[contactId] = response.data;

            // Resolve the promise
            deferred.resolve(service.chats[contactId]);
          },

          // ERROR
          function (response)
          {
            deferred.reject(response);
          }
      );

      return deferred.promise;
    }

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getById = function (value)
    {
      return this.filter(function (x)
      {
        return x.id === value;
      })[0];
    };
    return service;
  }
})();
