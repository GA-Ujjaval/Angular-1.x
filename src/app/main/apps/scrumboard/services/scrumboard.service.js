(function () {
    'use strict';

    angular
        .module('app.customer')
        .factory('ScrumboardService', ScrumboardService);

    /** @ngInject */
    function ScrumboardService($q, $http, hostUrlDevelopment) {
        var service = {
            boardData: {},
            allBoardsData: [],
            boardDataForBot: [],
            dataManipulation: dataManipulation
        };

        const cache = {};
        function dataManipulation(method, url, params, data, headers, update) {
          const timeStamp = new Date() - (cache[url] || {}).time;
          const newParam = angular.copy(params);
          delete newParam.customerId;
          const isParamsSame =_.isEqual(newParam, (cache[url] || {}).params || {});
          if(cache[url] && isParamsSame && update !== true && (timeStamp < 7000)){
            return Promise.resolve(angular.copy(cache[url].data));
          }
            return $http({
                method: method,
                url: url,
                params: params || '',
                headers: headers || '',
                data: data
                //data: $.param({input: JSON.stringify(humps.decamelizeKeys(apiInput))})
            }).then((response) => {
              if(url === hostUrlDevelopment.test.boardbyidnew || url === hostUrlDevelopment.test.getalltask || url === hostUrlDevelopment.test.getboards){
                delete params.customerId;
                cache[url] = {time: new Date(), data: angular.copy(response.data), params: params || undefined};
              }
              return response;
            })
              .then(successFunction).catch(errorFunction);

            // SUCCESS
            function successFunction(response) {
                // Attach the data
                service.boardDataForBot = response.data;
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

