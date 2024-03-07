(function () {
  'use strict';

  angular
    .module('app.admin')
    .factory('AdminService', AdminService);


  /** @ngInject */
  function AdminService($q, $http) {
    var service = {
      data: {},
      dataManipulation: dataManipulation
    };

    function dataManipulation(method, url, params, data, headers) {
      return $http({
        method: method,
        url: url,
        params: params || '',
        headers: headers || '',
        data: data || ''
        //data: $.param({input: JSON.stringify(humps.decamelizeKeys(apiInput))})
      }).then(successFunction).catch(errorFunction);

      // SUCCESS
      function successFunction(response) {
        // Attach the data
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
