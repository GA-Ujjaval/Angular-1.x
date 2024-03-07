(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('sourcerManagementService', sourcerManagementService);


  /** @ngInject */
  function sourcerManagementService(AuthService, CustomerService, hostUrlDevelopment, $q, errors) {

    /**
     * Post request for removing sourcer
     * @param objectId {string} - product or part id to which sourcer is attached
     * @param objectKey - object key of sourcer
     * @return {object || string}
     */
    function removeSourcer(objectId, objectKey) {
      const params = {
        objectId,
        sourceObjectId: objectKey
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeassociatesourcing, params, '', '')
        .then(response => {
          if (response.code === 0) {
            return response.data;
          } else {
            return $q.reject(response.message || errors.default);
          }
        });
    }

    return {
      removeSourcer
    };
  }
})();
