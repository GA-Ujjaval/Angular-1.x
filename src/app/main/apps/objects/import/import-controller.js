(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('importController', importController)
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
  function importController($scope, $timeout, $rootScope, $state, $http, $stateParams, hostUrlDevelopment, CustomerService,
    errors, $mdToast, AuthService, $document, introService, $mdDialog, GlobalSettingsService, fuseUtils) {

    $scope.IntroOptions = {
      steps: introService.getIntroObj("objectsImport"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>',
      doneLabel: 'Got it'
    };


    $scope.Complete = function () {
      $http({
        method: 'POST',
        url: hostUrlDevelopment.test.helpsetting,
        headers: {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
        },
        data: {
          helpIntroImport: true,
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin',
          customerId: vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId : null
        }
      }).then(function successCallback(response) {
        //console.log(response);
      }, function errorCallback(response) {
        //console.log(response);
      });
      $http({
        method: 'POST',
        url: hostUrlDevelopment.test.helpsetting,
        headers: {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
        },
        data: {
          botIntroSetting: false,
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.userRoleSet[0] == 'customer_admin',
          customerId: vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId : null
        }
      }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
    };
    $scope.AfterChangeEvent = function () {
      $(".introjs-button").css({
        'display': 'inline-block'
      });
      $('.introjs-skipbutton').hide();
      if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
        $('.introjs-skipbutton').show();
      }
    };
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
    vm.previewTableOptions = {
      data: [],
      columnDefs: [],
      enableSorting: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {
        vm.previewTableUiGrid = gridApi;
      }
    };

    vm.finalTableOptions = {
      data: [],
      columnDefs: [],
      enableSorting: false,
      enableColumnMenus: false,
      enableFiltering: true,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {
        vm.finalTableUiGrid = gridApi;
      }
    };

    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //Data
    vm.globalAdditionalInfo = {};
    $scope.currentPage = 0;
    $scope.pageSize = 20;
    $scope.startIndex = 0;
    $scope.endIndex = $scope.pageSize;
    vm.count = 0;
    vm.sortingOrder = '';
    vm.reverse = false;
    var fuseObj = $stateParams.obj;
    var id = $stateParams.id;
    vm.mapping = '';
    vm.type = '';
    vm.filePath = '';
    var flag = '';
    vm.steper = 1;
    vm.mappingName = '';
    vm.previoussteper = '';
    vm.summeryDataTemp = {};
    vm.operator = ['AND', 'OR'];
    vm.basicInfo = {
      objectName: '',
      objectNumber: '',
      revision: '',
      minorRevision: '',
      description: '',
      category: '',
      procurementType: '',
      tags: '',
      costType: '',
      fuseCost: '',
      projectNames: '',
      uom: ''
    };
    vm.inventory = {
      qtyOnHand: '',
      qtyOnOrder: ''
    };
    vm.sourcingDTO = {
      manufacturerSourcing: {
        manufacturerName: '',
        manufacturerPartNumber: ''
      },
      supplierSourcing: {
        name: '',
        sourcingPartNumber: ''
      }
    };

    vm.criteria = {
      fuseObject1: '',
      excelObject1: '',
      operator: '',
      fuseObject2: '',
      excelObject2: ''
    };

    vm.billOfMaterial = {
      location: '',
      referenceDesignator: '',
      quantity: '',
      notes: ''
    };
    vm.fileHeader = [];
    vm.objectHeader = [];
    vm.selectMapping = [];
    vm.configName = '';
    vm.checkOpration = false;

    // For Text message next the spinning wheel.
    vm.progressMesssage = false;

    // Show/Hide Section

    if (id === 'products') {
      id = '';
      vm.type = 'products';
      vm.dataMapping = 'products';
      vm.importName = 'Products';
      vm.importHeading = 'Products';
      vm.matchingRecordsNotShow = true;
      vm.partproductbom = 'Product';
      vm.showhideObjectnumber = true;
      vm.showhideBasicinfo = true;
      vm.showhideInventory = false;
      vm.showhideAdditionalinfo = false;
      vm.showhideManufacture = false;
      vm.showhideSupplier = false;
    } else {
      if (id === 'parts') {
        id = '';
        vm.type = 'parts';
        vm.dataMapping = 'parts';
        vm.importName = 'Parts';
        vm.importHeading = 'Parts';
        vm.matchingRecordsNotShow = true;
        vm.partproductbom = 'Part';
        vm.showhideObjectnumber = true;
        vm.showhideBasicinfo = true;
        vm.showhideInventory = false;
        vm.showhideAdditionalinfo = false;
        vm.showhideManufacture = false;
        vm.showhideSupplier = false;
      } else {
        if (id === 'documents') {
          id = '';
          vm.type = 'documents';
          vm.dataMapping = 'documents';
          vm.importName = 'Documents';
          vm.importHeading = 'Documents';
          vm.matchingRecordsNotShow = true;
          vm.showhideObjectnumber = true;
          vm.showhideBasicinfo = true;
        } else {
          vm.type = 'bom';
          vm.dataMapping = 'bom';
          vm.importName = 'BOM';
          vm.importHeading = 'Bill of Material';
          vm.matchingRecords = 'skip';
          vm.matchingRecordsNotShow = false;
          vm.partproductbom = 'Part';
          vm.showhideObjectnumber = true;
          vm.showhideBasicinfo = true;
          vm.showhideInventory = false;
          vm.showhideAdditionalinfo = false;
          vm.showhideManufacture = false;
          vm.showhideSupplier = false;
          vm.showhideBOM = true;
        }
      }
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
    isConfigurationEnable();

    $scope.$on('msWizard.stepForward', function () {
      next(vm.steper);
    });

    $scope.$on('msWizard.stepBack', function () {
      previous();
    });

    function getallMapping() {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          mappingType: vm.dataMapping
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          mappingType: vm.dataMapping
        }
      }

      function setBomInfo(object) {
        vm.objectIdImport = '(' + object.objectNumber + ' - ';
        if (object.fuseObjectNumberSetting.enableMinorRev == true) {
          vm.revisionImport = 'Revision ' + object.revision + '.' + object.minorRevision + ' , ';
        } else {
          vm.revisionImport = 'Revision ' + object.revision + ' , ';
        }
        if (object.description && object.description != null) {
          vm.descriptionImport = object.description + ')';
        } else if (object.fuseObjectNumberSetting.enableMinorRev == true) {
          vm.revisionImport = 'Revision ' + object.revision + '.' + object.minorRevision + ')';
        } else {
          vm.revisionImport = 'Revision ' + object.revision + ')';
        }
      }

      if (fuseObj != null) {
        setBomInfo(fuseObj);
      } else {
        $rootScope.$on('updateObj', function (event, obj) {
          setBomInfo(obj);
        });
      }

      $timeout(function () {
        if ($rootScope.introGlobalHelp && $rootScope.introImportFlag != true) {
          $timeout(function () {
            $rootScope.CallMeImport();
          });
        }
      }, 1000)

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getprofile, params, '', header)
        .then(function (response) {
          if (response.code !== 1006) {
            $rootScope.introImportFlag = response.data.helpSetting.helpIntroImport;
          }
        });

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getmapping, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

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
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
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

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.checkduplicatemapping, params, '', header)
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
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
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
          vm.dataHidden = 'data';
          vm.filePath = response.data.imagePath;
          break;
        case 4006:
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          break;
        case 1008:
          //For Progress Loader
          vm.progress = false;
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

    // Configuration proxyDetail Api called for isConfigEnable Flag
    function isConfigurationEnable() {
      GlobalSettingsService.getProxydetails()
        .then(function (response) {
          switch (response.code) {
            case 0:
              if (response.data.systemSettings) {
                vm.isConfigEnable = response.data.systemSettings.configurationSetting ?
                  (response.data.systemSettings.configurationSetting.configurationEnabled == 'true') : false;
              }
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
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

            if (vm.sessionData.proxy == true) {
              params = {
                customerId: vm.sessionData.customerAdminId,
                action: 'create',
                objectId: id,
                type: vm.type,
                filePath: vm.filePath,
                mappingName: vm.MappingData,
                updateObject: vm.matchingRecords
              }
            } else {
              params = {
                customerId: vm.sessionData.userId,
                action: 'create',
                objectId: id,
                type: vm.type,
                filePath: vm.filePath,
                mappingName: vm.MappingData,
                updateObject: vm.matchingRecords
              }
            }

            if (vm.Data.billOfMaterial === null) {
              data = {
                objectName: vm.basicInfo.objectName,
                objectNumber: vm.basicInfo.objectNumber,
                revision: vm.basicInfo.revision,
                minorRevision: vm.basicInfo.minorRevision,
                description: vm.basicInfo.description,
                category: vm.basicInfo.category,
                procurementType: vm.basicInfo.procurementType,
                costType: vm.basicInfo.costType,
                tags: vm.basicInfo.tags,
                projectNames: vm.basicInfo.projectNames,
                fuseCost: vm.basicInfo.fuseCost,
                uom: vm.basicInfo.uom,
                fuseInventory: {
                  qtyOnHand: vm.inventory.qtyOnHand,
                  qtyOnOrder: vm.inventory.qtyOnOrder
                },
                sourcingDTO: {
                  supplierSourcing: {
                    name: vm.sourcingDTO.supplierSourcing.name,
                    sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                  },
                  manufacturerSourcing: {
                    manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                    manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                  }
                },
                additionalInfo: vm.additionalInfo,
                criteria: {
                  fuseObject1: vm.criteria.fuseObject1,
                  excelObject1: vm.criteria.excelObject1,
                  operator: vm.criteria.operator,
                  fuseObject2: vm.criteria.fuseObject2,
                  excelObject2: vm.criteria.excelObject2
                },
                filePath: vm.filePath,
                mappingName: vm.mappingName,
                fileHeader: vm.fileHeader,
                objectHeader: vm.objectHeader
              };
            } else {
              data = {
                objectName: vm.basicInfo.objectName,
                objectNumber: vm.basicInfo.objectNumber,
                revision: vm.basicInfo.revision,
                minorRevision: vm.basicInfo.minorRevision,
                description: vm.basicInfo.description,
                category: vm.basicInfo.category,
                procurementType: vm.basicInfo.procurementType,
                costType: vm.basicInfo.costType,
                tags: vm.basicInfo.tags,
                projectNames: vm.basicInfo.projectNames,
                fuseCost: vm.basicInfo.fuseCost,
                uom: vm.basicInfo.uom,
                fuseInventory: {
                  qtyOnHand: vm.inventory.qtyOnHand,
                  qtyOnOrder: vm.inventory.qtyOnOrder
                },
                sourcingDTO: {
                  supplierSourcing: {
                    name: vm.sourcingDTO.supplierSourcing.name,
                    sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                  },
                  manufacturerSourcing: {
                    manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                    manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                  }
                },
                additionalInfo: vm.additionalInfo,
                billOfMaterial: {
                  location: vm.billOfMaterial.location,
                  referenceDesignator: vm.billOfMaterial.referenceDesignator,
                  quantity: vm.billOfMaterial.quantity,
                  notes: vm.billOfMaterial.notes
                },
                criteria: {
                  fuseObject1: vm.criteria.fuseObject1,
                  excelObject1: vm.criteria.excelObject1,
                  operator: vm.criteria.operator,
                  fuseObject2: vm.criteria.fuseObject2,
                  excelObject2: vm.criteria.excelObject2
                },
                filePath: vm.filePath,
                mappingName: vm.mappingName,
                fileHeader: vm.fileHeader,
                objectHeader: vm.objectHeader
              };
            }
            if (vm.isConfigEnable) {
              data.configName = vm.configName;
            } else {
              data.configName = '';
            }
            vm.progress = true;
            CustomerService.addNewMember('POST', hostUrlDevelopment.test.addbom, params, data, header)
              .then(function (response) {
                switch (response.code) {
                  case 0:
                    vm.steper = 3;
                    vm.summeryData = response.data;
                    if (vm.summeryData.StatisTics.length > 0) {
                      vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);

                      vm.previewTableOptions.columnDefs = buildImportTableColumns(vm.headersKey);
                      vm.previewTableOptions.data = getChangeDataStructureForTable(vm.summeryData.StatisTics);

                      vm.previewTableOptions.initialized = true;

                      setGridHeight('import-preview', vm.previewTableOptions, 0);
                      vm.progress = false;
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

              if (vm.MappingData === undefined) {
                vm.MappingData = '';
              }

              if (vm.sessionData.proxy == true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  action: 'create',
                  objectId: id,
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              } else {
                params = {
                  customerId: vm.sessionData.userId,
                  action: 'create',
                  objectId: id,
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              }

              if (vm.Data.billOfMaterial === null) {
                data = {
                  objectName: vm.basicInfo.objectName,
                  objectNumber: vm.basicInfo.objectNumber,
                  revision: vm.basicInfo.revision,
                  minorRevision: vm.basicInfo.minorRevision,
                  description: vm.basicInfo.description,
                  category: vm.basicInfo.category,
                  procurementType: vm.basicInfo.procurementType,
                  costType: vm.basicInfo.costType,
                  tags: vm.basicInfo.tags,
                  projectNames: vm.basicInfo.projectNames,
                  fuseCost: vm.basicInfo.fuseCost,
                  uom: vm.basicInfo.uom,
                  fuseInventory: {
                    qtyOnHand: vm.inventory.qtyOnHand,
                    qtyOnOrder: vm.inventory.qtyOnOrder
                  },
                  sourcingDTO: {
                    supplierSourcing: {
                      name: vm.sourcingDTO.supplierSourcing.name,
                      sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                    },
                    manufacturerSourcing: {
                      manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                      manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                    }
                  },
                  additionalInfo: vm.additionalInfo,
                  criteria: {
                    fuseObject1: vm.criteria.fuseObject1,
                    excelObject1: vm.criteria.excelObject1,
                    operator: vm.criteria.operator,
                    fuseObject2: vm.criteria.fuseObject2,
                    excelObject2: vm.criteria.excelObject2
                  },
                  filePath: vm.filePath,
                  mappingName: vm.mappingName,
                  fileHeader: vm.fileHeader,
                  objectHeader: vm.objectHeader,
                  updateMapping: true
                };
              } else {
                data = {
                  objectName: vm.basicInfo.objectName,
                  objectNumber: vm.basicInfo.objectNumber,
                  revision: vm.basicInfo.revision,
                  minorRevision: vm.basicInfo.minorRevision,
                  description: vm.basicInfo.description,
                  category: vm.basicInfo.category,
                  procurementType: vm.basicInfo.procurementType,
                  costType: vm.basicInfo.costType,
                  tags: vm.basicInfo.tags,
                  projectNames: vm.basicInfo.projectNames,
                  fuseCost: vm.basicInfo.fuseCost,
                  uom: vm.basicInfo.uom,
                  fuseInventory: {
                    qtyOnHand: vm.inventory.qtyOnHand,
                    qtyOnOrder: vm.inventory.qtyOnOrder
                  },
                  sourcingDTO: {
                    supplierSourcing: {
                      name: vm.sourcingDTO.supplierSourcing.name,
                      sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                    },
                    manufacturerSourcing: {
                      manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                      manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                    }
                  },
                  additionalInfo: vm.additionalInfo,
                  billOfMaterial: {
                    location: vm.billOfMaterial.location,
                    referenceDesignator: vm.billOfMaterial.referenceDesignator,
                    quantity: vm.billOfMaterial.quantity,
                    notes: vm.billOfMaterial.notes
                  },
                  criteria: {
                    fuseObject1: vm.criteria.fuseObject1,
                    excelObject1: vm.criteria.excelObject1,
                    operator: vm.criteria.operator,
                    fuseObject2: vm.criteria.fuseObject2,
                    excelObject2: vm.criteria.excelObject2
                  },
                  filePath: vm.filePath,
                  mappingName: vm.mappingName,
                  fileHeader: vm.fileHeader,
                  objectHeader: vm.objectHeader,
                  updateMapping: true
                };
              }
              if (vm.isConfigEnable) {
                data.configName = vm.configName;
              } else {
                data.configName = '';
              }
              vm.progress = true;
              CustomerService.addNewMember('POST', hostUrlDevelopment.test.addbom, params, data, header)
                .then(function (response) {
                  switch (response.code) {
                    case 0:
                      vm.steper = 3;
                      vm.summeryData = response.data;
                      if (vm.summeryData.StatisTics.length > 0) {
                        vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                        vm.previewTableOptions.columnDefs = buildImportTableColumns(vm.headersKey);
                        vm.previewTableOptions.data = getChangeDataStructureForTable(vm.summeryData.StatisTics);

                        vm.previewTableOptions.initialized = true;

                        setGridHeight('import-final', vm.previewTableOptions, 0);
                        vm.progress = false;
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

              if (vm.MappingData === undefined) {
                vm.MappingData = '';
              }

              if (vm.sessionData.proxy == true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  action: 'create',
                  objectId: id,
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              } else {
                params = {
                  customerId: vm.sessionData.userId,
                  action: 'create',
                  objectId: id,
                  type: vm.type,
                  filePath: vm.filePath,
                  mappingName: vm.MappingData,
                  updateObject: vm.matchingRecords
                }
              }

              if (vm.Data.billOfMaterial === null) {
                data = {
                  objectName: vm.basicInfo.objectName,
                  objectNumber: vm.basicInfo.objectNumber,
                  revision: vm.basicInfo.revision,
                  minorRevision: vm.basicInfo.minorRevision,
                  description: vm.basicInfo.description,
                  category: vm.basicInfo.category,
                  procurementType: vm.basicInfo.procurementType,
                  costType: vm.basicInfo.costType,
                  tags: vm.basicInfo.tags,
                  projectNames: vm.basicInfo.projectNames,
                  fuseCost: vm.basicInfo.fuseCost,
                  uom: vm.basicInfo.uom,
                  fuseInventory: {
                    qtyOnHand: vm.inventory.qtyOnHand,
                    qtyOnOrder: vm.inventory.qtyOnOrder
                  },
                  sourcingDTO: {
                    supplierSourcing: {
                      name: vm.sourcingDTO.supplierSourcing.name,
                      sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                    },
                    manufacturerSourcing: {
                      manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                      manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                    }
                  },
                  additionalInfo: vm.additionalInfo,
                  criteria: {
                    fuseObject1: vm.criteria.fuseObject1,
                    excelObject1: vm.criteria.excelObject1,
                    operator: vm.criteria.operator,
                    fuseObject2: vm.criteria.fuseObject2,
                    excelObject2: vm.criteria.excelObject2
                  },
                  filePath: vm.filePath,
                  mappingName: vm.mappingName,
                  fileHeader: vm.fileHeader,
                  objectHeader: vm.objectHeader,
                  updateMapping: false
                };
              } else {
                data = {
                  objectName: vm.basicInfo.objectName,
                  objectNumber: vm.basicInfo.objectNumber,
                  revision: vm.basicInfo.revision,
                  minorRevision: vm.basicInfo.minorRevision,
                  description: vm.basicInfo.description,
                  category: vm.basicInfo.category,
                  procurementType: vm.basicInfo.procurementType,
                  costType: vm.basicInfo.costType,
                  tags: vm.basicInfo.tags,
                  projectNames: vm.basicInfo.projectNames,
                  fuseCost: vm.basicInfo.fuseCost,
                  uom: vm.basicInfo.uom,
                  fuseInventory: {
                    qtyOnHand: vm.inventory.qtyOnHand,
                    qtyOnOrder: vm.inventory.qtyOnOrder
                  },
                  sourcingDTO: {
                    supplierSourcing: {
                      name: vm.sourcingDTO.supplierSourcing.name,
                      sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                    },
                    manufacturerSourcing: {
                      manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                      manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                    }
                  },
                  additionalInfo: vm.additionalInfo,
                  billOfMaterial: {
                    location: vm.billOfMaterial.location,
                    referenceDesignator: vm.billOfMaterial.referenceDesignator,
                    quantity: vm.billOfMaterial.quantity,
                    notes: vm.billOfMaterial.notes
                  },
                  criteria: {
                    fuseObject1: vm.criteria.fuseObject1,
                    excelObject1: vm.criteria.excelObject1,
                    operator: vm.criteria.operator,
                    fuseObject2: vm.criteria.fuseObject2,
                    excelObject2: vm.criteria.excelObject2
                  },
                  filePath: vm.filePath,
                  mappingName: vm.mappingName,
                  fileHeader: vm.fileHeader,
                  objectHeader: vm.objectHeader,
                  updateMapping: false
                };
              }
              if (vm.isConfigEnable) {
                data.configName = vm.configName;
              } else {
                data.configName = '';
              }

              CustomerService.addNewMember('POST', hostUrlDevelopment.test.addbom, params, data, header)
                .then(function (response) {
                  switch (response.code) {
                    case 0:
                      vm.steper = 3;

                      vm.summeryData = response.data;

                      if (vm.summeryData.StatisTics.length > 0) {
                        vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                        vm.previewTableOptions.columnDefs = buildImportTableColumns(vm.headersKey);
                        vm.previewTableOptions.data = getChangeDataStructureForTable(vm.summeryData.StatisTics);

                        vm.previewTableOptions.initialized = true;

                        setGridHeight('import-final', vm.previewTableOptions, 0);
                        vm.progress = false;
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
              objectId: id,
              type: vm.type,
              filePath: '',
              mappingName: '',
              updateObject: vm.matchingRecords
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              action: 'submit',
              objectId: id,
              type: vm.type,
              filePath: '',
              mappingName: '',
              updateObject: vm.matchingRecords
            }
          }

          if (vm.Data.billOfMaterial === null) {
            data = {
              objectName: vm.basicInfo.objectName,
              objectNumber: vm.basicInfo.objectNumber,
              revision: vm.basicInfo.revision,
              minorRevision: vm.basicInfo.minorRevision,
              description: vm.basicInfo.description,
              category: vm.basicInfo.category,
              procurementType: vm.basicInfo.procurementType,
              costType: vm.basicInfo.costType,
              tags: vm.basicInfo.tags,
              projectNames: vm.basicInfo.projectNames,
              fuseCost: vm.basicInfo.fuseCost,
              uom: vm.basicInfo.uom,
              fuseInventory: {
                qtyOnHand: vm.inventory.qtyOnHand,
                qtyOnOrder: vm.inventory.qtyOnOrder
              },
              sourcingDTO: {
                supplierSourcing: {
                  name: vm.sourcingDTO.supplierSourcing.name,
                  sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                },
                manufacturerSourcing: {
                  manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                  manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                }
              },
              additionalInfo: vm.additionalInfo,

              criteria: {
                fuseObject1: vm.criteria.fuseObject1,
                excelObject1: vm.criteria.excelObject1,
                operator: vm.criteria.operator,
                fuseObject2: vm.criteria.fuseObject2,
                excelObject2: vm.criteria.excelObject2
              },
              filePath: vm.filePath,
              mappingName: vm.configureName,
              fileHeader: vm.fileHeader,
              objectHeader: vm.objectHeader
            };
          } else {
            data = {
              objectName: vm.basicInfo.objectName,
              objectNumber: vm.basicInfo.objectNumber,
              revision: vm.basicInfo.revision,
              minorRevision: vm.basicInfo.minorRevision,
              description: vm.basicInfo.description,
              category: vm.basicInfo.category,
              procurementType: vm.basicInfo.procurementType,
              costType: vm.basicInfo.costType,
              tags: vm.basicInfo.tags,
              projectNames: vm.basicInfo.projectNames,
              fuseCost: vm.basicInfo.fuseCost,
              uom: vm.basicInfo.uom,
              fuseInventory: {
                qtyOnHand: vm.inventory.qtyOnHand,
                qtyOnOrder: vm.inventory.qtyOnOrder
              },
              sourcingDTO: {
                supplierSourcing: {
                  name: vm.sourcingDTO.supplierSourcing.name,
                  sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                },
                manufacturerSourcing: {
                  manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                  manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                }
              },
              additionalInfo: vm.additionalInfo,
              billOfMaterial: {
                location: vm.billOfMaterial.location,
                referenceDesignator: vm.billOfMaterial.referenceDesignator,
                quantity: vm.billOfMaterial.quantity,
                notes: vm.billOfMaterial.notes
              },
              criteria: {
                fuseObject1: vm.criteria.fuseObject1,
                excelObject1: vm.criteria.excelObject1,
                operator: vm.criteria.operator,
                fuseObject2: vm.criteria.fuseObject2,
                excelObject2: vm.criteria.excelObject2
              },
              filePath: vm.filePath,
              mappingName: vm.configureName,
              fileHeader: vm.fileHeader,
              objectHeader: vm.objectHeader
            };
          }
          if (vm.isConfigEnable) {
            data.configName = vm.configName;
          } else {
            data.configName = '';
          }
          vm.progress = true;
          CustomerService.addNewMember('POST', hostUrlDevelopment.test.addbom, params, data, header)
            .then(function (response) {
              switch (response.code) {
                case 0:
                  vm.summeryData = vm.summeryDataTemp;
                  vm.id = id;
                  if (vm.summeryData.StatisTics.length > 0) {
                    vm.headersKey = Object.keys(vm.summeryData.StatisTics[0].data);
                    vm.finalTableOptions.columnDefs = buildImportTableColumns(vm.headersKey);
                    vm.finalTableOptions.data = getChangeDataStructureForTable(vm.summeryData.StatisTics);

                    vm.finalTableOptions.initialized = true;

                    setGridHeight('import-final', vm.finalTableOptions, 2);
                    vm.progress = false;
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

    function buildImportTableColumns(columns) {
      var columnDefs = [];
      columnDefs.push({
        displayName: 'Import Status',
        field: 'importStatus',
        width: 150
      });
      columnDefs.push({
        displayName: 'Message',
        field: 'importMessage',
        width: 300
      });
      columns.forEach(function (col) {
        columnDefs.push({
          displayName: col,
          field: col,
          width: 150
        });
      });
      columnDefs.forEach(function (col) {
        col.enableFiltering = true;
        col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
      });
      return columnDefs;
    }

    function getChangeDataStructureForTable(data) {
      var readyData = [];
      data.forEach(function (item) {
        readyData.push(new ProperRow(item.importStatus, item.importMessage, item.data));
      });
      return readyData;
    }

    /**
     * @param id - {string} id of the grid to set height
     * @param gridOptions - {object} options of the grid to be processed
     */
    function setGridHeight(id, gridOptions, index) {
      var grid = document.getElementById(id);
      var gridHeight = (gridOptions.data.length * 30 + 50) > 650 ? 650 : (gridOptions.data.length * 30 + 150);
      grid.style.height = gridHeight + 'px';
      fuseUtils.setProperHeaderViewportHeight(gridOptions.columnDefs, index, null, !index ? vm.previewTableUiGrid : vm.finalTableUiGrid);
    }

    function ProperRow(importStatus, importMessage, objectData) {
      this.importStatus = importStatus;
      this.importMessage = importMessage;
      _.assign(this, objectData);
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
              objectId: id,
              type: vm.type,
              filePath: vm.filePath,
              mappingName: vm.MappingData,
              updateObject: vm.matchingRecords
            }
          } else {
            params = {
              customerId: vm.sessionData.userId,
              action: 'back',
              objectId: id,
              type: vm.type,
              filePath: vm.filePath,
              mappingName: vm.MappingData,
              updateObject: vm.matchingRecords
            }
          }

          if (vm.Data.billOfMaterial === null) {
            data = {
              objectName: vm.basicInfo.objectName,
              objectNumber: vm.basicInfo.objectNumber,
              revision: vm.basicInfo.revision,
              minorRevision: vm.basicInfo.minorRevision,
              description: vm.basicInfo.description,
              category: vm.basicInfo.category,
              procurementType: vm.basicInfo.procurementType,
              costType: vm.basicInfo.costType,
              tags: vm.basicInfo.tags,
              projectNames: vm.basicInfo.projectNames,
              fuseCost: vm.basicInfo.fuseCost,
              uom: vm.basicInfo.uom,
              fuseInventory: {
                qtyOnHand: vm.inventory.qtyOnHand,
                qtyOnOrder: vm.inventory.qtyOnOrder
              },
              sourcingDTO: {
                supplierSourcing: {
                  name: vm.sourcingDTO.supplierSourcing.name,
                  sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                },
                manufacturerSourcing: {
                  manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                  manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                }
              },
              additionalInfo: vm.additionalInfo,
              criteria: {
                fuseObject1: vm.criteria.fuseObject1,
                excelObject1: vm.criteria.excelObject1,
                operator: vm.criteria.operator,
                fuseObject2: vm.criteria.fuseObject2,
                excelObject2: vm.criteria.excelObject2
              },
              filePath: vm.filePath,
              mappingName: vm.mappingName,
              fileHeader: vm.fileHeader,
              objectHeader: vm.objectHeader
            };
          } else {
            data = {
              objectName: vm.basicInfo.objectName,
              objectNumber: vm.basicInfo.objectNumber,
              revision: vm.basicInfo.revision,
              minorRevision: vm.basicInfo.minorRevision,
              description: vm.basicInfo.description,
              category: vm.basicInfo.category,
              procurementType: vm.basicInfo.procurementType,
              costType: vm.basicInfo.costType,
              tags: vm.basicInfo.tags,
              projectNames: vm.basicInfo.projectNames,
              fuseCost: vm.basicInfo.fuseCost,
              uom: vm.basicInfo.uom,
              fuseInventory: {
                qtyOnHand: vm.inventory.qtyOnHand,
                qtyOnOrder: vm.inventory.qtyOnOrder
              },
              sourcingDTO: {
                supplierSourcing: {
                  name: vm.sourcingDTO.supplierSourcing.name,
                  sourcingPartNumber: vm.sourcingDTO.supplierSourcing.sourcingPartNumber
                },
                manufacturerSourcing: {
                  manufacturerName: vm.sourcingDTO.manufacturerSourcing.manufacturerName,
                  manufacturerPartNumber: vm.sourcingDTO.manufacturerSourcing.manufacturerPartNumber
                }
              },
              additionalInfo: vm.additionalInfo,
              billOfMaterial: {
                location: vm.billOfMaterial.location,
                referenceDesignator: vm.billOfMaterial.referenceDesignator,
                quantity: vm.billOfMaterial.quantity,
                notes: vm.billOfMaterial.notes
              },
              criteria: {
                fuseObject1: vm.criteria.fuseObject1,
                excelObject1: vm.criteria.excelObject1,
                operator: vm.criteria.operator,
                fuseObject2: vm.criteria.fuseObject2,
                excelObject2: vm.criteria.excelObject2
              },
              filePath: vm.filePath,
              mappingName: vm.mappingName,
              fileHeader: vm.fileHeader,
              objectHeader: vm.objectHeader
            };
          }
          if (vm.isConfigEnable) {
            data.configName = vm.configName;
          } else {
            data.configName = '';
          }

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.addbom, params, data, header)
            .then(function (response) {

              switch (response.code) {
                case 0:
                  //For Progress Loader
                  vm.progress = false;
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
              }
            })
            .catch(function (response) {
              //For Progress Loader
              vm.progress = false;
            });
          break;
        case 2:
          vm.progress = false;
          vm.dataHidden = 'data';
          vm.steper = 1;
          vm.isautoMap = false;
          break;
      }
    }

    function DoneFunction(id, type) {
      if (type === 'products') {
        $state.go('app.objects.products');
        $mdToast.show($mdToast.simple().textContent('Import Products operation was successfully completed...').position('top right'));
      } else {
        if (id) {
          type = id;
          var typeId = type.indexOf('products');
          if (typeId == 0) {
            $state.go('app.objects.part.parts.bom', {
              'id': id
            });
            $mdToast.show($mdToast.simple().textContent('Import Bill-of-Materials operation was successfully completed...').position('top right'));
          } else {
            $state.go('app.objects.part.parts.bom', {
              'id': id
            });
            $mdToast.show($mdToast.simple().textContent('Import Bill-of-Materials operation was successfully completed...').position('top right'));
          }

        } else {
          if (type === 'documents') {
            $state.go('app.objects.documents');
            $mdToast.show($mdToast.simple().textContent('Import Documents operation was successfully completed...').position('top right'));
          } else {
            $state.go('app.objects.part');
            $mdToast.show($mdToast.simple().textContent('Import Parts operation was successfully completed...').position('top right'));
          }
        }
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

    // check Oprator base on other attribute.
    vm.checkOprator = checkOprator;

    function checkOprator() {
      if (vm.criteria.fuseObject2 || vm.criteria.excelObject2) {
        vm.checkOpration = true;
        vm.Data.criteria = {
          fuseObject1: vm.criteria.fuseObject1,
          excelObject1: vm.criteria.excelObject1,
          operator: vm.criteria.operator,
          fuseObject2: vm.criteria.fuseObject2,
          excelObject2: vm.criteria.excelObject2
        }
      } else {
        vm.checkOpration = false;
        vm.Data.criteria = {
          fuseObject1: vm.criteria.fuseObject1,
          excelObject1: vm.criteria.excelObject1,
          operator: vm.criteria.operator,
          fuseObject2: vm.criteria.fuseObject2,
          excelObject2: vm.criteria.excelObject2
        }
      }
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
          objectId: id,
          bom: vm.filePath,
          type: vm.type,
          configName: vm.mapping === 'No mapping configuration available.' ? '' : vm.mapping,
          updateObject: vm.matchingRecords,
          autoMap: vm.isautoMap
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          objectId: id,
          bom: vm.filePath,
          type: vm.type,
          configName: vm.mapping === 'No mapping configuration available.' ? '' : vm.mapping,
          updateObject: vm.matchingRecords,
          autoMap: vm.isautoMap
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.importbom, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.steper = 2;
              vm.Data = response.data;
              console.log(vm.Data);

              if (vm.Data.fuseObjectNumberSetting.editObjectId == true) {
                if (vm.type === 'products') {
                  vm.criteria.fuseObject1 = 'Product Number';
                  vm.firstCriteriaDisabled = true;
                } else {
                  if (vm.type === 'parts' || vm.type === 'bom') {
                    vm.criteria.fuseObject1 = 'Part Number';
                    vm.firstCriteriaDisabled = true;
                  } else {
                    vm.criteria.fuseObject1 = 'Part Number';
                    vm.firstCriteriaDisabled = true;
                  }
                }
              } else {
                vm.criteria.fuseObject1 = '';
              }
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
              vm.partName = vm.Data.objectName;
              vm.filePath = vm.Data.filePath;
              vm.mappingName = vm.Data.mappingName;
              vm.fileHeader = vm.Data.fileHeader;
              angular.forEach(vm.fileHeader, function (val, key) {
                if (val == "") {
                  vm.fileHeader.splice(key, 1);
                }
              });
              vm.objectHeaderWithoutSourcing = vm.Data.objectHeader.filter(value => {
                return !value.toLowerCase().includes('manufacturer');
              }).filter(value => {
                return !value.toLowerCase().includes('sourc');
              });
              vm.objectHeader = vm.Data.objectHeader;

              //For Progress Loader
              vm.progress = false;
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
