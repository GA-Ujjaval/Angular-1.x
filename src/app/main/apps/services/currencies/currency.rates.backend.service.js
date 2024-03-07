(function () {
  'use strict';

  angular
    .module('app.customer')
    .factory('currencyRatesBackendService', currencyRatesBackendService);


  /** @ngInject */
  function currencyRatesBackendService(GlobalSettingsService, $q) {

    function removeCurrencyExchangeRate(abbreviation){
      return GlobalSettingsService.removeSystemSetting({groupSettings: `currencyRates`, groupSettingsType: abbreviation})
        .then((response) => {
          if(response.code === 0){
            return response.data;
          }else{
            return $q.reject(response)
          }
        })
    }



    return {
      removeCurrencyExchangeRate
    };
  }
})();
