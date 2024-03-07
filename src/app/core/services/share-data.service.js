(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('helpSettingService', helpSettingService);

  /** @ngInject */
  function helpSettingService($q) {

    var deferred = $q.defer();

    function addData(newObj) {
      deferred.resolve(newObj);
      deferred = $q.defer();
    }

    function getData() {
      return deferred.promise;
    }

    return {
      addData: addData,
      getData: getData
    };
  }
}());
