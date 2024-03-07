(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('GlobalSettingsService', GlobalSettingsService);

  function GlobalSettingsService(CustomerService, hostUrlDevelopment, AuthService, defaultTemplateService,
                                 $rootScope, currencyExchangeService, sourceCostService, searchPresetService) {

    const service = {
      getProxydetails: getProxyDetails,
      getProfile,
      setUserFullName,
      getUserFullName,
      updateSystemSetting,
      removeSystemSetting
    };

    var sessionData;
    var headers;

    var userFullName;

    function setUserFullName(newFullName) {
      userFullName = newFullName;
    }

    function getUserFullName() {
      return userFullName;
    }

    function setAuthData() {
      sessionData = AuthService.getSessionData('customerData');
      headers = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      }
    }

    function getProxyDetails() {
      setAuthData();
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.proxydetails, {}, '', headers)
        .then(function (response) {
          if(!response.data) {
            return;
          }
          const systemSettings = response.data.systemSettings;
          if (systemSettings.productionModuleSetting) {
            $rootScope.enableProducts = systemSettings.productionModuleSetting.productEnabled === 'true';
          } else {
            $rootScope.enableProducts = true;
          }
          if (systemSettings.currencyRates) {
            currencyExchangeService.setRates(systemSettings.currencyRates);
          }

          $rootScope.proxyEnable = response.data.proxyEnable;

          $rootScope.addonService = response.data.addonService;

          $rootScope.editObjectId = response.data.fuseObjectNumberSetting.editObjectId;

          $rootScope.enableMinorRev = response.data.fuseObjectNumberSetting.enableMinorRev;

          $rootScope.numericminor = response.data.fuseObjectNumberSetting.minorRevFormat;

          $rootScope.numericmajor = response.data.fuseObjectNumberSetting.majorRevFormat;

          $rootScope.enableEmptyObjectNumberSetting = response.data.fuseObjectNumberSetting.enableEmptyObjectNumberSetting;

          $rootScope.advancedNumberingStatus = response.data.advancedNumberingStatus;

          $rootScope.configurationSettings = systemSettings.configurationSetting ?
            (systemSettings.configurationSetting.configurationEnabled === 'true') : false;

          $rootScope.releaseHierarchy = systemSettings.releaseSettings ?
            systemSettings.releaseSettings.releaseHierarchy === 'true' : false;

          $rootScope.promoteDemote = systemSettings.releaseSettings ?
            (systemSettings.releaseSettings.promoteDemote === 'true') : false;

          $rootScope.releaseEditsHierarchy = systemSettings.releaseSettings ?
            (systemSettings.releaseSettings.releaseEditsHierarchy === 'true') : false;

          $rootScope.advancedNumberSettings = systemSettings.advancednumberingSetting ?
            (systemSettings.advancednumberingSetting.advancednumberingEnabled === 'true') : false;

          $rootScope.systemSetting = response.data.systemSettings;

          $rootScope.currencySetting = systemSettings && systemSettings.currencySettings ?
            (systemSettings.currencySettings.currencyChoice.split(' ')[0]) : '$';
          $rootScope.manualRelease = systemSettings.releaseSettings ? systemSettings.releaseSettings.manualRelease !== 'false' : true;

          let currencyChoice;
          if (systemSettings.currencySettings) {
            currencyChoice = systemSettings.currencySettings.currencyChoice;
          } else {
            const defaultCurrency = currencyExchangeService.getDefaultCurrency();
            currencyChoice = `${defaultCurrency.sign} (${defaultCurrency.abbreviation})`;
          }
          currencyExchangeService.setSystemCurrency(currencyChoice);

          if (systemSettings.sourcingCostSetting) {
            sourceCostService.setSetting(systemSettings.sourcingCostSetting.isEnabled);
          }
          return response;
        });
    }

    function getProfile() {
      setAuthData();
      headers.proxy = sessionData.proxy ? false : sessionData.proxy;

      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getprofile, '', '', headers)
        .then(function (res) {
          if (res.code === 0) {
            defaultTemplateService.updateAllDefaultTemplates(res.data.templateKeys);
            searchPresetService.updateAllDefaultPresets(res.data.templateKeys);
          }
          return res;
        })
    }

    /**
     * Creates ot updates already existing systemSetting.
     * @param setting {object}, which describes the changes:
     *   - configurationSetting {string} - the name of the setting to be created, updated
     *   - customerId {string} - the id of the customer, fulfilling operation
     *   - value {boolean} - the value of the setting
     *   - key {string} - the key data to be stored by
     *   - headers {object} - the fuse admin headers to be set
     * @returns {*}
     */
    function updateSystemSetting(setting) {
      const params = {
        customerId: setting.customerId
      };
      const data = {
        groupName: setting.groupName,
        propertiesMap: setting.key ? {[setting.key]: setting.value} : setting.value
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdategroupsetting, params, data, setting.headers);
    }

    function removeSystemSetting({groupSettings, groupSettingsType}) {
      setAuthData();
      const params = {
        customerId: sessionData.proxy === true ? sessionData.customerAdminId : sessionData.userId,
        groupSettings,
        groupSettingsType
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.removegroupsetting, params);
    }

    return service;
  }
})();
