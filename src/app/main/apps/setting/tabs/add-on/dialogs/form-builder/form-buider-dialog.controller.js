(function() {
  'use strict';

  angular
    .module('app.customer')
    .controller('FormBuilderDialogController', FormBuilderDialogController);

  /** @ngInject */
  function FormBuilderDialogController(ScrumboardService, AuthService, BoardService, CustomerService, AddonServiceFlag, hostUrlDevelopment, $scope, $mdDialog, $mdToast) {

    var vm = this;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //Data
    vm.boardList = [];
    vm.setUrl = {};
    vm.copyUrl = false;

    //Methods
    vm.getBoardList = getBoardList;
    vm.getMappingField = getMappingField;
    vm.BoardChangeFunction = BoardChangeFunction;
    vm.addonServiceChange = addonServiceChange;
    vm.submit = submit;
    vm.closeDialog = closeDialog;
    vm.bindMappingformData = bindMappingformData;

    //For Service Call Header
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //get addonservice flag
    vm.addonservice = AddonServiceFlag;

    //For Service Call Parameter
    var params = '';

    // Initialize
    init();

    function init() {
      getBoardList();
    }

    // get all board list
    function getBoardList() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboards, params, '', headers)
        .then(function(response) {
          switch (response.code) {
            case 0:
              vm.boardList = response.data;
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    // for getting mapped field
    function getMappingField(boardid) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          boardId: boardid,
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          boardId: boardid,
        };
      }
      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getmappingfieldbyboardid, params, '', headers)
        .then(function(response) {
          switch (response.code) {
            case 0:
              vm.cardData = response.data;
              vm.additionalInfo = vm.cardData.attributeList;
              vm.customCardToken = response.data.customCardToken;
              vm.customerId = response.data.customerId;
              // set copy to clipbord url variable
              var copyClipboardUrl = hostUrlDevelopment.baseUrl + "createcustomcard?authToken=" + response.data.customCardToken;
              vm.setUrl = copyClipboardUrl;
              $scope.supported = false;
              $scope.textToCopy = vm.setUrl;
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }


    function addonServiceChange() {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
        };
      }
      var data = {
        formBuilder: true
      }
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addonservice, params, data, headers)
        .then(function(response) {
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }


    function BoardChangeFunction(boardid) {
      // bindMappingformData();
      vm.copyUrl = false;
      getMappingField(boardid);
    }


    function submit() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          boardId: vm.selectboard,
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          boardId: vm.selectboard,
        };
      }

      var data = {
        customCardToken: vm.customCardToken,
        attachments: vm.cardData.attachments,
        attributeList: vm.additionalInfo,
        boardId: vm.selectboard,
        customerId: vm.cardData.customerId,
        description: vm.cardData.description,
        cardTitle: vm.cardData.cardTitle
      }
      addonServiceChange();
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.savemappingforexternalform, params, data, headers)
        .then(function(response) {
          switch (response.code) {
            case 0:
              $mdDialog.hide();
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });

    }

    if (vm.addonservice) {
      bindMappingformData();
    }

    function bindMappingformData() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          addOnType: 'card',
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          addOnType: 'card',

        };
      }
      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getmappingfieldbytype, params, '', headers)
        .then(function(response) {
          switch (response.code) {
            case 0:
              // set copy to clipbord url variable  when binding form data
              vm.customCardToken = response.data.customCardToken;
              var copyClipboardUrl = hostUrlDevelopment.baseUrl + "createcustomcard?authToken=" + response.data.customCardToken;
              vm.setUrl = copyClipboardUrl;
              $scope.supported = false;
              $scope.textToCopy = vm.setUrl;
              vm.selectboard = response.data.boardId;
              vm.cardData = response.data;
              vm.additionalInfo = response.data.attributeList;
              break;
            case 4004:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
        });
    }

    $scope.success = function() {
      vm.copyUrl = true;
    }

    function closeDialog() {
      $mdDialog.cancel();
    };

  }
})();
