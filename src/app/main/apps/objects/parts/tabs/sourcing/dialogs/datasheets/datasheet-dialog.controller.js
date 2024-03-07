(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('DatasheetController', DatasheetController);

  /** @ngInject */
  function DatasheetController($state, $mdDialog, Sourcing, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, objectId) {

    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Service Call Parameter
    var params = '';
    var data = '';

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    vm.Manufactureattachments = Sourcing.attachmentsList;

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //For Attachment
    vm.fileAdded = fileAdded;
    vm.upload = upload;
    vm.fileSuccess = fileSuccess;
    vm.removeAttachment = removeAttachment;

    //For Attachments
    vm.ngFlowOptions = {
      // You can configure the ngFlow from here
      target: hostUrlDevelopment.test.uploadfile + '?imageType=link&' + 'objectId=' + objectId + '/' + Sourcing.sourcingId,
      testChunks: false,
      fileParameterName: 'uploadfile'
    };
    vm.ngFlow = {
      // ng-flow will be injected into here through its directive
      flow: {}
    };
    vm.dropping = false;

    function upload(files) {
      vm.progress = true;
      // Set headers
      vm.ngFlow.flow.opts.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'authId': vm.sessionData.authId,
        'channel_name': vm.sessionData.channel_name,
        'proxy': vm.sessionData.proxy
      };

      vm.ngFlow.flow.upload();
    }

    function fileAdded(file) {

      // Prepare the temp file data for media list

      var uploadingFile = {
        id: file.uniqueIdentifier,
        file: file,
        type: 'uploading'
      };
    }


    function fileSuccess(file, message) {
      var response = JSON.parse(message);
      if (response.code == 0) {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: objectId,
            sourcingId: Sourcing.sourcingId,
            attachmentType: 'sourcing'
          }
        }
        else {
          params = {
            customerId: vm.sessionData.userId,
            objectId: objectId,
            sourcingId: Sourcing.sourcingId,
            attachmentType: 'sourcing'
          }
        }
        var ext = response.data.fileName.substr(response.data.fileName.lastIndexOf('.') + 1);

        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
          data = {
            name: response.data.fileName,
            src: response.data.imagePath,
            type: "image"
          };
        }
        else {
          data = {
            name: response.data.fileName,
            src: response.data.imagePath,
            type: "link"
          };
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremoveattachment, params, data, header)
          .then(function (response) {
            //console.log(response);
            switch (response.code) {
              case 0:
                //For Progress Loader
                vm.progress = false;

                angular.forEach(response.data.sourcingList, function (value, key) {
                  if (value.type === "manufacturer") {
                    vm.Manufactureattachments = value.attachmentsList;
                  }
                });
                break;
              case 1006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                console.log(response.message);
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }
      else {
        vm.progress = false;
        $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
      }
    }

    /**
     * Remove attachment
     *
     * @param item
     */
    function removeAttachment(item) {
      //For Progress Loader
      vm.progress = true;
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: objectId,
          sourcingId: Sourcing.sourcingId,
          attachmentType: 'sourcing'
        }
      }
      else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: objectId,
          sourcingId: Sourcing.sourcingId,
          attachmentType: 'sourcing'
        }
      }

      data = {
        id: item.id,
        name: item.name,
        src: item.imagePath,
        type: item.type
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremoveattachment, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              //For Progress Loader
              vm.progress = false;
              angular.forEach(response.data.sourcingList, function (value, key) {
                if (value.type === "manufacturer") {
                  vm.Manufactureattachments = value.attachmentsList;
                }
              });
              $mdToast.show($mdToast.simple().textContent("Removed Attachment Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    //Methods
    vm.closeDialog = closeDialog;

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }
  }
})();
