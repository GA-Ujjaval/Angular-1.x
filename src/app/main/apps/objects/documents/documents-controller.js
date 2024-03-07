(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('DocumentsController', DocumentsController);

  /** @ngInject */
  function DocumentsController($state, $scope, $filter, fuseUtils, objectPageEnum, $mdDialog, $mdMenu, clipboardService,
                               $document, hostUrlDevelopment, CustomerService, errors, $mdToast, MainTablesService, GlobalSettingsService,
                               AuthService, $timeout, $window, attributesUtils, helpSettingService, bulkDelete, AttributesService, BoardService,
                               DialogService, helperData, searchPresetService, exporterCallbackService, fuseType,
                               searchPresetRequestService, selectedValMatcher, selectedValNameMatcher,
                               AdvancedSearchSection, $cookies, $rootScope, uiGridGridMenuService, pageTitleService, notificationService) {

    var vm = this;
    const rawSections = [
      {
        displayName: 'Basic Info', id: 'basicInfo', records: [
          {displayName: 'Part Number', type: 'text', id: 'objectNumber'},
          {displayName: 'Revision', type: 'text', id: 'revision'},
          {displayName: 'Configuration', type: 'text', id: 'configName'},
          {displayName: 'Status', type: 'dropDown', id: 'status', searchPlaceholder: 'Search for a status..',
            options: [
              {value: 'InDevelopment', text: 'InDevelopment'},
              {value: 'Released', text: 'Released'},
              {value: 'Obsolete', text: 'Obsolete'},
            ]},
          {displayName: 'Category', type: 'dropDown', id: 'categoryId', searchPlaceholder: 'Search for a category..',
            getOptions: getCategories},
          {displayName: 'Part Name', type: 'text', id: 'objectName'},
          {displayName: 'Description', type: 'text', id: 'description'},
          {displayName: 'Project Name', type: 'text', id: 'projectNames'},
          {displayName: 'Tags', type: 'text', id: 'tags'},
          {displayName: 'Where-Used', type: 'boolean', id: 'hasWhereUsed', options: [
              {value: true, text: 'Yes'},
              {value: false, text: 'No'},
            ]},
          {displayName: 'Attachments', type: 'boolean', id: 'hasAttachments', options: [
              {value: true, text: 'Yes'},
              {value: false, text: 'No'},
            ]},
          {displayName: 'Latest', type: 'boolean', id: 'isLatest', options: [
              {value: 'true', text: 'Yes'},
              {value: 'false', text: 'No'},
            ]},
          {displayName: 'Associated Cards', type: 'boolean', id: 'hasAssociatedCards', options: [
              {value: 'true', text: 'Yes'},
              {value: 'false', text: 'No'},
            ]}
        ]
      },
      {
        displayName: 'Additional Info', id: 'additionalInfoList', records: []
      },
      {
        displayName: 'Object History', id: 'fuseObjectHistory', records: [
          {displayName: 'Created By', type: 'dropDown', id: 'createdBy', searchPlaceholder: 'Search for a creator..',
            getOptions: getAllUsers},
          {displayName: 'Created Date', type: 'text', id: 'createDate'},
          {displayName: 'Modified By', type: 'dropDown', id: 'modifiedBy', searchPlaceholder: 'Search for a editor..',
            getOptions: getAllUsers},
          {displayName: 'Modified Date', type: 'text', id: 'modifiedDate'},
          {displayName: 'Revision note', type: 'text', id: 'revisionNotes'}
        ]
      }
    ];

    vm.advancedSearchSections = rawSections.map((rawSection) => new AdvancedSearchSection(rawSection));

    $scope.$watch(() => {
      const gridElem = document.getElementById('grid-documents');
      gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 66}px`;
    });

    vm.toggleSelectChips = toggleSelectChips;
    vm.toggleAdvancedSearch = toggleAdvancedSearch;
    vm.defaultAvatar = defaultAvatar;
    vm.checkGlow = checkGlow;
    vm.getAllRecords = getAllRecords;
    vm.resetAdvancedSearchChip = resetAdvancedSearchChip;
    vm.isSectionEmpty = isSectionEmpty;
    vm.closeDropDownChip = closeDropDownChip;

    function closeDropDownChip() {
      $('md-backdrop').trigger('click');
    }

    function isSectionEmpty(value, search) {
      if (search) {
        return _.filter(value, val => {
          return val.displayName.toLowerCase().indexOf(search) !== -1;
        }).length !== 0;
      } else {
        return true;
      }
    }

    function resetAdvancedSearchChip(record) {
      if (record.type === 'boolean' && record.value !== null) {
        record.clean();
        callAdvancedSearch(true);
      }
      if((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
        if (record.value.date !== undefined) {
          record.clean();
          callAdvancedSearch(true);
        } else {
          return;
        }
      }
      if((record.id !== 'createDate' || record.id !== 'modifiedDate') && !record.isEmpty()) {
        record.clean();
        callAdvancedSearch(true);
      }
    }

    function getAllRecords() {
      return _(vm.advancedSearchSections || []).map(section => section.records).flatten().value();
    }

    function checkGlow(record) {
      if ((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
        return record.value.date !== undefined;
      }
      return !record.isEmpty();
    }

    function toggleAdvancedSearch(record) {
      if (record.type === 'boolean' && record.value !== null) {
        record.clean();
        callAdvancedSearch(true);
      }
      if((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
        if (record.value.date !== undefined) {
          record.clean();
          callAdvancedSearch(true);
        } else {
          return;
        }
      }
      if(!record.isEmpty()) {
        record.clean();
        callAdvancedSearch(true);
      }
      record.close();
    }

    function toggleSelectChips(record) {
      angular.element(`#${record.id}`).triggerHandler('click');
    }

    function getAllUsers() {
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, '', '', headers)
        .then(response => {
          const castedUsers = response.data.Members.map(user => {
            user.text = user.firstName + ' ' + user.lastName;
            user.value = user.userId;
            user.hasAvatar = true;
            return user;
          });
          return response.code === 0 ? castedUsers : $q.reject();
        });
    }

    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    function getCategories() {
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, {categoryType: 'documents'}, '', headers)
        .then((response) => {
          response.data
            .filter((category) => category.categoryId === category.parentCategoryId)
            .forEach((category) => category.categoryHierarchy = category.categoryName);
          const castedCategories = response.data.map((category) => {
            category.text = category.categoryHierarchy;
            category.value = category.categoryId;
            return category;
          });
          return response.code === 0 ? castedCategories: $q.reject();
        })
    }
    vm.objectPageEnum = objectPageEnum;
    vm.fuseUtils = fuseUtils;
    vm.bulkDelete = bulkDelete;
    vm.helperData = helperData;
    vm.currentObjectType = fuseType.documents;
    vm.fuseType = fuseType;
    vm.linkTarget = '_self';

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.readonly = fuseUtils.findAccessRights();

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    // Data
    vm.documentsCount = '';
    vm.documents = [];
    vm.closedocuments = [];
    vm.closedocumentsCount = null;
    vm.isLatest = true;
    vm.currencySetting = '$';
    var selectedRows = [];

    //Methods
    vm.searchByFreeText = fuseUtils.searchByFreeText;
    vm.changesearchtext = changesearchtext;
    vm.productCount = productCount;
    vm.openDocumentDialog = openDocumentDialog;
    vm.onChangeLatest = onChangeLatest;
    vm.clearSearch = clearSearch;
    vm.editTable = editTable;
    vm.getallfuseobject = getallfuseobject;
    vm.defaultObjectsSize = defaultObjectsSize;
    vm.openSelectObjectSize = openSelectObjectSize;
    vm.deleteItems = deleteItems;
    vm.releaseItemsBulky = releaseItemsBulky;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.getRightHeigh = getRightHeigh;
    vm.addToClipBoard = addToClipBoard;
    vm.getSelectedrows = getSelectedrows;
    vm.compareItems = compareItems;
    vm.isCompareEnable = isCompareEnable;

    vm.categories = [];
    vm.status = ['InDevelopment', 'Released', 'Obsolete'];
    vm.whereused = [{
      'text': 'Yes',
      'value': true
    }, {
      'text': 'No',
      'value': false
    }];
    vm.additionalInfo = [];
    vm.valuesAdditional = [];
    vm.search;
    vm.categorySearchTerm;
    vm.statusSearch;
    vm.clearSearchTerm = function () {
      vm.search = '';
      vm.categorySearchTerm = '';
      vm.statusSearch = '';
    };

    vm.text = 'Advanced Search';
    vm.togglepartNumber = false;
    vm.togglepartRevision = false;
    vm.toggleConfiguration = false;
    vm.toggle = [];
    vm.toggleAdditional = '';
    vm.togglePN = false;
    vm.toggleDescription = false;
    vm.togglepartPN = false;
    vm.togglepartTags = false;
    vm.keyword = '';
    vm.selectedValue = [];
    vm.selectedCategory = [];
    vm.selectedStatus = [];
    vm.documentNumber = '';
    vm.selectedConfiguration = '';
    vm.documentName = '';
    vm.description = '';
    vm.revision = '';
    vm.pn = '';
    vm.tags = '';
    vm.selectdWhereUsed = '';
    vm.showSearchValues = [];
    vm.showSearchValue = '';
    vm.showValues = [];
    vm.showValue = '';
    vm.showstatusValues = [];
    vm.showstatusValue = '';
    vm.toolValueShow = [];
    vm.additionalInfoShow = false;
    vm.additionalInfoTrackerFlag = false;

    // Advanced Search
    const debouncedSaveSearchPreset = _.debounce(() => searchPresetService.updateSearchPreset(vm, fuseType.documents), 200);

    // Advanced Search
    vm.initApplyPreset = initApplyPreset;
    vm.getSearchState = getSearchState;
    vm.saveSearchPresetState = () => {
      $scope.$broadcast('presetChanged');
      debouncedSaveSearchPreset();
    };
    vm.closeToggle = closeToggle;
    vm.toggleChipDetails = toggleChipDetails;
    vm.handleCriterionRemoval = handleCriterionRemoval;
    vm.callAdvancedSearch = callAdvancedSearch;

    vm.setScroll = (value) => {
      setTimeout(() => {
        if (value && value.length) {
          return;
        }
        const elements = document.querySelectorAll('md-select-menu md-content._md');
        const index = elements.length - 1;
        elements[index].scrollTop = 0;
      }, 100);
    };

    function isAdvanceSearchDirty() {
      return vm.advancedSearchSections.some((section) => section.isDirty());
    }

    function callAdvancedSearch(isDebounced) {
      const isImmediate = !isDebounced;
      if(isAdvanceSearchDirty()) {
        const presetState = getSearchState(true);
        getdatabysearch(presetState, isImmediate);
      } else {
        getallfuseobject(vm.objectsDefaultSize, isDebounced);
      }
    }

    function getSearchState(isForCall) {
      return searchPresetService.getActualSearchState(vm.advancedSearchSections, isForCall);
    }

    function handleCriterionRemoval(record){
      vm.selectedValue = vm.selectedValue.filter((criterion) => criterion !== record.id);
      record.hide();
      if (record.type === 'boolean' && record.value !== null) {
        record.clean();
        callAdvancedSearch(true);
      }
      if((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
        if (record.value.date !== undefined) {
          record.clean();
          callAdvancedSearch(true);
        } else {
          return;
        }
      }
      if(!record.isEmpty()) {
        record.clean();
        callAdvancedSearch(true);
      }
    }

    function handleKeyPress(event) {
      if(event.keyCode !== 13) {
        return;
      }
      if(!vm.advancedSearchSections.some((section) => section.isAnyRecordOpen())) {
        return;
      }
      if(isAdvanceSearchDirty()) {
        getdatabysearch(getSearchState(true), false);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
      }
    }

    document.addEventListener('keypress', handleKeyPress);

    $scope.$on('$destroy', () => {
      document.removeEventListener('keypress', handleKeyPress)
    });

    init();

    function init() {
      Promise.all([
        getallUsers(),
        getAttributesList()
      ])
        .then(function () {
          $rootScope.$watch('objectsDefaultSize', value => {
            if (value !== undefined) {
              vm.objectsDefaultSize = $rootScope.objectsDefaultSize;
              vm.objectsDefaultSizeDocument = $rootScope.objectsDefaultSizeDocument;
              vm.objectsDefaultSize = vm.objectsDefaultSizeDocument === null ? vm.objectsDefaultSize : vm.objectsDefaultSizeDocument;
              if (vm.objectsDefaultSize && (vm.objectsDefaultSize !== 0 && vm.objectsDefaultSize !== 15)) {
                vm.objectsDefaultSize = 15;
              }
              if (!vm.objectsDefaultSize && vm.objectsDefaultSize !== 0) {
                vm.objectsDefaultSize = 0;
                defaultObjectsSize(vm.objectsDefaultSize);
                openSelectObjectSize();
              }
              initTableLoading();
              vm.currencySetting = $rootScope.currencySetting;
              vm.manualRelease = $rootScope.manualRelease;
              vm.configurationSettings = $rootScope.configurationSettings;
              vm.releaseHierarchy = $rootScope.releaseHierarchy;
              vm.promoteDemote = $rootScope.promoteDemote;
              vm.releaseEditsHierarchy = $rootScope.releaseEditsHierarchy;
              vm.advancedNumberSettings = $rootScope.advancedNumberSettings;

              // Advanced Search
              if (vm.configurationSettings) {
                vm.advancedSearch = ['Part Number', 'Revision', 'Configuration', 'Status', 'Category', 'Part Name', 'Description', 'Project Name', 'Tags', 'Where-used'];
              } else {
                vm.advancedSearch = ['Part Number', 'Revision', 'Status', 'Category', 'Part Name', 'Description', 'Project Name', 'Tags', 'Where-used'];
              }

              getAttributes();
              vm.documentsTableOptions.columnDefs = buildDocumentTableColumns();
              restoreState();
            }
          });
        });
    }

    function initTableLoading() {
      const savedPreset = searchPresetService.getSavedSearchPreset(vm.currentObjectType);
      savedPreset ? initApplyPreset(savedPreset) : useRemoteSearchPreset();
    }

    function useRemoteSearchPreset() {
      searchPresetRequestService.getDefaultSearchPreset({objectType: fuseType.documents, tabName: fuseType.documents})
        .then(initApplyPreset);
    }

    function initApplyPreset(preset, isImmediate) {
      if (!preset) {
        getallfuseobject(vm.objectsDefaultSize);
        return;
      }
      applyPreset(preset, isImmediate);
    }

    function toggleChipDetails(prop, record) {
      let unregister = $scope.$watch(() => {
        let element = document.getElementsByClassName('comment-text')[0];
        if (element) {
          element.focus();
          unregister();
        }
      });
      const doOpenRecord = record && !record.isOpen();
      vm.advancedSearchSections.forEach((section) => section.closeAllRecords());
      if(doOpenRecord) {
        record.open();
      }
    }

    function applyPreset(preset, isImmediate) {
      if (preset && preset.templateData.searchPreset) {
        setSearchPresetToView(preset);
      }
      if (preset && (isAdvanceSearchDirty())) {
        getdatabysearch(getSearchState(true), isImmediate);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
      }
    }

    function setSearchPresetToView(preset) {
      vm.advancedSearchSections.forEach((section) => section.clean());
      _.forEach(preset.templateData.searchPreset, (value, key) => {
        vm.selectedValue = _.concat(vm.selectedValue, processSearchSection(value, key));
      });
    }

    function processSearchSection(sectionOrFieldData, sectionId) {
      sectionOrFieldData = _.cloneDeep(sectionOrFieldData);
      const section = getSection(sectionId);
      if(isSectionData(sectionOrFieldData)) {
        return _.map(sectionOrFieldData, (rawRecord) => {
          section.importRecord(rawRecord).show();
          return rawRecord.id;
        })
      }
      sectionOrFieldData.id = sectionId;
      section.importRecord(sectionOrFieldData).show();
      return sectionId;
    }

    function isSectionData(section) {
      return !(section.hasOwnProperty('type') && section.hasOwnProperty('value'))
    }

    function getSection(sectionIdOrRecordId) {
      return _.find(vm.advancedSearchSections, {id: sectionIdOrRecordId}) ||
        _.find(vm.advancedSearchSections, (section) => section.isRecordAvailable(sectionIdOrRecordId));
    }

    function getAttributes() {
      var basicInfoAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.documentsPage)),
        additionalAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", objectPageEnum.documentsPage)),
        objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", objectPageEnum.documentsPage));

      var parsedBasicAttrs = angular.fromJson(basicInfoAttributes);

      if ((basicInfoAttributes && basicInfoAttributes.indexOf('isUsedAnywhere') !== -1 && basicInfoAttributes.indexOf('isLatest') !== -1) && ((!vm.configurationSettings && (basicInfoAttributes.indexOf('Configuration') === -1) && (basicInfoAttributes.indexOf('associatedCardsList') !== -1))
        || (vm.configurationSettings && basicInfoAttributes && (basicInfoAttributes.indexOf('associatedCardsList') !== -1) && (basicInfoAttributes.indexOf('Configuration') !== -1)))) {
        vm.attrBasic = parsedBasicAttrs;
      } else {
        vm.attrBasic = attributesUtils.getDefaultDocumentsAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.documentsPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.documentsPage), angular.toJson(vm.attrBasic));
      }

      if (additionalAttributes) {
        vm.attrAdditional = angular.fromJson(additionalAttributes);
      }

      if (objectHistoryAttributes) {
        vm.attrObjectHistory = angular.fromJson(objectHistoryAttributes);
      }

    }

    function editTable(ev, flag) {
      saveState();
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
        getAttributes();
        vm.documentsTableOptions.columnDefs = buildDocumentTableColumns();
        restoreState();
      }, function () {

      });
    }

    function extendDocument(value) {
      value.isUsedAnywhere = value.hasWhereUsed ? 'Yes' : 'No';
      value.configurationsForDropdown = value.configName;
      value.associatedCardsList = value.associatedCardList;
      value.tags = value.tags.join(', ');
      value.projectNames = value.projectNames.join(', ');
      if (value.fuseCost != null && value.fuseCost != undefined && value.fuseCost != "") {
        value.fuseCost = vm.currencySetting + ' ' + value.fuseCost;
      } else {
        value.fuseCost = "";
      }
      if (value.fuseObjectNumberSetting.enableMinorRev) {
        value.revision = value.revision + '.' + value.minorRevision;
      }
      value.additionalInfoList.forEach(function (additionalInfoItem) {
        value[_.camelCase(additionalInfoItem.attributeKey)] = additionalInfoItem.attributeValue;
      });
      if (value.fuseObjectHistory) {
        var creator = _.find(vm.allUsers, {
          userId: value.fuseObjectHistory.createdBy
        });
        var editor = _.find(vm.allUsers, {
          userId: value.fuseObjectHistory.modifiedBy
        });
        value.createdBy = creator ? (creator.firstName + " " + creator.lastName) : '';
        value.modifiedBy = editor ? (editor.firstName + " " + editor.lastName) : '';
        value.modifiedDate = $filter('date')(value.fuseObjectHistory.modifiedDate, "medium");
        value.createDate = $filter('date')(value.fuseObjectHistory.createDate, "medium");
        value.revisionNotes = value.fuseObjectHistory.revisionNotes;
      }
    }

    const debouncedDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 2000);
    const immediateDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 200);

    function getallfuseobject(size, isDebounced) {
      if (size === '0' || size === 0) {
        vm.searchFlag = false;
        return;
      }
      vm.progress = true;
      vm.searchFlag = false;
      debouncedDoGetDataBySearch.cancel();
      debouncedDoGetAllFuseObject.cancel();
      if (isDebounced) {
        debouncedDoGetAllFuseObject(size)
      } else {
        immediateDoGetAllFuseObject(size);
      }
    }

    function doGetAllFuseObject(size) {
      if (size === '0' || size === 0) {
        return;
      }
      MainTablesService.getFuseDocuments(size)
        .then(function (response) {
          productCount();

          switch (response.code) {
            case 0:
              angular.copy(response.data, vm.documents);

              angular.forEach(vm.documents, function (value, key) {
                extendDocument(value);
              });

              vm.closedocuments = response.data;

              if (vm.isLatest) {
                vm.documents = _.filter(vm.documents, ['isLatest', 'true']);
              }

              vm.documentsTableOptions.data = angular.copy(vm.documents);

              fuseUtils.handleAllOptionForPagination(vm.documentsTableOptions, objectPageEnum.documentsPage);

              vm.documentsTableOptions.totalParentItems = vm.documents.length;

              vm.progress = false;

              break;
            case 4006:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
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

    function onChangeLatest() {
      if(isAdvanceSearchDirty()) {
        getdatabysearch(getSearchState(true), false);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
      }
    }

    function productCount() {
      vm.documentsCount = '';

      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: 'documents',
          isLatest: vm.isLatest
        };
      } else {
        params = {
          fuseObjectType: 'documents',
          isLatest: vm.isLatest
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobjectcount, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.documentsCount = response.data;
              vm.closedocumentsCount = response.data;
              break;
            case 4006:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function changesearchtext(e) {
      if (!angular.isUndefined(e) && e.keyCode === 13 && vm.keyword.trim() !== '') {
        getdatabysearch(getSearchState(true), false);
        e.stopPropagation();
      }
    }

    function clearSearch() {
      vm.keyword = '';
      if (isAdvanceSearchDirty()) {
        getdatabysearch(getSearchState(true), false);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
        vm.searchFlag = false;
      }
    }

    const debouncedDoGetDataBySearch = _.debounce(doGetDataBySearch, 2000);
    const immediateDoGetDataBySearch = _.debounce(doGetDataBySearch, 200);

    function getdatabysearch(data, isImmediate) {
      vm.progress = true;
      debouncedDoGetAllFuseObject.cancel();
      if(isImmediate) {
        immediateDoGetDataBySearch(data);
      } else {
        debouncedDoGetDataBySearch(data);
      }
    }

    function getExportData(presetState) {
      const stateCopy = _.cloneDeep(presetState);
      const outerSections = ['basicInfo'];
      outerSections.forEach((sectionId) => {
        _.forEach(presetState[sectionId], (val, key) => {
          if(val && (!_.isEmpty(val.value) || _.isBoolean(val.value))){
            stateCopy[key] = val;
          }
        })
      });
      outerSections.forEach((sectionId) => delete stateCopy[sectionId]);
      const innerSections = ['additionalInfoList', 'fuseObjectHistory'];
      innerSections.forEach((sectionId) => {
        _.forEach(stateCopy[sectionId], (val, key) => {
          if(_.isEmpty(val.value) && !_.isBoolean(val.value)) {
            delete stateCopy[sectionId][key];
          }
          if ((val.id === 'createDate' || val.id === 'modifiedDate') && !_.isEmpty(val.value)) {
            if (val.value.condition === 'before') {
              val.value.date = moment(val.value.date).utc().add(moment(val.value.date).utcOffset(), 'm').endOf('day');
            } else {
              val.value.date = moment(val.value.date).utc().add(moment(val.value.date).utcOffset(), 'm').startOf('day');
            }
          }
        });
        if(_.isEmpty(stateCopy[sectionId])) {
          delete stateCopy[sectionId];
        }
      });
      return stateCopy;
    }

    function doGetDataBySearch(data) {
      var type = [];
      type.push('document');

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          keyword: vm.keyword,
          searchType: type.join(',')
        };
      } else {
        params = {
          keyword: vm.keyword,
          searchType: type.join(',')
        };
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, getExportData(data), headers)
        .then(function (response) {
          vm.searchFlag = true;

          switch (response.code) {
            case 0:
              vm.documentsCount = response.count.documentCount;
              vm.documents = response.data;
              angular.forEach(vm.documents, function (value) {
                extendDocument(value);
              });
              vm.documents = _.filter(vm.documents, ['objectType', 'documents']);
              if (vm.isLatest) {
                vm.documents = _.filter(vm.documents, ['isLatest', 'true']);
              }
              vm.documentsTableOptions.data = angular.copy(vm.documents);

              fuseUtils.handleAllOptionForPagination(vm.documentsTableOptions, objectPageEnum.documentsPage);

              vm.documentsTableOptions.totalParentItems = vm.documents.length;

              //For Progress Loader
              vm.progress = false;
              break;
            case 4006:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
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

    function openDocumentDialog(ev, advancedNumberFalg) {
      $mdDialog.show({
          controller: 'CreateDocumentsController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/documents/dialogs/create-document-dialog.html',
          parent: angular.element($document.find('#content-container')),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            configure: '',
            object: '',
            advancedNumbering: advancedNumberFalg
          }
        })
        .then(function () {
          vm.documents = vm.closedocuments;
          vm.documentsCount = vm.closedocumentsCount;
        }, function () {

        });
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });
      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function buildDocumentTableColumns() {
      var arr = [];
      arr = angular.copy(attributesUtils.getBasicDocumentsPageAttributes());
      if (vm.attrBasic) {
        angular.forEach((vm.attrBasic || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value == 'totalCost') {
              colDef.visible = false;
            }
            if (o.value == 'shortage') {
              colDef.visible = false;
            }
            if (o.value == 'requiredQty') {
              colDef.visible = false;
            }
            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }
            if (o.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }
            if (o.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings)
                return;

              colDef.enableCellEdit = false;
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            arr.push(colDef);
          }
        });
      }

      if (vm.attrAdditional) {
        (vm.attrAdditional || []).forEach(function (o) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            colDef.field = _.camelCase(colDef.field);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            } else {
              colDef.cellTemplate = "<div class='ui-grid-cell-contents ui-grid-text-overflow'>{{(row.entity['" + colDef.field + "']||'') ? row.entity['" + colDef.field + "']:''}}</div>";
            }
            arr.push(colDef);
          }
        })
      }
      if (vm.attrObjectHistory) {
        angular.forEach((vm.attrObjectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }
      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });
      setTemplateForAttachmentsColumn(arr);
      return arr;
    }

    vm.documentsTableOptions = {
      exporterFieldCallback: exporterCallbackService.mainTable,
      flatEntityAccess: true,
      initialized: false,
      columnDefs: [],
      showTreeExpandNoChildren: false,
      showTreeRowHeader: false,
      data: [],
      enableRowSelection: true,
      enableSelectAll: true,
      multiSelect: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnReordering: true,
      enableColumnResizing: true,
      enableSorting: true,
      enableFiltering: true,
      exporterCsvFilename: 'documentslist.csv',
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
      paginationPageSizes: [
        {label: '25', value: 25},
        {label: '50', value: 50},
        {label: '75', value: 75},
        {label: '100', value: 100},
        {label: 'All', value: 3}
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      exporterSuppressColumns: ['bomId', 'objectId'],
      //enableFiltering: true,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.documentsTableUiGrid = gridApi;


        // Setup events so we're notified when grid state changes.
        vm.documentsTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.documentsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelDocuments = $('#grid-documents .ui-grid-top-panel').height();
          fuseUtils.setProperHeaderViewportHeight(vm.documentsTableOptions.columnDefs, 0, null, vm.documentsTableUiGrid);
          saveState();
        });
        //vm.hierarchicalUiGrid.grouping.on.aggregationChanged($scope, saveState);
        //vm.hierarchicalUiGrid.grouping.on.groupingChanged($scope, saveState);
        vm.documentsTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.documentsTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.documentsTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.documentsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          let gridCol;
          _.forEach(vm.documentsTableUiGrid.grid.columns, function (val) {
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
          saveState();
        });

        vm.documentsTableUiGrid.core.on.renderingComplete($scope, function () {
          vm.heightMax = $('.content-card')[0].offsetHeight - $('.toolbar')[0].offsetHeight - 5;
        });
        vm.documentsTableUiGrid.core.on.scrollBegin($scope, function () {});
        vm.documentsTableUiGrid.core.on.scrollEnd($scope, function () {});

        var paginationApi = vm.documentsTableUiGrid.pagination;
        paginationApi.isMultipleSupp = false;

        vm.documentsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.documentsPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.documentsPage);
          }
          saveState();
        });

        vm.documentsTableUiGrid.core.on.rowsRendered($scope, function () {

          if ((vm.documentsTableOptions.data.length > 0) && !vm.documentsTableOptions.initialized) {
            $timeout(function () {
              vm.documentsTableOptions.initialized = true;
            });
          }

          showClearButton(vm.documentsTableUiGrid);

          vm.heightTopPanelDocuments = $('#grid-documents .ui-grid-top-panel').height();

          paginationApi.isMultipleSupp = fuseUtils.isMultipleSupp(paginationApi, vm.documentsTableOptions);
        });

        vm.documentsTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
          selectedRows = vm.documentsTableUiGrid.selection.getSelectedRows();
        });

        vm.documentsTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
          selectedRows = vm.documentsTableUiGrid.selection.getSelectedRows();
        });

      }
    };

    function showClearButton(gridApi) {
      vm.clearSearchButton = false;
      vm.clearSearchButton = fuseUtils.buttonForClear(gridApi, vm.clearSearchButton);
    }

    /**
     * Save current state ( Pagination, grouping, sorting, column re ordering and etc ...)
     * of the grid in either local storage or cookies. Here we are using localstorage
     * purposefully
     */
    function saveState() {
      var state = vm.documentsTableUiGrid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName('grid-documents', objectPageEnum.documentsPage), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState() {
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName('grid-documents', objectPageEnum.documentsPage));
        state = state ? angular.fromJson(state) : null;

        fuseUtils.moveColumnToFirstPosition(vm.documentsTableUiGrid, $scope, 'associatedCardsList');
        fuseUtils.moveAttachmentsColumn(vm.documentsTableUiGrid, $scope);
        fuseUtils.setProperHeaderViewportHeight(vm.documentsTableOptions.columnDefs, 0, null, vm.documentsTableUiGrid);
        if (!state) {
          return;
        }

        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.documentsPage);
          state.pagination.paginationPageSize = 100;
        }

        if (state) vm.documentsTableUiGrid.saveState.restore($scope, state);
      });
    }

    function openSelectObjectSize(ev) {
      $mdDialog.show({
        controller: 'SelectObjectSizeController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/select-objects-size/select-objects-size.html',
        targetEvent: ev,
        locals: {
          Count: vm.objectsDefaultSize
        },
        clickOutsideToClose: true
      }).then(function (val) {

        if (val && val !== vm.objectsDefaultSize) {
          getallfuseobject(val);
          defaultObjectsSize(val);
        }
        vm.objectsDefaultSize = val ? val : vm.objectsDefaultSize;

      }, function () {
      });
    }

    function defaultObjectsSize(count) {
      if (count !== '0' && count !== '15' && count !== 0 && count !== 15) {
        let dontShowAlertForDatabaseLoad = $window.localStorage.getItem(`dontShowAlertForDatabaseLoad_Document_${vm.sessionData.userId}`);
        if (dontShowAlertForDatabaseLoad !== 'true') {
          notificationService.oneLineAlert(`Refreshing or reloading this page will reset the 'Items loaded from database' to 15. This results in quicker page-loading.`, 'Document', vm.sessionData.userId);
        }
        count = '15';
      }
      var data = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.userRoleSet[0] === 'customer_admin',
        customerId: vm.sessionData.userRoleSet[0] === 'customer_admin' ? vm.sessionData.userId : vm.sessionData.customerAdminId,
        defaultObjectCountDocument: parseInt(count)
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.helpsetting, '', data, headers)
        .then(function (response) {
          if (response.code === 0) {
            if (count === '0') {
              vm.documentsTableOptions.data = [];
              vm.documentsCount = '';
            }
          } else {
            console.log(response.message);
          }
        })
        .catch(function () {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function deleteItems() {
      bulkDelete.deleteItems(selectedRows);
      helpSettingService.getData().then(function (arr) {
        vm.documentsCount -= (arr && arr.length) || 0;
        bulkDelete.removeRows(vm.documentsTableOptions.data, arr);
        bulkDelete.removeRows(selectedRows, arr);
        bulkDelete.removeRows(vm.documents, arr);

        fuseUtils.handleAllOptionForPagination(vm.documentsTableOptions, objectPageEnum.documentsPage);

        vm.documentsTableOptions.totalParentItems = vm.documents.length;
        vm.documentsTableUiGrid.selection.clearSelectedRows();
        if(isAdvanceSearchDirty()) {
          getdatabysearch(getSearchState(true), false);
        } else {
          getallfuseobject(vm.objectsDefaultSize, true);
        }
      })
    }

    function getallUsers() {
      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          //vm.progress = false;
          switch (response.code) {
            case 0:
              vm.allUsers = response.data.Members;
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function () {
          //vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    // Advanced Search
    vm.loadOptions = function () {
      if (vm.categories && vm.categories.length) {
        return Promise.resolve(vm.categories);
      }
      vm.selectProgress = true;
      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          categoryType: 'documents'
        };
      } else {
        params = {
          categoryType: 'documents'
        };
      }

      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, params, '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              return $timeout(function () {
                angular.forEach(response.data, function (value) {
                  if (value.categoryId === value.parentCategoryId) {
                    value.categoryHierarchy = value.categoryName;
                  }
                });
                vm.categories = response.data;

                // For Progress Loader
                vm.selectProgress = false;
              });
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          vm.progress = false;
          // For Progress Loader
          vm.selectProgress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    };

    function getAttributesList() {
      // For Progress Loader
      vm.additinalProgress = true;

      AttributesService.getAttributesList()
        .then(function (response) {
          switch (response.code) {
            case 0:
              const additionalInfoSection = _.find(vm.advancedSearchSections, {id: 'additionalInfoList'});
              response.data.filter((attr) => attr.objectType === fuseType.documents)
                .forEach((attribute) => {
                  additionalInfoSection.addRecord({
                    id: attribute.attributeId,
                    displayName: attribute.attribute,
                    type: 'text'
                  });
                });
              vm.additinalProgress = false;
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function () {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function closeToggle(index) {
      vm.toggle[index] = vm.toggle[index] === false;
    }

    $scope.$on('bulkRelease', function (bulkRelease, successCount) {
      if (successCount) {
        if(isAdvanceSearchDirty()) {
          getdatabysearch(getSearchState(true), false);
        } else {
          getallfuseobject(vm.objectsDefaultSize);
        }
      }
    });

    $scope.$on('SendUp', function () {
      $timeout(() => {
        $state.go('app.objects.documents', {}, {
          notify: false,
          reload: false
        });
        pageTitleService.setPageTitle('Documents List');
      }, 50);
    });

    function releaseItemsBulky(status) {
      var confirm = $mdDialog.confirm()
        .title(`Are you sure you want change status to ${status} for selected objects?`)
        .ok('Yes')
        .cancel('No');

        $mdDialog.show(confirm).then(function () {

          $mdDialog.show({
            controller: 'ReleaseHierarchyController',
            controllerAs: 'vm',
            templateUrl: 'app/main/apps/objects/parts/tabs/release-hierarchy/release-hierarchy-dialog.html',
            parent: angular.element($document.find('#content-container')),
            clickOutsideToClose: false,
            locals: {
              Object: {
                status: status,
                arr: selectedRows,
                releaseHierarchy: vm.releaseHierarchy,
                releaseEditsHierarchy: vm.releaseEditsHierarchy,
                fromMainTable: true,
                withoutHierarchy: !vm.releaseHierarchy
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
              }).then(function (val) {
                helpSettingService.addData(val);
              }, function () {
              });

            }

          }, function () {
          });
        });
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {
        field: 'hasAttachments'
      });
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
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
        }, function () {})
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
      }).then(function () {}, function () {});
    }

    function getCard(cardId, board) {
      return _.find(board.cards, {id: cardId});
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }

    function addToClipBoard(count) {
      var step = 50;
      var cnt = count || 0;
      var endOfLoop = (selectedRows.length - cnt < step) ? selectedRows.length - cnt : step;

      for (var i = cnt; i < cnt + endOfLoop; i++) {
        var result = clipboardService.pushItem(new ClipboardItem(selectedRows[i]));
        if (result) {
          $mdToast.show($mdToast.simple().textContent('Exceeded browser cache limit. Reduce number of parts in clipboard and retry').toastClass("md-error-toast-theme").position('top right').hideDelay(4000));
          break;
        }
      }
      if (i === selectedRows.length) {
        $mdToast.show($mdToast.simple().textContent('Successfully Added To Clipboard').position('top right').hideDelay(1000));
      }
      if (i < selectedRows.length) {
        setTimeout(function () {
          addToClipBoard(cnt + endOfLoop);
        }, 10)
      }
    }

    function ClipboardItem(part) {
      this.objectType = part.objectType;
      this.objectNumber = part.objectNumber;
      this.configName = part.configName;
      this.revision = part.revision;
      this.status = part.status;
      this.objectName = part.objectName;
      this.objectId = part.objectId;
    }

    function getSelectedrows() {
      return selectedRows;
    }

    function getRightHeigh() {
      return document.body.clientHeight - $('#grid-documents')[0].offsetTop - 66;
    }

    function isCompareEnable() {
      var countRows = vm.documentsTableUiGrid ? vm.documentsTableUiGrid.selection.getSelectedCount() : 0;
      return (countRows > 1 && countRows < 6);
    }

    function compareItems() {
      const idsCompare = vm.documentsTableUiGrid.selection.getSelectedRows().map((row) => {
        return row.objectId;
      });
      const locHref = location.href;
      const urlParts= locHref.split('/');
      const targetUrl = urlParts[urlParts.length - 1];
      $cookies.put('numberForBackButton', targetUrl);
      saveState();
      $cookies.put('idsForCompare', idsCompare);
      $state.go('app.objects.compare');
    }

    vm.downloadOptions = {
      exporterFieldCallback: exporterCallbackService.mainTable,
      flatEntityAccess: true,
      initialized: false,
      columnDefs: [],
      showTreeExpandNoChildren: false,
      showTreeRowHeader: false,
      data: [],
      enableRowSelection: true,
      enableSelectAll: true,
      multiSelect: true,
      rowTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/row-templates/general-row-templates.html',
      enableColumnReordering: true,
      enableColumnResizing: true,
      enableSorting: true,
      enableFiltering: true,
      exporterCsvFilename: 'documentslist.csv',
      exporterOlderExcelCompatibility: true,
      exporterPdfDefaultStyle: {
        fontSize: 9
      },
      exporterPdfTableStyle: {
        margin: [30, 30, 0, 30]
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'LETTER',
      rowHeight: 30,
      minRowsToShow: 14,
      // 0 - disable , 1 - enable , 2 - enable when needed
      enableHorizontalScrollbar: 1,
      //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
      totalPages: 1,
      paginationPageSize: 50,
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
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      useExternalPagination: true,
      //enableFiltering: true,
      exporterSuppressColumns: ['bomId', 'objectId'],
      onRegisterApi: function (gridApi) {
        vm.downloadCsvGrid = gridApi;
        vm.downloadCsvGrid.core.on.rowsRendered($scope, function () {
          if ((vm.downloadOptions.data.length > 0) && !vm.downloadOptions.initialized) {
            $timeout(function () {
              vm.downloadOptions.initialized = true;
            });
          }
        });
      }
    };
    vm.downloadAll = downloadAll;
    vm.downloadAllProgress = false;
    function downloadAll(type) {
      vm.downloadAllProgress = true;
      params = {
        keyword: vm.keyword,
        searchType: ['document'],
      };
      let promise;
      if (isAdvanceSearchDirty()) {
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.documentsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.documentsTableOptions.columnDefs;
          resolve(CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, getExportData(getSearchState(true)), headers));
        });
      } else {
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.documentsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.documentsTableOptions.columnDefs;
          resolve(MainTablesService.getFuseDocuments(vm.objectsDefaultSize));
        });
      }
      promise.then((response)=> {
        vm.downloads = response.data;
        _.forEach(vm.downloads, function (value) {
          extendDocument(value);
        });
        if (vm.isLatest) {
          vm.downloads = _.filter(vm.downloads, ['isLatest', 'true']);
        }
        vm.downloadOptions.data = _.cloneDeep(vm.downloads);
        $timeout(() => {
          type === 'csv' ? fuseUtils.downloadAllCsv(vm.downloadCsvGrid) : fuseUtils.downloadAllPdf(vm.downloadCsvGrid);
          vm.downloadAllProgress = false;
        }, 3000);
      });
    }
  }

})();
