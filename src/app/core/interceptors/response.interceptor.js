(function () {
  'use strict';

  angular.module('app.objects')
    .factory('ResponseInterceptor', ['$injector', ResponseInterceptor]);

  function ResponseInterceptor($injector) {
    const response = (response) => {
      if (response.data && response.data.code === 4008) {
        const mdToast = $injector.get('$mdToast');
        const errors = $injector.get('errors');
        const AuthService = $injector.get('AuthService');
        const state = $injector.get('$state');
        mdToast.show(mdToast.simple().textContent(errors.er4008).position('top right'));
        AuthService.userLogout('customerData');
        state.go('app.login', {
          channelName: 'aws'
         });
      }
      return response;
    };

    return {
      response
    };
  }
})();
