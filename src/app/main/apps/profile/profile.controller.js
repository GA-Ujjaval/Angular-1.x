(function () {
  'use strict';

  angular
    .module('app.admin')
    .controller('profileCustomerController', profileCustomerController);

  /** @ngInject */
  function profileCustomerController($scope, $interval, AuthService, $state, $mdToast, CustomerService, hostUrlDevelopment,
                                     errors) {
    var vm = this;

    vm.error = errors;

    vm.customerProfileForm = {};
    vm.updateCustomerForm = {};
    vm.sessionData = {};

    vm.ngFlowOptions = {
      // You can configure the ngFlow from here
      chunkSize: 100 * 1024 * 1024,
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

    vm.sessionData = AuthService.getSessionData('customerData');

    vm.customerProfileFunction = customerProfileFunction;
    vm.Reset = resetFunction;
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
          proxy: vm.sessionData.proxy
        };
        getProfileDetailCall('GET', hostUrlDevelopment.test.getprofile, '', '', header);
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
    }

    function getProfileDetailCall(method, url, params, data, header) {
      CustomerService.addNewMember(method, url, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.customerProfileForm = response.data;
              //console.log(' vm.customerProfileForm : ', vm.customerProfileForm);
              break;
            case 4006:
              break;
            default:
            //console.log('Error : ',response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function resetFunction() {
      //console.log("reset");
      vm.customerProfileForm.userEmail = '';
      vm.customerProfileForm.userName = '';
      vm.customerProfileForm.firstName = '';
      vm.customerProfileForm.lastName = '';
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
        if (vm.customerProfileForm.avatar === null) {
          vm.customerProfileForm.avatar = '';
        }
        customerProfileCall('POST', hostUrlDevelopment.test.updateprofile, params, vm.customerProfileForm, header);
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
    }

    function customerProfileCall(method, url, params, data, header) {
      CustomerService.addNewMember(method, url, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent('Successfully Update!').position('top right'));
              //$state.go('app.customer.profile');
              window.location.reload();
              break;
            case 4:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
            //console.log(response.message);
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

    /**
     * Upload
     * Automatically triggers when files added to the uploader
     */
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

    /**
     * File upload success callback
     * Triggers when single upload completed
     *
     * @param file
     * @param message
     */
    function fileSuccess(file, message) {

      var response = JSON.parse(message);
      vm.progressimage = false;
      vm.customerProfileForm.avatar = response.data.imagePath;

    }

  }

})();
