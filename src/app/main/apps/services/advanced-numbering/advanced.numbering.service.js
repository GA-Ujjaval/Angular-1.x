(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('advancedNumberingService', advancedNumberingService);

  function advancedNumberingService(GlobalSettingsService, hostUrlDevelopment, AuthService, CustomerService, $q, apiGateService) {

    const service = {
      getDefaultScheme: getDefaultScheme,
      updateDefaultScheme: updateDefaultScheme,
      getNextNumber: getNextNumber,
      getTableData: getTableData,
      updateSingleCategoryScheme: updateSingleCategoryScheme,
      getSingleCategoryNextNumbers: getSingleCategoryNextNumbers,
      updateMode: updateMode,
      updateSchemeInUse: updateSchemeInUse,
      getPartsDefaultScheme: getPartsDefaultScheme
    };

    const gate = apiGateService;
    var sessionData;

    function updateMode(newMode, action) {
      sessionData = AuthService.getSessionData('customerData');
      const params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        mode: newMode,
        action: action
      };
      return gate.checkCode(CustomerService.addNewMember('POST', hostUrlDevelopment.test.updatemodesettings, params, null));
    }

    var modeInUse;

    /**
     * Function to get the default schemes' data for advanced numbering
     * @param mode {string} - the current mode applied
     */
    function getDefaultScheme() {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId
      };
      return gate.checkCode(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getdefaultadvancednumbering, params, null));
    }

    /**
     * Returns default scheme particularly for parts
     * @returns {*}
     */
    function getPartsDefaultScheme() {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        mode: modeInUse
      };
      return gate.checkCode(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getdefaultadvancednumbering, params, null),
        function (schemes) {
          return _.find(schemes, {objectType: 'parts'});
        });
    }

    /**
     *
     * @param scheme {object} with properties:
     *   - prefix {string}
     *   - suffix {string}
     *   - startingNumber {string}
     *   - runningNumber {string}
     *   - increment {string}
     *   - numberingScheme {string} - the numbering scheme used for current objectType (can be 'custom' or 'parts')
     *   - objectType {string} - the type of the object the scheme is used for
     * @returns {*}
     */
    function updateDefaultScheme(scheme) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        objectType: scheme.objectType
      };
      var data = {
        prefix: scheme.prefix,
        suffix: scheme.suffix,
        startingNumber: scheme.startingNumber,
        runningNumber: scheme.runningNumber,
        increment: +scheme.increment,
        numberingScheme: scheme.numberingScheme
      };
      return gate.checkCode(CustomerService.addNewMember('POST', hostUrlDevelopment.test.savedefaultadvancednumbering, params, data));
    }

    /**
     * Used to get next numbers for the default scheme.
     * @param settings {object} with properties:
     *   - objectType {string}
     *   - callFromDefault {boolean} - true if trying to get next numbers for the default scheme
     * @returns {*}
     */
    function getNextNumber(settings) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        objectType: settings.objectType,
        callFromDefault: settings.isCallFromDefault,
        categoryId: settings.categoryId || null
      };
      return gate.checkCode(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getnextnumbers, params, null));
    }

    /**
     * Returns single categories array in hierarchical form, so it has to be flattened
     * @param categoryType {string} - the type of the object the table is used for
     * @returns {*}
     */
    function getTableData(categoryType) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        categoryType: categoryType
      };
      return gate.checkCode(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategoryhierarchy, params, null));
    }

    /**
     * Updates a single category inside the table
     * @param categoryId {string}
     * @param scheme {object} the type of the object the table is used for
     * @returns {*}
     */
    function updateSingleCategoryScheme(categoryId, scheme) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        categoryId: categoryId,
        objectType: scheme.objectType
      };
      var data = {
        prefix: scheme.prefix,
        suffix: scheme.suffix,
        startingNumber: scheme.startingNumber,
        increment: +scheme.increment,
        scheme: scheme.scheme
      };
      return gate.checkCode(CustomerService.addNewMember('POST', hostUrlDevelopment.test.savecustomadvancednumbering, params, data));
    }

    /**
     * To get next numbers for a single category in the table
     * @param settings {object} with parameters :
     *   - categoryId {string}
     *   - objectType {string}
     * @returns {*}
     */
    function getSingleCategoryNextNumbers(settings) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        categoryId: settings.categoryId,
        objectType: settings.objectType,
        callFromDefault: false
      };
      return gate.checkCode(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getnextnumbers, params, null));
    }

    /**
     * Changes the scheme to use for particular type of objects.
     * (corresponds with the radio button group in advanced numbering)
     * @param objectType {string}
     * @param numberingScheme {string} new numberingScheme to use
     * @returns {*}
     */
    function updateSchemeInUse(objectType, numberingScheme) {
      sessionData = AuthService.getSessionData('customerData');
      var params = {
        customerId: sessionData.proxy ? sessionData.customerAdminId : sessionData.userId,
        objectType: objectType,
        numberingScheme: numberingScheme
      };
      return gate.checkCode(CustomerService.addNewMember('POST', hostUrlDevelopment.test.updatenumberingschemeforprodanddoc, params, null));
    }

    return service;
  }
})();
