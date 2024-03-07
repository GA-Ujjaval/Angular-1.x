(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('defaultTemplateService', defaultTemplateService);


  /** @ngInject */
  function defaultTemplateService(CustomerService, hostUrlDevelopment, AuthService, $window, fuseUtils) {

    var sessionData;

    var service = {
      getDefaultTemplate: getDefaultTemplate,
      setDefaultTemplateToLocalStorage: setDefaultTemplateToLocalStorage,
      updateAllDefaultTemplates: updateAllDefaultTemplates,
      isDefaultTemplateUpdated: isDefaultTemplateUpdated
    };

    /**
     * Returns default template data for particular table
     * @param tabName
     * @returns {*}
     */
    function getDefaultTemplate(tabName) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {};

      params.customerId = sessionData.proxy === true ? params.customerId = sessionData.customerAdminId :
        params.customerId = sessionData.userId;
      params.tabName = tabName || null;

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.getdefaulttemplate, params, '')
        .then(function (res) {
          if (res.code === 0) {
            updateDefaultTemplate(tabName, res);
          }

          return Promise.resolve(res);
        });
    }

    /**
     * @param tableName - {string} the name of the table for which we will save the data
     * @param response - {object} the /getdefaulttemplate response
     */
    function setDefaultTemplateToLocalStorage(tableName, response) {
      $window.localStorage.setItem(fuseUtils.buildAttributeName('default_template', tableName), angular.toJson(response));
    }

    /**
     * Returns already saved data for a table (or {null})
     * @param tableName - {string} the name of the table we need template for
     * @returns {string | null}
     */
    function getSavedDefaultTemplate(tableName) {
      return $window.localStorage.getItem(fuseUtils.buildAttributeName('default_template', tableName));
    }

    /**
     * Removes default template from local storage for the particular table
     * @param tableName - {string}
     */
    function removeSavedDefaultTemplate(tableName) {
      $window.localStorage.removeItem(fuseUtils.buildAttributeName('default_template', tableName));
    }

    /**
     * Updates localStorage data if needed.
     * Get the default template for the table and if it is equal to {null}
     * or its data equal to {null} or the hash key is old, so it will put new default template to localStorage
     * @param tableName - {string} the name of the table for which we check the default template
     * @param response - the response from server which contain default template data
     */
    function updateDefaultTemplate(tableName, response) {
      var savedResponse = angular.fromJson(getSavedDefaultTemplate(tableName));
      savedResponse = savedResponse === 'null' ? null : savedResponse;
      if (!savedResponse || response.data === null || savedResponse.data.hashKey !== response.data.hashKey) {
        setDefaultTemplateToLocalStorage(tableName, response);
      }
    }

    /**
     * This function is called whenever we call /getprofile to check saved default templates'
     * hashes with incoming and identify obsolete templates
     * @param templates - {object} with structure :
     * {
     *  'tableName': 'table_hash_key'
     * }
     */
    function updateAllDefaultTemplates(templates) {
      angular.forEach(templates, function (value, key) {
        var savedResponse = angular.fromJson(getSavedDefaultTemplate(key));
        savedResponse = savedResponse === 'null' ? null : savedResponse;

        if (!savedResponse || (savedResponse.data === null) || (savedResponse.data && savedResponse.data.hashKey !== value)) {
          removeSavedDefaultTemplate(key);
        }
      });
    }

    /**
     * Used in controllers to check whether we should apply default template or continue
     * execution as it was before adding templates functionality
     * @param tableName - {string} the name of the table to check validity for
     * @returns {boolean}
     */
    function isDefaultTemplateUpdated(tableName) {
      var savedTemplate = getSavedDefaultTemplate(tableName);
      savedTemplate = savedTemplate === 'null' ? null : angular.fromJson(savedTemplate);

      return savedTemplate === null;
    }

    return service;
  }
})();
