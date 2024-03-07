(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('apiAiClient', apiAiClient);

  function apiAiClient($q, $http) {

    var base_url = 'https://api.api.ai/v1';
    var version = '20150910';
    var access_token = 'ea8dc39219b74cbe8744613de5bb498a';

    function query(message, session_id) {

      var params = {
        query: message,
        lang: 'en'
      };

      if (!!session_id) {
        params.sessionId = session_id;
      }

      return $http.post(base_url + '/query' + '/?v=' + version, params, {
        headers: {
          "Authorization": "Bearer " + access_token,
          "Content-Type": "application/json; charset=utf-8"
        }
      }).then(function (response) {
        if (response.data.status.code == 200) {
          return {
            fulfillment: response.data.result.fulfillment.speech,
            session_id: response.data.sessionId
          };
        }
        else {
          throw new Error();
        }
      })
        .catch(function (error) {
          console.error(error);
        });
    }

    var service = {
      query: query
    };

    return service;

  }

})();
