(function () {
  'use strict';

  angular
    .module('app.customer')
    .factory('currencyExchangeService', currencyExchangeService);


  /** @ngInject */
  function currencyExchangeService(errors, availableCurrencies) {

    const systemCurrency = {};
    let exchangeRates = {};

    /**
     * Sets applied system currency to the service
     * @param string - in format '$ (USD)'
     */
    function setSystemCurrency(string) {
      systemCurrency.sign = string.split(' ')[0];
      systemCurrency.abbreviation = string.split('(')[1].split(')')[0];
    }

    /**
     * To get applied system currency use it.
     * @returns {*}
     */
    function getSystemCurrency() {
      return _.clone(systemCurrency);
    }

    function getSystemCurrencyView() {
      return `${systemCurrency.sign} (${systemCurrency.abbreviation})`;
    }

    function setRates(rates) {
      exchangeRates = rates;
    }

    function convertFrom(currency, value) {
      return exchangeRates[currency] ? value / +exchangeRates[currency] : errors.noAvailableCurrency;
    }

    function getSignByAbbreviation(abbreviation) {
      return _.find(availableCurrencies, {abbreviation}) || systemCurrency.sign;
    }

    /**
     * Retrieves abbreviation of a currency from string '$ (USD)'. Sometimes just 'USD' comes, so we need a check
     * @param fullCurrencyString
     * @returns {*}
     */
    function getCurrencyAbbreviation(fullCurrencyString) {
      let abbreviation;
      // sometimes instead of '$ (USD)' we have just 'USD' string, that's why we need this check
      try {
        abbreviation = fullCurrencyString.split('(')[1].split(')')[0];
      } catch (e) {
        abbreviation = fullCurrencyString;
      }
      return abbreviation || systemCurrency.abbreviation;
    }

    function isCurrencyAvailable(abbreviation) {
      return !!exchangeRates[abbreviation];
    }

    /**
     * Returns default currency, if it is not set to system yet.
     * @returns {*}
     */
    function getDefaultCurrency() {
      return angular.copy(_.find(availableCurrencies, {abbreviation: 'USD'}));
    }

    function getDefaultCurrencyString() {
      const defaultCurrency = getDefaultCurrency();
      return `${defaultCurrency.sign} (${defaultCurrency.abbreviation})`;
    }

    return {
      setRates,
      convertFrom,
      setSystemCurrency,
      getSystemCurrency,
      getSystemCurrencyView,
      getSignByAbbreviation,
      getCurrencyAbbreviation,
      isCurrencyAvailable,
      getDefaultCurrency,
      getDefaultCurrencyString
    };
  }
})();
