(function () {
  'use strict';

  angular
    .module('fuse')
    .factory('apiGateService', apiGateService);

  function apiGateService($q) {

    var service = {
      checkCode: checkCode
    };

    function checkCode(promise, onSuccess, onReject) {
      return promise.then(function (response) {
        if (response.code === 0) {
          return onSuccess ? onSuccess(response.data) : response.data;
        } else {
          return onReject ? onReject(response) : $q.reject(response.message);
        }
      })
    }

    return service;
  }
})();
