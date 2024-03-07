(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('PartsController', PartsController);

  /** @ngInject */
  function PartsController($state, $location, $filter, msUtils, $http, $stateParams, $mdDialog, $document, hostUrlDevelopment, CustomerService, $mdMenu,
                           $mdToast, AuthService, DialogService, sourcingUtils, $window, $cookies, MainTablesService, GlobalSettingsService, removeProtocolFilter,
                           $scope, $timeout, introService, $rootScope, objectPageEnum, fuseUtils, BoardService, attributesUtils, bulkDelete, $q, BomService, pageTitleService, pageTitles,
                           errors, currencyExchangeService, SourcingCostRow, helperData, uiGridGridMenuService) {

    $scope.BeforeChangeEvent = function (targetElement) {
      $timeout(function () {
        $(".introjs-button").css({
          'display': 'inline-block'
        });
        $(".introjs-helperLayer").css({
          'background-color': 'rgb(32,138,190)'
        });
        $('.introjs-skipbutton').hide();
      })
    };

    //indexes when configuration tab is enabled
    var tabIndexes = {
      BASIC_INFO_TAB_INDEX: 0,
      ADDITIONAL_INFO_TAB_INDEX: 1,
      CONFIGURATION_TAB_INDEX: 2,
      REVISION_TAB_INDEX: 3,
      ATTACHMENT_TAB_INDEX: 4,
      SOURCING_TAB_INDEX: 5,
      BOM_TAB_INDEX: 6,
      WHERE_USED_TAB_INDEX: 7,
      TIMELINE_TAB_INDEX: 8,
      COMMENTS_TAB_INDEX: 9
    };

    $scope.IntroOptions = {
      steps: introService.getIntroObj("objectsParts"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };
    $timeout(function () {
      $('md-tab-item').map(function (index, elem) {
        if (vm.isBOM == true || vm.isBOM == undefined) {
          elem.setAttribute("id", 'step1' + index);
        } else {
          $timeout(function () {
            $scope.IntroOptions.steps = introService.getIntroObj("objectsPartsBOM");
          });
          elem.setAttribute("id", 'step1' + index);
        }
      })
    });
    $(".introjs-helperLayer").css({
      'background-color': 'rgb(32,138,190)'
    });
    $('.introjs-skipbutton').hide();

    $scope.IntroOptions = {
      steps: introService.getIntroObj("objectsParts"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };
    $timeout(function () {
      $('md-tab-item').map(function (index, elem) {
        if (vm.isBOM == true || vm.isBOM == undefined) {
          elem.setAttribute("id", 'step1' + index);
        } else {
          $timeout(function () {
            $scope.IntroOptions.steps = introService.getIntroObj("objectsPartsBOM");
          });
          elem.setAttribute("id", 'step1' + index);
        }
      })
    });

    var vm = this;

    vm.showTimeline = function () {
      vm.timelineClicked = true;
    };

    vm.fuseUtils = fuseUtils;

    vm.objectPageEnum = objectPageEnum;

    vm.error = errors;
    vm.progress = true;
    vm.progressAdd = true;
    vm.whereusedProgres = true;

    // for temp purpose
    vm.disablePagination = false;

    /**
     * Sourcing Tab Configuration
     * @type {Array}
     */
    vm.quantityOnhand = null;
    vm.quantityOnorder = null;

    vm.originalFlatViewRows = [];
    vm.flatViewProgressBar = false;


    vm.targetQuatity = 1;
    vm.unitCostValue = "";
    vm.targetCostValue = "";
    vm.flatViewNodes = {};
    vm.arrayOfAttachmentFiles = [];

    var data = '';

    vm.defualtValue = 'affected';
    vm.changeItems = [];
    vm.dtInstance = {};

    vm.dtOptions = {
      dom: 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
      pagingType: 'simple',
      pageLength: 10,
      autoWidth: false,
      responsive: false
    };

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    angular.forEach(vm.sessionData.userRoleSet, function (value, key) {
      if (value === 'read_only') {
        vm.readonly = true;
        vm.SaveDisabled = true;
        vm.DeleteDisalbed = true;
        vm.costDisabled = true;
      } else {
        vm.readonly = false;
        vm.SaveDisabled = false;
        vm.DeleteDisalbed = false;
        vm.costDisabled = false;
      }
    });

    vm.isFuseAdmin = fuseUtils.isFuseAdmin();

    var params;
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    var id = $stateParams.id;
    vm.linkTarget = '_self';
    vm.id = id;
    var isDocuments = id && id.indexOf('documents') > -1;
    vm.isDocuments = isDocuments;
    var viewportEnv = 'documentsConfigurations';
    vm.isNotDocument = id.indexOf('documents') === -1;
    vm.manufactures = [];
    vm.supplier = [];
    vm.timeline = [];
    vm.boms = [];
    vm.hierarchicalBoms = [];
    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';
    vm.productsassociatedCardList = [];
    vm.changeLogo = changeLogo;
    vm.costSetting = 'M';
    vm.changeReleasedCost = true;
    vm.changeReleasedQOH = true;
    vm.changeReleasedAttribute = true;
    vm.changeReleasedQOO = true;
    vm.breakCost = {};
    vm.currencySetting = '$';
    vm.priceBreakSetting = false;
    vm.manualRelease = true;
    vm.partproduct = '';
    vm.Save = true;
    vm.selectTabsBOM = '';
    vm.selectTabsRev = '';
    vm.isLatestConfiguration = true;
    function getState() {
      const lastIndexOfState = $('#parts').inheritedData('$uiView').state.self.name.lastIndexOf('.');
      const lengthOfClearState = 3;
      const lengthOfCurrentState = $('#parts').inheritedData('$uiView').state.self.name.split('.').length - 1;
      const isClearState = lengthOfCurrentState <= lengthOfClearState;
      const stateName = $('#parts').inheritedData('$uiView').state.self.name;
      return isClearState ? stateName : stateName.substring(0, lastIndexOfState);
    }

    vm.state = getState();

    vm.states = {
      basicInfo: vm.state + '.basicInfo',
      timeline: vm.state + '.timeline',
      bom: vm.state + '.bom',
      comments: vm.state + '.comments',
      whereUsed: vm.state + '.whereUsed',
      additionalInfo: vm.state + '.additionalInfo',
      sourcing: vm.state + '.sourcing',
      attachments: vm.state + '.attachments',
      revisions: vm.state + '.revisions',
      configurations: vm.state + '.configurations'
    };

    const views = {};

    function getViews() {
      _.forEach(Object.keys(vm.states), stateProp => {
        Object.assign(views, {[stateProp]: 'content@' + vm.states[stateProp]});
      })
      return views;
    }

    vm.views = getViews();
    var currentPart = {};
    vm.partDetails = currentPart;

    $rootScope.$on('updateTimeline', function (event, timeline) {
      vm.timeline = timeline;
    });

    $scope.$on('addBOM', function() {
      vm.products.hasBOM = true;
    });

    $scope.$on('allBomRemoved', function () {
      vm.products.hasBOM = false;
    });

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    //Methods
    vm.openCardDialog = DialogService.openCardDialog;
    vm.countTotal = countTotal;
    vm.addNewComment = addNewComment;
    vm.SaveObjects = SaveObjects;
    vm.printTable = printTable;
    vm.deletefuseObjectConfirm = deletefuseObjectConfirm;
    vm.deleteFuseObjectByAdminConfirm = deleteFuseObjectByAdminConfirm;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    vm.promoteDemoteStatus = promoteDemoteStatus;
    vm.importBOMFunction = importBOMFunction;
    vm.backFunction = backFunction;
    vm.OpenLinkFunction = OpenLinkFunction;
    vm.hasSourcingRecord = hasSourcingRecord;
    vm.onPaginate = onPaginate;
    vm.onFlatViewPaginate = onFlatViewPaginate;
    vm.onHierarchicalPaginate = onHierarchicalPaginate;
    vm.minormajorFunction = minormajorFunction;
    vm.whereusedFunction = whereusedFunction;
    /* Change Items */
    vm.changeItemsQuerySearch = changeItemsQuerySearch;
    vm.changeItemsIDQuerySearch = changeItemsIDQuerySearch;
    vm.filterChangeItem = filterChangeItem;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.exists = msUtils.exists;
    vm.associatedocumentFuntions = associatedocumentFuntions;
    vm.numberInteger = numberInteger;
    $scope.onlyNumbers = /^\d+$/;
    vm.flipcostFunciton = flipcostFunciton;
    vm.checkScroll = checkScroll;
    vm.editTable = editTable;
    vm.initAttributes = initAttributes;
    vm.getAllRevisions = getAllRevisions;
    vm.getAllConfigurations = getAllConfigurations;
    vm.loadSelectedRevisionData = loadSelectedRevisionData;
    vm.uploadLogo = uploadLogo;
    vm.fileSuccessLogo = fileSuccessLogo;
    vm.removeThumbnail = removeThumbnail;
    vm.changeReleasedObsolete = changeReleasedObsolete;
    vm.confirmChangeReleasedObsolete = confirmChangeReleasedObsolete;
    vm.checkRadioButtonColor = checkRadioButtonColor;
    vm.editCostValue = editCostValue;
    vm.ObjectSave = ObjectSave;
    vm.onChangeLatestConfiguration = onChangeLatestConfiguration;
    vm.compareObjects = compareObjects;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.getAllAttachments = getAllAttachments;
    vm.associateDocument = associateDocument;
    vm.getActiveCostDisplayName = getActiveCostDisplayName;

    function ObjectSave(flag) {
      if (flag) {
        vm.Save = true;
      } else {
        vm.Save = false;
      }
    }

    init();

    function numberInteger(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
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
          User: vm.user,
          Contacts: vm.contacts,
          pageType: flag,
          whereIsRevisionFrom: '',
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function (data) {
        initAttributes();
        vm.dtInstance.rerender();
      });
    }

    function onPaginate(page, limit) {

      vm.promise = $timeout(function () {

      }, 2000);
    }

    function onFlatViewPaginate(page, limit) {

      vm.promise = $timeout(function () {

      }, 2000);
    }


    function onHierarchicalPaginate(page, limit) {

      vm.hierarchicalPromise = $timeout(function () {

      }, 2000);
    }

    /**
     * validate sourcing record existance
     * @param sourceList
     * @returns {boolean} - true - exist , false - not exist
     */
    function hasSourcingRecord(sourceList) {
      sourceList = sourceList || [];
      if (sourceList.length > 0) {
        return true;
      }
      return false;
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

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    function initAttributes() {

      var mfrPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", objectPageEnum.whereUsedPage)),
        basicAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.whereUsedPage)),
        sourcingAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSourcing", objectPageEnum.whereUsedPage)),
        additionalAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", objectPageEnum.whereUsedPage)),
        suppPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", objectPageEnum.whereUsedPage));

      if (basicAttributes && (basicAttributes.indexOf('isUsedAnywhere') !== -1) && (!vm.configurationSettings && (basicAttributes.indexOf('Configuration') === -1) && (basicAttributes.indexOf('associatedCardsList') !== -1)) ||
        (vm.configurationSettings && basicAttributes && (basicAttributes.indexOf('isUsedAnywhere') !== -1) && (basicAttributes.indexOf('associatedCardsList') !== -1) && (basicAttributes.indexOf('Configuration') !== -1))) {
        vm.attrBasic = angular.fromJson(basicAttributes);
      } else {
        vm.attrBasic = attributesUtils.getWhereUsedBasicAttributes();
        if (!vm.configurationSettings) {
          var ind1 = _.findIndex(vm.attrBasic, {
            value: 'configName'
          });
          vm.attrBasic.splice(ind1, 1);
        }
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", vm.objectPageEnum.whereUsedPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", vm.objectPageEnum.whereUsedPage), angular.toJson(vm.attrBasic));
      }

      var ind = _.findIndex(vm.attrBasic, {
        value: 'associatedCardsList'
      });
      var associatedCardList = vm.attrBasic.splice(ind, 1);
      vm.attrBasic.unshift(associatedCardList[0]);

      if (sourcingAttributes) {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesSourcing", vm.objectPageEnum.whereUsedPage));
      }

      if (additionalAttributes) {
        vm.attrAdditional = angular.fromJson(additionalAttributes);
      }

      if (mfrPartsAttributes) {
        vm.mfrParts = angular.fromJson(mfrPartsAttributes);
      }
      if (suppPartsAttributes) {
        vm.suppParts = angular.fromJson(suppPartsAttributes);
      }
    }

    vm.incrementRevision = incrementRevision;

    function getExtendedBomObject(bom) {

      if (bom.fuseCost != null && bom.fuseCost != undefined && bom.fuseCost != "") {
        bom.fuseCost = vm.currencySetting + ' ' + bom.fuseCost;
      } else {
        bom.fuseCost = "";
      }
      if (bom.costDetail && bom.costDetail.costSetting === helperData.backendRollupCostId) {
        bom.costType = 'Rollup';
      } else {
        bom.costType = 'Manual';
      }
      if (bom.hasBOM) {
        bom.hasBOM = 'Yes';
      } else {
        bom.hasBOM = 'No';
      }
      if (bom.fuseObjectNumberSetting.enableMinorRev) {
        bom.revision = bom.revision + '.' + bom.minorRevision;
      }
      bom.isUsedAnywhere = bom.hasWhereUsed ? 'Yes' : 'No';
      bom.configurationsForDropdown = bom.configName;
      bom.associatedCardsList = bom.associatedCardList;
      bom.tags = bom.tags.join(', ');
      bom.projectNames = bom.projectNames.join(', ');
      bom.additionalInfoList.forEach(function (additionalInfoItem) {
        bom[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });
      if (!_.isEmpty(bom.mfrPartsList)) {
        if (!_.isEmpty(bom.mfrPartsList[0].costDetail)) {
          bom.mfrPartsList[0].moq = bom.mfrPartsList[0].costDetail[0].moq;
        } else {
          bom.mfrPartsList[0].moq = '';
        }
        bom.mfrList = bom.mfrPartsList[0];
      }
      if (!_.isEmpty(bom.suppPartsList)) {
        if (!_.isEmpty(bom.suppPartsList[0].costDetail)) {
          bom.suppPartsList[0].moq = bom.suppPartsList[0].costDetail[0].moq;
        } else {
          bom.suppPartsList[0].moq = '';
        }
        bom.suppList = bom.suppPartsList[0];
      }


      return bom;
    }

    function buildExtendedObject(obj) {
      angular.forEach(obj, function (o, idx) {
        if (o.fuseObjectBOMResponseList && o.fuseObjectBOMResponseList.length != 0) {

          o = getExtendedBomObject(o);

          buildExtendedObject(o.fuseObjectBOMResponseList);
        } else {
          o = getExtendedBomObject(o);
        }
      });

      return obj;
    }

    function associateDocument() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: 'documents'
        };
      } else {
        params = {
          fuseObjectType: 'documents'
        };
      }
      if(vm.changeItems.length){
        return;
      }
      vm.attachmentLoading = true;
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.attachmentLoading = false;
              vm.changeItems = response.data;
              angular.forEach(vm.changeItems, function (value, key) {
                value.uploadDate = new Date(value.modifiedDate).toLocaleDateString();
                value.type = 'document';
                value.uploadType = 'CAD Files';
                value.href = value.objectId;
                value.modifiedDate = $filter('date')(value.modifiedDate, 'medium') || $filter('date')(value.fuseObjectHistory.createDate, 'medium');
              });
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

    $rootScope.$on('updateTimeline', function (event, products) {
      vm.isConfigName = products.timeLineList["0"].configName;
      vm.isMinorRevision = products.fuseObjectNumberSetting.enableMinorRev;
      vm.updateTimeLineFlag = true;
      if (products.fuseCost == null || products.fuseCost == '') {
        vm.cost = '';
      } else {
        vm.cost = $filter('number')(products.fuseCost.replace(',', ''), 2);
      }
      if (products.costDetail != null) {
        if (products.costDetail != null) {
          if (products.costDetail.costSetting === helperData.backendRollupCostId) {
            vm.costSetting = helperData.rollupCostId;
            vm.costDisabled = true;
          } else {
            vm.costSetting = products.costDetail.costSetting;
            vm.costDisabled = false;
          }
        }
      }
      vm.timeline = transformJsonTimeLine(products.timeLineList);
      vm.timelineObjectType = vm.timeline[0].objectId.split("-");
    });

    $scope.$on('SendUp', function () {
      $state.go('app.objects.part.parts.basicInfo', {
        id: id
      }, {
        notify: false,
        reload: false
      });
    });

    $scope.$on('attachmentReportDownloadStarted', function () {
      vm.reportProgress = true;
    });

    $scope.$on('attachmentReportDownloadEnded', function () {
      vm.reportProgress = false;
    });

    $scope.$watch('vm.selectedTab', function (newValue, oldValue) {
      if (vm.configurationSettings && newValue === vm.tabs.CONFIGURATION_TAB_INDEX) {
        vm.getConfigurations();
      }
      setPageTitle(currentPart.objectNumber, currentPart.revision);
    });


    function init(selectedTabindex, isRollup) {
      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : undefined,
        fuseObjectId: id,
        isBom: false
      };

      Promise.all([
        BoardService.getAllMembers(),
        CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', header)
      ])
        .then(function (responses) {
          const allMembersIndex = 0;
          const fuseObjectIndex = 1;
          vm.members = responses[allMembersIndex];
          handleProxyDetails(selectedTabindex);
          handleGetFuseObjectById(responses[fuseObjectIndex], isRollup);
          $scope.$watch('vm.tabs', value => {
            if (value !== undefined) {
              if ($location.url().indexOf('comments') !== -1) {
                vm.Save = false;
                vm.selectedTab = vm.tabs.COMMENTS_TAB_INDEX;
              }
              if ($location.url().indexOf('timeline') !== -1) {
                vm.Save = false;
                vm.showTimeline();
                vm.selectedTab = vm.tabs.TIMELINE_TAB_INDEX;
              }
              if ($location.url().indexOf('whereUsed') !== -1) {
                vm.Save = false;
                vm.whereusedFunction();
                vm.selectedTab = vm.tabs.WHERE_USED_TAB_INDEX;
              }
              if ($location.url().indexOf('additionalInfo') !== -1) {
                vm.selectedTab = vm.tabs.ADDITIONAL_INFO_TAB_INDEX;
              }
              if ($location.url().indexOf('sourcing') !== -1) {
                vm.Save = false;
                vm.selectedTab = vm.tabs.SOURCING_TAB_INDEX;
              }
              if ($location.url().indexOf('attachments') !== -1) {
                vm.Save = false;
                vm.selectedTab = vm.tabs.ATTACHMENT_TAB_INDEX;
              }
              if ($location.url().indexOf('revisions') !== -1) {
                vm.Save = false;
                vm.selectedTab = vm.tabs.REVISION_TAB_INDEX;
              }
              if ($location.url().indexOf('configurations') !== -1) {
                vm.Save = false;
                vm.selectedTab = vm.tabs.CONFIGURATION_TAB_INDEX;
              }
              if ($location.url().indexOf('basicInfo') !== -1) {
                vm.selectedTab = vm.tabs.BASIC_INFO_TAB_INDEX;
              }
            }
          });
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.default).action('x')
            .toastClass("md-error-toast-theme").position('top right').hideDelay(false));
        });
    }

    function handleGetFuseObjectById(response, isRollup) {
      delayInInitLoad();
      switch (response.code) {
        case 0:
          var data = response.data;
          currentPart.objectNumber = data.objectNumber;
          currentPart.revision = data.revision;
          currentPart.minorRevision = data.minorRevision;
          setPageTitle(data.objectNumber, data.revision);
          if (!isRollup) {
            $mdDialog.hide();
          }
          vm.partproduct = response.data.objectType;
          vm.isBOM = response.data.isBomEnable === 'true';
          if (response.data.fuseCost == null || response.data.fuseCost === '') {
            vm.cost = '';
          } else {
            vm.cost = response.data.fuseCost;
          }
          if (response.data.costDetail != null) {
            if (response.data.costDetail.costSetting === helperData.backendRollupCostId) {
              vm.costSetting = helperData.rollupCostId;
              vm.costDisabled = true;
            } else {
              vm.costSetting = response.data.costDetail.costSetting;
              vm.costDisabled = false;
            }
            vm.manualCost = response.data.costDetail.manualCost;
            vm.rollupCost = response.data.costDetail.rollupCost || 0;
            vm.breakCost = response.data.costDetail.breakCost ? response.data.costDetail.breakCost : {};
          }

          if (response.data.qtyOnHand || response.data.qtyOnOrder || response.data.qtyTotal) {
            vm.quantityOnhand = response.data.qtyOnHand;
            vm.quantityOnorder = response.data.qtyOnOrder;
            vm.totalQuantity = response.data.qtyTotal;
          }
          vm.products = response.data;
          vm.status = response.data.status;
          vm.objectType = response.data.objectType;
          vm.selectedRevision = vm.products.revision;
          $rootScope.productHirarcy = vm.products.categoryHierarchy;
          vm.timeline = transformJsonTimeLine(vm.products.timeLineList);
          $rootScope.$emit('updateTimeline', vm.products);
          vm.fuseObjectHistory = extendObjectHistory(response.data.fuseObjectHistory);

          /**
           * Sourcing Tab List & Initial Page Limit
           */
          vm.boms = vm.products.bomResponse;

          /**
           * Hierarchical Tab List & Initial Page Limit
           */
          vm.hierarchicalBoms = angular.copy(vm.products.bomResponse);

          vm.supplierPartCost.setTableData(data.suppPartsList);
          vm.manufacturerPartCost.setTableData(data.mfrPartsList);

          angular.forEach(vm.boms, function (val1) {
            if (val1.fuseObjectBOMResponseList != null) {
              if (val1.fuseObjectBOMResponseList.length > 0) {
                angular.forEach(val1.fuseObjectBOMResponseList, function (val2) {
                  val2.show = false;
                  if (val2.fuseObjectBOMResponseList != null) {
                    if (val2.fuseObjectBOMResponseList.length > 0) {
                      angular.forEach(val2.fuseObjectBOMResponseList, function (val3) {
                        val3.show = false;
                        if (val3.fuseObjectBOMResponseList != null) {
                          if (val3.fuseObjectBOMResponseList.length > 0) {
                            angular.forEach(val3.fuseObjectBOMResponseList, function (val4) {
                              val4.show = false;
                            });
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });

          vm.additionalInfoList = vm.products.additionalInfoList || [];
          for (var i = 0; i < vm.additionalInfoList.length; i++) {
            vm.additionalInfoList[i]['isEdit'] = false;
          }

          vm.additionalInfoListCopy = angular.copy(vm.additionalInfoList);

          if (vm.products.status === 'Released') {
            vm.released = true;
            vm.SaveDisabled = true;
            vm.DeleteDisalbed = true;
          } else if (vm.products.status === 'InDevelopment') {
            vm.released = false;
            vm.SaveDisabled = false;
            vm.DeleteDisalbed = false;
            vm.ChangeStatusDisabled = false;
          } else if (vm.products.status === 'Obsolete') {
              vm.released = true;
              vm.SaveDisabled = true;
              vm.DeleteDisalbed = true;
              vm.ChangeStatusDisabled = true;
          }
          vm.manufactures = [];
          vm.supplier = [];
          vm.comments = vm.products.commentsList;
          vm.manufactures = vm.products.mfrPartsList;
          vm.supplier = vm.products.suppPartsList;
          vm.attachments = vm.products.attachmentsList;
          angular.forEach(vm.attachments, function (value) {
            if (value.type == 'document') {
              value.uploadType = 'CAD Files';
            }
            if (value.uploadType === 'CAD Files') {
              value.src = "https://" + $location.host() + "/objects/documents/" + value.name;
            }
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

            if (value.name != null && value.type != 'document') {
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
          vm.thumbnailSrc = response.data.thumbnailPath;
          vm.initialObject = angular.copy(getObject());

          proxyDetails();
          if (vm.products.associatedCardList.length === 0) {

          } else {
            vm.productsassociatedCardList = [];
            angular.forEach(vm.products.associatedCardList, function (value, key) {
              if (vm.sessionData.proxy == true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  cardId: value
                };
              } else {
                params = {
                  cardId: value
                }
              }

              CustomerService.addNewMember('GET', hostUrlDevelopment.test.getboardbycardid, params, '', header)
                .then(function (response) {
                  vm.progress = false;

                  function checkValue(value) {
                    var matched = false;
                    for (var i = 0, length = vm.productsassociatedCardList.length; i < length; i++) {
                      if (value.id === vm.productsassociatedCardList[i].id) {
                        matched = true;
                        break;
                      }
                    }
                    return matched;
                  }

                  switch (response.code) {
                    case 0:
                      angular.forEach(response.data.cards, function (value, key) {
                        angular.forEach(vm.products.associatedCardList, function (val, keys) {
                          if (value.id === val) {
                            if (!checkValue(value)) {
                              vm.productsassociatedCardList.push({
                                cards: value,
                                BoardName: response.data.name
                              });
                            }
                          }
                        });
                      });
                      if (vm.productsassociatedCardList) {
                        for (var i = 0; i < vm.productsassociatedCardList.length; i++) {
                          angular.forEach(response.data.lists, function (list) {
                            if (list.id == vm.productsassociatedCardList[i].cards.cardListId) {
                              vm.productsassociatedCardList[i].listName = list.name;
                            }
                          })
                        }
                      }
                      break;
                  }
                })
                .catch(function (response) {
                  vm.progress = false;
                  console.error(response);
                });

            });
          }
          break;
        case 4006:
          console.log(response.message);
          $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
          $state.go('app.objects.part');
          break;
        default:
          console.log(response.message);
      }
    }

    function handleProxyDetails(selectedTabindex) {
      $rootScope.$watch('systemSetting', value => {
        if (value !== undefined) {
          let systemSettings = value;
          if (systemSettings) {
            vm.configurationSettings = systemSettings.configurationSetting ?
              (systemSettings.configurationSetting.configurationEnabled === 'true') : false;

            vm.editReleased = systemSettings.releaseSettings ?
              (systemSettings.releaseSettings.allowEdit === 'true') : false;

            vm.releaseAdditionalInfoSettings = systemSettings.releaseAdditionalInfoSettings ?
              (systemSettings.releaseAdditionalInfoSettings.allowEdit === 'true') : false;

            vm.releaseSourcingSettings = systemSettings.releaseSourcingSettings ?
              (systemSettings.releaseSourcingSettings.allowEdit === 'true') : false;

            vm.releaseAttachmentSettings = systemSettings.releaseAttachmentSettings ?
              (systemSettings.releaseAttachmentSettings.allowEdit === 'true') : false;

            vm.advancedNumbering = !!$rootScope.advancedNumberingStatus;

            var tabs = getTabIndexesObj(vm.configurationSettings, vm.isDocuments);
            vm.tabs = tabs;

            vm.selectTabsBOM = tabs.BOM_TAB_INDEX;
            vm.selectTabsRev = tabs.REVISION_TAB_INDEX;

            if ($rootScope.tabFlag) {
              vm.selectedTab = tabs.ATTACHMENT_TAB_INDEX;
              $rootScope.$on('$locationChangeStart', function () {
                vm.selectedTab = tabs.BASIC_INFO_TAB_INDEX;
              });
            }

            if ($location.url().indexOf('bom') === -1) {
              vm.selectedTab = selectedTabindex ? selectedTabindex :
                $state.params.revisionFlag ? tabs.REVISION_TAB_INDEX :
                  $state.params.attachmentsFlag ? tabs.ATTACHMENT_TAB_INDEX : 0;
              vm.minorRevisionSettings = $rootScope.enableMinorRev;
            } else {
              vm.selectedTab = tabs.BOM_TAB_INDEX;
            }
            initAttributes();
          }
        }
      });
    }

    function whereusedFunction() {
      vm.progress = false;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          oType: vm.partproduct,
          oId: id,
          oData: 'wu'
        };
      } else {
        params = {
          oType: vm.partproduct,
          oId: id,
          oData: 'wu'
        };
      }
      $rootScope.progressAddToBom = true;

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.progress = false;
              $rootScope.progressAddToBom = false;
              vm.whereUsedList = buildExtendedObject(response.data);
              for (var i = 0; i < vm.whereUsedList.length; i++) {
                var newRefDes = vm.whereUsedList[i].whereUsedBom;
                vm.whereUsedList[i].refDocs = ((newRefDes.referenceDesignator || []).length > 0) ? newRefDes.referenceDesignator.join(',') : '';
              }
              vm.whereusedProgres = false;
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

    function getTabIndexesDocuments(tab) {
      let tabs = angular.copy(tab);
      tabs = reduceTabIndex(tabs);
      delete tabs.BOM_TAB_INDEX;
      delete tabs.SOURCING_TAB_INDEX;
      return tabs;
    }

    function reduceTabIndex(tab) {
      let tabs = angular.copy(tab);
      angular.forEach(tabs, function (value, key, obj) {
        if (value > tab.SOURCING_TAB_INDEX) {
          obj[key] -= 2;
        }
      });
      return tabs;
    }

    function getTabIndexesObj(isConfigurationEnabled, isDocuments) {
      var tabs = angular.copy(tabIndexes);

      if (!isConfigurationEnabled) {
        delete tabs.CONFIGURATION_TAB_INDEX;
        angular.forEach(tabs, function (value, key, obj) {
          if (value > tabIndexes.CONFIGURATION_TAB_INDEX) {
            obj[key]--;
          }
        })
      }
      if (isDocuments) {
        return getTabIndexesDocuments(tabs);
      }
      return tabs;
    }

    function promoteDemoteStatus(RelObs) {
      if (RelObs === 'Released') {
        vm.relobs = 'Released';
      } else if (RelObs === 'InDevelopment') {
        vm.relobs = 'InDevelopment';
      } else {
        vm.relobs = 'Obsolete';
      }
      data = {
        objectId: id,
        status: vm.relobs
      };
      ChangeStatusConfirm(data, `Do you want to change status from ${vm.products.status} to ${vm.relobs}?`);
    }

    //Increment Minor and Major Revision.

    function minormajorFunction(minormajor, Revision, minorRevision, checkForOlderObject) {
      if (vm.status == 'InDevelopment') {
        $mdToast.show($mdToast.simple().textContent('Revision Increment not allowed until Object is Released.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
      } else {
        if (checkForOlderObject === 'false') {
          $mdToast.show($mdToast.simple().textContent('Cannot increment revision because this is not the most recent version of this object. You can increment revision only from the most recent revision for this object.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
        } else {
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
            }
          } else {
            params = {
              customerId: vm.sessionData.userId
            }
          }

          data = {
            fuseObjectId: id,
            isMajor: minormajor,
            revision: Revision,
            minorRevision: minorRevision,
          };

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.autogeneraterevision, params, data, header)
            .then(function (response) {
              vm.progress = false;
              switch (response.code) {
                case 0:
                  incrementRevision('', response.data, minormajor);
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
              console.log(vm.error.erCatch);
            });
        }
      }
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

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.commentonfuseobject, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.comments = response.data.commentsList;
              var COMMENTS_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).COMMENTS_TAB_INDEX;
              init(COMMENTS_TAB_INDEX);
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
          console.log(vm.error.erCatch);
        });
    }

    function SaveObjects(flag) {

      if (vm.cost === undefined) {
        $mdToast.show($mdToast.simple().textContent('Cost can have upto two decimals places.Also, it can not be negative.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
      } else {
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

        data = getObject(flag);

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateobject, params, data, header)
          .then(function (response) {

            vm.progress = false;
            switch (response.code) {
              case 0:
                init(vm.selectedTab);
                MainTablesService.removeCache();
                $mdToast.show($mdToast.simple().textContent('Successfully Updated').position('top right'));
                $mdDialog.hide();
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
                break;
              case 4566:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error('catch');
          });
      }
    }

    // For Increament Revision
    function incrementRevision(isLatest, minormajorIncrement, minormajor) {
      whereusedFunction();
      vm.minormajor = '';
      if (isLatest === '') {
        if (minormajor) {
          vm.minormajor = 'Do you want to increment the major revision?';
        } else {
          vm.minormajor = 'Do you want to increment the minor revision?';
        }
        var confirm = $mdDialog.confirm()
          .title(vm.minormajor)
          .ariaLabel('Increment Revision')
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function (ev) {

          $mdDialog.show({
            controller: 'RevisionNotesController',
            controllerAs: 'vm',
            templateUrl: 'app/main/apps/objects/parts/tabs/revisionnotedialog/revisionnote-dialog.html',
            parent: angular.element($document.find('#content-container')),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
              fuseObjectId: id,
              minormajorIncrement: minormajorIncrement,
              minormajor: minormajor,
              incrementOnly: '',
              products: vm.products,
              editReleasedBom: vm.editReleasedBom
            }
          }).then(function () {
            init();
          }, function () {

            CustomerService.addNewMember('POST', hostUrlDevelopment.test.incrementrevision, params, '', header)
              .then(function (response) {
                vm.progress = false;

                switch (response.code) {
                  case 0:
                    $mdDialog.hide();
                    $mdToast.show($mdToast.simple().textContent(response.data.customObjectId + ' ' + 'Increment Revision Operation Successfully Performed !!').position('top right'));
                    if (response.data.objectType === 'parts') {
                      $state.go('app.objects.part.parts.basicInfo', {
                        'id': response.data.objectId
                      });
                    } else {
                      if (response.data.objectType === 'documents') {
                        $state.go('app.objects.documents.details.basicInfo', {
                          'id': response.data.objectId
                        });
                      } else {
                        $state.go('app.objects.products.details.basicInfo', {
                          'id': response.data.objectId
                        });
                      }

                    }
                    break;
                  case 4006:
                    console.log(response.message);
                    break;
                  case 17:
                    console.log(response.message);
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                  case 1006:
                    console.log(response.message);
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                    break;
                  case 4004:
                    console.log(response.message);
                    break;
                  case 11:
                    console.log(response.message);
                  default:
                    console.log(response.message);
                }
              })
              .catch(function (response) {
                vm.progress = false;
                console.error('catch');
              });
          });
        });
      } else {
        if (isLatest === 'false') {
          $mdToast.show($mdToast.simple().textContent('Cannot increment revision because this is not the most recent version of this object. You can increment revision only from the most recent revision for this object.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
        } else {
          vm.dataMinorMajor;
          if (vm.sessionData.proxy == true) {
            params = {
              customerId: vm.sessionData.customerAdminId,
            }
          } else {
            params = {
              customerId: vm.sessionData.userId
            }
          }

          data = {
            fuseObjectId: id,
            isMajor: true,
            revision: vm.products.revision,
            minorRevision: vm.products.minorRevision
          }

          CustomerService.addNewMember('POST', hostUrlDevelopment.test.autogeneraterevision, params, data, header)
            .then(function (response) {
              vm.progress = false;
              switch (response.code) {
                case 0:
                  vm.dataMinorMajor = response.data;

                  var confirm = $mdDialog.confirm()
                    .title('Do you want to increment the revision?')
                    .ariaLabel('Increment Revision')
                    .ok('Yes')
                    .cancel('No');

                  $mdDialog.show(confirm).then(function (ev) {

                    $mdDialog.show({
                      controller: 'RevisionNotesController',
                      controllerAs: 'vm',
                      templateUrl: 'app/main/apps/objects/parts/tabs/revisionnotedialog/revisionnote-dialog.html',
                      parent: angular.element($document.find('#content-container')),
                      targetEvent: ev,
                      clickOutsideToClose: true,
                      locals: {
                        fuseObjectId: id,
                        minormajorIncrement: vm.dataMinorMajor,
                        minormajor: minormajor,
                        incrementOnly: 'incrementOnly',
                        products: vm.products,
                        editReleasedBom: vm.editReleasedBom
                      }
                    }).then(function () {
                      init();
                    }, function () {

                      CustomerService.addNewMember('POST', hostUrlDevelopment.test.incrementrevision, params, '', header)
                        .then(function (response) {
                          vm.progress = false;

                          switch (response.code) {
                            case 0:
                              $mdToast.show($mdToast.simple().textContent(response.data.customObjectId + ' ' + 'Increment Revision Operation Successfully Performed !!').position('top right'));
                              if (response.data.objectType === 'parts') {
                                $state.go('app.objects.part.parts.basicInfo', {
                                  'id': response.data.objectId
                                });
                              } else {
                                if (response.data.objectType === 'documents') {
                                  $state.go('app.objects.documents.details.basicInfo', {
                                    'id': response.data.objectId
                                  });
                                } else {
                                  $state.go('app.objects.products.details.basicInfo', {
                                    'id': response.data.objectId
                                  });
                                }

                              }
                              break;
                            case 4006:
                              console.log(response.message);
                              break;
                            case 17:
                              console.log(response.message);
                              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                            case 1006:
                              console.log(response.message);
                              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                              break;
                            case 4004:
                              console.log(response.message);
                              break;
                            case 11:
                              console.log(response.message);
                            default:
                              console.log(response.message);
                          }
                        })
                        .catch(function (response) {
                          vm.progress = false;
                          console.error('catch');
                        });
                    });
                  });
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
              console.log(vm.error.erCatch);
            });
        }
      }
    }

    // For importBOMFunction
    function importBOMFunction(releaseBomSettings) {
      if (releaseBomSettings) {
        if (vm.products.status !== 'InDevelopment') {
          var confirm = $mdDialog.confirm({
            title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to edit?',
            ariaLabel: 'edit fuse object Bill of Material',
            ok: 'Yes',
            cancel: 'No'
          });
          $mdDialog.show(confirm).then(function () {
            if (vm.products.objectType === 'products') {
              if (vm.products.bomResponse == 0) {
                $state.go('app.objects.products.import', {
                  'id': id,
                  obj: vm.products
                });
              } else {
                $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                $state.go('app.objects.products.import', {
                  'id': id,
                  obj: vm.products
                });
              }
            } else {
              if (vm.products.bomResponse == 0) {
                $state.go('app.objects.part.import', {
                  'id': id,
                  obj: vm.products
                });
              } else {
                $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                $state.go('app.objects.part.import', {
                  'id': id,
                  obj: vm.products
                });
              }
            }
          }, function () {

          });
        } else {
          importBomWithCheckRelease();
        }
      } else {
        importBomWithCheckRelease();
      }
    }

    // Function for ImportBOM check for release or obsulate
    function importBomWithCheckRelease() {
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

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.checkrelease, params, '', header)
        .then(function (response) {
          vm.progress = false;

          switch (response.code) {
            case 0:
              if (response.data.objectType === 'products') {
                if (vm.products.bomResponse == 0) {
                  $state.go('app.objects.products.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                } else {
                  $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                  $state.go('app.objects.products.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                }
              } else {
                if (vm.products.bomResponse == 0) {
                  $state.go('app.objects.part.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                } else {
                  $mdToast.show($mdToast.simple().textContent('BOM structure detected, it will be replaced by imported BOM.').position('top right'));
                  $state.go('app.objects.part.import', {
                    'id': response.data.objectId,
                    obj: vm.products
                  });
                }
              }
              break;
            case 4006:
              console.log(response.message);
              break;
            case 19:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
            case 17:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
              break;
            case 4004:
              console.log(response.message);
              break;
            case 11:
              console.log(response.message);
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error('catch');
        });
    }

    //For Sourcing tab
    vm.openManufactureDialog = openManufactureDialog;
    vm.openSupplierDialog = openSupplierDialog;
    vm.datasheetDialog = datasheetDialog;
    vm.supplierAtthachment = supplierAtthachment;
    //for edit part numbering dialog
    vm.editPartNumberingDialog = editPartNumberingDialog;

    function openManufactureDialog(ev, manufature, objectId, addedit) {
      if (vm.SaveDisabled && vm.releaseSourcingSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to ' + addedit + '?',
          ariaLabel: 'add fuse object Supplier',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          manufacturer();
        }, function () {

        });
      } else {
        manufacturer();
      }

      function manufacturer() {
        $mdDialog.show({
          controller: 'manufactureController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/manufactures/manufactures.html',
          parent: angular.element($document.find('#content-container')),
          targetEvent: ev,
          clickOutsideToClose: true,
          multiple: true,
          locals: {
            Manufature: manufature,
            User: vm.user,
            Manufatures: vm.manufactures,
            objectId: objectId,
            status: vm.products.status,
            SaveDisabled: vm.SaveDisabled,
            releaseSourcingSettings: vm.releaseSourcingSettings
          }
        }).then(function () {
          var SOURCING_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).SOURCING_TAB_INDEX;
          init(SOURCING_TAB_INDEX);
        }, function () {
        });
      }
    }

    function openSupplierDialog(ev, supplier, objectId, addedit) {
      if (vm.SaveDisabled && vm.releaseSourcingSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to ' + addedit + '?',
          ariaLabel: 'add fuse object Supplier',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          suppliers();
        }, function () {

        });
      } else {
        suppliers();
      }

      function suppliers() {
        $mdDialog.show({
          controller: 'supplierController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/supplier/supplier.html',
          parent: angular.element($document.find('#content-container')),
          targetEvent: ev,
          clickOutsideToClose: true,
          multiple: true,
          locals: {
            Supplier: supplier,
            Suppliers: vm.supplier,
            objectId: objectId,
            status: vm.products.status,
            SaveDisabled: vm.SaveDisabled,
            releaseSourcingSettings: vm.releaseSourcingSettings
          }
        }).then(function () {
          var SOURCING_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).SOURCING_TAB_INDEX;
          init(SOURCING_TAB_INDEX);
        }, function () {
        });
      }
    }

    function datasheetDialog(ev, objectId, sourcing) {
      $mdDialog.show({
        controller: 'DatasheetController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/datasheets/datasheet-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Sourcing: sourcing,
          objectId: objectId,
          Contacts: vm.contacts
        }
      }).then(function () {
        init();
      }, function () {

      });
    }

    function supplierAtthachment(ev, objectId, sourcing) {
      $mdDialog.show({
        controller: 'SupplierAttachmentController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/sourcing/dialogs/supplierattachment/supplieratachment-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Sourcing: sourcing,
          objectId: objectId,
          Suppliers: vm.supplier
        }
      }).then(function () {
        init();
      }, function () {
      });
    }

    //For Dialog Definition-----------------------------------------------------------------------------------------
    vm.showTabDialog = function (ev, editData, objectId, objectData) {
      $mdDialog.show({
        controller: 'billofmaterialController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/billofmaterial.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          event: ev,
          editData: editData || '',
          $parent: vm,
          callback: null,
          ObjectId: objectId,
          Data: vm.products,
          ObjectData: objectData,
          BOMS: vm.boms,
          isConfigurationCompare: false,
          row: null,
          bomId: null,
          columns: [],
          editReleased: vm.editReleased,
          allFuseObjects: vm.allFuseObjects,
          isConfigEnabled: vm.configurationSettings,
          addedit: ''
        }
      }).then(function (data) {
        init();
      });
    };

    // for editPartNumberingDialog
    function editPartNumberingDialog(ev, configurationSettings, isConfig, advancedNumberFalg) {
      const lastStateName = $location.url().split('/')[$location.url().split('/').length - 1];
      $mdDialog.show({
        controller: 'editPartNumberingDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          object: getObject(),
          products: vm.products,
          copyObject: 'Edit',
          objectId: '',
          configurationSettings: configurationSettings,
          isConfig: isConfig,
          advancedNumbering: advancedNumberFalg,
          lastStateName: lastStateName,
          editPart: false
        }
      }).then(function (data) {
        init(vm.selectedTab);
      }, function () {

      });
    }

    //For Attachments
    vm.upload = upload;
    vm.fileSuccess = fileSuccess;
    vm.fileAdded = fileAdded;
    vm.downloadAttacFunction = downloadAttacFunction;
    vm.removeAttachment = removeAttachment;
    vm.openAttacFunction = openAttacFunction;
    vm.downloadAttacFunction = downloadAttacFunction;
    vm.uploadForms = uploadForms;
    vm.copyToClipboard = copyToClipboard;
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

    vm.dropping = false;
    vm.attachLink = false;
    vm.linkName = false;
    vm.Files = '';
    vm.type = '';
    vm.paramPath = [];

    function upload() {
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to upload an attachment?',
          ariaLabel: 'add fuse object Attachment',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          attachment();
        }, function () {

        });
      } else {
        attachment();
      }

      function attachment() {
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

    function setPageTitle(partNumber, revision) {
      if (!partNumber) {
        return;
      }

      var tabIndexes = getTabIndexesObj(vm.configurationSettings, vm.isDocuments);
      var tabIndexNames = Object.keys(tabIndexes);
      var currentPageName = tabIndexNames
        .filter(
          function (pageIndexName) {
            return tabIndexes[pageIndexName] === vm.selectedTab
          })
        .join();
      pageTitleService.setPageTitleInDetails(partNumber, revision, pageTitles.tabNames[currentPageName]);
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

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremoveattachment, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.attachLink = false;
              vm.attachments = response.data.attachmentsList;
              for (var i = 0; i < vm.fileUpload.length; i++) {
                for (var j = 0; j < vm.attachments.length; j++) {
                  if (vm.fileUpload[i].name == vm.attachments[j].name) {
                    vm.fileUpload[i].src = vm.attachments[j].src;
                  }
                }
              }
              vm.ngFlow.flow.files = [];
              var ATTACHMENT_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).ATTACHMENT_TAB_INDEX;
              init(ATTACHMENT_TAB_INDEX);
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
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to upload an attachment?',
          ariaLabel: 'add fuse object Attachment',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          attachmentlink();
        }, function () {
          vm.attachlink = '';
          vm.linkname = '';
        });
      } else {
        attachmentlink();
      }

      function attachmentlink() {
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

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremoveattachment, params, data, header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.attachlink = '';
                vm.linkname = '';
                vm.attachLink = false;
                vm.attachments = response.data.attachmentsList;
                for (var i = 0; i < vm.fileUpload.length; i++) {
                  for (var j = 0; j < vm.attachments.length; j++) {
                    if (vm.fileUpload[i].name == vm.attachments[j].name) {
                      vm.fileUpload[i].src = vm.attachments[j].src;
                    }
                  }
                }
                var ATTACHMENT_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).ATTACHMENT_TAB_INDEX;
                init(ATTACHMENT_TAB_INDEX);
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
      }
    }

    function downloadAttacFunction(item) {
      var downloadLink = angular.element('<a></a>'); //create a new  <a> tag element
      downloadLink.attr('href', item.src);
      downloadLink.attr('target', '_blank');
      downloadLink.attr('download', item.name);
      downloadLink[0].click(); //call click function
    }

    function openAttacFunction(item) {
      if (item.type == 'document' && item.uploadType === 'CAD Files') {
        $location.path('objects/documents/' + item.name);
        $rootScope.tabFlag = true;
      } else {
        window.open(item.src, '_blank');
      }
    }

    function removeAttachment(item) {
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to remove an attachment?',
          ariaLabel: 'remove fuse object Attachment',
          ok: 'Remove',
          cancel: 'Cancel'
        });
      } else {
        var confirm = $mdDialog.confirm({
          title: 'Remove Attachment',
          parent: $document.find('#attachments'),
          textContent: 'Are you sure you want to remove an attachment?',
          ariaLabel: 'remove card',
          clickOutsideToClose: true,
          escapeToClose: true,
          ok: 'Remove',
          cancel: 'Cancel'
        });
      }

      $mdDialog.show(confirm).then(function () {
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

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.addremoveattachment, params, data, header)
          .then(function (response) {

            switch (response.code) {
              case 0:
                vm.progress = false;
                var ATTACHMENT_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).ATTACHMENT_TAB_INDEX;
                init(ATTACHMENT_TAB_INDEX);
                vm.attachments = response.data.attachmentsList;
                $mdToast.show($mdToast.simple().textContent("Removed Attachment Successfully...").position('top right'));
                break;
              case 1006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              default:
                console.error(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }, function () {
      });
    }

    /**
     * Remove attachment
     *
     * @param item
     */
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

    //For timeline
    function transformJsonTimeLine(response) {
      var data = [];
      angular.forEach(response, function (val) {
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
                'alt': val.idMember
              }
            }
          },
          'name': val.title,
          'icon': iconSelect(val.title),
          'time': val.time,
          'event': val.message,
          'action': val.action,
          'member': val.idMember,
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
        case 'addAt':
          data = 'icon-paperclip';
          break;
        case 'removeAttachment':
          data = 'icon-paperclip';
          break;
        case 'changeStatus':
          data = 'icon-flip-to-front';
          break;
        case 'ADD':
          data = 'icon-document';
          break;
        case 'UPDATE':
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
        case 'COPY OBJECT':
          data = 'icon-content-copy';
          break;
        case 'Create Configuration':
          data = 'icon-content-copy';
          break;
        default:
          data = 'icon-account-alert';
      }
      return data;
    }

    /**
     * Delete Category Confirm Dialog
     */
    function deletefuseObjectConfirm(ev) {
      var titleDelete = 'Are you sure you want to Delete this object?';

      if (vm.products.hasBOM && (vm.products.mfrPartsList.length || vm.products.suppPartsList.length)) {
        titleDelete = 'This part has supplier/manufacturer information and bill of material. Would you still like to delete?';
      } else if (vm.products.mfrPartsList.length || vm.products.suppPartsList.length) {
        titleDelete = 'This part has supplier/manufacturer information. Would you still like to delete?';
      } else if (vm.products.hasBOM) {
        titleDelete = 'This part has bill of material. Would you still like to delete?';
      }

      var confirm = $mdDialog.confirm()
        .title(titleDelete)
        .ariaLabel('delete fuse object')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;

        var promises = [];

        if (vm.products.hasBOM) {
          promises.push(bulkDelete.removeAllBoms(vm.products));
        } else if (vm.products.mfrPartsList.length || vm.products.suppPartsList.length) {
          promises.push(bulkDelete.removeAllSourcing(vm.products));
        }

        $q.all(promises).then(function () {
          deleteFuseObject(vm.products.objectId)
        });

      });
    }

    function deleteFuseObjectByAdminConfirm(ev) {
      const titleDelete = 'Are you sure you want to Delete this object?';
      const confirm = $mdDialog.confirm()
        .title(titleDelete)
        .ariaLabel('delete fuse object')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {

        //For Progress Loader
        vm.progress = true;
        deleteFuseObjectByAdmin(vm.products.objectId);
      });
    }

    function deleteFuseObjectByAdmin(id) {
      params = {
        customerId: vm.sessionData.customerAdminId,
        objectId: id
      };
      header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.removefuseobjectbyadmin, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          if (response.code === 0) {
            vm.type = vm.partproduct;
            if (vm.type === 'parts') {
              $state.go('app.objects.part');
            } else {
              if (vm.type === 'documents') {
                $state.go('app.objects.documents');
              } else {
                $state.go('app.objects.products');
              }
            }
            $mdToast.show($mdToast.simple().textContent("Object Removed Successfully.").position('top right'));
            MainTablesService.removeCache();
          } else {
            $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          }
        })
        .catch(function () {
          //For Progress Loader
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
        });
    }

    function deleteFuseObject(id) {
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

      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.removefuseobject, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              vm.type = vm.partproduct;
              if (vm.type === 'parts') {
                $state.go('app.objects.part');
              } else {
                if (vm.type === 'documents') {
                  $state.go('app.objects.documents');
                } else {
                  $state.go('app.objects.products');
                }
              }
              $mdToast.show($mdToast.simple().textContent("Object Removed Successfully.").position('top right'));
              MainTablesService.removeCache();
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
    }

    /**
     * ChangeStatusConfirm Confirm Dialog
     */
    function ChangeStatusConfirm(data, M) {

      var confirm = $mdDialog.confirm()
        .title(M)
        .ariaLabel('Change Status')
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function () {
        changeStatusHierarchy(data.status);
      });
    }

    function changeStatusHierarchy(status) {
      $mdDialog.show({
        controller: 'ReleaseHierarchyController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/release-hierarchy/release-hierarchy-dialog.html',
        parent: angular.element($document.find('#content-container')),
        clickOutsideToClose: false,
        locals: {
          Object: {
            status: status,
            type: vm.products.objectType,
            objectId: vm.products.objectId,
            releaseHierarchy: vm.changeStatusHierarchy,
            releaseEditsHierarchy: vm.releaseEditsHierarchy,
            withoutHierarchy: !vm.changeStatusHierarchy
          }
        }
      }).then(function (arr) {
        if (arr && arr.length > 0) {
          $mdDialog.show({
            controller: 'BulkReleaseController',
            controllerAs: 'vm',
            templateUrl: 'app/main/apps/objects/parts/tabs/bulk-release/bulk-release-hierarchy.html',
            parent: angular.element($document.find('#content-container')),
            clickOutsideToClose: false,
            locals: {
              status: status,
              Objects: arr,
              isBulkRelease: false,
              isHierarchicalBulkRelease: false
            }
          }).then(function () {
            if (vm.releaseEditsHierarchy) {
              $rootScope.$broadcast('updateBOM');
            }
            init();
          }, function () {
          });
        }
      }, function () {
      });
    }

    function changeStatus(data) {
      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          isReleased: true
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          isReleased: true
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.changestatus, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              init();
              break;
            case 4006:
              break;
            case 1006:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log(vm.error.erCatch);
        });
    }

    //For Back Button individual page.
    function backFunction(objectType) {
      if (objectType === 'parts') {
        $state.go('app.objects.part');
      } else {
        if (objectType === 'documents') {
          $state.go('app.objects.documents');
        } else {
          $state.go('app.objects.products');
        }
      }
      $rootScope.changeLengthEntries = true;
    }

    function OpenLinkFunction(url) {
      if (!url) {
        return;
      }

      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
        window.open(url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }

    // $rootScope.$on('invokePartInitializeShit', function () {
    //   init();
    // });

    /**
     * Add change item chips
     *
     * @param query
     * @returns {filterFn}
     */
    function changeItemsQuerySearch(query) {
      return query ? vm.changeItems.filter(createFilterFor(query)) : [];
    }

    /**
     * Filter change Items
     *
     * @param query
     * @returns {array} IDs
     */
    function changeItemsIDQuerySearch(query) {
      return query ? changeItemsQuerySearch(query).map(function (item) {
        return item.displayObjectId;
      }) : [];
    }

    vm.parseStrings = function (str1, str2, str3) {
      var objectNumber1 = str1.objectNumber || '';
      var configName1 = str1.configName || '';
      var revision1 = str1.revision || '';
      var minorRevision1 = str1.minorRevision || '';
      var status1 = str1.status || '';
      var objectName1 = str1.objectName || '';
      if (vm.configurationSettings && configName1) {
        str1.displayObjectId = "[ " + objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
        return "[ " + objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      } else {
        str1.displayObjectId = "[ " + objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
        return "[ " + objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      }
    };
    vm.parseChip = function (chip) {
      return vm.parseStrings(chip);
    };

    /**
     * Change Items filter
     *
     * @param change item
     * @returns {boolean}
     */
    function filterChangeItem(changeItem) {
      if (!vm.changeItemSearchText || vm.changeItemSearchText === '') {
        return true;
      }
      let objectNumber1 = changeItem.objectNumber || '';
      let configName1 = changeItem.configName || '';
      let revision1 = changeItem.revision || '';
      let minorRevision1 = changeItem.minorRevision || '';
      let status1 = changeItem.status || '';
      let objectName1 = changeItem.objectName || '';
      if (vm.configurationSettings && configName1) {
        changeItem.displayObjectId = "[ " + objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      } else {
        changeItem.displayObjectId = "[ " + objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 + " ] [ " + status1 + " ] " + objectName1;
      }
      return angular.lowercase(changeItem.displayObjectId).indexOf(angular.lowercase(vm.changeItemSearchText)) >= 0;
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

    function associatedocumentFuntions(AD) {
      if (vm.SaveDisabled && vm.releaseBomSettings) {
        var confirm = $mdDialog.confirm({
          title: 'WARNING: Object is ' + vm.products.status + ', are you sure you want to associate a document?',
          ariaLabel: 'add fuse object Attachment',
          ok: 'Yes',
          cancel: 'No'
        });
        $mdDialog.show(confirm).then(function () {
          associateDocument();
        }, function () {

        });
      } else {
        associateDocument();
      }

      function associateDocument() {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            objectId: id,
            associatedObjectId: AD.objectId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            objectId: id,
            associatedObjectId: AD.objectId
          }
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.associateobject, params, '', header)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                var ATTACHMENT_TAB_INDEX = getTabIndexesObj(vm.configurationSettings, vm.isDocuments).ATTACHMENT_TAB_INDEX;
                init(ATTACHMENT_TAB_INDEX);
                $mdToast.show($mdToast.simple().textContent('Successfully Saved').position('top right'));
                break;
              case 1006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              case 21:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
    }

    // for getting all revisions for perticular fuseObjectId
    function getAllRevisions() {
      vm.progressAllRevisions = true;
      if (vm.sessionData.proxy == true) {
        var params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectId: id
        };
      } else {

        var params = {
          userId: vm.sessionData.userId,
          fuseObjectId: id
        };
      }
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectrevisionbyid, params, '', header)
        .then(function (response) {
          vm.progressAllRevisions = false;
          switch (response.code) {
            case 0:
              vm.revisions = response.data;
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
          vm.progressAllRevisions = false;
          console.log(vm.error.erCatch);
        });
    }

    // for getting all revisions for perticular fuseObjectId
    function getAllConfigurations() {

      BomService.getFuseObjectConfigurationsById(id)
        .then(function (response) {
          vm.progressAllConfigurations = false;
          switch (response.code) {
            case 0:
              vm.configuration = response.data;
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
          vm.progressAllConfigurations = false;
          console.log(vm.error.erCatch);
        });
    }

    function getAllAttachments() {
      if (vm.sessionData.proxy == true) {
        params = {
          objectId: id,
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          objectId: id,
          customerId: vm.sessionData.userId
        };
      }
      vm.progress = true;
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.downloadallattachmentsaszip, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.allAttachmentsZipFile = response.data;
              OpenLinkFunction(vm.allAttachmentsZipFile);
              init(getTabIndexesObj(vm.configurationSettings, vm.isDocuments).ATTACHMENT_TAB_INDEX);
              break;
            case 4006:
              // console.log(response.message);
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

    // for ng-change event of revision dropdown
    function loadSelectedRevisionData(key) {
      vm.progress = true;
      if (vm.sessionData.proxy == true) {
        var params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectId: key,
          isBom: false
        };
      } else {
        var params = {
          userId: vm.sessionData.userId,
          fuseObjectId: key,
          isBom: false
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', header)
        .then(function (response) {
          // vm.progress = false;
          delayInInitLoad();
          switch (response.code) {
            case 0:
              $state.go('app.objects.part.parts.basicInfo', {
                id: response.data.objectId
              });
              $mdToast.show($mdToast.simple().textContent('Successfully Loaded Revision.').position('top right'));
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
          console.log(vm.error.erCatch);
        });
    }

    // Fuse cost and Roll-up cost setting.
    function flipcostFunciton() {

      if ((!vm.readonly && !vm.SaveDisabled) || !vm.changeReleasedCost) {

        vm.settingCost = '';
        vm.progressCardData = true;

        if (vm.costSetting === helperData.rollupCostId) {
          vm.settingCost = helperData.backendRollupCostId;
        } else {
          vm.settingCost = vm.costSetting;
        }

        if (vm.sessionData.proxy == true) {
          var params = {
            customerId: vm.sessionData.customerAdminId,
            fuseObjectId: id,
            costSettings: vm.settingCost
          };
        } else {
          var params = {
            userId: vm.sessionData.userId,
            fuseObjectId: id,
            costSettings: vm.settingCost
          };
        }

        CustomerService.addNewMember('GET', hostUrlDevelopment.test.flipcostsettings, params, '', header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.progressCardData = false;
                if (response.data.fuseCost == null || response.data.fuseCost == '') {
                  vm.cost = '';
                } else {
                  vm.cost = response.data.fuseCost;
                }
                if (response.data.costDetail != null) {
                  if (response.data.costDetail.costSetting === helperData.backendRollupCostId) {
                    vm.costSetting = helperData.rollupCostId;
                    vm.costDisabled = true;
                  } else {
                    vm.costSetting = response.data.costDetail.costSetting;
                    vm.costDisabled = false;
                  }
                }
                vm.timeline = transformJsonTimeLine(response.data.timeLineList);
                vm.initialObject.fuseCost = vm.cost;
                vm.initialObject.costDetail.costSetting = vm.costSetting === helperData.rollupCostId ? helperData.backendRollupCostId : vm.costSetting;
                $mdToast.show($mdToast.simple().textContent('Successfully updated').position('top right'));
                break;
              case 4006:
                $mdToast.show($mdToast.simple().textContent(response.message)
                  .action('x').toastClass("md-error-toast-theme too-wide-message").position('top right').hideDelay(0));
                vm.costSetting = vm.oldCostSetting;
                vm.progressCardData = false;
                break;
              case 1006:
                if (vm.costSetting === helperData.rollupCostId) {
                  vm.costSetting = 'M';
                } else {
                  vm.costSetting = helperData.rollupCostId;
                }
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                vm.progressCardData = false;
                break;
              default:
                $mdToast.show($mdToast.simple().textContent(vm.error.default).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                vm.progressCardData = false;
            }
          })
          .catch(function (response) {
            console.log(vm.error.erCatch);
            vm.progressCardData = false;
          });
      }
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

    vm.heightMax = document.body.scrollHeight;

    function getMemberName(members, value) {
      angular.forEach(members, function (val) {
        if (val.id == value.createdBy) {
          value.uploadUser = val.name;
        }
      });
      return value;
    }

    function getActiveCostDisplayName() {
      const activeCost = getActiveCost();
      if (!activeCost) {
        return;
      }
      const isRollup = !activeCost.currency;
      if (isRollup) {
        return `${activeCost.name} (${vm.currencySetting} ${activeCost.cost || 0})`;
      }
      const currencyAbbreviation = currencyExchangeService.getCurrencyAbbreviation(activeCost.currency);
      const currencySign = currencyExchangeService.getSignByAbbreviation(currencyAbbreviation).sign;
      if (activeCost.sourceType) {
        return `${activeCost.name} : ${activeCost.sourcerName} (MOQ ${activeCost.moq}: ${isNaN(activeCost.cost) ? '' : currencySign} ${activeCost.cost || 0})`;
      }
      return `${activeCost.name} (MOQ ${activeCost.value}: ${isNaN(activeCost.cost) ? '' : currencySign} ${activeCost.cost || 0})`;
    }

    function getActiveCost() {
      const allPrices = _.concat(vm.priceBreakOptions.data, vm.supplierPartCost.data, vm.manufacturerPartCost.data);
      return _.find(allPrices, {id: vm.costSetting});
    }

    //For upload Thumbnail
    vm.ngFlowOptionsLogo = {
      // You can configure the ngFlow from here
      chunkSize: 500 * 1024 * 1024,
      target: hostUrlDevelopment.test.uploadfile + '?imageType=thumbnail&' + 'customerId=' + params.customerId + '&' + 'objectId=' + id,
      testChunks: false,
      fileParameterName: 'uploadfile'
    };

    vm.ngFlowLogo = {
      // ng-flow will be injected into here through its directive
      flow: {}
    };

    $scope.$watch(() => {
      const gridElem = document.getElementById('grid-configurations');
      if (gridElem) {
        gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 246}px`;
      }
    });

    $scope.$watch('vm.costSetting', function (newVal, oldVal) {
      vm.oldCostSetting = oldVal;
    });

    function uploadLogo() {
      var imageType = 'image';
      var filesToUpload = vm.ngFlowLogo.flow.files;
      if (filesToUpload.some(function (file) {
        return file.file.type.indexOf(imageType) === -1
      })) {
        $mdToast.show($mdToast.simple().textContent(vm.error.wrongThumbnailType).action('x')
          .toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
        filesToUpload.length = 0;
        return;
      }

      changeLogo(false);
      vm.thumbnailFlag = true;
      vm.ngFlowLogo.flow.opts.allowDuplicateUploads = true;
      vm.ngFlowLogo.flow.opts.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'authId': vm.sessionData.authId,
        'channel_name': vm.sessionData.channel_name,
        'proxy': vm.sessionData.proxy
      };
      vm.ngFlowLogo.flow.upload();
    }

    function fileSuccessLogo(file, message) {

      var response = JSON.parse(message);

      if (response.code == 0) {
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
          id: id,
          src: response.data.imagePath,
          name: response.data.fileName
        };

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatethumbnail, params, data, header)
          .then(function (response) {
            vm.thumbnailFlag = false;
            switch (response.code) {
              case 0:
                vm.thumbnailSrc = response.data.thumbnailPath;
                vm.timeline = transformJsonTimeLine(response.data.timeLineList);
                vm.fuseObjectHistory = response.data.fuseObjectHistory;
                $rootScope.$broadcast('updateThumbnail', vm.thumbnailSrc);
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
            console.error(response);
          });
      }
    }

    function changeLogo(isChangelogo) {
      fuseUtils.isChangeLogo = isChangelogo;
    }

    function removeThumbnail() {
      changeLogo(false);
      vm.thumbnailFlag = true;

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

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.removethumbnail, params, '', header)
        .then(function (response) {
          vm.thumbnailFlag = false;
          switch (response.code) {
            case 0:
              vm.thumbnailSrc = response.data.thumbnailPath;
              vm.timeline = transformJsonTimeLine(response.data.timeLineList);
              vm.fuseObjectHistory = response.data.fuseObjectHistory;
              $rootScope.$broadcast('updateThumbnail', vm.thumbnailSrc);
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
          console.error(response);
        });
    }

    // this method used for making all flag to false (only one field user can edit)
    function flagChange(additionalInfoList) {
      for (var i = 0; i < additionalInfoList.length; i++) {
        additionalInfoList[i]['isEdit'] = false;
      }
    }

    let tableDataBackup;

    function changeReleasedObsolete(attr, flag, value, clear, totalQuantity, list, toBeSaved, isEditIconClicked, index) {
      if (flag && attr == 'cost') {
        tableDataBackup = _.cloneDeep(vm.priceBreakOptions.data);
      }
      if (attr == 'cost') {
        if (clear) {
          vm.priceBreakOptions.data = tableDataBackup;
        }
        vm.changeReleasedCost = !flag;
        vm.costBeforeChange = value;
        clear ? vm.cost = value : false;
      } else if (attr == 'AdditionalInfo') {
        if (!toBeSaved) {
          vm.additionalInfoListCopy = angular.copy(vm.additionalInfoList);
        }
        flagChange(vm.additionalInfoListCopy);
        vm.additionInfoBeforeChange = value;
        var obj = vm.additionalInfoListCopy[index];
        obj.isEdit = flag;
        clear ? obj.attributeValue = value : false;
        if (!isEditIconClicked) {
          if (toBeSaved) {
            vm.additionalInfoList = angular.copy(vm.additionalInfoListCopy);
          } else {
            vm.additionalInfoListCopy = angular.copy(vm.additionalInfoList);
          }
        }
      } else {
        vm.totalQuantityBeforeChange = totalQuantity;
        clear ? vm.totalQuantity = totalQuantity : false;
        if (attr == 'QOH') {
          vm.changeReleasedQOH = !flag;
          vm.qohBeforeChange = value;
          clear ? vm.quantityOnhand = value : false;
        } else {
          vm.changeReleasedQOO = !flag;
          vm.qooBeforeChange = value;
          clear ? vm.quantityOnorder = value : false;
        }
      }
    }

    function confirmChangeReleasedObsolete(ev, attr, flag, value, clear, totalQuantity, list, toBeSaved, isEditIconClicked, index) {
      var confirm = $mdDialog.confirm()
        .title('WARNING: Object is ' + vm.status + ', are you sure you want to edit?')
        .ariaLabel('change released/obsolete objects')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function () {
        changeReleasedObsolete(attr, flag, value, clear, totalQuantity, list, toBeSaved, isEditIconClicked, index);
      }, function () {
      });

    }

    function checkRadioButtonColor() {
      if (vm.status === 'Released' || vm.status === 'Obsolete') {
        $('.md-on').css({
          'background-color': 'grey'
        });
        $('.md-off').css({
          'border-color': 'grey'
        });
      }
    }

    function proxyDetails() {
      $rootScope.$watch('systemSetting', value => {
        if (value !== undefined) {
          let systemSettings = value;
          if (systemSettings) {
            vm.editReleased = systemSettings.releaseSettings ?
              (systemSettings.releaseSettings.allowEdit === 'true') : false;

            vm.editReleasedBom = systemSettings.releaseBomSettings ?
              (systemSettings.releaseBomSettings.allowEdit === 'true') : false;

            systemSettings.currencySettings ?
              vm.currencySetting = systemSettings.currencySettings.currencyChoice.split(' ')[0] : false;

            vm.fullSystemCurrency = (systemSettings.currencySettings && systemSettings.currencySettings.currencyChoice)
              || currencyExchangeService.getDefaultCurrencyString();

            vm.priceBreakSetting = systemSettings.costSplitSettings ?
              (systemSettings.costSplitSettings.allowCostSplit === 'true') : false;

            vm.releaseBomSettings = systemSettings && systemSettings.releaseBomSettings ?
              (systemSettings.releaseBomSettings.allowEdit === 'true') : false;

            vm.manualRelease = systemSettings.releaseSettings ?
              systemSettings.releaseSettings.manualRelease !== 'false' : true;

            vm.promoteDemote = systemSettings.releaseSettings ?
              systemSettings.releaseSettings.promoteDemote !== 'false' : true;

            vm.changeStatusHierarchy = systemSettings.releaseSettings ?
              (systemSettings.releaseSettings.releaseHierarchy === 'true') : false;

            vm.releaseEditsHierarchy = systemSettings.releaseSettings ?
              (systemSettings.releaseSettings.releaseEditsHierarchy === 'true') : false;

            vm.releaseAttachmentSettings = systemSettings.releaseAttachmentSettings ?
              (systemSettings.releaseAttachmentSettings.allowEdit === 'true') : false;

            vm.releaseSourcingSettings = systemSettings.releaseSourcingSettings ?
              (systemSettings.releaseSourcingSettings.allowEdit === 'true') : false;

            vm.configurationSettings = systemSettings.configurationSetting ?
              (systemSettings.configurationSetting.configurationEnabled === 'true') : false;

            vm.releaseAdditionalInfoSettings = systemSettings.releaseAdditionalInfoSettings ?
              (systemSettings.releaseAdditionalInfoSettings.allowEdit === 'true') : false;

            vm.minorRevisionSettings = $rootScope.enableMinorRev;

            vm.advancedNumberSettings = systemSettings.advancednumberingSetting ?
              (systemSettings.advancednumberingSetting.advancednumberingEnabled === 'true') : false;

            if (!vm.configurationSettings) {
              vm.attrBasic = _.filter(vm.attrBasic, function (col) {
                return col.name !== 'Configuration'
              });
            }

            initAttributes();
            setBomTabSelect(vm.configurationSettings);

            if (vm.priceBreakSetting) {
              var arr = [];
              _.forIn(systemSettings, function (o) {
                if (_.has(o, 'id') && _.has(o, 'name')) {
                  o.value = o[o.id];
                  o.cost = '';

                  if (vm.breakCost) {
                    _.forIn(vm.breakCost, function (obj, key) {
                      if (key === o.id) {
                        o.cost = obj;
                      }
                    });
                  }
                  if (o.id === 'M') {
                    if (arr[0] && arr[0].id === helperData.rollupCostId) {
                      o.cost = vm.manualCost;
                      arr.splice(1, 0, o);
                    } else {
                      o.cost = vm.manualCost;
                      arr.unshift(o);
                    }
                  } else if (o.id === helperData.rollupCostId) {
                    o.cost = vm.rollupCost;
                    arr.unshift(o);
                  } else {
                    arr.push(o);
                  }
                  vm.breakCost[o.id] = o.cost;
                }
              });
              vm.priceBreakOptions.data = arr.map((row) => {
                const systemCurrency = currencyExchangeService.getSystemCurrency();
                row.currency = `${systemCurrency.sign} (${systemCurrency.abbreviation})`;
                row.cost = isNaN(row.cost) ? row.cost : +row.cost;
                return row;
              });
            }
            vm.initialObject.costDetail.breakCost = angular.copy(vm.breakCost);
          }
          setCostDetail();
          vm.configurationsGridOptions.columnDefs = buildRevisionsTableColumns();
          restoreState();
        }
      });
    }

    $rootScope.$on('updateRollupCost', (event, value) => {
      init(null, true);
    });

    function calculatePartNameLength() {
      return Math.round(($document.width() - $('.padd-29').width())/22);
    }

    function setBomTabSelect(configSetting) {
      if (configSetting) {
        vm.selectTabsBOM = 6;
        vm.selectTabsRev = 3;
        if ($location.url().substring($location.url().indexOf('bom')) == 'bom') {
          vm.Save = false;
          vm.selectedTab = 6;
        }
      } else {
        vm.selectTabsBOM = 5;
        vm.selectTabsRev = 2;
        if ($location.url().substring($location.url().indexOf('bom')) == 'bom') {
          vm.Save = false;
          vm.selectedTab = 5;
        }
      }
    }

    $scope.$on('$stateChangeStart',
      function (event, toState) {
        if (toState.name != 'app.login' && !angular.equals(vm.initialObject, getObject()) &&
          !vm.updateTimeLineFlag && !vm.toStateFlag) {
          event.preventDefault();
          var confirm = $mdDialog.confirm()
            .title('Changes to the part have not been saved, are you sure you want to exit?')
            .ok('Yes')
            .cancel('No');

          $mdDialog.show(confirm).then(function () {
            $mdDialog.hide();
            vm.toStateFlag = true;
            $state.go(toState);
          }, function () {
            $mdDialog.hide();
          });
        }
      });

    function getObject(flag) {
      if (vm.additionalInfoListCopy) {
        Object.keys(vm.additionalInfoListCopy).forEach(function (key) {
          delete vm.additionalInfoListCopy[key].isEdit;
        });
      }
      if (vm.additionalInfoList) {
        Object.keys(vm.additionalInfoList).forEach(function (key) {
          delete vm.additionalInfoList[key].isEdit;
        });
      }
      return {
        objectId: vm.products.objectId,
        objectType: vm.products.objectType,
        objectName: vm.products.objectName,
        objectNumber: vm.products.objectNumber,
        categoryId: vm.products.categoryId,
        description: vm.products.description,
        revision: vm.products.revision,
        uom: vm.products.uom,
        fuseCost: vm.cost,
        costDetail: {
          manualCost: vm.manualCost,
          rollupCost: vm.rollupCost,
          costSetting: vm.costSetting === helperData.rollupCostId ? helperData.backendRollupCostId : vm.costSetting,
          breakCost: vm.breakCost
        },
        procurementType: vm.products.procurementType,
        projectNames: vm.products.projectNames,
        tags: vm.products.tags,
        additionalInfoList: flag ? vm.additionalInfoList : vm.additionalInfoListCopy,
        systemRevision: vm.products.systemRevision,
        minorRevision: vm.products.minorRevision,
        systemObjectNumber: vm.products.systemObjectNumber,
        systemMinorRevision: vm.products.systemMinorRevision,
        fuseObjectHistory: vm.products.fuseObjectHistory,
        qtyOnHand: vm.quantityOnhand,
        qtyOnOrder: vm.quantityOnorder,
        qtyTotal: vm.totalQuantity
      };
    }

    const COST_COLUMN_WIDTH = 250;

    function buildPriceBreakColumns() {

      var attributes = [{
        cellTemplate: 'app/main/apps/objects/parts/tabs/basic-info/cost-radio-button-cell-template.html',
        field: 'id',
        displayName: '',
        enableCellEdit: false,
        width: 80
      },
        {
          field: 'name',
          displayName: 'Cost Type (Part Cost)',
          enableCellEdit: false
        },
        {
          field: 'value',
          displayName: 'MOQ',
          enableCellEdit: false
        },
        {
          field: 'currency',
          displayName: 'Currency',
          enableCellEdit: false
        },
        {
          cellTemplate: 'app/main/apps/objects/parts/tabs/basic-info/cost-value-cell-template.html',
          field: 'cost',
          displayName: 'Cost',
          enableCellEdit: true,
          width: COST_COLUMN_WIDTH,
          cellEditableCondition: function ($scope) {
            return $scope.rowRenderIndex != 0 && ((!vm.readonly && !vm.SaveDisabled) || !vm.changeReleasedCost)
          }
        },
      ];

      return attributes;
    }

    vm.priceBreakOptions = {
      initialized: false,
      columnDefs: buildPriceBreakColumns(),
      data: [],
      rowHeight: 30,
      enableFiltering: false,
      enableSorting: false,
      enableColumnMenus: false,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.priceBreakUiGrid = gridApi;

        vm.priceBreakUiGrid.edit.on.afterCellEdit($scope, function (rowEntity) {
          if (rowEntity.id === 'M') {
            vm.manualCost = rowEntity.cost;
          }
          if (rowEntity.id === helperData.rollupCostId) {
            vm.rollupCost = rowEntity.cost;
          }
          vm.breakCost[rowEntity.id] = rowEntity.cost;

          if (vm.costSetting === rowEntity.id) {
            vm.cost = rowEntity.cost;
          }
        });

        vm.priceBreakUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.priceBreakOptions.data.length > 0) && !vm.priceBreakOptions.initialized) {
            $timeout(function () {
              vm.priceBreakOptions.initialized = true;
            });
          }
          vm.partNameLength = calculatePartNameLength();
        });
      }
    };

    function setCostDetail() {
      if (_.find(vm.priceBreakOptions.data, function (val) {
        return val.id == 'M';
      }) == undefined) {
        if (_.find(vm.priceBreakOptions.data, function (val) {
          return val.id === helperData.rollupCostId;
        }) == undefined) {
          vm.priceBreakOptions.data.unshift({
            id: 'M',
            name: 'Manual',
            value: 1,
            cost: vm.manualCost || 0,
            currency: vm.fullSystemCurrency
          });
        } else {
          vm.priceBreakOptions.data.splice(1, 0, {
            id: 'M',
            name: 'Manual',
            value: 1,
            cost: vm.manualCost || 0,
            currency: vm.fullSystemCurrency
          });
        }
      }
      if (_.find(vm.priceBreakOptions.data, function (val) {
        return val.id === helperData.rollupCostId;
      }) == undefined) {
        vm.priceBreakOptions.data.unshift({
          id: helperData.rollupCostId,
          name: 'Rollup',
          value: '',
          cost: vm.rollupCost,
          currency: vm.fullSystemCurrency
        });
      }
    }

    function editCostValue(row) {
      angular.element('#' + row).dblclick();
    }

    function extendObjectHistory(history) {
      var newHistory = {};
      var creator = _.find(vm.members, {
        id: history.createdBy
      });
      var editor = _.find(vm.members, {
        id: history.modifiedBy
      });
      newHistory.createdBy = creator ? (creator.firstName + " " + creator.lastName) : '';
      newHistory.modifiedBy = editor ? (editor.firstName + " " + editor.lastName) : '';
      newHistory.modifiedDate = history.modifiedDate;
      newHistory.createDate = history.createDate;
      newHistory.revisionNotes = history.revisionNotes;
      return newHistory;
    }

    vm.copyPPD = copyPPD;

    // Copy Part, Product, Document dialog
    function copyPPD(ev, ID, configurationSettings, isConfig) {
      $mdDialog.show({
        controller: 'CopyPPDController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/copy-ppd/dialog/copyppd-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          objectId: ID,
          objectType: vm.products.objectType,
          objects: vm.products,
          configurationSettings: configurationSettings,
          isConfig: isConfig
        }
      }).then(function (data) {
      }, function () {
      });
    }

    vm.createConfiguration = createConfiguration;

    function createConfiguration(ev, object) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          allConfigurations: true,
          fuseObjectId: object.objectId
        }
      } else {
        params = {
          allConfigurations: true,
          fuseObjectId: object.objectId
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getconfigurations, params, '', header)
        .then(function (response) {
          var configurationObject = [];
          if (response.code == 0) {
            response.data.forEach(function (res) {
              configurationObject.push({
                objectId: res.objectId,
                objectType: res.objectType,
                objectNumber: res.objectNumber,
                systemRevision: res.systemRevision,
                minorRevision: res.minorRevision,
                systemObjectNumber: res.systemObjectNumber,
                revision: res.revision,
                systemMinorRevision: res.systemMinorRevision,
                objectName: res.objectName,
                configName: res.configName,
                isConfig: res.isConfig,
                hasConfig: res.hasConfig,
              })
            });
          }
          return configurationObject;
        })
        .then(function (configObj) {
          // Configuration selection popup before Create new configuration
          $mdDialog.show({
            controller: 'IntermediateConfigController',
            controllerAs: 'vm',
            templateUrl: 'app/main/apps/objects/parts/dialog/intermediate-config-dialog.html',
            parent: angular.element($document.find('#content-container')),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
              configurationObject: configObj,
              object: object,
              ev: ev,
              advancedNumbering: vm.advancedNumbering
            }
          }).then(function () {
          }, function () {
          });
        })
        .catch(function (response) {
          console.log(vm.error.erCatch);
        });
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //configuration table part


    vm.readonly = fuseUtils.findAccessRights();

    //Method
    vm.downloadTable = downloadTable;
    vm.editConfigurationsTable = editConfigurationsTable;
    vm.setTooltip = setTooltip;
    vm.isCompareEnable = isCompareEnable;
    vm.compareConfigurations = compareConfigurations;
    vm.getConfigurations = getConfigurations;


    var whereFromFlag = 'parts';
    var configurationPageType = objectPageEnum.configurationPage;

    vm.configurations = [];
    var configurations = [];

    vm.configurationsForCompare = [];
    vm.objectNumber = '';
    vm.heightMax = document.body.scrollHeight;
    vm.progressConfigurations = false;

    function getConfigurations() {
      if (!vm.members) {
        setTimeout(function () {
          getConfigurations()
        }, 100);
      }

      if (vm.sessionData.proxy == true) {
        params = {
          fuseObjectId: id,
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          fuseObjectId: id
        };
      }
      params.allConfigurations = true;

      vm.progressConfigurations = true;
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getconfigurations, params, '', header)
        .then(function (response) {
          vm.progressConfigurations = false;
          switch (response.code) {
            case 0:
              configurations.length = 0;
              angular.forEach(response.data, function (configuration) {
                vm.objectNumber = configuration.objectNumber;
                configurations.push(extendPropertiesOfConfiguration(configuration));
              });

              angular.copy(_.filter(configurations, {
                isLatest: 'true'
              }), vm.configurations);

              restoreState();
              if (configurations[0] && configurations[0].additionalInfoList) {
                setAttributesAdditionalRevisions(configurations[0].additionalInfoList);
              }
              $timeout(function () {
                setSelectedRows();
              });
              setCsvFilename({objectNumber: response.data[0].objectNumber}, [vm.configurationsGridOptions]);
              fuseUtils.handleAllOptionForPagination(vm.configurationsGridOptions, objectPageEnum.configurationPage);
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progressConfigurations = false;
          console.log(response.message);
        });
      $timeout(function () {
        vm.progressConfigurations = false;
      }, 100);

    }

    function extendPropertiesOfConfiguration(configuration) {

      if (configuration.additionalInfoList) {
        angular.forEach(configuration.additionalInfoList, function (additionalItem) {
          configuration[additionalItem.attributeKey] = additionalItem.attributeValue;
        });
      }

      if (configuration.fuseObjectHistory) {
        var creator = _.find(vm.members, {
          id: configuration.fuseObjectHistory.createdBy
        });
        var editor = _.find(vm.members, {
          id: configuration.fuseObjectHistory.modifiedBy
        });

        configuration.configurationsForDropdown = configuration.configName;
        configuration.createdBy = creator ? creator.firstName + " " + creator.lastName : '';
        configuration.modifiedBy = editor ? editor.firstName + " " + editor.lastName : '';
        configuration.modifiedDate = $filter('date')(configuration.fuseObjectHistory.modifiedDate, "medium");
        configuration.createDate = $filter('date')(configuration.fuseObjectHistory.createDate, "medium");
        configuration.revisionNotes = configuration.fuseObjectHistory.revisionNotes;
      }

      if (configuration.minorRevision && vm.minorRevisionSettings) {
        configuration.revision = configuration.revision + '.' + configuration.minorRevision;
      }

      configuration.partNumber = configuration.objectNumber;
      configuration.hasBOM = configuration.hasBOM ? 'Yes' : 'No';
      configuration.projectNames = configuration.projectNames.join(', ');
      configuration.tags = configuration.tags.join(', ');

      if (configuration.costDetail && configuration.costDetail.costSetting === helperData.backendRollupCostId) {
        configuration.costType = 'Rollup';
      } else {
        configuration.costType = 'Manual';
      }

      if (!_.isEmpty(configuration.mfrPartsList)) {
        var firstMfr = configuration.mfrPartsList[0];

        if (!_.isEmpty(firstMfr.costDetail)) {
          firstMfr.moq = firstMfr.costDetail[0].moq;
          firstMfr.currency = firstMfr.costDetail[0].currency;
          firstMfr.cost = firstMfr.costDetail[0].cost;
        } else {
          firstMfr.moq = '';
        }
        configuration.mfrList = firstMfr;
        configuration.mfrList = sourcingUtils.addSourcingPrefix('mfr', configuration.mfrList);

        _.assign(configuration, configuration.mfrList);
      }
      if (!_.isEmpty(configuration.suppPartsList)) {
        if (!_.isEmpty(configuration.suppPartsList[0].costDetail)) {
          configuration.suppPartsList[0].moq = configuration.suppPartsList[0].costDetail[0].moq;
          configuration.suppPartsList[0].currency = configuration.suppPartsList[0].costDetail[0].currency;
          configuration.suppPartsList[0].cost = configuration.suppPartsList[0].costDetail[0].cost;
        } else {
          configuration.suppPartsList[0].moq = '';
        }
        configuration.suppList = configuration.suppPartsList[0];
        configuration.suppList = sourcingUtils.addSourcingPrefix('supp', configuration.suppList);

        _.assign(configuration, configuration.suppList);
      }

      return configuration;
    }

    function setAttributesAdditionalRevisions(additionalInfoList) {
      var arr = [];
      if (additionalInfoList && additionalInfoList != 'undefined') {
        angular.forEach(additionalInfoList, function (additionalItem) {
          var item = {};
          item.name = additionalItem.attributeKey;
          item.value = _.camelCase(additionalItem.attributeKey);
          item.displayed = false;
          arr.push(item);
        });
      }

      $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesAdditional', configurationPageType), angular.toJson(arr));
    }

    vm.configurationsGridOptions = {
      initialized: false,
      data: vm.configurations,
      columnDefs: [],
      enableSelectAll: false,
      multiSelect: true,
      enableRowSelection: true,
      showTreeExpandNoChildren: false,
      enableHiding: false,
      showTreeRowHeader: false,
      enableColumnReordering: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnResizing: true,
      enableSorting: true,
      enableCellEdit: false,
      enableFiltering: true,
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      exporterPdfTableStyle: {
        margin: [30, 30, 0, 30]
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'LETTER',
      rowHeight: 30,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 1,
      enableVerticalScrollbar: 2,
      //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
      paginationPageSize: 100,
      paginationPageSizes: [{
        label: '25',
        value: 25
      },
        {
          label: '50',
          value: 50
        },
        {
          label: '75',
          value: 75
        },
        {
          label: '100',
          value: 100
        }
      ],
      paginationTemplate: "<div class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div class=\"ui-grid-pager-container\"><div class=\"ui-grid-pager-control\"><button type=\"button\" ng-click=\"paginationApi.seek(1)\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle\"><div class=\"first-bar\"></div></div></button> <button type=\"button\" ng-click=\"paginationApi.previousPage()\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle prev-triangle\"></div></button> <input type=\"number\" ng-model=\"grid.options.paginationCurrentPage\" min=\"1\" max=\"{{ paginationApi.getTotalPages() }}\" required> <span class=\"ui-grid-pager-max-pages-number\" ng-show=\"paginationApi.getTotalPages() > 0\">/ {{ paginationApi.getTotalPages() }}</span> <button type=\"button\" ng-click=\"paginationApi.nextPage()\" ng-disabled=\"cantPageForward()\"><div class=\"last-triangle next-triangle\"></div></button> <button type=\"button\" ng-click=\"paginationApi.seek(paginationApi.getTotalPages())\" ng-disabled=\"cantPageToLast()\"><div class=\"last-triangle\"><div class=\"last-bar\"></div></div></button></div><div class=\"ui-grid-pager-row-count-picker\">" +

      "<select ng-model=\"grid.options.paginationPageSize\"" +

      "ng-options=\"o.value as o.label for o in grid.options.paginationPageSizes\">" +

      "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
      exporterSuppressColumns: ['bomId', 'objectId'],
      onRegisterApi: function (gridApi) {
        vm.configurationsTableUiGrid = gridApi;

        vm.configurationsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.configurationPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.configurationPage);
          }
          saveState();
        });
        vm.configurationsTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.configurationsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          fuseUtils.setProperHeaderViewportHeight(vm.configurationsGridOptions.columnDefs, isDocuments ? 1 : 4, isDocuments ? viewportEnv: null, vm.configurationsTableUiGrid);
          saveState();
        });
        vm.configurationsTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.configurationsTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.configurationsTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.configurationsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.configurationsGridOptions.initialized) {
            let gridCol;
            _.forEach(vm.configurationsTableUiGrid.grid.columns, function (val) {
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
          saveState();
        });

        vm.configurationsTableUiGrid.core.on.renderingComplete($scope, function () {
        });
        vm.configurationsTableUiGrid.core.on.scrollBegin($scope, function () {
          $('div[ui-grid-filter]').css({
            'padding-top': 20 + 'px'
          });
          $('.ui-grid-filter-container').css({
            'position': 'absolute',
            'bottom': 0
          });
        });
        vm.configurationsTableUiGrid.core.on.scrollEnd($scope, function () {
          $('div[ui-grid-filter]').css({
            'padding-top': 20 + 'px'
          });
          $('.ui-grid-filter-container').css({
            'position': 'absolute',
            'bottom': 0
          });
        });

        vm.configurationsTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.configurationsGridOptions.data.length > 0) && !vm.configurationsGridOptions.initialized) {
            $timeout(function () {
              vm.configurationsGridOptions.initialized = true;
            });
          }
          showClearButton(vm.configurationsTableUiGrid);
          vm.heightTopPanelConfigurations = $('#grid-revisions .ui-grid-top-panel').height();
          vm.thumbnailIndexRevisions = _.findIndex(vm.configurationsTableUiGrid.grid.columns, function (val) {
            return val.field == 'thumbnailPath';
          }) - 3;
        });

        vm.configurationsTableUiGrid.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.isSelected) {
            vm.configurationsForCompare = _.filter(vm.configurationsForCompare, function (selectedRow) {
              return selectedRow.objectId !== row.entity.objectId;
            });
            vm.configurationsForCompare.push(row.entity);
          } else {
            var index = _.findIndex(vm.configurationsForCompare, ['name', row.entity.name]);
            vm.configurationsForCompare.splice(index, 1);
          }

          saveSelectedRows();
          saveState();
        });

        restoreState();
      }
    };

    function getConfigurationsAttributes() {
      var attributes = {};

      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", configurationPageType));
      var attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", configurationPageType));
      var attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", configurationPageType));
      var attributesManufacturer = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", configurationPageType));
      var attributesSupplier = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", configurationPageType));
      var attributesHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", configurationPageType));

      var parsedBasicAttrs = angular.fromJson(attributesBasic);

      if (attributesBasic && (!vm.configurationSettings && (attributesBasic.indexOf('Configuration') === -1) && (attributesBasic.indexOf('associatedCardsList') !== -1)) ||
        (vm.configurationSettings && attributesBasic && (attributesBasic.indexOf('Configuration') !== -1))) {
        attributes.basicInfo = parsedBasicAttrs;
      } else {
        attributes.basicInfo = attributesUtils.getConfigurationBasicAttributes();
        $window.localStorage.removeItem(fuseUtils.buildAttributeName('attributesBasic', configurationPageType));
        $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesBasic', configurationPageType), angular.toJson(attributes.basicInfo));
      }


      if (attributesHistory && attributesHistory != 'undefined') {
        attributes.history = angular.fromJson(attributesHistory);
      } else {
        attributes.history = [{
          name: 'Created By',
          value: 'createdBy',
          displayed: true
        },
          {
            name: 'Created Date',
            value: 'createDate',
            displayed: true
          },
          {
            name: 'Modified By',
            value: 'modifiedBy',
            displayed: true
          },
          {
            name: 'Modified Date',
            value: 'modifiedDate',
            displayed: true
          },
          {
            name: 'Revision Notes',
            value: 'revisionNotes',
            displayed: true
          }
        ];
        $window.localStorage.removeItem(fuseUtils.buildAttributeName('attributesObjectHistory', configurationPageType));
        $window.localStorage.setItem(fuseUtils.buildAttributeName('attributesObjectHistory', configurationPageType), angular.toJson(attributes.history));
      }

      if (attributesInventory && attributesInventory != 'undefined') {
        attributes.inventory = angular.fromJson(attributesInventory);
      }
      if (attributesAdditional && attributesAdditional != 'undefined') {
        attributes.additional = angular.fromJson(attributesAdditional);
      }
      if (attributesManufacturer && attributesManufacturer != 'undefined') {
        attributes.manufacturer = angular.fromJson(attributesManufacturer);
      }
      if (attributesSupplier && attributesSupplier != 'undefined') {
        attributes.supplier = angular.fromJson(attributesSupplier);
      }

      return attributes;

    }

    function buildRevisionsTableColumns() {
      var attributes = getConfigurationsAttributes();
      var columns = [];

      if (attributes.basicInfo) {
        angular.forEach((attributes.basicInfo || []), function (tableRow) {
          if (tableRow.displayed) {
            var columnDef = fuseUtils.parseAttributes(tableRow);

            if (tableRow.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings)
                return;

              columnDef.enableCellEdit = false;
            }

            columns.push(columnDef);
          }
        });
      }

      if (attributes.inventory && whereFromFlag !== 'documents') {
        angular.forEach((attributes.inventory || []), function (tableRow) {
          if (tableRow.displayed) {
            columns.push(fuseUtils.parseAttributes(tableRow));
          }
        });
      }

      if (attributes.additional) {
        angular.forEach((attributes.additional || []), function (tableRow) {
          if (tableRow.displayed) {
            columns.push(fuseUtils.parseAttributes(tableRow, true));
          }
        });
      }

      if (attributes.manufacturer && whereFromFlag !== 'documents') {
        angular.forEach((attributes.manufacturer || []), function (tableRow) {
          if (tableRow.displayed) {
            var colDef = fuseUtils.parseAttributes(tableRow);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
            if (tableRow.value === 'mfrObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-number-with-button-cell.html';
            }
            if (tableRow.value === 'mfrObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
            }
            colDef.name = tableRow.value;
            columns.push(colDef);
          }
        });
      }

      if (attributes.supplier && whereFromFlag !== 'documents') {
        angular.forEach((attributes.supplier || []), function (tableRow) {
          if (tableRow.displayed) {
            var colDef = fuseUtils.parseAttributes(tableRow);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
            if (tableRow.value === 'suppObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-number-with-button-cell.html';
            }
            if (tableRow.value === 'suppObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
            }
            colDef.name = tableRow.value;
            columns.push(colDef);
          }
        });
      }

      if (attributes.history) {
        angular.forEach((attributes.history || []), function (tableRow, i) {
          if (tableRow.displayed) {
            columns.push(fuseUtils.parseAttributes(tableRow));
          }
        });
      }

      columns.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      return columns;
    }

    function editConfigurationsTable(ev, flag) {
      $mdDialog.show({
        controller: 'EditTableController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/edittable.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          pageType: configurationPageType,
          whereIsRevisionFrom: whereFromFlag,
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function () {
        vm.configurationsGridOptions.initialized = false;
        vm.configurationsGridOptions.columnDefs = buildRevisionsTableColumns();
        restoreState();
        setSelectedRows()
      }, function () {

      });
    }

    function restoreState() {
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName('grid-configurations', configurationPageType));
        state = state ? angular.fromJson(state) : null;
        fuseUtils.setProperHeaderViewportHeight(vm.configurationsGridOptions.columnDefs, isDocuments ? 1 : 4, isDocuments ? viewportEnv: null, vm.configurationsTableUiGrid);
        if (!state) {
          return;
        }

        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.revisionsPage);
          state.pagination.paginationPageSize = 100;
        }
        if (state && vm.configurationsTableUiGrid) {
          vm.configurationsTableUiGrid.saveState.restore($scope, state);
          fuseUtils.moveAttachmentsColumn(vm.configurationsTableUiGrid, $scope, true);
        }
      });
    }

    function saveState() {
      var state = vm.configurationsTableUiGrid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName('grid-configurations', configurationPageType), angular.toJson(state));
    }

    function saveSelectedRows() {
      var state = vm.configurationsTableUiGrid.saveState.save();
      var selectedRows = state.selection;
      var name = vm.objectNumber + '-selectedRows';
      $window.localStorage.removeItem(fuseUtils.buildAttributeName(name, configurationPageType));
      $window.localStorage.setItem(fuseUtils.buildAttributeName(name, configurationPageType), angular.toJson(selectedRows));
    }

    function setSelectedRows() {
      $timeout(function () {
        var name = vm.objectNumber + '-selectedRows';
        var rows = $window.localStorage.getItem(fuseUtils.buildAttributeName(name, configurationPageType));
        rows = angular.fromJson(rows);
        if (rows && rows.length > 0) {
          angular.forEach(rows, function (row) {
            var rowSelect = vm.configurationsGridOptions.data[row.row];
            vm.configurationsTableUiGrid.selection.selectRow(rowSelect);
          });
        }
      })
    }

    function showClearButton(gridApi) {
      vm.clearSearchButton = false;
      vm.clearSearchButton = buttonForClear(gridApi, vm.clearSearchButton);
    }

    function buttonForClear(gridInstance, flag) {

      _.forEach(gridInstance.grid.columns, function (column) {
        if ((column.isPinnedLeft() || column.isPinnedRight()) && column.name !== 'treeBaseRowHeaderCol' && column.field !== 'objectId') {
          flag = true;
        }
        if (column.filters[0].term !== undefined) {
          flag = true;
        }
      });

      if (gridInstance.grid.getColumnSorting().length !== 0) {
        flag = true;
      }

      return flag;
    }

    function setTooltip() {
      var countRows = vm.configurationsForCompare.length;
      return (countRows < 2) ? 'Please select at least two parts to compare' : (countRows > 5) ? 'Only 5 objects or less can be compared' : 'Displays BOM matrix for Selected objects. BOM Edits (add/remove/modify) can be made through matrix.';
    }

    function isCompareEnable() {
      var countRows = vm.configurationsForCompare.length;
      return (countRows > 1 && countRows < 6);
    }


    function compareConfigurations() {
      if (vm.configurationsForCompare.length < 2)
        return;

      const locHref = location.href;
      const urlParts = locHref.split('/');
      const targetUrl = urlParts[urlParts.length - 2];

      $cookies.put('numberForBackButtonConfigurations', targetUrl);

      var idsCompareConfigurations = [];
      angular.forEach(vm.configurationsForCompare, function (row) {
        idsCompareConfigurations.push(row.objectId)
      });
      saveSelectedRows();
      saveState();
      $cookies.put('idsForCompareConfigurations', idsCompareConfigurations);
      $state.go('app.objects.compareConfigurations');
    }

    function getTimeZone() {
      var usertime = new Date().toLocaleString();
      var tzsregex = /\b(ACDT|ACST|ACT|ADT|AEDT|AEST|AFT|AKDT|AKST|AMST|AMT|ART|AST|AWDT|AWST|AZOST|AZT|BDT|BIOT|BIT|BOT|BRT|BST|BTT|CAT|CCT|CDT|CEDT|CEST|CET|CHADT|CHAST|CIST|CKT|CLST|CLT|COST|COT|CST|CT|CVT|CXT|CHST|DFT|EAST|EAT|ECT|EDT|EEDT|EEST|EET|EST|FJT|FKST|FKT|GALT|GET|GFT|GILT|GIT|GMT|GST|GYT|HADT|HAEC|HAST|HKT|HMT|HST|ICT|IDT|IRKT|IRST|IST|JST|KRAT|KST|LHST|LINT|MART|MAGT|MDT|MET|MEST|MIT|MSD|MSK|MST|MUT|MYT|NDT|NFT|NPT|NST|NT|NZDT|NZST|OMST|PDT|PETT|PHOT|PKT|PST|RET|SAMT|SAST|SBT|SCT|SGT|SLT|SST|TAHT|THA|UYST|UYT|VET|VLAT|WAT|WEDT|WEST|WET|WST|YAKT|YEKT)\b/gi;
      var timezonenames = {
        "UTC+0": "GMT",
        "UTC+1": "CET",
        "UTC+2": "EET",
        "UTC+3": "EEDT",
        "UTC+3.5": "IRST",
        "UTC+4": "MSD",
        "UTC+4.5": "AFT",
        "UTC+5": "PKT",
        "UTC+5.5": "IST",
        "UTC+6": "BST",
        "UTC+6.5": "MST",
        "UTC+7": "THA",
        "UTC+8": "AWST",
        "UTC+9": "AWDT",
        "UTC+9.5": "ACST",
        "UTC+10": "AEST",
        "UTC+10.5": "ACDT",
        "UTC+11": "AEDT",
        "UTC+11.5": "NFT",
        "UTC+12": "NZST",
        "UTC-1": "AZOST",
        "UTC-2": "GST",
        "UTC-3": "BRT",
        "UTC-3.5": "NST",
        "UTC-4": "CLT",
        "UTC-4.5": "VET",
        "UTC-5": "EST",
        "UTC-6": "CST",
        "UTC-7": "MST",
        "UTC-8": "PST",
        "UTC-9": "AKST",
        "UTC-9.5": "MIT",
        "UTC-10": "HST",
        "UTC-11": "SST",
        "UTC-12": "BIT"
      };
      var timezone = usertime.match(tzsregex);
      if (timezone) {
        timezone = timezone[timezone.length - 1];
      } else {
        var offset = -1 * new Date().getTimezoneOffset() / 60;
        offset = "UTC" + (offset >= 0 ? "+" + offset : offset);
        timezone = timezonenames[offset];
      }
      return timezone;
    }

    function parseImgToBase64(url, flag) {
      var deferred = $q.defer();
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');
      ctx.canvas.width = 35;
      ctx.canvas.height = 27;
      var image = new Image();
      if (flag) {
        url = url.replace(/^https:\/\//i, 'http://');
        image.setAttribute('crossOrigin', 'anonymous');
      }
      image.src = url;
      image.onload = function () {
        ctx.drawImage(image, 8, 0, 25, 25);
        deferred.resolve(c.toDataURL());
      };
      return deferred.promise
    }

    function getBase64Values(doc, index) {
      var deferred = $q.defer();
      var promises = [];
      angular.forEach(doc.content[0].table.body, function (value, k) {
        if (k != 0) {
          promises.push(value[index] ? parseImgToBase64(value[index], true) :
            vm.partproduct == 'parts' ? parseImgToBase64('assets/images/ecommerce/part-square.png') : parseImgToBase64('assets/images/ecommerce/product-sqaure.png'));
        }
      });
      $q.all(promises).then(function (values) {
        deferred.resolve(values);
      });
      return deferred.promise;
    }

    function parseThumbnailValues(doc, index, values) {
      angular.forEach(doc.content[0].table.body, function (value, k) {
        if (k != 0) {
          value[index] = {
            image: values[k - 1]
          };
        }
        return value;
      });
      return doc;
    }

    function downloadTable(flag, option, gridApi, gridOptions) {
      if (flag == 'csv') {
        vm.configurationsGridOptions.exporterSuppressColumns = ['bomId', 'objectId', 'thumbnailPath'];

        gridApi.exporter.csvExport('visible', 'visible');
      } else {
        var now = new Date();
        var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A') + ' (' + getTimeZone() + ')';

        if (vm.partproduct == 'parts') {
          var base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/part-square.png');
        } else {
          var base64String = vm.thumbnailSrc ? parseImgToBase64(vm.thumbnailSrc, true) : parseImgToBase64('assets/images/ecommerce/product-sqaure.png');
        }

        base64String.then(function (value) {

          base64String = value;

          gridOptions.exporterPdfHeader = {
            columns: [{
              style: 'headerStyle',
              table: {
                widths: [50, '*'],
                body: [
                  [{
                    text: dateformat || ' ',
                    margin: [0, 5, 0, 0],
                    colSpan: 2,
                    style: 'dateStyle'
                  },
                    ''
                  ],
                  ['',
                    {
                      text: [{
                        text: vm.configurations[0].objectNumber + ', Revision ' + vm.configurations[0].revision + '\t',
                        bold: true,
                        margin: [4, 4, 0, 0]
                      },
                        {
                          text: ' ' + vm.configurations[0].status + ' ',
                          background: vm.configurations[0].status == 'InDevelopment' ? '#ffc12d' : (vm.configurations[0].status == 'Released' ? '#4caf50' : '#ff5722'),
                          color: vm.configurations[0].status == 'Released' ? '#fff' : '#000',
                          bold: true,
                          margin: [0, 4, 4, 0]
                        }
                      ]
                    }
                  ],
                  [{
                    stack: [{
                      image: base64String,
                      width: 25,
                      alignment: 'center'
                    }]
                  },
                    {
                      text: vm.configurations[0].description || ' ',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  ['',
                    {
                      text: [{
                        text: ' ' + vm.configurations[0].categoryHierarchy + ' ',
                        background: '#fff',
                        color: '#000',
                        margin: [4, 2, 0, 4]
                      }, {
                        text: ' , ' + vm.configurations[0].objectName,
                        margin: [0, 2, 4, 4]
                      }]
                    }
                  ]
                ]
              },
              layout: 'noBorders'
            }]
          };

          gridOptions.exporterPdfCustomFormatter = function (docDefinition) {
            docDefinition.styles.headerStyle = {
              margin: [30, 5, 0, 0],
              fillColor: '#208abe',
              color: '#fff'
            };
            docDefinition.styles.flatStyle = {
              color: '#000',
              margin: [0, 2, 4, 2],
              fillColor: '#fff'
            };
            docDefinition.styles.flatValueStyle = {
              color: '#000',
              margin: [0, 0, 4, 0],
              bold: true,
              fillColor: '#fff'
            };
            docDefinition.styles.dateStyle = {
              color: '#000',
              fillColor: '#fff'
            };
            return docDefinition;
          };
          var exportColumnHeaders = uiGridExporterService.getColumnHeaders(gridApi, uiGridExporterConstants.VISIBLE);
          var exportData = uiGridExporterService.getData(gridApi, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE, true);
          var docDefinition = uiGridExporterService.prepareAsPdf(gridApi, exportColumnHeaders, exportData);

          docDefinition.pageMargins = [0, 100, 0, 40];
          var base64Values = getBase64Values(docDefinition, vm.thumbnailIndexHierarchical);

          docDefinition.content[0].table.widths = 100 / docDefinition.content[0].table.widths.length + '%';

          base64Values.then(function (values) {
            vm.configurationsGridOptions.exporterSuppressColumns = ['bomId', 'objectId'];
            parseThumbnailValues(docDefinition, vm.thumbnailIndexHierarchical, values);

            if (uiGridExporterService.isIE() || navigator.appVersion.indexOf("Edge") !== -1) {
              uiGridExporterService.downloadPDF(gridOptions.exporterPdfFilename, docDefinition);
            } else {
              if (option == 'print') {
                pdfMake.createPdf(docDefinition).print();
              } else {
                pdfMake.createPdf(docDefinition).download();
              }
            }
          });
        });
      }
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function onChangeLatestConfiguration() {
      if (vm.isLatestConfiguration) {
        vm.configurations = _.filter(vm.configurations, {
          isLatest: 'true'
        });
        vm.configurationsGridOptions.data = vm.configurations;
      } else {
        vm.configurationsForCompare.length = 0;
        angular.copy(configurations, vm.configurationsGridOptions.data);
      }
    }

    function compareObjects() {
      if (vm.configurationsForCompare.length < 2) {
        return;
      }
      const locHref = location.href;
      const urlParts = locHref.split('/');
      const targetUrl = urlParts[urlParts.length - 2];
      const pageType = urlParts[urlParts.length - 1];
      $cookies.put('numberForBackButton', targetUrl);
      $cookies.put('pageType', pageType);
      const idsObjects = _.map(vm.configurationsForCompare, row => row.objectId);
      saveSelectedRows();
      saveState();
      $cookies.put('idsForCompare', idsObjects);
      $state.go('app.objects.compare', {targetPageIndex: tabIndexes.CONFIGURATION_TAB_INDEX});
    }

    vm.cardDialogResponses = [];

    function getBoards(row) {
      var cardIds = row.associatedCardsList;
      var promises = [];
      if (cardIds[0] === 'no access') {
        showOkPopup('Can not display card name because you do not have access to this board');
        return;
      }

      row.cardsInfo = [];
      cardIds.forEach(function (cardId) {
        promises.push(BoardService.getBoardBycardId(cardId))
      });

      Promise.all(promises)
        .then(function (res) {
          row.cardsDownloaded = true;
          res.forEach(function (r, i) {
            if (r.code !== 0) {
              cardIds[i] = '-1';
              return;
            }
            vm.cardDialogResponses.push(r);
            row.cardsInfo.push(r.data);
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
            row.cardsInfo[i].chosenCard = getCard(card, row.cardsInfo[i]);
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
      var neededCard = _.find(board.cards, {
        id: cardId
      });
      return neededCard
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }

    function setCsvFilename(part, tables) {
      var csvFilename = 'Revisions of ' + part.objectNumber + '.csv';
      tables.forEach(function (table) {
        table.exporterCsvFilename = csvFilename;
      });
    }

    function delayInInitLoad() {
      $timeout(function () {
        vm.progress = false
      }, 2000);
    }

    function printTable(id, obj, rev, txt) {
      var divToPrint = document.getElementById(id);
      var newWin = window.open("");
      var now = new Date();
      var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A');
      newWin.document.write('<html><head><title>' + obj + ', Revision ' + rev + ' - ' + txt + '</title>' + '<style>@page { size: auto;  margin: 0mm; }</style>' +
        '</head><body>' + '<div style="padding: 5px;">' + dateformat + '<span style="left: 40%; position: absolute;">' + obj + ', Revision ' + rev + ' - ' + txt + '</span>' + '</div>' + divToPrint.outerHTML + '</body></html>');
      newWin.print();
      newWin.close();
    }

    const costBreakColumns = {
      'id': {
        cellTemplate: 'app/main/apps/objects/parts/tabs/basic-info/cost-radio-button-cell-template.html',
        field: 'id',
        displayName: '',
        width: 80,
      },
      'name': {
        field: 'name',
        cellTemplate: 'app/main/apps/objects/parts/tabs/basic-info/sourcer-name-template.html',
      },
      'value': {
        field: 'moq',
        displayName: 'MOQ',
      },
      'currency': {
        field: 'currency',
        displayName: 'Currency',
      },
      'cost': {
        field: 'cost',
        displayName: 'Cost',
        width: COST_COLUMN_WIDTH,
      }
    };
    const columnAttributes = ['id', 'name', 'value', 'currency', 'cost'];

    function getColumnDef(attribute, type) {
      const colDef = {enableCellEdit: false, enableSorting: false, enableColumnMenu: false};
      _.assign(colDef, costBreakColumns[attribute]);
      if (attribute === 'name') {
        colDef.displayName = `Cost Type (${type} Part Cost)`;
      }
      return colDef;
    }

    CostTable.prototype.setTableColumns = function (type) {
      return columnAttributes.map((attribute) => {
        return getColumnDef(attribute, type);
      });
    };

    CostTable.prototype.setTableData = function (sourcers) {
      const costsOfSourcers = sourcers.map(function (sourcer) {
        return getSourcerCosts(sourcer);
      });
      const flattenedCosts = _.flatten(costsOfSourcers);
      this.data = flattenedCosts.map((costData) => {
        costData.id = costData.sourcerdId ? `${costData.sourcerdId}(${costData.id})` : costData.id;
        return costData;
      });
    };

    function getSourcerCosts(sourcer) {
      return sourcer.costDetail.map((costSettings) => {
        return new SourcingCostRow(costSettings, sourcer);
      })
    }

    function CostTable(tableType) {
      this._type = tableType;
      this.enableVerticalScrollbar = 2;
      this.enableHorizontalScrollbar = 2;
      this.columnDefs = this.setTableColumns(this._type);
    }

    vm.supplierPartCost = new CostTable('Supplier');
    vm.manufacturerPartCost = new CostTable('Manufacturer');
  }

})();
