(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('SourcingDetailsController', SourcingDetailsController);

  /** @ngInject */
  function SourcingDetailsController($state, $stateParams, $mdDialog, $document, $filter, hostUrlDevelopment, CustomerService,
                                     errors, $mdToast, AuthService, DialogService, $mdMenu, pageTitleService, pageTitles,
                                     $scope, $timeout, objectPageEnum, fuseUtils, BoardService, $window, $rootScope,
                                     attributesUtils, sourcingUtils, uiGridGridMenuService) {

    var vm = this;
    vm.fuseUtils = fuseUtils;
    vm.objectPageEnum = objectPageEnum;
    vm.sourcingUtils = sourcingUtils;

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
    vm.currencySetting = 'USD';
    vm.currencySettingSymbol = '$';
    vm.costSection = {
      initialized: false,
      columnDefs: costColumns(),
      data: [],
      enableFiltering: false,
      enableSorting: false,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2
    };
    vm.heightMax = document.body.scrollHeight;
    var manufacturerPartsId = 'grid-mfr-parts',
      whereUsedMfrPageId = 'where-used-mfr',
      whereUsedSuppPageId = 'where-used-supp',
      supplierPartsId = 'grid-supp-parts';

    vm.manufacturerPartsId = 'grid-mfr-parts';
    vm.whereUsedMfrPageId = 'where-used-mfr';
    vm.whereUsedSuppPageId = 'where-used-supp';
    vm.supplierPartsId = 'grid-supp-parts';

    vm.Save = true;

    vm.linkTarget = '_self';

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });


    /**
     * Sourcing Tab Configuration
     * @type {Array}
     */
    vm.quantityOnhand = null;
    vm.quantityOnorder = null;

    //Method
    init();
    vm.saveSourceObjects = saveSourceObjects;
    vm.editSourceDialog = editSourceDialog;
    vm.deletesourceobject = deletesourceobject;
    vm.backFunction = backFunction;
    vm.countTotal = countTotal;
    vm.addNewComment = addNewComment;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    vm.initManufacturesSuppliers = initManufacturesSuppliers;
    vm.editTable = editTable;
    vm.ObjectSave = ObjectSave;
    vm.OpenLinkFunction = OpenLinkFunction;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.getAllAttachments = getAllAttachments;

    function ObjectSave(flag) {
      if (flag) {
        vm.Save = true;
      } else {
        vm.Save = false;
      }
    }

    function getSourceObject() {
      return {
        sourceType: vm.sourceObjectData.sourceType,
        objectId: vm.sourceObjectData.objectId,
        revision: vm.sourceObjectData.revision,
        minorRevision: vm.sourceObjectData.minorRevision,
        objectName: vm.sourceObjectData.objectName,
        objectNumber: vm.sourceObjectData.objectNumber,
        description: vm.sourceObjectData.description,
        isAvailable: vm.sourceObjectData.isAvailable,
        leadTime: vm.sourceObjectData.leadTime,
        packaging: vm.sourceObjectData.packaging,
        tags: vm.sourceObjectData.tags,
        orderQuantity: vm.sourceObjectData.orderQuantity,
        costDetail: vm.costSection.data,
        sourcingId: vm.sourceObjectData.sourcingId,
        qtyOnHand: vm.quantityOnhand,
        qtyOnOrder: vm.quantityOnorder,
        qtyTotal: vm.totalQuantity,
        additionalInfoList: vm.sourceObjectData.additionalInfoList
      }
    }

    function init() {
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

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getsourceobjectbyid, params, '', header)
        .then(function (response) {
          vm.progressAdd = false;
          switch (response.code) {
            case 0:
              vm.sourceObjectData = response.data;
              if (vm.sourceObjectData.sourceType === 'manufacturer') {
                vm.sourceType = 'Manufacturer';
                vm.types = 'Supplier';
                vm.hideButton = true;
                initManufacturesSuppliers('Manufacturer', '');
              } else {
                vm.sourceType = 'Supplier';
                vm.types = 'Manufacturer';
                vm.hideButton = false;
                initManufacturesSuppliers('Supplier', '');
              }
              if (vm.sourceObjectData.qtyOnHand || vm.sourceObjectData.qtyOnOrder || vm.sourceObjectData.qtyTotal) {
                vm.quantityOnhand = vm.sourceObjectData.qtyOnHand;
                vm.quantityOnorder = vm.sourceObjectData.qtyOnOrder;
                vm.totalQuantity = vm.sourceObjectData.qtyTotal;
              }
              if (vm.sourceObjectData.currency === '') {
                vm.sourceObjectData.currency = 'USD';
              }
              if (vm.sourceObjectData.sourceObjectHistory) {
                var creator = _.find(vm.members, {
                  id: vm.sourceObjectData.sourceObjectHistory.createdBy
                });
                var editor = _.find(vm.members, {
                  id: vm.sourceObjectData.sourceObjectHistory.modifiedBy
                });
                vm.createdBy = creator ? creator.firstName + " " + creator.lastName : '';
                vm.modifiedBy = editor ? editor.firstName + " " + editor.lastName : '';
                vm.createDate = $filter('date')(vm.sourceObjectData.sourceObjectHistory.createDate, "medium");
                vm.modifiedDate = $filter('date')(vm.sourceObjectData.sourceObjectHistory.modifiedDate, "medium");
                vm.sourceObjectData.sourceObjectHistory.revisionNotes = vm.sourceObjectData.sourceObjectHistory.revisionNotes;
              }
              angular.forEach(vm.sourceObjectData.timeLineList, function (value, key) {
                angular.forEach(vm.members, function (val, keys) {
                  if (val.id === value.idMember) {
                    value.userName = val.name;
                  }
                });
              });
              vm.timeLineList = transformJsonTimeLine(vm.sourceObjectData.timeLineList);
              angular.forEach(vm.sourceObjectData.commentsList, function (value, key) {
                angular.forEach(vm.members, function (val, keys) {
                  if (val.id === value.idMember) {
                    value.memberName = val.name;
                  }
                });
              });
              angular.forEach(vm.sourceObjectData.attachmentsList, function (value) {

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
              if (vm.sourceObjectData.costDetail.length === 0) {
                vm.costSection.data = vm.sourceObjectData.costDetail;
              } else {
                vm.sourceObjectData.currency = vm.sourceObjectData.costDetail[0].currency;
                vm.costSection.data = vm.sourceObjectData.costDetail;
              }

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

    // this method used for getting all attachments
    function getAllAttachments() {
      if (vm.sessionData.proxy == true) {
        params = {
          objectId: id,
          customerId: vm.sessionData.customerAdminId,
          type: 'source'
        };
      } else {
        params = {
          objectId: id,
          customerId: vm.sessionData.userId,
          type: 'source'
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

    function costColumns() {
      var attributes = [{
        cellTemplate: 'app/main/apps/objects/sourcing/sourcingdetails/tabs/basicinfo/moq.html',
        field: 'moq',
        displayName: 'MOQ',
        enableCellEdit: true,
      },
        {
          cellTemplate: 'app/main/apps/objects/sourcing/sourcingdetails/tabs/basicinfo/currency.html',
          field: 'currency',
          displayName: 'Currency',
          enableCellEdit: true,
        },
        {
          cellTemplate: 'app/main/apps/objects/sourcing/sourcingdetails/tabs/basicinfo/cost.html',
          field: 'cost',
          displayName: 'Cost'
        }
      ];

      return attributes;
    }

    function saveSourceObjects() {
      vm.progress = true;
      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId
      };
      data = getSourceObject();

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatesourceobject, params, data, header)
        .then(function (response) {
          vm.progress = false;
          if (response.code === 0) {
            init();
            $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
          } else {
            $mdToast.show($mdToast.simple().textContent(response.message).action('x')
              .toastClass("md-error-toast-theme too-wide-message").position('top right').hideDelay(0));
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log('catch');
        });
    }

    //For Back Button individual page.
    function backFunction() {
      if (vm.sourceType === 'Manufacturer') {
        $rootScope.$broadcast('tabChange', {
          data: 'manufacturersparts'
        });
        $state.go('app.objects.sourcing');
      } else {
        $rootScope.$broadcast('tabChange', {
          data: 'supplierparts'
        });
        $state.go('app.objects.sourcing');
      }
    }

    // call to calculate total quantity
    function countTotal(elem) {
      vm.totalQuantity = null;
      $(elem).val($(elem).val().replace(/ +?/g, ''));
      if (!isNaN(vm.quantityOnorder) && !isNaN(vm.quantityOnhand)) {
        if (vm.quantityOnorder !== undefined && vm.quantityOnorder !== null) {
          vm.totalQuantity += parseFloat(vm.quantityOnorder);
        }
        if (vm.quantityOnhand !== undefined && vm.quantityOnhand !== null) {
          vm.totalQuantity += parseFloat(vm.quantityOnhand);
        }
      }
    }

    function editSourceDialog(ev, type, sourceObjectData) {
      $mdDialog.show({
        controller: 'CreateManufacturerpartController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/tabs/manufactureparts/dialog/create-manufacturerparts-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          type: type,
          sourceObject: sourceObjectData
        }
      })
        .then(function () {
          init();
        }, function () {

        });
    }

    $rootScope.$on('deleteSupplierPart', function (event, data) {
      init();
    });

    $scope.$on('SendUp', function () {
      $state.go('app.objects.sourcing.sourcingdetails', {id: id}, {
        notify: false,
        reload: false
      });
    });

    $scope.$watch('vm.selectedTab', function () {
      var currentTab = vm.types !== 'Manufacturer' ? pageTitles.tabNamesForMPN[vm.selectedTab]
        : pageTitles.tabNamesForSPN[vm.selectedTab];
      if (vm.sourceObjectData) {
        setPageTitle(vm.sourceObjectData.objectNumber, vm.sourceObjectData.revision, currentTab);
      }
    });

    function setPageTitle(partNumber, revision, tab) {
      if (!partNumber) {
        return;
      }
      pageTitleService.setPageTitleInDetails(partNumber, revision, tab);
    }

    /**
     * Delete Source Object Confirm Dialog
     */
    function deletesourceobject(ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to Delete this object?')
        .ariaLabel('delete source object')
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

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.deletesourceobject, params, '', header)
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

    //For timeline
    function transformJsonTimeLine(response) {
      var data = [];
      angular.forEach(response, function (val, key) {
        if (val.title === 'IMPORT' || val.title === 'IMPORT UPDATE' || val.title === 'MANUAL UPDATE') {
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
          'member': val.userName,
          'objectId': val.objectId,
          'objectNumber': val.objectNumber,
          'revision': val.revision,
          'minorRevision': val.minorRevision
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

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.commentonsourceobject, params, data, header)
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
    vm.uploadForms = uploadForms;
    vm.copyToClipboard = copyToClipboard;
    vm.checkScroll = checkScroll;
    vm.restoreState = restoreState;
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

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourceobjectattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.attachLink = false;
              vm.sourceObjectData.attachmentsList = response.data.attachmentsList;
              for (var i = 0; i < vm.fileUpload.length; i++) {
                for (var j = 0; j < vm.sourceObjectData.attachmentsList.length; j++) {
                  if (vm.fileUpload[i].name == vm.sourceObjectData.attachmentsList[j].name) {
                    vm.fileUpload[i].src = vm.sourceObjectData.attachmentsList[j].src;
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

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourceobjectattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.attachlink = '';
              vm.linkname = '';
              vm.attachLink = false;
              vm.sourceObjectData.attachmentsList = response.data.attachmentsList;
              for (var i = 0; i < vm.fileUpload.length; i++) {
                for (var j = 0; j < vm.sourceObjectData.attachmentsList.length; j++) {
                  if (vm.fileUpload[i].name == vm.sourceObjectData.attachmentsList[j].name) {
                    vm.fileUpload[i].src = vm.sourceObjectData.attachmentsList[j].src;
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

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremovesourceobjectattachment, params, data, header)
          .then(function (response) {

            switch (response.code) {
              case 0:
                //For Progress Loader
                vm.progress = false;
                init();
                vm.sourceObjectData.attachmentsList = response.data.attachmentsList;
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
            vm.heightMax - 400 - vm.fileUpload.length * 64 + scrollTop : scrollTop - originalY + topMargin
        }, 0);
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

    //For Sourcing tab
    vm.openSupplierDialog = openSupplierDialog;

    function openSupplierDialog(ev, supplier, objectId) {
      $mdDialog.show({
        controller: 'supplierpartController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/sourcing/sourcingdetails/tabs/mp/dialog/supplierpart/supplierpart.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Supplier: supplier,
          Suppliers: vm.sourceObjectData,
          objectId: id
        }
      }).then(function () {
        init();
      }, function () {
      });
    }

    function initManufacturesSuppliers(type, wuFlag) {
      vm.progress = true;
      var url,
        sourceType;

      if (type == 'Manufacturer') {
        type = 'supp';
        sourceType = '';
      } else {
        type = 'mfr';
        sourceType = '';
      }

      if (wuFlag) {
        url = hostUrlDevelopment.test.getsourceobjectbyid;
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
      } else {
        url = hostUrlDevelopment.test.getallsourceobject;
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: id,
            oType: "source",
            oData: type,
            sourceType: sourceType
          };
        } else {
          params = {
            objectId: id,
            oType: "source",
            oData: type,
            sourceType: sourceType
          };
        }
      }

      CustomerService.addNewMember('GET', url, params, '', header)
        .then(function (response) {
          vm.progress = false;
          vm.mfrSuppFlag = true;
          if (wuFlag) {
            vm.wuFlag = true;
          }
          switch (response.code) {
            case 0:
              if (wuFlag) {
                angular.forEach(response.data.whereUsed, function (value) {
                  extendSourcing(value, wuFlag);
                });
              } else {
                angular.forEach(response.data, function (value) {
                  extendSourcing(value, wuFlag);
                });
              }

              if (wuFlag) {
                if (vm.sourceType == 'Supplier') {
                  vm.whereUsedSuppPageTableOptions.data = response.data.whereUsed;
                  fuseUtils.handleAllOptionForPagination(vm.whereUsedMfrPageTableOptions, objectPageEnum.whereUsedSuppPage);
                } else if (vm.sourceType == 'Manufacturer') {
                  vm.whereUsedMfrPageTableOptions.data = response.data.whereUsed;
                  fuseUtils.handleAllOptionForPagination(vm.whereUsedMfrPageTableOptions, objectPageEnum.whereUsedMfrPage);
                }
              } else {
                if (vm.sourceType == 'Supplier') {
                  vm.manufacturerPartsTableOptions.data = response.data;
                  fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.mfrPartsManufacturePage);
                } else if (vm.sourceType == 'Manufacturer') {
                  vm.supplierPartsTableOptions.data = response.data;
                  fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.suppPartsSupplierPage);
                }
              }
              setPageTitle(vm.sourceObjectData.objectNumber, vm.sourceObjectData.revision);
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
        if (objectPageEnum.mfrPartsSupplierPage == flag) {
          vm.manufacturerPartsTableOptions.initialized = false;
          vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, flag);
        } else if (objectPageEnum.suppPartsManufacturerPage == flag) {
          vm.supplierPartsTableOptions.initialized = false;
          vm.supplierPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierPartsTableUiGrid, supplierPartsId, flag);
        } else if (objectPageEnum.whereUsedMfrPage == flag) {
          vm.whereUsedMfrPageTableOptions.initialized = false;
          vm.whereUsedMfrPageTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, flag);
        } else if (objectPageEnum.whereUsedSuppPage == flag) {
          vm.whereUsedSuppPageTableOptions.initialized = false;
          vm.whereUsedSuppPageTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, flag);
        }
      }, function () {

      });
    }

    function extendSourcing(val, flag) {
      val.associatedCardsList = val.associatedCardSet;
      val.tags = !_.isEmpty(val.tags) ? val.tags.join(', ') : '';
      val.additionalInfoList.forEach(function (additionalInfoItem) {
        val[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });
      if (!flag) {
        if (vm.sourceType == 'Manufacturer') {
          val.objectType = 'manufacturerPart';
        } else {
          val.objectType = 'supplierPart';
        }
      }
      if (!_.isEmpty(val.costDetail) && val.costDetail[0]) {
        val.cost = val.costDetail[0].cost;
        val.currency = val.costDetail[0].currency;
        val.orderQuantity = val.costDetail[0].moq;
      }
      if (val.minorRevision) {
        val.revision = val.revision + '.' + val.minorRevision;
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

      extendSourcingData(val);
    }

    function extendSourcingData(val) {
      if (!_.isEmpty(val.mfrPartsList)) {
        if (!_.isEmpty(val.mfrPartsList[0].costDetail) && val.mfrPartsList[0].costDetail[0]) {
          val.mfrPartsList[0].moq = val.mfrPartsList[0].costDetail[0].moq;
          val.mfrPartsList[0].cost = val.mfrPartsList[0].costDetail[0].cost;
          val.mfrPartsList[0].currency = val.mfrPartsList[0].costDetail[0].currency;
        } else {
          val.mfrPartsList[0].moq = '';
          val.mfrPartsList[0].cost = '';
          val.mfrPartsList[0].currency = '';
        }
        val.mfrList = val.mfrPartsList[0];
        return sourcingUtils.addSourcingPrefix('mfr', val.mfrList);
      }
      if (!_.isEmpty(val.suppPartsList)) {
        if (!_.isEmpty(val.suppPartsList[0].costDetail) && val.suppPartsList[0].costDetail[0]) {
          val.suppPartsList[0].moq = val.suppPartsList[0].costDetail[0].moq;
          val.suppPartsList[0].cost = val.suppPartsList[0].costDetail[0].cost;
          val.suppPartsList[0].currency = val.suppPartsList[0].costDetail[0].currency;
        } else {
          val.suppPartsList[0].moq = '';
          val.suppPartsList[0].cost = '';
          val.suppPartsList[0].currency = '';
        }
        val.suppList = val.suppPartsList[0];
        return sourcingUtils.addSourcingPrefix('supp', val.suppList);
      }
    }

    function getAttributes(type) {
      var obj = {};
      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", type)),
        attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", type)),
        attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", type)),
        attributesCost = localStorage.getItem(fuseUtils.buildAttributeName("attributesCost", type)),
        attributesMfr = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", type)),
        attributesSupp = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", type)),
        objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", type));

        if(type !== objectPageEnum.mfrPartsSupplierPage && type !== objectPageEnum.suppPartsManufacturerPage &&
          attributesBasic && attributesBasic.indexOf('Cost Type') !== -1){
          localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
          attributesBasic = null;
        }

      if (attributesBasic && attributesBasic != 'undefined' &&
        (_.find(angular.fromJson(attributesBasic), {
          name: 'Packaging'
        }) || type == objectPageEnum.whereUsedMfrPage || type == objectPageEnum.whereUsedSuppPage)) {
        obj.basicInfo = angular.fromJson(attributesBasic);
      } else {
        if (type == objectPageEnum.mfrPartsSupplierPage) {
          obj.basicInfo = attributesUtils.getManufacturerPartsBasicAttributes();
        } else if (type == objectPageEnum.suppPartsManufacturerPage) {
          obj.basicInfo = attributesUtils.getSupplierPartsBasicAttributes();
        } else {
          obj.basicInfo = attributesUtils.getWhereUsedBasicAttributes();
        }
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", type), JSON.stringify(obj.basicInfo));
      }
      if (attributesInventory && attributesInventory != 'undefined') {
        obj.inventory = angular.fromJson(attributesInventory);
      }
      if (attributesCost && attributesCost != 'undefined' && (type != objectPageEnum.whereUsedMfrPage && type != objectPageEnum.whereUsedSuppPage)) {
        obj.cost = angular.fromJson(attributesCost);
      } else if (type != objectPageEnum.whereUsedMfrPage && type != objectPageEnum.whereUsedSuppPage) {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesCost", type));
        obj.cost = attributesUtils.getSupplierManufacturerPartsCostAttributes();
      }
      if (attributesAdditional && attributesAdditional != 'undefined') {
        obj.additional = angular.fromJson(attributesAdditional);
      }
      if (attributesMfr && attributesMfr != 'undefined') {
        obj.mfrList = angular.fromJson(attributesMfr);
      }
      if (attributesSupp && attributesSupp != 'undefined') {
        obj.suppList = angular.fromJson(attributesSupp);
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

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="ui-grid-cell-contents attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function buildTableColumns(type) {
      var attributes = getAttributes(type);
      var arr = [];
      if (type == objectPageEnum.mfrPartsSupplierPage) {
        arr = angular.copy(attributesUtils.getBasicSourcingManufacturerPageAttributes());
      } else if (type == objectPageEnum.suppPartsManufacturerPage) {
        arr = angular.copy(attributesUtils.getBasicSourcingSupplierPageAttributes());
        arr.push(attributesUtils.getEditColumn());
      }

      var isEmptyColumns = true;
      for (var key in attributes) {
        if (isEmptyColumns && attributes[key] != null && attributes[key] != 'undefined') {
          isEmptyColumns = attributes[key].every(function (obj) {
            return !obj.displayed;
          })
        }
      }

      if (attributes.basicInfo) {
        if (isEmptyColumns && (type === objectPageEnum.whereUsedMfrPage || type === objectPageEnum.whereUsedSuppPage)) {
          var partNumberColumn = _.find(attributes.basicInfo, ['value', 'objectNumber']);
          partNumberColumn.displayed = true;
        }
        angular.forEach((attributes.basicInfo || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if ((o.value === 'objectName' || o.value === 'name') &&
              type == objectPageEnum.mfrPartsSupplierPage && type == objectPageEnum.suppPartsManufacturerPage) {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/object-name-cell.html';
            }
            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }

            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
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

      if (attributes.mfrList) {
        angular.forEach((attributes.mfrList || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
            if (o.value === 'mfrObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-number-with-button-cell.html';
            }
            if (o.value === 'mfrObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
            }
            //colDef.field = 'mfrList[0].' + o.value;
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }

      if (attributes.suppList) {
        angular.forEach((attributes.suppList || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
            if (o.value === 'suppObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-number-with-button-cell.html';
            }
            if (o.value === 'suppObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
            }
            //colDef.field = 'suppList[0].' + o.value;
            colDef.name = o.value;
            arr.push(colDef);
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
    vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.mfrPartsSupplierPage);
    vm.manufacturerPartsTableOptions.exporterSuppressColumns = ['manufacturerId'];
    vm.manufacturerPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.manufacturerPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.manufacturerPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.mfrPartsSupplierPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.mfrPartsSupplierPage);
        }
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
      });
      vm.manufacturerPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
      });
      vm.manufacturerPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelManufacturerParts = $('#grid-mfr-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 1, null, vm.manufacturerPartsTableUiGrid);
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.manufacturerPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
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
        saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.manufacturerPartsTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      // Restore previously saved state.
      restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.mfrPartsSupplierPage);

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
    vm.supplierPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.suppPartsManufacturerPage);
    vm.supplierPartsTableOptions.exporterSuppressColumns = ['supplierId'];
    vm.supplierPartsTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.supplierPartsTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.supplierPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.suppPartsManufacturerPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.suppPartsManufacturerPage);
        }
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
      });
      vm.supplierPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
      });
      vm.supplierPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelSupplierParts = $('#grid-supp-parts .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 1, null, vm.supplierPartsTableUiGrid);
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
      });
      vm.supplierPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
      });
      vm.supplierPartsTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.supplierPartsTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
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
        saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.suppPartsManufacturerPage);
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

    vm.whereUsedMfrPageTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.whereUsedMfrPageTableOptions.columnDefs = buildTableColumns(objectPageEnum.whereUsedMfrPage);
    vm.whereUsedMfrPageTableOptions.exporterSuppressColumns = ['supplierId'];
    vm.whereUsedMfrPageTableOptions.exporterFieldCallback = function (grid, row, col, value) {
      if (col.name === 'associatedCardsList') {
        value = !_.isEmpty(value);
      }
      if (col.name === 'isLatest') {
        value = value === 'true' ? 'Yes' : 'No';
      }
      return value;
    };
    vm.whereUsedMfrPageTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.whereUsedMfrPageTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.whereUsedMfrPageTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.whereUsedMfrPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.whereUsedMfrPage);
        }
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelWhereUsed = $('#grid-where-used-mfr .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.whereUsedMfrPageTableOptions.columnDefs, 3, null, vm.whereUsedMfrPageTableUiGrid);
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.whereUsedMfrPageTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.whereUsedMfrPageTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.whereUsedMfrPageTableUiGrid.grid.columns, function (val) {
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
        saveState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);
      });
      vm.whereUsedMfrPageTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.whereUsedMfrPageTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      // Restore previously saved state.
      restoreState(vm.whereUsedMfrPageTableUiGrid, whereUsedMfrPageId, objectPageEnum.whereUsedMfrPage);

      vm.whereUsedMfrPageTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.whereUsedMfrPageTableOptions.data.length > 0) && !vm.whereUsedMfrPageTableOptions.initialized) {
          $timeout(function () {
            vm.whereUsedMfrPageTableOptions.initialized = true;
          });
        }
        showClearButton(vm.whereUsedMfrPageTableUiGrid, true);
        vm.heightTopPanelWhereUsed = $('#grid-where-used-mfr .ui-grid-top-panel').height();
      });

    };

    vm.whereUsedSuppPageTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
    vm.whereUsedSuppPageTableOptions.columnDefs = buildTableColumns(objectPageEnum.whereUsedSuppPage);
    vm.whereUsedSuppPageTableOptions.exporterSuppressColumns = ['manufacturerId'];
    vm.whereUsedSuppPageTableOptions.exporterFieldCallback = function (grid, row, col, value) {
      if (col.name === 'associatedCardsList') {
        value = !_.isEmpty(value);
      }
      if (col.name === 'isLatest') {
        value = value === 'true' ? 'Yes' : 'No';
      }
      return value;
    };
    vm.whereUsedSuppPageTableOptions.onRegisterApi = function (gridApi) {

      // Keep a reference to the gridApi.
      vm.whereUsedSuppPageTableUiGrid = gridApi;

      // Setup events so we're notified when grid state changes.
      vm.whereUsedSuppPageTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
        if (!rowsNumber)
          return;

        if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.whereUsedSuppPage);
        } else {
          fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.whereUsedSuppPage);
        }
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
        vm.heightTopPanelWhereUsed = $('#grid-where-used-supp .ui-grid-top-panel').height();
        fuseUtils.setProperHeaderViewportHeight(vm.whereUsedSuppPageTableOptions.columnDefs, 3, null, vm.whereUsedSuppPageTableUiGrid);
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.core.on.filterChanged($scope, function () {
        $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
      });
      vm.whereUsedSuppPageTableUiGrid.core.on.sortChanged($scope, function () {
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
        if (vm.whereUsedSuppPageTableOptions.initialized) {
          let gridCol;
          _.forEach(vm.whereUsedSuppPageTableUiGrid.grid.columns, function (val) {
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
        saveState(vm.whereUsedSuppPageTableUiGrid, whereUsedSuppPageId, objectPageEnum.whereUsedSuppPage);
      });
      vm.whereUsedSuppPageTableUiGrid.core.on.scrollBegin($scope, function () {
      });
      vm.whereUsedSuppPageTableUiGrid.core.on.scrollEnd($scope, function () {
      });

      vm.whereUsedSuppPageTableUiGrid.core.on.rowsRendered($scope, function () {
        if ((vm.whereUsedSuppPageTableOptions.data.length > 0) && !vm.whereUsedSuppPageTableOptions.initialized) {
          $timeout(function () {
            vm.whereUsedSuppPageTableOptions.initialized = true;
          });
        }
        showClearButton(vm.whereUsedSuppPageTableUiGrid, true);
        vm.heightTopPanelWhereUsed = $('#grid-where-used-supp .ui-grid-top-panel').height();
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
      if (!grid)
        return;

      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName(id, type));
        if (state && !_.isEmpty(angular.fromJson(state).columns)) {
          if (type == objectPageEnum.suppPartsManufacturerPage &&
            (_.last(angular.fromJson(state).columns)).name == 'edit') {
            localStorage.removeItem(fuseUtils.buildAttributeName(id, type));
            state = $window.localStorage.getItem(fuseUtils.buildAttributeName(id, type));
          }
        }

        state = state ? angular.fromJson(state) : null;


        fuseUtils.moveColumnToFirstPosition(grid, $scope, 'associatedCardsList', true);

        if (type === objectPageEnum.suppPartsManufacturerPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.supplierPartsTableOptions.columnDefs, 1, null, vm.supplierPartsTableUiGrid);
        } else if (type === objectPageEnum.whereUsedMfrPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.whereUsedMfrPageTableOptions.columnDefs, 3, null, vm.whereUsedMfrPageTableUiGrid);
        } else if (type === objectPageEnum.mfrPartsSupplierPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.manufacturerPartsTableOptions.columnDefs, 1, null, vm.manufacturerPartsTableUiGrid);
        } else if (type === objectPageEnum.whereUsedSuppPage) {
          fuseUtils.setProperHeaderViewportHeight(vm.whereUsedSuppPageTableOptions.columnDefs, 3, null, vm.whereUsedSuppPageTableUiGrid);
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

    function showClearButton(gridApi, whereUsedFlag) {
      if (whereUsedFlag) {
        if (vm.sourceType == 'Supplier') {
          vm.clearButtonWhereUsedSuppPage = false;
          vm.clearButtonWhereUsedSuppPage = fuseUtils.buttonForClear(gridApi, vm.clearButtonWhereUsedSuppPage);
        } else {
          vm.clearButtonWhereUsedMfrPage = false;
          vm.clearButtonWhereUsedMfrPage = fuseUtils.buttonForClear(gridApi, vm.clearButtonWhereUsedMfrPage);
        }
      } else {
        if (vm.sourceType == 'Supplier') {
          vm.clearButtonManufacturerParts = false;
          vm.clearButtonManufacturerParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonManufacturerParts);
        } else {
          vm.clearButtonSupplierParts = false;
          vm.clearButtonSupplierParts = fuseUtils.buttonForClear(gridApi, vm.clearButtonSupplierParts);
        }
      }
    }

    vm.cardDialogResponses = [];

    function getBoards(row) {
      var cardIds = row.entity.associatedCardsList;
      var promises = [];
      if (cardIds[0] === 'no access') {
        showOkPopup('Can not display card name because you do not have access to this board');
        return;
      }

      row.entity.cardsInfo = [];
      cardIds.forEach(function (cardId) {
        promises.push(BoardService.getBoardBycardId(cardId))
      });

      Promise.all(promises)
        .then(function (res) {
          row.entity.cardsDownloaded = true;
          res.forEach(function (r, i) {
            if (r.code !== 0) {
              cardIds[i] = '-1';
              return;
            }
            vm.cardDialogResponses.push(r);
            row.entity.cardsInfo.push(r.data);
          });
          cardIds = _.filter(cardIds, function (id) {
            return id !== '-1'
          });
          if (cardIds.length === 0) {
            cardIds[0] = 'no access';
            showOkPopup('Can not display card name because you do not have access to this board');
            return;
          }
          cardIds.forEach(function (card, i) {
            row.entity.cardsInfo[i].chosenCard = getCard(card, row.entity.cardsInfo[i]);
          });
          $scope.$digest();
        }, function () {
        })
    }

    function showOkPopup(message) {
      $mdMenu.hide();
      $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text">' + message + '</div><div><md-button class="show-ok-popup-button" ng-click="close()">Ok</md-button></div>',
        controller: function DialogController($scope, $mdDialog) {
          $scope.close = function () {
            $mdDialog.hide();
          }
        }
      }).then(function () {
      }, function () {
      });
    }

    function getCard(cardId, board) {
      var neededCard = _.find(board.cards, {id: cardId});
      return neededCard
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
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
