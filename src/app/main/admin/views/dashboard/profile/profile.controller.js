(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('profileAdminController', profileAdminController);

    /** @ngInject */
    function profileAdminController($scope, $state, AuthService, $mdToast, AdminService, hostUrlDevelopment, errors) {

        var vm = this;

        vm.error = errors;

        vm.customerProfileForm = {};

        vm.sessionData = {};

        vm.sessionData = AuthService.getSessionData('customerData');
        vm.ngFlowOptions = {
            // You can configure the ngFlow from here
            target: hostUrlDevelopment.test.uploadfile + '?imageType=avatar',
            testChunks: false,
            fileParameterName: 'uploadfile'
            /*chunkSize                : 15 * 1024 * 1024,
             maxChunkRetries          : 1,
             simultaneousUploads      : 1,
             testChunks               : false,
             progressCallbacksInterval: 1000*/
        };
        vm.ngFlow = {
            // ng-flow will be injected into here through its directive
            flow: {}
        };
        vm.customerProfileFunction = customerProfileFunction;


        vm.fileAdded = fileAdded;
        vm.upload = upload;
        vm.fileSuccess = fileSuccess;
        var params, header;
        init();

        function init() {
            if (vm.sessionData.userId) {
                params = {
                    customerId: vm.sessionData.userId
                };
                header = {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: false
                };
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

        function customerProfileFunction() {
            //For Progress Loader
            vm.progress = true;

            if (vm.sessionData.userId) {
                params = {
                    customerId: vm.sessionData.userId
                };
                header = {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: false
                };
                if(vm.customerProfileForm.avatar === null){
                  vm.customerProfileForm.avatar = '';
                }
                customerProfileCall('POST', hostUrlDevelopment.test.updateprofile, params, vm.customerProfileForm, header);
            } else {
                $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
            }
        }

        function customerProfileCall(method, url, params, data, header) {
            AdminService.dataManipulation(method, url, params, data, header)
                .then(function (response) {
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            $mdToast.show($mdToast.simple().textContent('Successfully Update!').position('top right'));
                            //$state.go('app.admin.dashboard');
                            window.location.reload();
                            break;
                        case 4006:
                            break;
                        default:
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));

                });
        }

        function fileAdded(file) {

            var uploadingFile = {
                id: file.uniqueIdentifier,
                file: file,
                type: 'uploading'
            };
        }

        function upload(files) {
            vm.progressimage = true;
            // Set headers
            vm.ngFlow.flow.opts.headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'authId': vm.sessionData.authId,
                'channel_name': vm.sessionData.channel_name,
                'proxy': vm.sessionData.proxy
            };

            vm.ngFlow.flow.upload();
        }

        function fileSuccess(file, message) {

            var response = JSON.parse(message);
            vm.progressimage = false;
            vm.customerProfileForm.avatar = response.data.imagePath;

        }

    }

})();
