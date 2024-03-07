(function () {
    'use strict';

    angular
        .module('app.admin')
        .factory('getUsersService', getUsersService);


    /** @ngInject */
    function getUsersService($q, $http, hostUrlDevelopment, AuthService, errors, $mdToast, $state) {

        var vm = this;
        vm.sessionData = {};
        vm.error = errors;

        vm.sessionData = AuthService.getSessionData('customerData');

        var service = {
            data: {},
            error: errors,
            getList: getList
        };
        function getList() {
            // Create a new deferred object
            var deferred = $q.defer();

            var headers = {
                authId: vm.sessionData.authId,
                channel_name: vm.sessionData.channel_name,
                proxy: vm.sessionData.proxy
            };
            getListCall(hostUrlDevelopment.test.getusers, headers).then(function (response) {
                switch (response.code) {
                    case 0:
                        // Attach the data
                        service.data = response.data;
                        break;
                    case 403:
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        AuthService.userLogout('customerData');
                        //$state.go('app.landing');
                        $state.go('app.login', {channelName:'aws'});
                        break;
                    case 1006:
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                         AuthService.userLogout('customerData');
                         //$state.go('app.landing');
                        $state.go('app.login', {channelName:'aws'});
                        break;
                    default:
                        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                        AuthService.userLogout('customerData');
                        //$state.go('app.landing');
                        $state.go('app.login', {channelName:'aws'});
                }
                deferred.resolve(response);
            }).catch(function (response) {
                deferred.resolve(response);
            });


            return deferred.promise;
        }

        function getListCall(url, headers) {
            return $http({
                method: 'GET',
                url: url,
                headers: headers || ''
            }).then(successFunction).catch(errorFunction);


            // SUCCESS
            function successFunction(response) {

                return response.data;

                // Resolve the promise
            }

            // ERROR
            function errorFunction(response) {
                // Reject the promise
                return response;
            }
        }


        return service;
    }
})();
