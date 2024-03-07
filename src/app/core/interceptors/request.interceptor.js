(function () {
  'use strict';

  angular.module('app.objects')
    .factory('RequestInterceptor', ['$injector', 'hostUrlDevelopment', RequestInterceptor]);

  function RequestInterceptor($injector, hostUrlDevelopment) {
    const request = (config) => {
      if (config.url.indexOf(hostUrlDevelopment.baseUrl) === -1) {
        return config;
      }
      const sessionData = $injector.get('AuthService').getSessionData('customerData');
      if (!sessionData) {
        return config;
      }
      const headers = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      };
      const params = {
        customerId: sessionData.proxy === true ? sessionData.customerAdminId : sessionData.userId
      };

      config.headers = _.isEmpty(config.headers) ? headers : config.headers;
      config.headers = assignExcept(config.headers, headers, 'proxy');
      config.params = _.isEmpty(config.params) ? params : config.params;
      config.params = assignExcept(config.params, params, 'customerId');
      return config;
    };

    function assignExcept(target, val, prop) {
      const newBase = _.cloneDeep(target);
      const oldVal = newBase[prop];
      Object.assign(newBase, val);
      newBase[prop] = oldVal;
      return newBase;
    }

    return {
      request
    };
  }

})();
