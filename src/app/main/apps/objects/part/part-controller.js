(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('PartController', PartController)
    .filter('toDate', function () {
    return function (input) {
      if (input) {
        return new Date(input);
      }
    };
  });

  /** @ngInject */
  function PartController($state, $scope, $mdDialog, $document, $filter, hostUrlDevelopment, CustomerService, errors, $mdToast, clipboardService,
                          AuthService, objectPageEnum, fuseUtils, $timeout, $window, uiGridTreeBaseService, DialogService, MainTablesService, GlobalSettingsService,
                          attributesUtils, helpSettingService, bulkDelete, sourcingUtils, AttributesService, BoardService, $mdMenu, helperData,
                          searchPresetService, searchPresetRequestService, fuseType, exporterCallbackService,
                          AdvancedSearchSection, $q, $cookies, $rootScope, uiGridGridMenuService, pageTitleService, notificationService) {

    const vm = this;

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
          {displayName: 'Unit of Measure', type: 'text', id: 'uom'},
          {displayName: 'Procurement Type', type: 'text', id: 'procurementType'},
          {displayName: 'Project Name', type: 'text', id: 'projectNames'},
          {displayName: 'Tags', type: 'text', id: 'tags'},
          {displayName: 'Cost', type: 'text', id: 'fuseCost'},
          {displayName: 'BOM', type: 'boolean', id: 'hasBOM', options: [
              {value: true, text: 'Yes'},
              {value: false, text: 'No'},
            ]},
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
            ]},
          {displayName: 'Cost Type', type: 'dropDown', id: 'costType', searchPlaceholder: 'Search for a cost type..',
            options: [
              {value: 'M', text: 'Manual'},
              {value: 'A', text: 'Rollup'},
            ]},
        ]
      },
      {
        displayName: 'Inventory', id: 'inventory', records: [
          {displayName: 'Quantity On Hand', type: 'text', id: 'qtyOnHand'},
          {displayName: 'Quantity On Order', type: 'text', id: 'qtyOnOrder'},
          {displayName: 'Total Available Quantity', type: 'text', id: 'qtyTotal'}
        ]
      },
      {
        displayName: 'Additional Info', id: 'additionalInfoList', records: []
      },
      {
        displayName: 'Manufacturer Parts', id: 'manufacturerParts', records: [
          {displayName: 'Manufacturer Part Number', type: 'text', id: 'mfr-objectNumber'},
          {displayName: 'Manufacturer Name', type: 'text', id: 'mfr-objectName'},
          {displayName: 'Manufacturer Code', type: 'text', id: 'mfr-code'},
          {displayName: 'Manufacturer Part Description', type: 'text', id: 'mfr-description'},
          {displayName: 'Manufacturer Part Available', type: 'boolean', id: 'mfr-isAvailable', options: [
              {value: 'Yes', text: 'Yes'},
              {value: 'No', text: 'No'},
            ]},
          {displayName: 'Manufacturer Part Packaging', type: 'text', id: 'mfr-packaging'},
          {displayName: 'Manufacturer Part Lead Time', type: 'text', id: 'mfr-leadTime'},
          {displayName: 'Manufacturer Part MOQ', type: 'text', id: 'mfr-moq'},
          {displayName: 'Manufacturer Part Currency', type: 'dropDown', id: 'mfr-currency', searchPlaceholder: 'Search for a currency..',
            options: [
              {value: '$ (USD)', text: '$ (USD)'},
              {value: '$ (CAD)', text: '$ (CAD)'},
              {value: '\u20AC (EUR)', text: '\u20AC (EUR)'},
              {value: '\u00A3 (GBR)', text: '\u00A3 (GBR)'},
              {value: '\u20B9 (INR)', text: '\u20B9 (INR)'},
              {value: '\u00A5 (RMB)', text: '\u00A5 (RMB)'},
              {value: 'AUD (AUD)', text: 'AUD (AUD)'},
              {value: '\u00A5 (JAP)', text: '\u00A5 (JAP)'},
              {value: '\u20A9 (KRW)', text: '\u20A9 (KRW)'},
              {value: 'MXN (MXN)', text: 'MXN (MXN)'},
              {value: '\u20B1 (PHP)', text: '\u20B1 (PHP)'},
              {value: 'NZD (NZD)', text: 'NZD (NZD)'},
              {value: 'NT$ (TWD)', text: 'NT$ (TWD)'},
              {value: '\u0E3F (THB)', text: '\u0E3F (THB)'},
              {value: 'CHF (CHF)', text: 'CHF (CHF)'},
              {value: 'SGD (SGD)', text: 'SGD (SGD)'},
              {value: 'kr (NOK)', text: 'kr (NOK)'},
              {value: 'EGP (EGP)', text: 'EGP (EGP)'},
              {value: 'kr (DKK)', text: 'kr (DKK)'},
              {value: 'R$ (BRL)', text: 'R$ (BRL)'},
              {value: '\u20AB (VND)', text: '\u20AB (VND)'},
              {value: 'R (ZAR)', text: 'R (ZAR)'},
              {value: '\u20AA (ILS)', text: '\u20AA (ILS)'},
              {value: 'kr (SEK)', text: 'kr (SEK)'},
            ]},
          {displayName: 'Manufacturer Part Cost', type: 'text', id: 'mfr-cost'},
          {displayName: 'Manufacturer Approved', type: 'boolean', id: 'mfr-approved', options: [
              {value: 'Yes', text: 'Yes'},
              {value: 'No', text: 'No'},
            ]},
        ]
      },
      {
        displayName: 'Supplier Parts', id: 'supplierParts', records: [
          {displayName: 'Supplier Part Number', type: 'text', id: 'supp-objectNumber'},
          {displayName: 'Supplier Name', type: 'text', id: 'supp-objectName'},
          {displayName: 'Supplier Code', type: 'text', id: 'supp-code'},
          {displayName: 'Supplier Part Description', type: 'text', id: 'supp-description'},
          {displayName: 'Supplier Part Available', type: 'boolean', id: 'supp-isAvailable', options: [
              {value: 'Yes', text: 'Yes'},
              {value: 'No', text: 'No'},
            ]},
          {displayName: 'Supplier Part Packaging', type: 'text', id: 'supp-packaging'},
          {displayName: 'Supplier Part Lead Time', type: 'text', id: 'supp-leadTime'},
          {displayName: 'Supplier Part MOQ', type: 'text', id: 'supp-moq'},
          {displayName: 'Supplier Part Currency', type: 'dropDown', id: 'supp-currency', searchPlaceholder: 'Search for a currency..',
            options: [
              {value: '$ (USD)', text: '$ (USD)'},
              {value: '$ (CAD)', text: '$ (CAD)'},
              {value: '\u20AC (EUR)', text: '\u20AC (EUR)'},
              {value: '\u00A3 (GBR)', text: '\u00A3 (GBR)'},
              {value: '\u20B9 (INR)', text: '\u20B9 (INR)'},
              {value: '\u00A5 (RMB)', text: '\u00A5 (RMB)'},
              {value: 'AUD (AUD)', text: 'AUD (AUD)'},
              {value: '\u00A5 (JAP)', text: '\u00A5 (JAP)'},
              {value: '\u20A9 (KRW)', text: '\u20A9 (KRW)'},
              {value: 'MXN (MXN)', text: 'MXN (MXN)'},
              {value: '\u20B1 (PHP)', text: '\u20B1 (PHP)'},
              {value: 'NZD (NZD)', text: 'NZD (NZD)'},
              {value: 'NT$ (TWD)', text: 'NT$ (TWD)'},
              {value: '\u0E3F (THB)', text: '\u0E3F (THB)'},
              {value: 'CHF (CHF)', text: 'CHF (CHF)'},
              {value: 'SGD (SGD)', text: 'SGD (SGD)'},
              {value: 'kr (NOK)', text: 'kr (NOK)'},
              {value: 'EGP (EGP)', text: 'EGP (EGP)'},
              {value: 'kr (DKK)', text: 'kr (DKK)'},
              {value: 'R$ (BRL)', text: 'R$ (BRL)'},
              {value: '\u20AB (VND)', text: '\u20AB (VND)'},
              {value: 'R (ZAR)', text: 'R (ZAR)'},
              {value: '\u20AA (ILS)', text: '\u20AA (ILS)'},
              {value: 'kr (SEK)', text: 'kr (SEK)'},
            ]},
          {displayName: 'Supplier Part Cost', type: 'text', id: 'supp-cost'},
          {displayName: 'Supplier Approved', type: 'boolean', id: 'supp-approved', options: [
              {value: 'Yes', text: 'Yes'},
              {value: 'No', text: 'No'},
            ]},
        ]
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
    vm.objectPageEnum = objectPageEnum;
    vm.fuseType = fuseType;
    vm.currentObjectType = fuseType.parts;
    vm.fuseUtils = fuseUtils;
    vm.sourcingUtils = sourcingUtils;
    vm.clipboardService = clipboardService;
    vm.helperData = helperData;
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
    vm.parts = [];
    vm.closeparts = [];
    vm.closedocumentsCount = null;
    vm.isLatest = true;
    vm.heightMax = document.body.scrollHeight;
    vm.currencySetting = '$';
    var selectedRows = [];
    vm.partsCount = '';
    vm.text = 'Advanced Search';
    vm.keyword = '';
    vm.selectedValue = [];
    vm.linkTarget = '_self';
    const debouncedSaveSearchPreset = _.debounce(() => searchPresetService.updateSearchPreset(vm, fuseType.parts), 200);

    //multiple selecting
    vm.isMultipleRowsSelected = isMultipleRowsSelected;

    //Methods
    vm.openPartDialog = openPartDialog;
    vm.changesearchtext = changesearchtext;
    vm.clearSearch = clearSearch;
    vm.getCountParts = getCountParts;
    vm.editTable = editTable;
    vm.onChangeLatest = onChangeLatest;
    vm.toggleSourcingGridRow = toggleSourcingGridRow;
    vm.getallfuseobject = getallfuseobject;
    vm.defaultObjectsSize = defaultObjectsSize;
    vm.openSelectObjectSize = openSelectObjectSize;
    vm.deleteItems = deleteItems;
    vm.releaseItemsBulky = releaseItemsBulky;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.addToClipBoard = addToClipBoard;
    vm.getSelectedrows = getSelectedrows;

    // Advanced Search
    vm.closeToggle = closeToggle;
    vm.getSearchState = getSearchState;
    vm.initApplyPreset = initApplyPreset;
    vm.saveSearchPresetState = () => {
      $scope.$broadcast('presetChanged');
      debouncedSaveSearchPreset();
    };
    vm.getSearchState = getSearchState;
    vm.toggleChipDetails = toggleChipDetails;
    vm.handleCriterionRemoval = handleCriterionRemoval;
    vm.callAdvancedSearch = callAdvancedSearch;
    vm.getAllRecords = getAllRecords;
    vm.resetAdvancedSearchChip = resetAdvancedSearchChip;

    vm.checkGlow = checkGlow;

    function getAllRecords() {
      return _(vm.advancedSearchSections || []).map(section => section.records).flatten().value();
    }

    function checkGlow(record) {
      if ((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
        return record.value.date !== undefined;
      }
      return !record.isEmpty();
    }

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

    $scope.$on('$destroy', () => {
      document.removeEventListener('keypress', handleKeyPress)
    });

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

    $scope.$watch(() => {
      const gridElem = document.getElementById('grid-parts');
      gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 66}px`;
    });

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
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
              vm.objectsDefaultSizePart = $rootScope.objectsDefaultSizePart;
              vm.objectsDefaultSize = vm.objectsDefaultSizePart === null ? vm.objectsDefaultSize : vm.objectsDefaultSizePart;
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
              vm.releaseHierarchy = $rootScope.releaseHierarchy;
              vm.releaseEditsHierarchy = $rootScope.releaseEditsHierarchy;
              vm.manualRelease = $rootScope.manualRelease;
              vm.configurationSettings = $rootScope.configurationSettings;
              vm.promoteDemote = $rootScope.promoteDemote;
              vm.advancedNumberSettings = $rootScope.advancedNumberSettings;
              if (vm.configurationSettings) {
                vm.advancedSearch = ['Part Number', 'Revision', 'Configuration', 'Status', 'Category', 'Part Name', 'Description', 'Unit of Measure', 'Procurement Type', 'Project Name', 'Tags', 'Cost', 'BOM', 'Where-used'];
              } else {
                vm.advancedSearch = ['Part Number', 'Revision', 'Status', 'Category', 'Part Name', 'Description', 'Unit of Measure', 'Procurement Type', 'Project Name', 'Tags', 'Cost', 'BOM', 'Where-used'];
              }
              getAttributes();
              vm.partTableOptions.columnDefs = buildPartTableColumns();
              restoreState();
            }
          });
        });
    }

    function getCategories() {
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, {categoryType: 'parts'}, '', headers)
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

    vm.defaultAvatar = defaultAvatar;

    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    function getAttributesList() {
      vm.additinalProgress = true;
      return AttributesService.getAttributesList()
        .then(function (response) {
          switch (response.code) {
            case 0:
              const additionalInfoSection = _.find(vm.advancedSearchSections, {id: 'additionalInfoList'});
              response.data.filter((attr) => attr.objectType === fuseType.parts)
                .forEach((attribute) => {
                  additionalInfoSection.addRecord({
                    id: attribute.attributeId,
                    displayName: attribute.attribute,
                    type: 'text'
                  });
              });
              vm.additinalProgress = false;
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          console.log(vm.error.erCatch);
        });
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
      if((record.id !== 'createDate' || record.id !== 'modifiedDate') && !record.isEmpty()) {
        record.clean();
        callAdvancedSearch(true);
      }
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

    vm.toggleAdvancedSearch = toggleAdvancedSearch;

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

    /**
     * Checks whether at least one of the chips is not empty
     * @returns {boolean}
     */
    function isAdvanceSearchDirty() {
      return vm.advancedSearchSections.some((section) => section.isDirty());
    }

    /**
     * Used to open and close chip details (panel with 'update' and 'close' options)
     * @param prop
     * @param record
     */
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

    vm.toggleSelectChips = toggleSelectChips;

    function toggleSelectChips(record) {
      angular.element(`#${record.id}`).triggerHandler('click');
    }


    function closeToggle(index) {
      vm.toggle[index] = vm.toggle[index] === false;
    }

    function initTableLoading() {
      const savedPreset = searchPresetService.getSavedSearchPreset(objectPageEnum.partsPage);
      savedPreset ? initApplyPreset(savedPreset) : useRemoteSearchPreset();
    }

    function initApplyPreset(preset, isImmediate) {
      if (!preset) {
        getallfuseobject(vm.objectsDefaultSize);
        return;
      }
      applyPreset(preset, isImmediate);
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

    function useRemoteSearchPreset() {
      searchPresetRequestService.getDefaultSearchPreset({objectType: 'parts', tabName: 'parts'})
        .then(initApplyPreset);
    }

    function setSearchPresetToView(preset) {
      vm.selectedValue = [];
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

    /**
     * this function is added because there is a conflict of prod data.
     * There are two data structures are used in local storage already
     * @param sectionIdOrRecordId
     */
    function getSection(sectionIdOrRecordId) {
      return _.find(vm.advancedSearchSections, {id: sectionIdOrRecordId}) ||
             _.find(vm.advancedSearchSections, (section) => section.isRecordAvailable(sectionIdOrRecordId));
    }

    function getSearchState(isForCall) {
      return searchPresetService.getActualSearchState(vm.advancedSearchSections, isForCall);
    }

    function extendPart(value) {
      value.isUsedAnywhere = value.hasWhereUsed ? 'Yes' : 'No';
      value.configurationsForDropdown = value.configName;
      value.associatedCardsList = value.associatedCardList;
      value.tags = value.tags.join(', ');
      value.projectNames = value.projectNames.join(', ');
      if (value.fuseCost != null && value.fuseCost !== undefined && value.fuseCost !== "") {
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
      if (value.costDetail && value.costDetail.costSetting === helperData.backendRollupCostId) {
        value.costType = 'Rollup';
      } else {
        value.costType = 'Manual';
      }
      if (value.hasBOM) {
        value.hasBOM = 'Yes';
      } else {
        value.hasBOM = 'No';
      }
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
      sourcingUtils.extendSourcingData(value);
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

    const debouncedDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 2000);
    const immediateDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 200);

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
      MainTablesService.getFuseParts(size)
        .then(function (response) {
          getCountParts();
          switch (response.code) {
            case 0:
              vm.parts = response.data;

              angular.forEach(vm.parts, function (value, key) {
                extendPart(value);
              });

              vm.closeparts = response.data;

              if (vm.isLatest) {
                vm.parts = _.filter(vm.parts, ['isLatest', 'true']);
              }

              vm.partTableOptions.data = angular.copy(vm.parts);


              vm.partTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.partTableOptions.data);

              vm.partTableOptions.totalParentItems = vm.parts.length;

              fuseUtils.handleAllOptionForPagination(vm.partTableOptions, objectPageEnum.partsPage);

              vm.progress = false;
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
          console.log(vm.error.erCatch);
        });
    }

    function onChangeLatest() {
      if(isAdvanceSearchDirty()) {
        getdatabysearch(getSearchState(true), false);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
      }
    }

    function getCountParts() {
      vm.partsCount = '';
      vm.progress = true;
      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: 'parts',
          isLatest: vm.isLatest
        };
      } else {
        params = {
          fuseObjectType: 'parts',
          isLatest: vm.isLatest
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobjectcount, params, '', headers)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.partsCount = response.data;
              vm.closepartsCount = response.data;
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
          console.log(vm.error.erCatch);
        });
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
        vm.partTableOptions.initialized = false;
        vm.partTableOptions.columnDefs = buildPartTableColumns();
        restoreState();
      }, function () {

      });
    }

    $scope.$on('SendUp', function () {
      $timeout(() => {
        $state.go('app.objects.part', {}, {
          notify: false,
          reload: false
        });
        pageTitleService.setPageTitle('Parts List');
      }, 50);
    });

    function getAttributes() {
      var mfrPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", objectPageEnum.partsPage)),
        basicAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.partsPage)),
        sourcingAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSourcing", objectPageEnum.partsPage)),
        additionalAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", objectPageEnum.partsPage)),
        suppPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", objectPageEnum.partsPage)),
        objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", objectPageEnum.partsPage));

      var parsedAttrs = angular.fromJson(basicAttributes);

      if ((basicAttributes && (basicAttributes.indexOf('isUsedAnywhere') !== -1) &&
        (basicAttributes.indexOf('isLatest') !== -1)) && ((!vm.configurationSettings &&
        (basicAttributes.indexOf('Configuration') === -1) && (basicAttributes.indexOf('associatedCardsList') !== -1)) ||
        (basicAttributes && vm.configurationSettings && (basicAttributes.indexOf('associatedCardsList') !== -1) &&
          (basicAttributes.indexOf('Configuration') !== -1)))) {
        vm.attrBasic = parsedAttrs;
      } else {
        vm.attrBasic = attributesUtils.getDefaultPartAndProductsAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.partsPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.partsPage), angular.toJson(vm.attrBasic));
      }

      if (sourcingAttributes) {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesSourcing", objectPageEnum.productsPage));
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
      if (objectHistoryAttributes) {
        vm.objectHistory = angular.fromJson(objectHistoryAttributes);
      }
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

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      return grid.columns.some((col) => col.displayName.length > 24) ? 'cell-height-70' : 'cell-height-50';
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
      const outerSections = ['inventory', 'basicInfo'];
      outerSections.forEach((sectionId) => {
        _.forEach(presetState[sectionId], (val, key) => {
          if(val && (!_.isEmpty(val.value) || _.isBoolean(val.value))){
            stateCopy[key] = val;
          }
        })
      });
      outerSections.forEach((sectionId) => delete stateCopy[sectionId]);
      const innerSections = ['additionalInfoList', 'manufacturerParts', 'supplierParts', 'fuseObjectHistory'];
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
      params = {
        keyword: vm.keyword,
        searchType: ['part']
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, getExportData(data), headers)
        .then(function (response) {
          vm.searchFlag = true;
          switch (response.code) {
            case 0:
              vm.partsCount = response.count.partCount;
              vm.parts = response.data;
              angular.forEach(vm.parts, function (value) {
                extendPart(value);
              });
              vm.parts = _.filter(vm.parts, ['objectType', 'parts']);
              if (vm.isLatest) {
                vm.parts = _.filter(vm.parts, ['isLatest', 'true']);
              }
              vm.partTableOptions.data = angular.copy(vm.parts);

              vm.partTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.partTableOptions.data);

              vm.partTableOptions.totalParentItems = vm.parts.length;

              fuseUtils.handleAllOptionForPagination(vm.partTableOptions, objectPageEnum.partsPage);
              vm.progress = false;
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

    function openPartDialog(ev, advancedNumberFalg) {
      $mdDialog.show({
        controller: 'CreatePartsController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/part/dialogs/create-part-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          configure: '',
          object: '',
          advancedNumbering: advancedNumberFalg
        }
      }).then(function () {
        vm.parts = vm.closeparts;
        vm.partsCount = vm.closepartsCount;
      }, function () {

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

        if (val && val != vm.objectsDefaultSize) {
          getallfuseobject(val);
          defaultObjectsSize(val);
        }
        vm.objectsDefaultSize = val ? val : vm.objectsDefaultSize;

      }, function () {
      });
    }

    /**
     * construct part table list
     * @returns {Array}
     */
    function buildPartTableColumns() {

      if (localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsPage)) &&
        angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsPage)))[0].objectList) {
        vm.attrInventory = angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsPage)));
      } else {
        vm.attrInventory = attributesUtils.getDefaultPartsProductsInventoryAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsPage), angular.toJson(vm.attrInventory));
      }

      var arr = [];
      arr = angular.copy(attributesUtils.getBasicPartsPageAttributes());

      if (vm.attrBasic) {
        angular.forEach((vm.attrBasic || []), function (attribute, i) {
          if (attribute.displayed) {
            var colDef = fuseUtils.parseAttributes(attribute);
            if (attribute.value === 'totalCost') {
              colDef.visible = false;
            }
            if (attribute.value === 'shortage') {
              colDef.visible = false;
            }
            if (attribute.value === 'requiredQty') {
              colDef.visible = false;
            }
            if (attribute.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }
            if (attribute.value === 'fuseCost') {
              colDef.sortingAlgorithm = sortingCosts;
            }
            if (attribute.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }
            if (attribute.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="ui-grid-cell-contents associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }

            if (attribute.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings) {
                return;
              }

              colDef.enableCellEdit = false;
            }

            arr.push(colDef);
          }
        });
      }

      if (vm.attrInventory) {
        angular.forEach((vm.attrInventory || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            colDef.type = 'number';
            arr.push(colDef);
          }
        });
      }

      if (vm.attrAdditional) {
        angular.forEach((vm.attrAdditional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            colDef.field = _.camelCase(colDef.field);
            if (o.name === "Rich") {
              colDef.height = 150;
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/rich-text-cell.html';
              colDef.name = o.value;
              arr.push(colDef);
            } else if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
              arr.push(colDef);
            } else {
              colDef.cellTemplate = "<div class='ui-grid-cell-contents ui-grid-text-overflow'>{{(row.entity['" + colDef.field + "']||'') ? row.entity['" + colDef.field + "']:''}}</div>";
              arr.push(colDef);
            }
          }
        });
      }

      if (vm.mfrParts) {
        angular.forEach((vm.mfrParts || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
            if (o.value === 'mfrObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-number-with-button-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'mfrObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
            }
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }

      if (vm.suppParts) {
        angular.forEach((vm.suppParts || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
            if (o.value === 'suppObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-number-with-button-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'suppObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
            }
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }

      if (vm.objectHistory) {
        angular.forEach((vm.objectHistory || []), function (o, i) {
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

    vm.partTableOptions = {
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
      exporterCsvFilename: 'partslist.csv',
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
        },
        {
          label: 'All',
          value: 3
        }
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      //enableFiltering: true,
      exporterSuppressColumns: ['bomId', 'objectId'],
      onRegisterApi: function (gridApi) {
        vm.partTableUiGrid = gridApi;
        vm.partTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        /**
         * diff - is the difference in px between current col width and previous
         * colDef - the column definition of the changed column
         */
        vm.partTableUiGrid.colResizable.on.columnSizeChanged($scope, function (colDef, diff, c) {
          fuseUtils.setProperHeaderViewportHeight(vm.partTableOptions.columnDefs, 0, null, vm.partTableUiGrid);
          vm.heightTopPanelParts = $('#grid-parts .ui-grid-top-panel').height();
          saveState();
        });
        vm.partTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.partTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.partTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.partTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.partTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.partTableUiGrid.grid.columns, function (val) {
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

        vm.partTableUiGrid.core.on.renderingComplete($scope, function () {
        });
        vm.partTableUiGrid.core.on.scrollBegin($scope, function () {
        });

        vm.partTableUiGrid.core.on.scrollEnd($scope, function () {
        });

        var paginationApi = vm.partTableUiGrid.pagination;
        paginationApi.isMultipleSupp = false;

        vm.partTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.partsPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.partsPage);
          }
          saveState();
        });

        vm.partTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.partTableOptions.data.length > 0) && !vm.partTableOptions.initialized) {
            $timeout(function () {
              vm.partTableOptions.initialized = true;
            });
          }
          showClearButton(vm.partTableUiGrid);
          vm.heightTopPanelParts = $('#grid-parts .ui-grid-top-panel').height();

          paginationApi.isMultipleSupp = fuseUtils.isMultipleSupp(paginationApi, vm.partTableOptions);
        });

        vm.partTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
          selectedRows = _.filter(vm.partTableUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
        });

        vm.partTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
          selectedRows = _.filter(vm.partTableUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
        });

      }
    };

    function sortingCosts(a, b, rowA, rowB, direction) {
      return fuseUtils.sortCost(vm.currencySetting, a, b);
    }

    function isMultipleRowsSelected() {
      return selectedRows.length > 1;
    }

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
      var state = vm.partTableUiGrid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName('grid-parts', objectPageEnum.partsPage), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState() {
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName('grid-parts', objectPageEnum.partsPage));
        state = state ? angular.fromJson(state) : null;

        fuseUtils.moveColumnToFirstPosition(vm.partTableUiGrid, $scope, 'associatedCardsList');
        fuseUtils.moveAttachmentsColumn(vm.partTableUiGrid, $scope);
        fuseUtils.moveColumnToFirstPosition(vm.partTableUiGrid, $scope, 'clipboard', true);
        fuseUtils.setProperHeaderViewportHeight(vm.partTableOptions.columnDefs, 0, null, vm.partTableUiGrid);

        if (!state) {
          return;
        }
        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.partsPage);
          state.pagination.paginationPageSize = 100;
        }
        if (state) {
          vm.partTableUiGrid.saveState.restore($scope, state);
        }
      });
    }

    function toggleSourcingGridRow(row) {
      uiGridTreeBaseService.toggleRowTreeState(vm.partTableUiGrid.grid, row);
    }

    function defaultObjectsSize(count) {
      if (count !== '0' && count !== '15' && count !== 0 && count !== 15) {
        let dontShowAlertForDatabaseLoad = $window.localStorage.getItem(`dontShowAlertForDatabaseLoad_Part_${vm.sessionData.userId}`);
        if (dontShowAlertForDatabaseLoad !== 'true') {
          notificationService.oneLineAlert(`Refreshing or reloading this page will reset the 'Items loaded from database' to 15. This results in quicker page-loading.`, 'Part', vm.sessionData.userId);
        }
        count = '15';
      }
      var data = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.userRoleSet[0] === 'customer_admin',
        customerId: vm.sessionData.userRoleSet[0] === 'customer_admin' ? vm.sessionData.userId : vm.sessionData.customerAdminId,
        defaultObjectCountPart: parseInt(count)
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.helpsetting, '', data, headers)
        .then(function (response) {
          if (response.code === 0) {
            if (count === '0') {
              vm.partTableOptions.data = [];
              vm.partsCount = '';
            }
          } else {
            console.log(response.message);
          }
        })
        .catch(function (response) {
          console.log(vm.error.erCatch);
        });
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="ui-grid-cell-contents attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function deleteItems() {
      bulkDelete.deleteItems(selectedRows);
      helpSettingService.getData().then(function (arr) {
        vm.partsCount -= (arr && arr.length) || 0;
        bulkDelete.removeRows(vm.partTableOptions.data, arr);
        bulkDelete.removeRows(selectedRows, arr);
        bulkDelete.removeRows(vm.parts, arr);

        fuseUtils.handleAllOptionForPagination(vm.partTableOptions, objectPageEnum.partsPage);

        vm.partTableOptions.totalParentItems = vm.parts.length;
        vm.partTableUiGrid.selection.clearSelectedRows();
        if(isAdvanceSearchDirty()) {
          getdatabysearch(getSearchState(true), false);
        } else {
          getallfuseobject(vm.objectsDefaultSize, true);
        }
      })
    }

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

    function getallUsers() {
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, '', '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.allUsers = response.data.Members;
              break;
            case 4006:
              break;
            default:
          }
        })
        .catch(function (response) {
          console.log(vm.error.erCatch);
        });
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

    vm.isCompareEnable = isCompareEnable;
    vm.compareItems = compareItems;

    function isCompareEnable() {
      var countRows = vm.partTableUiGrid ? vm.partTableUiGrid.selection.getSelectedCount() : 0;
      return (countRows > 1 && countRows < 6);
    }

    function compareItems() {
      const idsCompare = vm.partTableUiGrid.selection.getSelectedRows().map((row) => {
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
      exporterCsvFilename: 'partslist.csv',
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
        searchType: ['part'],
      };
      let promise;
      if (isAdvanceSearchDirty()) {
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.partsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.partTableOptions.columnDefs;
          resolve(CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, getExportData(getSearchState(true)), headers));
        });
      } else {
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.partsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.partTableOptions.columnDefs;
          resolve(MainTablesService.getFuseParts(vm.objectsDefaultSize));
        });
      }
      promise.then((response)=> {
        vm.downloads = response.data;
        _.forEach(vm.downloads, function (value) {
          extendPart(value);
        });
        if (vm.isLatest) {
          vm.downloads = _.filter(vm.downloads, ['isLatest', 'true']);
        }
        vm.downloadOptions.data = _.cloneDeep(vm.downloads);
        vm.sourcingUtils.applyFlattenOnSourcing(vm.downloadOptions.data);
        $timeout(() => {
          type === 'csv' ? fuseUtils.downloadAllCsv(vm.downloadCsvGrid) : fuseUtils.downloadAllPdf(vm.downloadCsvGrid);
          vm.downloadAllProgress = false;
        }, 3000);
      });
    }
  }

})();
