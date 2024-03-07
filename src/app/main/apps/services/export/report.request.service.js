(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('reportRequestService', reportRequestService);


  /** @ngInject */
  function reportRequestService(CustomerService, hostUrlDevelopment, $q, $http, AuthService) {
    const service = {
      getAttachmentReport
    };

    let sessionData;
    let headersDefault;

    /**
     * params {object} with properties:
     *  - objectId {string} - the id of the bject to get report for
     *  - bomFlag - bom flag shows, whether to add bom attachments to the report
     * @returns {*}
     */
    function getAttachmentReport(params) {
      setAuthData();
      return $http({
        method: 'POST',
        url: hostUrlDevelopment.test.downloadallattachmentsaspdfreport,
        params: getParamsWithCustomerId(params),
        headers: headersDefault,
        responseType: 'arraybuffer'
      })
        .then((response) => {
          return response.data;
        })
        .catch((err) => {
          return $q.reject();
        })
    }

    function getParamsWithCustomerId(stringParams = '') {
      if (stringParams && !stringParams.customerId) {
        stringParams.customerId = sessionData.proxy === true ? sessionData.customerAdminId : sessionData.userId;
      }
      return stringParams;
    }

    function setAuthData() {
      sessionData = AuthService.getSessionData('customerData');
      headersDefault = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      }
    }

    return service;
  }
})();
