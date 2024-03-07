(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('sourcingimportController', sourcingimportController)
    .filter('startFromPage', function () {
      return function (input, start) {
        if (angular.isUndefined(input)) {
          return input;
        }
        start = +start; //parse to int
        return input.slice(start);
      }
    })
    .filter('capitalize', function () {
      return function (input) {
        var output, outputs;

        if (input.match('is') && input.charAt(0) == 'i') {
          output = input.replace('is', '');
        } else {
          outputs = input.replace(/([A-Z])/g, ' $1').trim();
          output = (!!outputs) ? outputs.charAt(0).toUpperCase() + outputs.substr(1) : '';
        }

        return output;
      }
    });

  /** @ngInject */
  function sourcingimportController($scope, $timeout, $rootScope, $state, $http, $stateParams, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, $document, introService, $mdDialog) {

    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Parameter
    var params = '';
    var data = '';
    vm.matchingRecords = 'skip';

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    $scope.$on('msWizard.stepForward', function () {
      next(vm.steper);
    });

    $scope.$on('msWizard.stepBack', function () {
      previous();
    });

    //Data
    var fuseObj = $stateParams.obj;
    var id = $stateParams.id;
    vm.mapping = '';
    vm.type = '';
    vm.filePath = '';
    var flag = '';
    vm.steper = 1;
    vm.previoussteper = '';
    vm.fileHeader = [];
    vm.objectHeader = [];
    vm.selectMapping = [];
    vm.basicInfo = {
      objectName: '',
      code: '',
      approved: '',
      description: '',
      contactNumber: '',
      website: '',
      address: '',
      tags: ''
    };
    vm.contacts = {
      name: '',
      title: '',
      email: '',
      contactNumber: '',
      address: ''
    };

    // For Text message next the spinning wheel.
    vm.progressMesssage = false;

    // Show/Hide Section

    if (id === 'manufacturers') {
      id = '';
      vm.type = 'mfr';
      vm.importName = 'Manufacturers';
      vm.importHeading = 'Manufacturers';
      vm.partproductbom = 'Manufacturer';
      vm.matchingRecordsNotShow = true;
      vm.showhideBasicinfo = true;
      vm.showhideAdditionalinfo = false;
      vm.showhideContact = false;
      vm.message1 = "There’re no formulas in the spreadsheet for 'Manufacturer Name'.";
      vm.message2 = "Import Manager uses 'Manufacturer Name' to identify if there is a match in FusePLM to prevent importing duplicate data."
    } else {
      id = '';
      vm.type = 'supp';
      vm.importName = 'Suppliers';
      vm.importHeading = 'Suppliers';
      vm.partproductbom = 'Supplier';
      vm.matchingRecordsNotShow = true;
      vm.showhideBasicinfo = true;
      vm.showhideAdditionalinfo = false;
      vm.showhideContact = false;
      vm.message1 = "There’re no formulas in the spreadsheet for 'Supplier Part Number' and 'Supplier Name'."
      vm.message2 = "Import Manager uses 'Supplier Name’ to identify if there is a match in FusePLM to prevent importing duplicate data."
    }

    //Methods
    getallMapping();
    vm.upload = upload;
    vm.fileAdded = fileAdded;
    vm.fileSuccess = fileSuccess;
    vm.next = next;
    vm.previous = previous;
    vm.DoneFunction = DoneFunction;
    vm.changeMapping = changeMapping;
    vm.checkingMapping = checkingMapping;

    function getallMapping() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          mappingType: vm.type
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          mappingType: vm.type
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getmappingsourcing, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;

          switch (response.code) {
            case 0:
              vm.DataMapping = response.data;
              vm.selectMapping = response.data;
              break;
            case 4006:
              vm.DataMapping = [];
              vm.notMapping = 'No mapping configuration available.';
              break;
            case 19:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 17:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              break;
            case 11:
              break;
            default:
              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;
        });
    }

    function changeMapping() {
      vm.mapping = vm.MappingData;
      angular.forEach(vm.selectMapping, function (value, key) {
        if (vm.mapping == value.ObjectId) {
          if (value.updateObject == 'update') {
            vm.matchingRecords = 'update';
          } else {
            vm.matchingRecords = 'skip';
          }
        }
      });
    }

    function checkingMapping() {

      if (vm.sessionData.proxy == true) {
        params = {
          mappingType: vm.type,
          configName: vm.configureName
        }
      } else {
        params = {
          mappingType: vm.type,
          configName: vm.configureName
        }
      }
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.checkduplicatemappingsourcing, params, '', header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.data3 = vm.summeryData.newRecords === 0 ? '' : 'ab';
              break;
            case 4006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 19:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 17:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4266:
              vm.data3 = "";
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 11:
            default:
              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;
        });
    }

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
      target: hostUrlDevelopment.test.uploadfile + '?imageType=import&' + 'customerId=' + params.customerId,
      testChunks: false,
      fileParameterName: 'uploadfile'
    };

    vm.ngFlow = {
      // ng-flow will be injected into here through its directive
      flow: {}
    };

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
      vm.progress = true;
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

      vm.fielName = file.name;
      var response = JSON.parse(message);
      switch (response.code) {
        case 0:
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;

          vm.dataHidden = 'data';
          vm.filePath = response.data.imagePath;
          break;
        case 4006:
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 1008:
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 17:
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 1006:
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 4004:
          break;
        case 11:
          break;
        default:
      }
    }

    function next() {
      jQuery('#content').animate({
        scrollTop: 0
      }, 'slow');
      switch (vm.steper) {
        case 1:
          autoMapped();
          break;
        case 2:
          var mapping = vm.mapping === 'No mapping configuration available.' ? '' : vm.mapping;
          if (mapping === '') {
            //For Progress Loader
            vm.progress = true;

            // For Text message next the spinning wheel.
            vm.progressMesssage = true;

            if (vm.MappingData === undefined) {
              vm.MappingData = '';
            }
            vm.progress = true;
            $scope.currentPage = 0;
            $scope.pageSize = 20;
            $scope.startIndex = 0;
            $scope.endIndex = $scope.pageSize;

            if (vm.sessionData.proxy == true) {
              params = {
                customerId: vm.sessionData.customerAdminId,
                action: 'create',
                type: vm.type,
                filePath: vm.filePath,
                mappingName: vm.MappingData,
                updateObject: vm.matchingRecords
              }
            } else {
              params = {
                customerId: vm.sessionData.userId,
                action: 'create',
                type: vm.type,
                filePath: vm.filePath,
                mappingName: vm.MappingData,
                updateObject: vm.matchingRecords
              }
            }

            data = {
              objectName: vm.basicInfo.objectName,
              code: vm.basicInfo.code,
              approved: vm.basicInfo.approved,
              description: vm.basicInfo.description,
              contactNumber: vm.basicInfo.contactNumber,
              website: vm.basicInfo.website,
              address: vm.basicInfo.address,
              tags: vm.basicInfo.tags,
              additionalInfo: vm.additionalInfo,
              contacts: {
                name: vm.contacts.name,
                title: vm.contacts.title,
                email: vm.contacts.email,
                contactNumber: vm.contacts.contactNumber,
                address: vm.contacts.address
              },
              filePath: vm.filePath,
              mappingName: vm.mappingName,
              fileHeader: vm.fileHeader,
              objectHeader: vm.objectHeader
            };

            CustomerService.addNewMember('POST', hostUrlDevelopment.test.addsource, params, data, header)
              .then(function (response) {
                switch (response.code) {
                  case 0:
                    vm.steper = 3;
                    vm.summeryData = response.data;

                    if (vm.summeryData.StatisTics.length > 0) {
                      vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                      if (vm.headersKey) {
                        if (vm.headersKey.includes("Description") || vm.headersKey.includes("Part Name") || vm.headersKey.includes("Product Name") || vm.headersKey.includes("Document Name")) {
                          $timeout(function () {
                            var table = document.getElementById('import-table');
                            var allTh = table.children[0].children[0].children;
                            var thArray = Array.prototype.slice.call(allTh);
                            var thIndex1 = 0;
                            var thIndex2 = 0;
                            var thIndex3 = 0;
                            var thIndex4 = 0
                            thArray.forEach(function (th, index) {
                              if (th.innerText.toLowerCase().trim() === 'description') {
                                thIndex1 = index;
                              }
                              if (th.innerText.toLowerCase().trim() === 'part name') {
                                thIndex2 = index;
                              }
                              if (th.innerText.toLowerCase().trim() === 'product name') {
                                thIndex3 = index;
                              }
                              if (th.innerText.toLowerCase().trim() === 'document name') {
                                thIndex3 = index;
                              }
                            });
                            if (thIndex1 > 0) {
                              allTh[thIndex1].style.minWidth = "320px";
                            }
                            if (thIndex2 > 0) {
                              allTh[thIndex2].style.minWidth = "180px";
                            }
                            if (thIndex3 > 0) {
                              allTh[thIndex3].style.minWidth = "220px";
                            }
                          }, 1000);
                        }
                      }
                      $scope.pageSize = (vm.summeryData.StatisTics.length > 20) ? 20 : vm.summeryData.StatisTics.length;
                      $scope.endIndex = $scope.pageSize;
                    }
                    if (vm.summeryData.newRecords === 0) {
                      vm.data3 = '';
                    } else {
                      vm.data3 = 'ab';
                    }
                    vm.summeryDataTemp = response.data;
                    //For Progress Loader
                    vm.progress = false;

                    // For Text message next the spinning wheel.
                    vm.progressMesssage = false;
                    break;
                  case 4006:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    break;
                  case 19:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  case 17:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  case 1006:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    break;
                  case 4004:
                    break;
                  case 11:
                  default:
                    //For Progress Loader
                    vm.progress = false;

                    // For Text message next the spinning wheel.
                    vm.progressMesssage = false;
                }
              })
              .catch(function (response) {
                //For Progress Loader
                vm.progress = false;

                // For Text message next the spinning wheel.
                vm.progressMesssage = false;
              });
          } else {
            var confirm = $mdDialog.confirm()
              .title('Would you like to save changes to the existing `Mapping configuration`?')
              .ariaLabel('Mapping configuration')
              .ok('Yes, Save changes and go to next step')
              .cancel('No, go to next step');

            $mdDialog.show(confirm).then(function () {
              //For Progress Loader
              vm.progress = true;

              // For Text message next the spinning wheel.
              vm.progressMesssage = true;
              vm.Data.updateMapping = true;

              if (vm.MappingData === undefined) {
                vm.MappingData = '';
              }
              $scope.currentPage = 0;
              $scope.pageSize = 20;
              $scope.startIndex = 0;
              $scope.endIndex = $scope.pageSize;

              if (vm.sessionData.proxy == true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  action: 'create',
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              } else {
                params = {
                  customerId: vm.sessionData.userId,
                  action: 'create',
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              }

              data = {
                objectName: vm.basicInfo.objectName,
                code: vm.basicInfo.code,
                approved: vm.basicInfo.approved,
                description: vm.basicInfo.description,
                contactNumber: vm.basicInfo.contactNumber,
                website: vm.basicInfo.website,
                address: vm.basicInfo.address,
                tags: vm.basicInfo.tags,
                additionalInfo: vm.additionalInfo,
                contacts: {
                  name: vm.contacts.name,
                  title: vm.contacts.title,
                  email: vm.contacts.email,
                  contactNumber: vm.contacts.contactNumber,
                  address: vm.contacts.address
                },
                filePath: vm.filePath,
                mappingName: vm.mappingName,
                updateMapping: vm.Data.updateMapping,
                fileHeader: vm.fileHeader,
                objectHeader: vm.objectHeader
              };

              CustomerService.addNewMember('POST', hostUrlDevelopment.test.addsource, params, data, header)
                .then(function (response) {
                  switch (response.code) {
                    case 0:
                      vm.steper = 3;
                      vm.summeryData = response.data;

                      if (vm.summeryData.StatisTics.length > 0) {
                        vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                        if (vm.headersKey) {
                          if (vm.headersKey.includes("Description") || vm.headersKey.includes("Part Name") || vm.headersKey.includes("Product Name") || vm.headersKey.includes("Document Name")) {
                            $timeout(function () {
                              var table = document.getElementById('import-table');
                              var allTh = table.children[0].children[0].children;
                              var thArray = Array.prototype.slice.call(allTh);
                              var thIndex1 = 0;
                              var thIndex2 = 0;
                              var thIndex3 = 0;
                              var thIndex4 = 0
                              thArray.forEach(function (th, index) {
                                if (th.innerText.toLowerCase().trim() === 'description') {
                                  thIndex1 = index;
                                }
                                if (th.innerText.toLowerCase().trim() === 'part name') {
                                  thIndex2 = index;
                                }
                                if (th.innerText.toLowerCase().trim() === 'product name') {
                                  thIndex3 = index;
                                }
                                if (th.innerText.toLowerCase().trim() === 'document name') {
                                  thIndex3 = index;
                                }
                              });
                              if (thIndex1 > 0) {
                                allTh[thIndex1].style.minWidth = "320px";
                              }
                              if (thIndex2 > 0) {
                                allTh[thIndex2].style.minWidth = "180px";
                              }
                              if (thIndex3 > 0) {
                                allTh[thIndex3].style.minWidth = "220px";
                              }
                            }, 1000);
                          }
                        }
                        $scope.pageSize = (vm.summeryData.StatisTics.length > 20) ? 20 : vm.summeryData.StatisTics.length;
                        $scope.endIndex = $scope.pageSize;
                      }
                      if (vm.summeryData.newRecords === 0) {
                        vm.data3 = '';
                      } else {
                        vm.data3 = 'ab';
                      }
                      vm.summeryDataTemp = response.data;

                      //For Progress Loader
                      vm.progress = false;

                      // For Text message next the spinning wheel.
                      vm.progressMesssage = false;
                      break;
                    case 4006:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                      break;
                    case 19:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    case 17:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    case 1006:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                      break;
                    case 4004:
                      break;
                    case 11:
                    default:
                      //For Progress Loader
                      vm.progress = false;

                      // For Text message next the spinning wheel.
                      vm.progressMesssage = false;
                  }
                })
                .catch(function (response) {
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
                });
            }, function () {
              //For Progress Loader
              vm.progress = true;

              // For Text message next the spinning wheel.
              vm.progressMesssage = true;
              vm.Data.updateMapping = false;

              if (vm.MappingData === undefined) {
                vm.MappingData = '';
              }
              vm.progress = true;
              $scope.currentPage = 0;
              $scope.pageSize = 20;
              $scope.startIndex = 0;
              $scope.endIndex = $scope.pageSize;

              if (vm.sessionData.proxy == true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  action: 'create',
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              } else {
                params = {
                  customerId: vm.sessionData.userId,
                  action: 'create',
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }

              }

              data = {
                objectName: vm.basicInfo.objectName,
                code: vm.basicInfo.code,
                approved: vm.basicInfo.approved,
                description: vm.basicInfo.description,
                contactNumber: vm.basicInfo.contactNumber,
                website: vm.basicInfo.website,
                address: vm.basicInfo.address,
                tags: vm.basicInfo.tags,
                additionalInfo: vm.additionalInfo,
                contacts: {
                  name: vm.contacts.name,
                  title: vm.contacts.title,
                  email: vm.contacts.email,
                  contactNumber: vm.contacts.contactNumber,
                  address: vm.contacts.address
                },
                filePath: vm.filePath,
                mappingName: vm.mappingName,
                updateMapping: vm.Data.updateMapping,
                fileHeader: vm.fileHeader,
                objectHeader: vm.objectHeader
              };

              CustomerService.addNewMember('POST', hostUrlDevelopment.test.addsource, params, data, header)
                .then(function (response) {
                  switch (response.code) {
                    case 0:
                      vm.steper = 3;
                      vm.summeryData = response.data;

                      if (vm.summeryData.StatisTics.length > 0) {
                        vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                        $scope.pageSize = (vm.summeryData.StatisTics.length > 20) ? 20 : vm.summeryData.StatisTics.length;
                        $scope.endIndex = $scope.pageSize;
                      }
                      if (vm.summeryData.newRecords === 0) {
                        vm.data3 = '';
                      } else {
                        vm.data3 = 'ab';
                      }
                      vm.summeryDataTemp = response.data;

                      //For Progress Loader
                      vm.progress = false;

                      // For Text message next the spinning wheel.
                      vm.progressMesssage = false;
                      break;
                    case 4006:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                      break;
                    case 19:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    case 17:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                    case 1006:
                      $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                      break;
                    case 4004:
                      break;
                    case 11:
                    default:
                      //For Progress Loader
                      vm.progress = false;

                      // For Text message next the spinning wheel.
                      vm.progressMesssage = false;
                  }
                })
                .catch(function (response) {
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
                });
            });
          }
          break;
        case 3:
          //For Progress Loader
          vm.progress = true;

          // For Text message next the spinning wheel.
          vm.progressMesssage = true;

          if (vm.configureName === undefined) {
            vm.configureName = '';
          }
          $scope.currentPage = 0;
          $scope.pageSize = 20;
          $scope.startIndex = 0;
          $scope.endIndex = $scope.pageSize;
          vm.searchText = '';

          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              action: 'submit',
              type: vm.type,
              filePath: '',
              mappingName: '',
              updateObject: vm.matchingRecords
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              action: 'submit',
              type: vm.type,
              filePath: '',
              mappingName: '',
              updateObject: vm.matchingRecords
            }
          }

          data = {
            objectName: vm.basicInfo.objectName,
            code: vm.basicInfo.code,
            approved: vm.basicInfo.approved,
            description: vm.basicInfo.description,
            contactNumber: vm.basicInfo.contactNumber,
            website: vm.basicInfo.website,
            address: vm.basicInfo.address,
            tags: vm.basicInfo.tags,
            additionalInfo: vm.additionalInfo,
            contacts: {
              name: vm.contacts.name,
              title: vm.contacts.title,
              email: vm.contacts.email,
              contactNumber: vm.contacts.contactNumber,
              address: vm.contacts.address
            },
            filePath: vm.filePath,
            mappingName: vm.configureName,
            fileHeader: vm.fileHeader,
            objectHeader: vm.objectHeader
          };

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.addsource, params, data, header)
            .then(function (response) {

              switch (response.code) {
                case 0:
                  vm.summeryData = vm.summeryDataTemp;
                  vm.id = id;
                  if (vm.summeryData.StatisTics.length > 0) {
                    vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                    if (vm.headersKey) {
                      if (vm.headersKey.includes("Description") || vm.headersKey.includes("Part Name") || vm.headersKey.includes("Product Name") || vm.headersKey.includes("Document Name")) {
                        $timeout(function () {
                          var table = document.getElementById('import-tables');
                          var allTh = table.children[0].children[0].children;
                          var thArray = Array.prototype.slice.call(allTh);
                          var thIndex1 = 0;
                          var thIndex2 = 0;
                          var thIndex3 = 0;
                          var thIndex4 = 0
                          thArray.forEach(function (th, index) {
                            if (th.innerText.toLowerCase().trim() === 'description') {
                              thIndex1 = index;
                            }
                            if (th.innerText.toLowerCase().trim() === 'part name') {
                              thIndex2 = index;
                            }
                            if (th.innerText.toLowerCase().trim() === 'product name') {
                              thIndex3 = index;
                            }
                            if (th.innerText.toLowerCase().trim() === 'document name') {
                              thIndex3 = index;
                            }
                          });
                          if (thIndex1 > 0) {
                            allTh[thIndex1].style.minWidth = "320px";
                          }
                          if (thIndex2 > 0) {
                            allTh[thIndex2].style.minWidth = "180px";
                          }
                          if (thIndex3 > 0) {
                            allTh[thIndex3].style.minWidth = "220px";
                          }
                        }, 1000);
                      }
                    }
                    $scope.pageSize = (vm.summeryData.StatisTics.length > 20) ? 20 : vm.summeryData.StatisTics.length;
                    $scope.endIndex = $scope.pageSize;
                  }

                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
                  break;
                case 4006:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                case 19:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                case 17:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                case 1006:
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                case 4004:
                  break;
                case 11:
                default:
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
              }
            })
            .catch(function (response) {
              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
            });
          break;
      }
    }

    function previous() {
      jQuery('#content').animate({
        scrollTop: 0
      }, 'slow');
      //For Progress Loader
      vm.progress = true;
      switch (vm.steper) {
        case 3:
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
              action: 'back',
              type: vm.type,
              filePath: vm.filePath,
              mappingName: vm.MappingData,
              updateObject: vm.matchingRecords
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              action: 'back',
              type: vm.type,
              filePath: vm.filePath,
              mappingName: vm.MappingData,
              updateObject: vm.matchingRecords
            }
          }

          data = {
            objectName: vm.basicInfo.objectName,
            code: vm.basicInfo.code,
            approved: vm.basicInfo.approved,
            description: vm.basicInfo.description,
            contactNumber: vm.basicInfo.contactNumber,
            website: vm.basicInfo.website,
            address: vm.basicInfo.address,
            tags: vm.basicInfo.tags,
            additionalInfo: vm.additionalInfo,
            contacts: {
              name: vm.contacts.name,
              title: vm.contacts.title,
              email: vm.contacts.email,
              contactNumber: vm.contacts.contactNumber,
              address: vm.contacts.address
            },
            filePath: vm.filePath,
            mappingName: vm.mappingName,
            fileHeader: vm.fileHeader,
            objectHeader: vm.objectHeader
          };

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.addsource, params, data, header)
            .then(function (response) {

              switch (response.code) {
                case 0:
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
                  vm.steper = 2;
                  vm.summeryData = response.data;
                  break;
                case 4006:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                case 19:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                case 17:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                case 1006:
                  $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                  break;
                case 4004:
                  break;
                case 11:
                default:
                  //For Progress Loader
                  vm.progress = false;

                  // For Text message next the spinning wheel.
                  vm.progressMesssage = false;
              }
            })
            .catch(function (response) {
              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
            });
          break;
        case 2:
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;
          vm.dataHidden = 'data';
          vm.steper = 1;
          vm.isautoMap = false;
          break;
      }
    }

    function DoneFunction(id, type) {
      $mdToast.show($mdToast.simple().textContent('Import operation was successfully completed').position('top right'));
      if ($stateParams.id) {
        $rootScope.$broadcast('tabChange', {
          data: $stateParams.id
        });
        $state.go('app.objects.sourcing');
      } else {
        $rootScope.$broadcast('tabChange', {
          data: $stateParams.id
        });
        $state.go('app.objects.sourcing');
      }
    }

    $scope.numberOfPages = function () {
      return Math.ceil(vm.summeryData.StatisTics.length / $scope.pageSize);
    };

    vm.countFunction = countFunction;
    vm.countprevous = countprevous;

    function countFunction() {
      $scope.currentPage = $scope.currentPage + 1;
      $scope.startIndex = $scope.endIndex;
      if ($scope.currentPage > vm.summeryData.StatisTics.length / $scope.pageSize - 1) {
        $scope.endIndex = $scope.endIndex + (vm.summeryData.StatisTics.length % $scope.pageSize);
      } else {
        $scope.endIndex = $scope.endIndex + $scope.pageSize;
      }
    }

    function countprevous() {
      $scope.currentPage = $scope.currentPage - 1;
      $scope.endIndex = $scope.startIndex;
      $scope.startIndex = $scope.startIndex - $scope.pageSize;
    }

    // auto map attribute.
    vm.isautoMap = false;
    vm.onChangeAutoMap = onChangeAutoMap;

    function onChangeAutoMap() {
      autoMapped();
    }

    function autoMapped() {
      //For Progress Loader
      vm.progress = true;

      vm.MappingData = vm.MappingData === undefined ? '' : vm.MappingData;
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          bom: vm.filePath,
          type: vm.type,
          configName: vm.mapping === 'No mapping configuration available.' ? '' : vm.mapping,
          updateObject: vm.matchingRecords,
          autoMap: vm.isautoMap
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          bom: vm.filePath,
          type: vm.type,
          configName: vm.mapping === 'No mapping configuration available.' ? '' : vm.mapping,
          updateObject: vm.matchingRecords,
          autoMap: vm.isautoMap
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.importsource, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.steper = 2;
              vm.Data = response.data;
              if (angular.equals({}, vm.Data.additionalInfo) || vm.Data.additionalInfo == null) {
                vm.additionalInfoFlag = false;
              } else {
                if (vm.additionalInfo) {
                  vm.additionalInfo = vm.additionalInfo;
                } else {
                  vm.additionalInfo = vm.Data.additionalInfo;
                  vm.additionalInfoFlag = true;
                }
              }
              vm.filePath = vm.Data.filePath;
              vm.mappingName = vm.Data.mappingName;
              vm.fileHeader = vm.Data.fileHeader;
              angular.forEach(vm.fileHeader, function (val, key) {
                if (val == "") {
                  vm.fileHeader.splice(key, 1);
                }
              });
              vm.objectHeader = vm.Data.objectHeader;

              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
              break;
            case 4006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 19:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 17:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              break;
            case 11:
            default:
              //For Progress Loader
              vm.progress = false;

              // For Text message next the spinning wheel.
              vm.progressMesssage = false;
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;

          // For Text message next the spinning wheel.
          vm.progressMesssage = false;
        });
    }

  }
})();
