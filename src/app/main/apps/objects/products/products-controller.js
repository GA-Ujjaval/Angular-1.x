(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('ProductsController', ProductsController);

  /** @ngInject */
  function ProductsController($state, $scope, $mdDialog, $document, $filter, hostUrlDevelopment, CustomerService, errors, $mdMenu,
                              $mdToast, AuthService, objectPageEnum, fuseUtils, $timeout, $window, BoardService, clipboardService, DialogService,
                              uiGridTreeBaseService, attributesUtils, helpSettingService, bulkDelete, sourcingUtils, helperData,
                              selectedValMatcher, searchPresetService, fuseType, searchPresetRequestService, GlobalSettingsService,
                              exporterCallbackService, selectedValNameMatcher, AdvancedSearchSection,
                              $cookies, $rootScope, uiGridGridMenuService, pageTitleService, notificationService) {
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
            ]}
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

    function getCategories() {
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcategorylist, {categoryType: 'products'}, '', headers)
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
    vm.toggleSelectChips = toggleSelectChips;
    vm.toggleAdvancedSearch = toggleAdvancedSearch;
    vm.checkGlow = checkGlow;
    vm.getAllRecords = getAllRecords;
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

    function defaultAvatar(nameOfOwner) {
      if (nameOfOwner) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    vm.objectPageEnum = objectPageEnum;
    vm.fuseType = fuseType;
    vm.fuseUtils = fuseUtils;
    vm.sourcingUtils = sourcingUtils;
    vm.bulkDelete = bulkDelete;
    vm.helperData = helperData;
    vm.currentObjectType = fuseType.products;

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
    vm.products = [];
    vm.productsCount = '';

    vm.closeProducts = [];
    vm.closeproductsCount = null;
    vm.isLatest = true;
    vm.currencySetting = '$';
    vm.linkTarget = '_self';
    var selectedRows = [];

    //Methods
    vm.searchByFreeText = fuseUtils.searchByFreeText;
    vm.clearSearch = clearSearch;
    vm.productCount = productCount;
    vm.openProductDialog = openProductDialog;
    vm.editTable = editTable;
    vm.printTable = printTable;
    vm.onChangeLatest = onChangeLatest;
    vm.toggleSourcingGridRow = toggleSourcingGridRow;
    vm.getallfuseobject = getallfuseobject;
    vm.defaultObjectsSize = defaultObjectsSize;
    vm.openSelectObjectSize = openSelectObjectSize;
    vm.deleteItems = deleteItems;
    vm.releaseItemsBulky = releaseItemsBulky;
    vm.getBoards = getBoards;
    vm.openCard = openCard;
    vm.getRightHeigh = getRightHeigh;
    vm.changesearchtext = changesearchtext;

    vm.addToClipBoard = addToClipBoard;
    vm.getSelectedrows = getSelectedrows;
    vm.compareItems = compareItems;
    vm.isCompareEnable = isCompareEnable;

    vm.categories = [];
    vm.status = ['InDevelopment', 'Released', 'Obsolete'];
    vm.bom = [{
      'text': 'Yes',
      'value': true
    }, {
      'text': 'No',
      'value': false
    }];
    vm.whereused = [{
      'text': 'Yes',
      'value': true
    }, {
      'text': 'No',
      'value': false
    }];
    vm.inventory = ['Quantity On Hand', 'Quantity On Order', 'Total Available Quantity'];
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
    vm.keyword = '';
    vm.selectedValue = [];
    vm.selectedCategory = [];
    vm.selectedStatus = [];
    vm.selectedBOM = '';
    vm.selectdWhereUsed = '';
    vm.productNumber = '';
    vm.selectedConfiguration = '';
    vm.productName = '';
    vm.description = '';
    vm.revision = '';
    vm.uom = '';
    vm.pt = '';
    vm.pn = '';
    vm.tags = '';
    vm.cost = '';
    vm.qoh = '';
    vm.qoo = '';
    vm.toa = '';
    vm.showSearchValues = [];
    vm.showSearchValue = '';
    vm.showValues = [];
    vm.showValue = '';
    vm.showstatusValues = [];
    vm.showstatusValue = '';
    vm.toolValueShow = [];
    vm.additionalInfoShow = false;
    vm.additionalInfoTrackerFlag = false;
    const debouncedSaveSearchPreset = _.debounce(() => searchPresetService.updateSearchPreset(vm, fuseType.products), 200);

    $scope.$watch(() => {
      const gridElem = document.getElementById('grid-products');
      gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 66}px`;
    });

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
    vm.resetAdvancedSearchChip = resetAdvancedSearchChip;

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

    function closeToggle(index) {
      vm.toggle[index] = vm.toggle[index] === false ? true : false;
    }

    function changesearchtext(e) {
      if (!angular.isUndefined(e) && e.keyCode === 13 && vm.keyword.trim() !== '') {
        getdatabysearch(getSearchState(true), false);
        e.stopPropagation();
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

    /**
     * Checks whether at least one of the chips is not empty
     * @returns {boolean}
     */
    function isAdvanceSearchDirty() {
      return vm.advancedSearchSections.some((section) => section.isDirty());
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

    document.addEventListener('keypress', handleKeyPress);
    $scope.$on('$destroy', () => {
      document.removeEventListener('keypress', handleKeyPress)
    });

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
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
              vm.objectsDefaultSizeProduct = $rootScope.objectsDefaultSizeProduct;
              vm.objectsDefaultSize = vm.objectsDefaultSizeProduct === null ? vm.objectsDefaultSize : vm.objectsDefaultSizeProduct;
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
              vm.releaseHierarchy = $rootScope.releaseHierarchy;
              vm.promoteDemote = $rootScope.promoteDemote;
              vm.releaseEditsHierarchy = $rootScope.releaseEditsHierarchy;
              vm.configurationSettings = $rootScope.configurationSettings;
              vm.advancedNumberSettings = $rootScope.advancedNumberSettings;
              // Advanced Search
              if (vm.configurationSettings) {
                vm.advancedSearch = ['Part Number', 'Revision', 'Configuration', 'Status', 'Category', 'Part Name', 'Description', 'Unit of Measure', 'Procurement Type', 'Project Name', 'Tags', 'Cost', 'BOM', 'Where-used'];
              } else {
                vm.advancedSearch = ['Part Number', 'Revision', 'Status', 'Category', 'Part Name', 'Description', 'Unit of Measure', 'Procurement Type', 'Project Name', 'Tags', 'Cost', 'BOM', 'Where-used'];
              }
              getAttributes();
              vm.productTableOptions.columnDefs = buildProductTableColumns();
              restoreState();
            }
          });
        });
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

    function initTableLoading() {
      const savedPreset = searchPresetService.getSavedSearchPreset(objectPageEnum.productsPage);
      savedPreset ? initApplyPreset(savedPreset) : useRemoteSearchPreset();
    }

    function initApplyPreset(preset, isImmediate) {
      if (!preset) {
        getallfuseobject(vm.objectsDefaultSize);
        return;
      }
      applyPreset(preset, isImmediate);
    }

    function useRemoteSearchPreset() {
      searchPresetRequestService.getDefaultSearchPreset({objectType: fuseType.products, tabName: fuseType.products})
        .then(initApplyPreset);
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

    function getSection(sectionIdOrRecordId) {
      return _.find(vm.advancedSearchSections, {id: sectionIdOrRecordId}) ||
        _.find(vm.advancedSearchSections, (section) => section.isRecordAvailable(sectionIdOrRecordId));
    }

    function isSectionData(section) {
      return !(section.hasOwnProperty('type') && section.hasOwnProperty('value'))
    }

    function extendProduct(value) {
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
      if (value.costDetail && value.costDetail.costSetting == 'A') {
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
        var creator = _.find(vm.allUsers, {userId: value.fuseObjectHistory.createdBy});
        var editor = _.find(vm.allUsers, {userId: value.fuseObjectHistory.modifiedBy});
        value.createdBy = creator ? (creator.firstName + " " + creator.lastName) : '';
        value.modifiedBy = editor ? (editor.firstName + " " + editor.lastName) : '';
        value.modifiedDate = $filter('date')(value.fuseObjectHistory.modifiedDate, "medium");
        value.createDate = $filter('date')(value.fuseObjectHistory.createDate, "medium");
        value.revisionNotes = value.fuseObjectHistory.revisionNotes;
      }
      sourcingUtils.extendSourcingData(value);
    }

    const debouncedDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 2000);
    const immediateDoGetAllFuseObject = _.debounce(doGetAllFuseObject, 200);

    function getallfuseobject(size, isDebounced) {
      if (size === '0' || size === 0) {
        vm.searchFlag = false;
        return;
      }
      vm.searchFlag = false;
      vm.progress = true;
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
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: 'products',
          defaultObjectCount: size
        };
      } else {
        params = {
          fuseObjectType: 'products',
          defaultObjectCount: size
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', headers)
        .then(function (response) {
          productCount();
          switch (response.code) {
            case 0:

              vm.products = response.data;

              angular.forEach(vm.products, function (value, key) {
                extendProduct(value);
              });

              vm.closeProducts = response.data;

              if (vm.isLatest) {
                vm.products = _.filter(vm.products, ['isLatest', 'true']);
              }

              vm.productTableOptions.data = angular.copy(vm.products);

              vm.productTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.productTableOptions.data);

              vm.productTableOptions.totalParentItems = vm.products.length;

              fuseUtils.handleAllOptionForPagination(vm.productTableOptions, objectPageEnum.productsPage);

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
        .catch(function () {
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
      vm.productsCount = '';

      //For Progress Loader
      vm.progress = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          fuseObjectType: 'products',
          isLatest: vm.isLatest
        };
      } else {
        params = {
          fuseObjectType: 'products',
          isLatest: vm.isLatest
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobjectcount, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.productsCount = response.data;
              vm.closeproductsCount = response.data;
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

    function clearSearch() {
      vm.keyword = '';
      if (isAdvanceSearchDirty()) {
        getdatabysearch(getSearchState(true), false);
      } else {
        getallfuseobject(vm.objectsDefaultSize);
        vm.searchFlag = false;
      }
    }

    function setHeaderHeight(grid) {
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
      var type = [];
      type.push('product');

      if (vm.sessionData.proxy == true) {
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

              vm.productsCount = response.count.productCount;
              vm.products = response.data;

              angular.forEach(vm.products, function (value) {
                extendProduct(value);
              });

              vm.products = _.filter(vm.products, ['objectType', 'products']);

              if (vm.isLatest) {
                vm.products = _.filter(vm.products, ['isLatest', 'true']);
              }

              //vm.count.productCount = vm.products.length;
              vm.productTableOptions.data = angular.copy(vm.products);

              fuseUtils.handleAllOptionForPagination(vm.productTableOptions, objectPageEnum.productsPage);

              vm.productTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.productTableOptions.data);

              vm.productTableOptions.totalParentItems = vm.products.length;

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
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
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
        vm.productTableOptions.initialized = false;
        vm.productTableOptions.columnDefs = buildProductTableColumns();
        restoreState();
      }, function () {

      });
    }

    function printTable(body, head, txt) {
      var bodyToPrint = document.getElementById(body);
      var headToPrint = document.getElementById(head);
      var newWin = window.open("");
      var now = new Date();
      var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A');
      newWin.document.write('<html><head><title>' + txt + '</title>' + '<style>@page { size: auto;  margin: 0mm; }</style>' +
        '</head><body>' + '<div style="padding: 5px;">' + dateformat + '<span style="left: 50%; position: absolute;">' + txt + '</span>' + '</div>' + '<table style="text-align: left;">' + headToPrint.outerHTML + bodyToPrint.outerHTML + '</table>' + '</body></html>');
      newWin.print();
      newWin.close();
    }

    function getAttributes() {

      var mfrPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", objectPageEnum.productsPage)),
        basicAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.productsPage)),
        sourcingAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSourcing", objectPageEnum.productsPage)),
        additionalAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", objectPageEnum.productsPage)),
        suppPartsAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", objectPageEnum.productsPage)),
        objectHistoryAttributes = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", objectPageEnum.productsPage));

      var parsedBasicAttrs = angular.fromJson(basicAttributes);

      if ((basicAttributes && basicAttributes.indexOf('isUsedAnywhere') !== -1 && basicAttributes.indexOf('isLatest') !== -1) && ((!vm.configurationSettings && (basicAttributes.indexOf('Configuration') === -1) && (basicAttributes.indexOf('associatedCardsList') !== -1))
        || (vm.configurationSettings && basicAttributes && (basicAttributes.indexOf('associatedCardsList') !== -1) && (basicAttributes.indexOf('Configuration') !== -1)))) {
        vm.attrBasic = parsedBasicAttrs;
      } else {
        vm.attrBasic = attributesUtils.getDefaultPartAndProductsAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.productsPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", objectPageEnum.productsPage), angular.toJson(vm.attrBasic));
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

    function openProductDialog(ev, advancedNumberFalg) {
      $mdDialog.show({
          controller: 'CreateProductsController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/products/dialogs/create-product-dialog.html',
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
          vm.Products = vm.closeProducts;
          vm.closeproductsCount = vm.productsCount;
        }, function () {

        });
    }

    function buildProductTableColumns() {

      if (localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsPage)) &&
        angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsPage)))[0].objectList) {
        vm.attrInventory = angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsPage)));
      } else {
        vm.attrInventory = attributesUtils.getDefaultPartsProductsInventoryAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsPage), angular.toJson(vm.attrInventory));
      }

      var arr = [];
      arr = angular.copy(attributesUtils.getBasicProductPageAttributes());

      if (vm.attrBasic) {

        angular.forEach((vm.attrBasic || []), function (o, i) {

          if (o.displayed) {

            var colDef = fuseUtils.parseAttributes(o);

            if (o.value === 'totalCost') {
              colDef.visible = false;
            }

            if (o.value === 'shortage') {
              colDef.visible = false;
            }

            if (o.value === 'fuseCost') {
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            }

            if (o.value === 'requiredQty') {
              colDef.visible = false;
            }

            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }

            if (o.value === 'hasAttachments') {
              colDef.displayName = ' ';
            }

            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html'
            }

            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
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
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            } else {
              colDef.cellTemplate = "<div class='ui-grid-cell-contents ui-grid-text-overflow'>{{(row.entity['" + colDef.field + "']||'') ? row.entity['" + colDef.field + "']:''}}</div>";
            }
            arr.push(colDef);
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
            //colDef.field = 'mfrList[0].' + o.value;
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
            //colDef.field = 'suppList[0].' + o.value;
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
        //col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    /**
     * table configurations
     * @type {{
     *  initialized: boolean,
     *  columnDefs: *,
     *  showTreeExpandNoChildren: boolean, showTreeRowHeader: boolean, data: Array,
     *  enableColumnReordering: boolean, enableColumnResizing: boolean, enableSorting: boolean,
     *  enableFiltering: boolean, exporterPdfDefaultStyle: {fontSize: number},
     *  exporterPdfTableStyle: {margin: [*]}, exporterPdfOrientation: string,
     *  exporterPdfPageSize: string, rowHeight: number, enableHorizontalScrollbar: number,
     *  paginationPageSize: number, paginationPageSizes: [*],
     *  onRegisterApi: ProductsController.productTableOptions.onRegisterApi
     * }}
     */
    vm.productTableOptions = {
      exporterFieldCallback: exporterCallbackService.mainTable,
      initialized: false,
      flatEntityAccess: true,
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
      exporterCsvFilename: 'productslist.csv',
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
      exporterSuppressColumns: ['objectId'],
      //enableFiltering: true,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.productTableUiGrid = gridApi;

        // Setup events so we're notified when grid state changes.
        vm.productTableUiGrid.colMovable.on.columnPositionChanged($scope, saveState);
        vm.productTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelProducts = $('#grid-products .ui-grid-top-panel').height();
          fuseUtils.setProperHeaderViewportHeight(vm.productTableOptions.columnDefs, 0, null, vm.productTableUiGrid);
          saveState();
        });
        //vm.hierarchicalUiGrid.grouping.on.aggregationChanged($scope, saveState);
        //vm.hierarchicalUiGrid.grouping.on.groupingChanged($scope, saveState);
        vm.productTableUiGrid.core.on.columnVisibilityChanged($scope, saveState);
        vm.productTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
        });
        vm.productTableUiGrid.core.on.sortChanged($scope, saveState);
        vm.productTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.productTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.productTableUiGrid.grid.columns, function (val) {
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

        restoreState();

        var paginationApi = vm.productTableUiGrid.pagination;
        paginationApi.isMultipleSupp = false;

        vm.productTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.productsPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.productsPage);
          }
          saveState();
        });

        vm.productTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.productTableOptions.data.length > 0) && !vm.productTableOptions.initialized) {
            $timeout(function () {
              vm.productTableOptions.initialized = true;
            });
          }
          showClearButton(vm.productTableUiGrid);
          vm.heightTopPanelProducts = $('#grid-products .ui-grid-top-panel').height();
          $('div[ui-grid-filter]').css({'padding-top': 20 + 'px'});
          $('.ui-grid-filter-container').css({'position': 'absolute', 'bottom': 0});

          paginationApi.isMultipleSupp = fuseUtils.isMultipleSupp(paginationApi, vm.productTableOptions);
        });

        vm.productTableUiGrid.selection.on.rowSelectionChanged($scope, function () {
          selectedRows = _.filter(vm.productTableUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
        });

        vm.productTableUiGrid.selection.on.rowSelectionChangedBatch($scope, function () {
          selectedRows = _.filter(vm.productTableUiGrid.selection.getSelectedRows(), function (o) {
            return !o.sourcingChildren
          });
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
      var state = vm.productTableUiGrid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName('grid-products', objectPageEnum.productsPage), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState() {
      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName('grid-products', objectPageEnum.productsPage));
        state = state ? angular.fromJson(state) : null;

        fuseUtils.moveColumnToFirstPosition(vm.productTableUiGrid, $scope, 'associatedCardsList');
        fuseUtils.moveAttachmentsColumn(vm.productTableUiGrid, $scope);
        fuseUtils.setProperHeaderViewportHeight(vm.productTableOptions.columnDefs, 0, null, vm.productTableUiGrid);

        if (!state) {
          return;
        }

        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.productsPage);
          state.pagination.paginationPageSize = 100;
        }

        if (state) vm.productTableUiGrid.saveState.restore($scope, state);
      });
    }

    function toggleSourcingGridRow(row) {
      uiGridTreeBaseService.toggleRowTreeState(vm.productTableUiGrid.grid, row);
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
        let dontShowAlertForDatabaseLoad = $window.localStorage.getItem(`dontShowAlertForDatabaseLoad_Product_${vm.sessionData.userId}`);
        if (dontShowAlertForDatabaseLoad !== 'true') {
          notificationService.oneLineAlert(`Refreshing or reloading this page will reset the 'Items loaded from database' to 15. This results in quicker page-loading.`, 'Product', vm.sessionData.userId);
        }
        count = '15';
      }
      var data = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.userRoleSet[0] === 'customer_admin',
        customerId: vm.sessionData.userRoleSet[0] === 'customer_admin' ? vm.sessionData.userId : vm.sessionData.customerAdminId,
        defaultObjectCountProduct: parseInt(count)
      };
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.helpsetting, '', data, headers)
        .then(function (response) {
          if (response.code === 0) {
            if (count === '0') {
              vm.productTableOptions.data = [];
              vm.productsCount = '';
            }
          }
          else {
            console.log(response.message);
          }
        })
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function deleteItems() {
      bulkDelete.deleteItems(selectedRows);
      helpSettingService.getData().then(function (arr) {
        vm.productsCount -= (arr && arr.length) || 0;
        bulkDelete.removeRows(vm.productTableOptions.data, arr);
        bulkDelete.removeRows(selectedRows, arr);
        bulkDelete.removeRows(vm.products, arr);

        fuseUtils.handleAllOptionForPagination(vm.productTableOptions, objectPageEnum.productsPage);

        vm.productTableOptions.totalParentItems = vm.products.length;
        vm.productTableUiGrid.selection.clearSelectedRows();
        if(isAdvanceSearchDirty()) {
          getdatabysearch(getSearchState(true), false);
        } else {
          getallfuseobject(vm.objectsDefaultSize, true);
        }
      })
    }

    function getallUsers() {
      if (vm.sessionData.proxy == true) {
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
        .catch(function (response) {
          //vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    // Advamced Search

    function getAttributesList() {
      // For Progress Loader
      vm.additinalProgress = true;

      var headers = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      if (vm.sessionData.proxy == true) {
        var params = {
          customerId: vm.sessionData.customerAdminId
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getattributeslist, params, '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              const additionalInfoSection = _.find(vm.advancedSearchSections, {id: 'additionalInfoList'});
              response.data.filter((attr) => attr.objectType === fuseType.products)
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
        .catch(function (response) {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
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
        $state.go('app.objects.products', {}, {
          notify: false,
          reload: false
        });
        pageTitleService.setPageTitle('Products List');
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
      var neededCard = _.find(board.cards, {id: cardId});
      return neededCard
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    function getRightHeigh() {
      return document.body.clientHeight - $('#grid-products')[0].offsetTop - 66;
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

    function isCompareEnable() {
      var countRows = vm.productTableUiGrid ? vm.productTableUiGrid.selection.getSelectedCount() : 0;
      return (countRows > 1 && countRows < 6);
    }

    function compareItems() {
      const idsCompare = vm.productTableUiGrid.selection.getSelectedRows().map((row) => {
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
      exporterCsvFilename: 'productslist.csv',
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
      let promise;
      if (isAdvanceSearchDirty()) {
        params = {
          keyword: vm.keyword,
          searchType: ['product'],
        };
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.productsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.productTableOptions.columnDefs;
          resolve(CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, getExportData(getSearchState(true)), headers));
        });
      } else {
        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            fuseObjectType: 'products',
            defaultObjectCount: vm.objectsDefaultSize
          };
        } else {
          params = {
            fuseObjectType: 'products',
            defaultObjectCount: vm.objectsDefaultSize
          };
        }
        promise = new Promise(resolve => {
          vm.downloadOptions.paginationPageSize = vm.productsCount;
          vm.downloadOptions.paginationCurrentPage = 1;
          vm.downloadOptions.columnDefs = vm.productTableOptions.columnDefs;
          resolve(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', headers));
        });
      }
      promise.then((response)=> {
        vm.downloads = response.data;
        _.forEach(vm.downloads, function (value) {
          extendProduct(value);
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
