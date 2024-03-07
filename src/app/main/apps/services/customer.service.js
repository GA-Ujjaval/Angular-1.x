(function () {
  'use strict';

  angular
    .module('app.customer')
    .factory('CustomerService', CustomerService);


  /** @ngInject */
  function CustomerService($q, $http, AuthService) {
    var service = {
      data: {},
      addNewMember: addNewMember
    };

    var sessionData;
    var headersDefault;

    /**
     * sets proper header for request. this is needed to handle situation,
     * when user logs out and then logs in as other user
     */
    function setAuthData() {
      sessionData = AuthService.getSessionData('customerData');
      headersDefault = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      }
    }

    function getParamsWithCustomerId(stringParams = '') {
      if (stringParams && !stringParams.customerId) {
        stringParams.customerId = sessionData.proxy === true ? sessionData.customerAdminId : sessionData.userId;
      }
      return stringParams;
    }

    function addNewMember(method, url, stringParams, bodyParams, headers, responseType) {
      setAuthData();
      return $http({
        method: method,
        url: url,
        params: getParamsWithCustomerId(stringParams),
        headers: headers || headersDefault,
        data: bodyParams,
        responseType: responseType
      }).then(successFunction).catch(errorFunction);

      // SUCCESS
      function successFunction(response) {
        return response.data;
      }

      // ERROR
      function errorFunction(response) {
        // Attach the data
        return response;
      }
    }

    return service;
  }
})();
