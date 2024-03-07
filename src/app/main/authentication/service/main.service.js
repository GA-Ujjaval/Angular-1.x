(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('AuthService', AuthService);

  /** @ngInject */
  function AuthService($cookies, $http) {

    var service = {
      getSessionData: getSessionDataFunction,
      userLogin: loginFunction,
      proxyLogin: proxyLogin,
      userLogout: logoutFunction,
      proxyLogout: proxyLogout,
      isAuthenticated : isAuthenticated,
      dataManipulation : dataManipulation
    };

    function dataManipulation(method, url, params, data, headers) {
      return $http({
        method: method,
        url: url,
        params: params || '',
        headers: headers || '',
        data: data
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

    function isAuthenticated(){
      var data = $cookies.getObject('customerData') || {};
      if(data.userId){
        return true;
      }else{
        return false;
      }
    }

    function getSessionDataFunction(name){
      var data = $cookies.getObject(name);
      return data;
    }

    function loginFunction(name, data){
      var newData = data;
      newData.proxy = false;
      $cookies.putObject(name, newData);
      //return $cookies.putObject(name, data);
    }

    function logoutFunction(name){
      $cookies.remove(name);
      //return $cookies.remove(name);
    }

    function proxyLogin(name, data, id){
      var newData = data;
      $cookies.remove(name);
      newData.proxy = true;
      newData.auth = false;
      newData.customerAdminId = id;
      $cookies.putObject(name, newData);
    }

    function proxyLogout(name, data){
      var newData = data;
      $cookies.remove(name);
      newData.proxy = false;
      newData.auth = true;
      delete newData.customerAdminId;
      $cookies.putObject(name, newData);
    }

    return service;
  }

})();
