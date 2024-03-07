(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('dashboardAdminController', dashboardAdminController);

    /** @ngInject */
    function dashboardAdminController($scope, hostUrlDevelopment, AdminService, errors, $mdToast, AuthService, $state, $mdDialog) {

        var vm = this;

        //For Error ----------------------------------------------------------------------------------------------------
        vm.error = errors;

        //For Progress Loader-------------------------------------------------------------------------------------------
        vm.progress = false;

        //For Tabs Forms Main Object------------------------------------------------------------------------------------
        vm.createCustomerForm = {};
        vm.proxyForm = {};

        //For Session---------------------------------------------------------------------------------------------------
        vm.sessionData = {};
        vm.sessionData = AuthService.getSessionData('customerData');

        //For Service Call----------------------------------------------------------------------------------------------
        vm.proxyLoginFunction = proxyLoginFunction;
        vm.getAllUsersCall = getAllUsersCall;

        //For Global Variable-------------------------------------------------------------------------------------------
        vm.getUsers = [];
        var params = '';
        var header = '';
        vm.onlyActiveAccounts = true;
        $scope.$on('render-dashboard', function() {
            getAllUsersCall();
        });

        //For Dialog Definition-----------------------------------------------------------------------------------------
        vm.showTabDialog = function (ev, editData) {
            $mdDialog.show({
                controller: 'orgDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/admin/views/dashboard/dialogs/org-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    event: ev,
                    editData: editData || '',
                    $parent: vm,
                    callback: null
                }
            }).then(function (data) {
                getAllUsersCall();
                getProxyCall();
            }, function () {
                getAllUsersCall();
            });
        };

        //Functions-----------------------------------------------------------------------------------------------------

        init();

        function init() {
            if (vm.sessionData.userId) {
                params = {
                    customerId: vm.sessionData.userId
                };
                header = {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: vm.sessionData.proxy
                };
                getAllUsersCall();
                getProxyCall();
                getProfileDetailCall('GET', hostUrlDevelopment.test.getprofile, '', '', header);
            } else {
                $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
            }
        }

        function getProfileDetailCall(method, url, params, data, header){

            AdminService.dataManipulation(method, url, params, data, header)
                .then(function (response) {

                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            vm.customerProfileForm = response.data;
                            break;
                        case 4006:
                            break;
                        default:
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    console.log(vm.error.erCatch);
                });
        }

        function getProxyCall(){

            var header = {
                authId: vm.sessionData.authId,
                channel_name: vm.sessionData.channel_name
            };

            AdminService.dataManipulation('GET', hostUrlDevelopment.test.getproxy, '', '', header)
                .then(function (response) {

                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            vm.cutomerData = response.data;
                            break;
                        case 4006:
                            break;
                        default:
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    console.log(vm.error.erCatch);
                });
        }

        function getAllUsersCall() {

            //For Data Table--------------------------------------------------------------------------------------------
            var headers = {
                authId: vm.sessionData.authId,
                channel_name: vm.sessionData.channel_name,
                proxy: vm.sessionData.proxy
            };

            AdminService.dataManipulation('GET', hostUrlDevelopment.test.getusers, '', '', headers)
                .then(function (response) {

                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            if (vm.onlyActiveAccounts) {
                                vm.getUsers = _.filter(response.data.Organization, function(user) {
                                    if (Object.keys(user.systemSettings).length) {
                                        if (user.systemSettings.companystatusSetting) {
                                            return user.systemSettings.companystatusSetting.status == "true";
                                        }
                                    }
                                });
                            } else {
                                vm.getUsers = _.filter(response.data.Organization, function(user) {
                                    if (Object.keys(user.systemSettings).length) {
                                        if (user.systemSettings.companystatusSetting) {
                                            return user.systemSettings.companystatusSetting.status == "false";
                                        }
                                    }
                                });
                            }
                            break;
                        case 4006:
                            break;
                        default:
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    console.log(vm.error.erCatch);
                });
        }

        function proxyLoginFunction() {

            //For Progress Loader
            vm.progress = true;

            if (vm.sessionData.userId) {
                var params = {
                    customerId: vm.sessionData.userId
                };
                var header = {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: true
                };
                proxyLoginCall('POST', hostUrlDevelopment.test.proxyauthentication, params, vm.proxyForm, header);
            } else {
                $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
            }
        }

        function proxyLoginCall(method, url, params, data, header) {
            AdminService.dataManipulation(method, url, params, data, header)
                .then(function (response) {

                    //For Progress Loader
                    vm.progress = false;

                    switch (response.code) {
                        case 0:
                            AuthService.proxyLogin('customerData', vm.sessionData, response.data.customerAdminId);
                            $state.go('app.customer.dashboard');
                            break;
                        default:
                            $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                });
        }
    }

})();
