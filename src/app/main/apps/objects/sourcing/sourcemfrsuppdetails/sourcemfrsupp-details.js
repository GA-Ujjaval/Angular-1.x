(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('SourcmfrsuppDetailsController', SourcmfrsuppDetailsController);

  /** @ngInject */
  function SourcmfrsuppDetailsController($state, $location, $filter, msUtils, $http, $stateParams, $mdDialog, $document, hostUrlDevelopment, CustomerService,
                                         errors, $mdToast, AuthService, DialogService, pageTitleService, pageTitles,
                                         $scope, $timeout, introService, $rootScope, objectPageEnum, fuseUtils,
                                         BoardService, CardFilters, $window, attributesUtils, uiGridGridMenuService) {

    var vm = this;
    vm.fuseUtils = fuseUtils;
    vm.objectPageEnum = objectPageEnum;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Service Call Parameter
    var params = '';
    var data = '';
    vm.arrayOfAttachmentFiles = [];

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.readonly = fuseUtils.findAccessRights();

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //data
    var id = $stateParams.id;
    vm.selectedTab = $stateParams.attachmentsFlag ? 2 : 0;
    vm.timeLineList = [];
    vm.heightMax = document.body.scrollHeight;
    var manufacturerPartsId = 'grid-mfr-parts',
      supplierPartsId = 'grid-supp-parts';

    vm.manufacturerPartsId = 'grid-mfr-parts';
    vm.supplierPartsId = 'grid-supp-parts';

    vm.Save = true;

    vm.linkTarget = '_self';

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    $rootScope.$on('updateContactTimeline', function (event, args) {
      init();
    });

    //Method
    init();
    vm.editSourcingDialog = editSourcingDialog;
    vm.saveSourcingObjects = saveSourcingObjects;
    vm.backFunction = backFunction;
    vm.opencontactsDialog = opencontactsDialog;
    vm.deletesourcingobject = deletesourcingobject;
    vm.addNewComment = addNewComment;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    vm.initManufacturesSuppliers = initManufacturesSuppliers;
    vm.editTable = editTable;
    vm.printTable = printTable;
    vm.ObjectSave = ObjectSave;
    vm.OpenLinkFunction = OpenLinkFunction;
    vm.getAllAttachments = getAllAttachments;
    vm.restoreState = restoreState;

    vm.availabilityValues = [
      {
        value: 'yes',
        text: 'Yes'
      }, {
        value: 'no',
        text: 'No'
      }];

    function ObjectSave(flag) {
      if (flag) {
        vm.Save = true;
      } else {
        vm.Save = false;
      }
    }

    function init() {
      // getAllAttachments();
      BoardService.getAllMembers().then(function (resp) {
        vm.members = resp;
      });
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id
        };
      } else {
        params = {
          objectId: id
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getsourcingobjectbyid, params, '', header)
        .then(function (response) {
          vm.progressAdd = false;
          switch (response.code) {
            case 0:
              vm.sourcingObjectData = response.data;
              vm.sourcingObjectData.approved = vm.sourcingObjectData.approved.toLowerCase();
              if (vm.sourcingObjectData.sourceType === 'manufacturer') {
                vm.sourceType = 'Manufacturer';
              } else {
                vm.sourceType = 'Supplier';
              }
              if (vm.sourcingObjectData.sourcingObjectHistory) {
                var creator = _.find(vm.members, {
                  id: vm.sourcingObjectData.sourcingObjectHistory.createdBy
                });
                var editor = _.find(vm.members, {
                  id: vm.sourcingObjectData.sourcingObjectHistory.modifiedBy
                });
                vm.createdBy = creator ? creator.firstName + " " + creator.lastName : '';
                vm.modifiedBy = editor ? editor.firstName + " " + editor.lastName : '';
                vm.createDate = $filter('date')(vm.sourcingObjectData.sourcingObjectHistory.createDate, "medium");
                vm.modifiedDate = $filter('date')(vm.sourcingObjectData.sourcingObjectHistory.modifiedDate, "medium");
                vm.sourcingObjectData.sourcingObjectHistory.revisionNotes = vm.sourcingObjectData.sourcingObjectHistory.revisionNotes;
              }
              angular.forEach(vm.sourcingObjectData.timeLineList, function (value, key) {
                angular.forEach(vm.members, function (val, keys) {
                  if (val.id === value.idMember) {
                    value.userName = val.name;
                  }
                });
              });
              vm.timeLineList = transformJsonTimeLine(vm.sourcingObjectData.timeLineList);
              angular.forEach(vm.sourcingObjectData.commentsList, function (value, key) {
                angular.forEach(vm.members, function (val, keys) {
                  if (val.id === value.idMember) {
                    value.memberName = val.name;
                  }
                });
              });
              angular.forEach(vm.sourcingObjectData.attachmentsList, function (value) {

                var uploadDate = new Date(value.time).toLocaleDateString();
                value.uploadDate = uploadDate;

                if (value.src.indexOf('aws') !== -1) {
                  const urlComponents = value.src.split('/');
                  urlComponents[urlComponents.length-1] = urlComponents[urlComponents.length-1].replace(/[+]/g, '%20');
                  value.src = '';
                  for (let i=0; i < urlComponents.length-1; i++) {
                    value.src += `${urlComponents[i]}/`;
                  }
                  value.src += urlComponents[urlComponents.length-1];
                }

                getMemberName(vm.members, value);

                if (value.name != null) {
                  var uploadType = value.name.substr(value.name.indexOf("."));
                  if (uploadType == '.jpg' || uploadType == '.png' || uploadType == '.jpeg' || uploadType == '.gif') {
                    value.uploadType = 'Image';
                  } else {
                    if (value.type === 'external_link') {
                      value.uploadType = 'Link';
                    } else {
                      value.uploadType = 'Document';
                    }
                  }
                }
              });
              setPageTitle(vm.sourcingObjectData.name);
              break;
            case 4006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
              $state.go('app.objects.sourcing');
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function getSourcingObject() {
      return {
        sourceType: vm.sourcingObjectData.sourceType,
        objectId: vm.sourcingObjectData.objectId,
        name: vm.sourcingObjectData.name,
        code: vm.sourcingObjectData.code,
        approved: vm.sourcingObjectData.approved,
        description: vm.sourcingObjectData.description,
        //notes: vm.sourcingObjectData.notes,
        contactNumber: vm.sourcingObjectData.contactNumber,
        website: vm.sourcingObjectData.website,
        address: vm.sourcingObjectData.address,
        tags: vm.sourcingObjectData.tags,
        status: vm.sourcingObjectData.status,
        additionalInfoList: vm.sourcingObjectData.additionalInfoList
      }
    }

    // this method used for getting all attachments
    function getAllAttachments() {
      if (vm.sessionData.proxy == true) {
        params = {
          objectId: id,
          customerId: vm.sessionData.customerAdminId,
          type: 'sourcing'
        };
      } else {
        params = {
          objectId: id,
          customerId: vm.sessionData.userId,
          type: 'sourcing'
        };
      }
      vm.progress = true;
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.downloadattachmentsaszip, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.allAttachmentsZipFile = response.data;
              OpenLinkFunction(vm.allAttachmentsZipFile);
              init();
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 13:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 16:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log(response.message);
        });
    }

    function editSourcingDialog(ev, type, sourcingObjectData) {
      $mdDialog.show({
        controller: 'CreateManufacturerController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/tabs/manufactures/dialog/create-manufacturer-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          type: type,
          sourcingObject: sourcingObjectData
        }
      })
        .then(function () {
          init();
        }, function () {

        });
    }

    //saveorupdatesourcingobject
    function saveSourcingObjects() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      data = getSourcingObject();

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatesourcingobject, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              init();
              $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
              break;
            case 4006:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            case 4266:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    //For Back Button individual page.
    function backFunction() {
      if (vm.sourceType === 'Manufacturer') {
        $rootScope.$broadcast('tabChange', {
          data: 'manufacturers'
        });
        $state.go('app.objects.sourcing');
      } else {
        $rootScope.$broadcast('tabChange', {
          data: 'suppliers'
        });
        $state.go('app.objects.sourcing');
      }
    }

    function opencontactsDialog(ev, contact, contacts) {
      $mdDialog.show({
        controller: 'contactsController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/sourcemfrsuppdetails/tabs/contacts/dialog/addorupdatecontacts/contacts.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          objectId: id,
          contactDetails: contact,
          contacts: contacts
        }
      }).then(function () {
        init();
      }, function () {

      });
    }

    /**
     * Delete Category Confirm Dialog
     */
    function deletesourcingobject(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to Delete this object?')
        .ariaLabel('delete sourcing object')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: id
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            objectId: id
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.deletesourcingobject, params, '', header)
          .then(function (response) {

            //For Progress Loader
            vm.progress = false;

            switch (response.code) {
              case 0:
                $state.go('app.objects.sourcing');
                $mdToast.show($mdToast.simple().textContent("Removed Successfully.").position('top right'));
                break;
              case 4006:
                console.log(response.message);
                break;
              case 1006:
                console.log(response.message);
                break;
              case 4004:
                console.log(response.message);
                break;
              case 11:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              case 13:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              case 16:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            //For Progress Loader
            vm.progress = false;
            console.log('catch');
          });
      });
    }

    function getMemberName(members, value) {
      angular.forEach(members, function (val) {
        if (val.id == value.createdBy) {
          value.uploadUser = val.name;
        }
      });
      return value;
    }

    //For timeline
    function transformJsonTimeLine(response) {
      var data = [];

      angular.forEach(response, function (val, key) {
        // if (val.title === 'IMPORT' || val.title === 'IMPORT UPDATE' || val.title === 'MANUAL UPDATE') {
        if (val.title === 'MANUAL UPDATE' || val.title === 'Add Attachment' || val.title === 'IMPORT' || val.title === 'IMPORT UPDATE') {
          if (angular.isString(val.action || '')) {
            vm.line1 = (val.action || '').split('#');
            val.action = vm.line1;
          } else if (angular.isArray(val.action)) {
            // do nothing
          }
        }
        data.push({
          'card': {
            'template': 'app/core/directives/ms-card/templates/template-5/template-5.html',
            'title': val.title,
            'event': val.message,
            'action': val.action,
            'media': {
              'image': {
                'src': val.avatar || 'assets/images/avatars/profile.jpg',
                'alt': val.userName
              }
            }
          },
          'name': val.title,
          'icon': iconSelect(val.title),
          'time': val.time,
          'event': val.message,
          'action': val.action,
          'member': val.userName
        });
      });
      return data;
    }

    function iconSelect(response) {
      var data = '';
      switch (response) {
        case 'create':
          data = 'icon-clock';
          break;
        case 'edit':
          data = 'icon-pencil';
          break;
        case 'comments':
          data = 'icon-message';
          break;
        case 'associated':
          data = 'icon-trello';
          break;
        case 'Add Attachment':
          data = 'icon-paperclip';
          break;
        case 'remove Attachment':
          data = 'icon-paperclip';
          break;
        case 'changeStatus':
          data = 'icon-flip-to-front';
          break;
        case 'ADD':
          data = 'icon-document';
          break;
        case 'MANUAL UPDATE':
          data = 'icon-document';
          break;
        case 'IMPORT':
          data = 'icon-document';
          break;
        case 'REMOVE':
          data = 'icon-document';
          break;
        case 'Import overwrite':
          data = 'icon-document';
          break;
        case 'Updated BOM':
          data = 'icon-document';
          break;
        default:
          data = 'icon-account-alert';
      }
      return data;
    }

    function addNewComment() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id
        }
      }

      data = {
        message: vm.newCommentText
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.commentonsourcingobject, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              init();
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 4006:
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    $scope.$watch('vm.selectedTab', function () {
      if (!vm.sourcingObjectData) {
        return;
      }
      var currentTab = vm.sourcingObjectData.sourceType === 'manufacturer' ? pageTitles.tabNamesForManufacturer[vm.selectedTab]
        : pageTitles.tabNamesForSupplier[vm.selectedTab];
      setPageTitle(vm.sourcingObjectData.name, null, currentTab)
    });

    function setPageTitle(partNumber, revision, tab) {
      if (!partNumber) {
        return;
      }
      pageTitleService.setPageTitleInDetails(partNumber, revision, tab);
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    //For Attachments
    vm.upload = upload;
    vm.fileSuccess = fileSuccess;
    vm.fileAdded = fileAdded;
    vm.downloadAttacFunction = downloadAttacFunction;
    vm.openAttacFunction = openAttacFunction;
    vm.removeAttachment = removeAttachment;
    //vm.openAttacFunction = openAttacFunction;
    //vm.downloadAttacFunction = downloadAttacFunction;
    vm.uploadForms = uploadForms;
    vm.copyToClipboard = copyToClipboard;
    vm.checkScroll = checkScroll;
    vm.fileUpload = [];

    if (vm.sessionData.proxy == true) {
      params = {
        customerId: vm.sessionData.customerAdminId
      }
    } else {
      params = {
        customerId: vm.sessionData.userId
      }
    }
    vm.ngFlowOptions = {
      // You can configure the ngFlow from here
      chunkSize: 1000 * 1024 * 1024,
      target: hostUrlDevelopment.test.uploadfile + '?imageType=link&' + 'customerId=' + params.customerId + '&' + 'objectId=' + id,
      testChunks: false,
      fileParameterName: 'uploadfile'
    };
    vm.ngFlow = {
      // ng-flow will be injected into here through its directive
      flow: {},
      allowDuplicateUploads: true
    };
    //vm.dropping = false;
    vm.dropping = false;
    //vm.submitButton = true;
    vm.attachLink = false;
    vm.linkName = false;
    vm.Files = '';
    vm.type = '';
    vm.paramPath = [];

    function upload() {
      vm.progress = true;
      // Set headers
      vm.ngFlow.flow.opts.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'authId': vm.sessionData.authId,
        'channel_name': vm.sessionData.channel_name,
        'proxy': vm.sessionData.proxy
      };
      vm.uploadFlag = true;
      vm.closeUpload = true;
      vm.ngFlow.flow.upload();
    }

    vm.chevronD = true;
    vm.chevronU = false;
    vm.chevronDown = function () {
      vm.chevronD = false;
      vm.chevronU = true;
    };
    vm.chevronUp = function () {
      vm.chevronU = false;
      vm.chevronD = true;
    };

    vm.closeUpload = true;
    vm.closeUploadStatus = function () {
      vm.closeUpload = false;
      vm.fileUpload.length = 0;
    }

    function fileAdded(file) {
      var fileType = file.name.substr(file.name.lastIndexOf('.') + 1);
      var relativePath = file.relativePath;
      if (relativePath.substr(0, relativePath.indexOf('/'))) {
        vm.typeFolder = true;
      } else {
        vm.typeFolder = false
      }
      // Prepare the temp file data for media list
      var uploadingFile = {
        id: file.uniqueIdentifier,
        file: file,
        type: 'uploading'
      };
      var uploadingName = {
        name: uploadingFile.file.name,
        src: '',
        uploadFlag: true,
        fileType: fileType,
        typeFolder: vm.typeFolder
      }
      vm.fileUpload.push(uploadingName);
    }

    function fileSuccess(file, message) {
      vm.attachLink = true;
      var response = JSON.parse(message);
      if (response.code == 0) {
        vm.arrayOfAttachmentFiles.push(response);
      }
    }

    vm.uploadComplete = uploadComplete;
    vm.attachementApiCall = attachementApiCall;

    vm.fileUploadCounter = 0;

    function uploadComplete() {
      vm.totalfilesCount = vm.arrayOfAttachmentFiles.length || [];
      vm.attachementApiCall(vm.fileUploadCounter);
    }

    function attachementApiCall(index) {
      var file = vm.arrayOfAttachmentFiles[index];
      if (file) {
        addremoveAttachment(file).then(function (res) {
          if (res) {
            vm.fileUploadCounter += 1;
            if (vm.fileUploadCounter < vm.arrayOfAttachmentFiles.length) {
              vm.attachementApiCall(vm.fileUploadCounter);
            } else if (vm.fileUploadCounter === vm.arrayOfAttachmentFiles.length) {
              vm.fileUploadCounter = 0;
              vm.arrayOfAttachmentFiles = [];
            }
          }
        });
      }
    }

    function addremoveAttachment(response) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id,
          sourcingId: '',
          attachmentType: ''
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id,
          sourcingId: '',
          attachmentType: ''
        }
      }

      var ext = response.data.fileName.substr(response.data.fileName.lastIndexOf('.') + 1);
      if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
        data = {
          name: response.data.fileName,
          src: response.data.imagePath,
          type: "image",
          fileSize: response.data.fileSize
        };
      } else {
        data = {
          name: response.data.fileName,
          src: response.data.imagePath,
          type: "link",
          fileSize: response.data.fileSize
        };
      }

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourcingobjectattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.attachLink = false;
              vm.sourcingObjectData.attachmentsList = response.data.attachmentsList;
              for (var i = 0; i < vm.fileUpload.length; i++) {
                for (var j = 0; j < vm.sourcingObjectData.attachmentsList.length; j++) {
                  if (vm.fileUpload[i].name == vm.sourcingObjectData.attachmentsList[j].name) {
                    vm.fileUpload[i].src = vm.sourcingObjectData.attachmentsList[j].src;
                  }
                }
              }
              vm.ngFlow.flow.files = [];
              init();
              vm.progress = false;
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
          return response;
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
          return response;
        });
    }

    function uploadForms() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id,
          sourcingId: '',
          attachmentType: ''
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id,
          sourcingId: '',
          attachmentType: ''
        }
      }

      data = {
        name: vm.linkname,
        src: vm.attachlink,
        type: "external_link"
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourcingobjectattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.attachlink = '';
              vm.linkname = '';
              vm.attachLink = false;
              vm.sourcingObjectData.attachmentsList = response.data.attachmentsList;
              for (var i = 0; i < vm.fileUpload.length; i++) {
                for (var j = 0; j < vm.sourcingObjectData.attachmentsList.length; j++) {
                  if (vm.fileUpload[i].name == vm.sourcingObjectData.attachmentsList[j].name) {
                    vm.fileUpload[i].src = vm.sourcingObjectData.attachmentsList[j].src;
                  }
                }
              }
              init();
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
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
      //}
    }

    function openAttacFunction(item) {
      if (item.type == 'document' && item.uploadType === 'CAD Files') {
        $location.path('objects/documents/' + item.name);
        $rootScope.tabFlag = true;
      } else {
        window.open(item.src, '_blank');
      }
    }

    function downloadAttacFunction(item) {
      var downloadLink = angular.element('<a></a>'); //create a new  <a> tag element
      downloadLink.attr('href', item.src);
      downloadLink.attr('target', '_blank');
      downloadLink.attr('download', item.name);
      downloadLink[0].click(); //call click function
    }

    function copyToClipboard(src) {
      var aux = document.createElement("input");
      aux.setAttribute('value', src);
      document.body.appendChild(aux);
      aux.select();
      document.execCommand("copy");
      document.body.removeChild(aux);
      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog md-theme="default" class="_md md-default-theme md-transition-in">' +
          '<md-dialog-content class="md-dialog-content">' +
          '<h2 class="md-title ng-binding text-copy-clipboard">Shareable link has been copied to the clipboard<br/>Users with this link can view attachment</h2>' +
          '</md-dialog-content>' +
          '<md-dialog-actions>' +
          '<button class="md-primary md-confirm-button md-button md-ink-ripple md-default-theme  button-copy-clipboard" type="button" ng-click="dialog.hide()" ">' +
          '<span class="ng-binding ng-scope">OK</span>' +
          '</button>' +
          '</md-dialog-actions>' +
          '</md-dialog>',
          parent: angular.element(document.querySelector('#attachments')),
          clickOutsideToClose: true
        }));
    }

    function removeAttachment(item) {
      var confirm = $mdDialog.confirm({
        title: 'Remove Attachment',
        parent: $document.find('#attachments'),
        textContent: 'Are you sure want to remove attachment?',
        ariaLabel: 'remove card',
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Remove',
        cancel: 'Cancel'
      });
      $mdDialog.show(confirm).then(function () {
        //For Progress Loader
        vm.progress = true;
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: id,
            sourcingId: '',
            attachmentType: ''
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            objectId: id,
            sourcingId: '',
            attachmentType: ''
          }
        }
        if (item.type === 'document' && item.uploadType === 'CAD Files') {
          data = {
            id: item.name,
            name: '',
            src: '',
            type: item.type
          };
        } else {
          data = {
            id: item.id,
            name: item.name,
            src: item.src,
            type: item.uploadType
          };
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourcingobjectattachment, params, data, header)
          .then(function (response) {

            switch (response.code) {
              case 0:
                //For Progress Loader
                vm.progress = false;
                init();
                vm.sourcingObjectData.attachmentsList = response.data.attachmentsList;
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
      }, function () {
      });
    }

    function checkScroll() {
      $('#scroll-check').scroll(function () {
        var element = $('.progress-bar');
        if (element.offset()) {
          var originalY = element.offset().top;
        }
        var topMargin = vm.heightMax - 400 - vm.fileUpload.length * 64;
        var scrollTop = $('#scroll-check').scrollTop();

        element.stop(false, false).animate({
          top: scrollTop < originalY ?
            vm.heightMax - 400 - vm.fileUpload.length * 64 + scrollTop :
            scrollTop - originalY + topMargin
        }, 0);
      });
    }

    function initManufacturesSuppliers(type) {
      vm.progress = true;
      if (type == 'Manufacturer') {
        type = 'mfr';
      } else {
        type = 'supp';
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          objectId: id,
          oType: "sourcing",
          oData: type
        };
      } else {
        params = {
          objectId: id,
          oType: "sourcing",
          oData: type
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallsourceobject, params, '', header)
        .then(function (response) {
          vm.progress = false;
          vm.mfrSuppFlag = true;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function (value) {
                extendSourcing(value);
              });
              if (vm.sourceType == 'Manufacturer') {
                vm.manufacturerPartsTableOptions.data = response.data;
                fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.mfrPartsManufacturePage);
              } else {
                vm.supplierPartsTableOptions.data = response.data;
                fuseUtils.handleAllOptionForPagination(vm.supplierPartsTableOptions, objectPageEnum.mfrPartsSupplierPage);
              }
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
          console.log(response.message);
        });
    }

    function editTable(ev, flag) {
      $mdDialog.show({
        controller: 'EditTableController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/edittable.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          pageType: flag,
          whereIsRevisionFrom: '',
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function () {
        if (objectPageEnum.mfrPartsManufacturePage == flag) {
          vm.manufacturerPartsTableOptions.initialized = false;
          vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, flag);
        } else {
          vm.supplierPartsTableOptions.initialized = false;
          vm.supplierPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierPartsTableUiGrid, supplierPartsId, flag);
        }
      }, function () {

      });
    }

    function extendSourcing(val) {
      val.tags = val.tags.join(', ');
      val.additionalInfoList.forEach(function (additionalInfoItem) {
        val[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });
      if (vm.sourceType == 'Manufacturer') {
        val.objectType = 'manufacturerPart';
      } else {
        val.objectType = 'supplierPart';
      }
      if (!_.isEmpty(val.costDetail)) {
        val.cost = val.costDetail[0].cost;
        val.currency = val.costDetail[0].currency;
        val.orderQuantity = val.costDetail[0].moq;
      }

      if (val.sourceObjectHistory) {
        var creator = _.find(vm.members, {
          id: val.sourceObjectHistory.createdBy
        });
        var editor = _.find(vm.members, {
          id: val.sourceObjectHistory.modifiedBy
        });
        val.createdBy = creator.firstName + " " + creator.lastName;
        val.modifiedBy = editor.firstName + " " + editor.lastName;
        val.modifiedDate = $filter('date')(val.sourceObjectHistory.modifiedDate, "medium");
        val.createDate = $filter('date')(val.sourceObjectHistory.createDate, "medium");
        val.revisionNotes = val.sourceObjectHistory.revisionNotes;
      }
    }

    function getAttributes(type) {
      var obj = {};
      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", type));
      var attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", type));
      var attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", type));
      var attributesCost = localStorage.getItem(fuseUtils.buildAttributeName("attributesCost", type));
      var objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", type));

      if (attributesBasic && attributesBasic != 'undefined' && _.find(angular.fromJson(attributesBasic), {
        name: "Packaging"
      })) {
        obj.basicInfo = angular.fromJson(attributesBasic);
      } else {
        if (type == objectPageEnum.mfrPartsManufacturePage) {
          obj.basicInfo = attributesUtils.getManufacturerPartsBasicAttributes();
        } else {
          obj.basicInfo = attributesUtils.getSupplierPartsBasicAttributes();
        }

        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", type), JSON.stringify(obj.basicInfo));
      }
      if (attributesInventory && attributesInventory != 'undefined') {
        obj.inventory = angular.fromJson(attributesInventory);
      }
      if (attributesCost && attributesCost != 'undefined') {
        obj.cost = angular.fromJson(attributesCost);
      } else {
        obj.cost = attributesUtils.getSupplierManufacturerPartsCostAttributes();
      }
      if (attributesAdditional && attributesAdditional != 'undefined') {
        obj.additional = angular.fromJson(attributesAdditional);
      }

      if (objectHistoryAttributes != 'undefined' && objectHistoryAttributes != null) {
        obj.history = JSON.parse(objectHistoryAttributes);
      }
      return obj;
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function buildTableColumns(type) {
      var attributes = getAttributes(type);
      var arr = [];
      if (type == objectPageEnum.mfrPartsManufacturePage) {
        arr = angular.copy(attributesUtils.getBasicSourcingManufacturerPageAttributes());
      } else {
        arr = angular.copy(attributesUtils.getBasicSourcingSupplierPageAttributes());
      }

      if (attributes.basicInfo) {
        angular.forEach((attributes.basicInfo || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value === 'objectName' || o.value === 'name') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/object-name-cell.html';
            }
            arr.push(colDef);
          }
        });
      }

      if (attributes.additional) {
        angular.forEach((attributes.additional || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o, true));
          }
        });
      }

      if (attributes.inventory) {
        angular.forEach((attributes.inventory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      if (attributes.cost) {
        angular.forEach((attributes.cost || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      if (attributes.history) {
        angular.forEach((attributes.history || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      setTemplateForAttachmentsColumn(arr);

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      return arr;
    }

    vm.manufacturerPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.mfrPartsManufacturePage);
    vm.manufacturerPartsTableOptions.exporterSuppressColumns = ['manufacturerId'];
    vm.manufacturerPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.manufacturerPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.manufacturerPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsManufacturePage);
      });
      vm.manufacturerPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelManufacturerParts = $('#grid-mfr-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 0, null, vm.manufacturerPartsTableUiGrid);
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsManufacturePage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsManufacturePage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.manufacturerPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsManufacturePage);
      });
      vm.manufacturerPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.manufacturerPartsTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.manufacturerPartsTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsManufacturePage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.manufacturerPartsTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.manufacturerPartsTableOptions.data.length > 0) && !vm.manufacturerPartsTableOptions.initialized) {
          $timeout(function () {
            vm.manufacturerPartsTableOptions.initialized = true;
          });
        }
        showClearButton(vm.manufacturerPartsTableUiGrid);
        vm.heightTopPanelManufacturerParts = $('#grid-mfr-parts .ui-grid-top-panel').height();
      });

    };

    vm.supplierPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.supplierPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.suppPartsSupplierPage);
    vm.supplierPartsTableOptions.exporterSuppressColumns = ['supplierId'];
    vm.supplierPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.supplierPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.supplierPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsSupplierPage);
      });
      vm.supplierPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelSupplierParts = $('#grid-supp-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 0, null, vm.supplierPartsTableUiGrid);
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsSupplierPage);
      });
      vm.supplierPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsSupplierPage);
      });
      vm.supplierPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.supplierPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsSupplierPage);
      });
      vm.supplierPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.supplierPartsTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.supplierPartsTableUiGrid.grid.columns, function (val) {
            if (val.field === colDef.field) {
              gridCol = val;
            }
          });
          if(gridCol) {
            uiGridGridMenuService.toggleColumnVisibility(gridCol);
            $timeout(function () {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
            }, 0);
          }
        }
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsSupplierPage);
      });
      vm.supplierPartsTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.supplierPartsTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.supplierPartsTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.supplierPartsTableOptions.data.length > 0) && !vm.supplierPartsTableOptions.initialized) {
          $timeout(function () {
            vm.supplierPartsTableOptions.initialized = true;
          });
        }
        showClearButton(vm.supplierPartsTableUiGrid);
        vm.heightTopPanelSupplierParts = $('#grid-supp-parts .ui-grid-top-panel').height();
      });

    };

    function saveState(grid, id, type) {
      var state = grid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName(id, type), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState(grid, id, type) {
      if (!grid) {
        return;
      }
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName(id, type));
        state = state ? angular.fromJson(state) : null;

        if (type === objectPageEnum.mfrPartsManufacturePage) {
          fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 0, null, vm.manufacturerPartsTableUiGrid);
        } else if (type === objectPageEnum.suppPartsSupplierPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 0, null, vm.supplierPartsTableUiGrid);
        }

        if (!state) {
          return;
        }

        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, type);
          state.pagination.paginationPageSize = 100;
        }
        if (state) grid.saveState.restore($scope, state);

      });
    }

    function showClearButton(gridApi) {
      if (vm.sourceType == 'Manufacturer') {
        vm.clearButtonManufacturerParts = false;
        vm.clearButtonManufacturerParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonManufacturerParts);
      } else {
        vm.clearButtonSupplierParts = false;
        vm.clearButtonSupplierParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonSupplierParts);
      }
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="ui-grid-cell-contents attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function printTable(id, obj, rev, txt) {
      var divToPrint = document.getElementById(id);
      var newWin = window.open("");
      var now = new Date();
      var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A');
      newWin.document.write('<html><head><title>' + rev + ' - ' + txt + '</title>' + '<style>@page { size: auto;  margin: 0mm; }</style>' +
        '</head><body>' + '<div style="padding: 5px;">' + dateformat + '<span style="left: 40%; position: absolute;">' + rev + ' - ' + txt + '</span>' + '</div>' + divToPrint.outerHTML + '</body></html>');
      newWin.print();
      newWin.close();
    }

    function OpenLinkFunction(url) {

      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
        window.open(url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }

  }

})();
