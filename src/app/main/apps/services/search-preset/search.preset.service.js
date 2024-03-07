(function () {
  'use strict';

  /**
   * The service handles all the functionality related to search preset feature
   */
  angular
    .module('app.objects')
    .factory('searchPresetService', searchPresetService);

  function searchPresetService(fuseUtils, selectedValMatcher, features, notificationService, $rootScope) {

    /**
     * Returns name of the attribute for search preset feature
     * @param key {string} - the name of the table search preset is saved for
     * @returns {*}
     */
    const getName = (key) => fuseUtils.buildAttributeName(`${key}_${features.searchPreset}`);

    /**
     * Saves search preset to localstorage
     * @param key {string] - the name of the table to save preset for
     * @param preset {object} - the preset object
     */
    function saveSearchPreset(key, preset) {
      if(preset && !preset.templateData) {
        preset = {templateData: {searchPreset: preset}}
      }
      localStorage.setItem(getName(key), angular.toJson(preset));
    }

    /**
     * Returns search reset saved for passed key
     * @param key {string} - the key to retrieve preset
     * @returns {Object|Array|string|number}
     */
    function getSavedSearchPreset(key) {
      return angular.fromJson(localStorage.getItem(getName(key)));
    }

    /**
     * Returns the default data structure for search preset model
     * @returns
     */
    function getAdvancedSearchScheme() {
      return {
        "categoryId": {
          "type": "dropDown",
          "value": []
        },
        "status": {
          "type": "dropDown",
          "value": []
        },
        "configName": {
          "type": "text",
          "value": ""
        },
        "objectNumber": {
          "type": "text",
          "value": ""
        },
        "objectName": {
          "type": "text",
          "value": ""
        },
        "revision": {
          "type": "text",
          "value": ""
        },
        "description": {
          "type": "text",
          "value": ""
        },
        "uom": {
          "type": "text",
          "value": ""
        },
        "procurementType": {
          "type": "text",
          "value": ""
        },
        "fuseCost": {
          "type": "text",
          "value": ""
        },
        "hasBOM": {
          "type": "dropDown",
          "value": null
        },
        "hasWhereUsed": {
          "type": "dropDown",
          "value": null
        },
        "projectNames": {
          "type": "multiple_text",
          "value": ""
        },
        "tags": {
          "type": "multiple_text",
          "value": ""
        }
      };
    }

    /**
     * Matching object, which have access to all variables associated to a chip.
     * Its properties assign values to the related chips
     * @type
     */
    const setMatcher = {
      'objectNumber': (vm, val) => {
        vm[objectNumberMatcher[vm.currentObjectType]] = val;
        vm.Data.objectNumber.value = val || '';
        vm.pnumberShow = true;
        vm.togglepartNumber = false;
      },
      'configName': (vm, val) => {
        vm.selectedConfiguration = val;
        vm.Data.configName.value = val || '';
        vm.configurationShow = true;
        vm.toggleConfiguration = false;
      },
      'revision': (vm, val) => {
        vm.revision = val;
        vm.Data.revision.value = val || '';
        vm.revisionShow = true;
        vm.togglepartRevision = false;
      },
      'objectName': (vm, val) => {
        vm[objectNameMatcher[vm.currentObjectType]] = val;
        vm.Data.objectName.value = val || '';
        vm.pnShow = true;
        vm.togglePN = false;
      },
      'description': (vm, val) => {
        vm.description = val;
        vm.Data.description.value = val || '';
        vm.descriptionShow = true;
        vm.toggleDescription = false;
      },
      'uom': (vm, val) => {
        vm.uom = val;
        vm.Data.uom.value = val || '';
        vm.uomShow = true;
        vm.togglepartUOM = false;
      },
      'procurementType': (vm, val) => {
        vm.pt = val;
        vm.Data.procurementType.value = val || '';
        vm.ptShow = true;
        vm.togglepartPT = false;
      },
      'projectNames': (vm, val) => {
        vm.pn = val;
        vm.Data.projectNames.value = val || '';
        vm.pnameShow = true;
        vm.togglepartPN = false;
      },
      'tags': (vm, val) => {
        vm.tags = val;
        vm.Data.tags.value = val || '';
        vm.tagsShow = true;
        vm.togglepartTags = false;
      },
      'fuseCost': (vm, val) => {
        vm.cost = val;
        vm.Data.fuseCost.value = val || '';
        vm.costShow = true;
        vm.togglepartCost = false;
      },
      'hasBOM': (vm, val) => {
        if(val === true){
          vm.showbomValue = 'Yes';
        } else if(val === false) {
          vm.showbomValue = 'No';
        } else {
          vm.showbomValue = '';
        }
        vm.Data.hasBOM.value = val;
        vm.bomShow = true;
        vm.selectedBOM = val;
      },
      'hasWhereUsed': (vm, val) => {
        if(val === true){
          vm.showwhereusedValue = 'Yes';
        } else if(val === false) {
          vm.showwhereusedValue = 'No';
        } else {
          vm.showwhereusedValue = '';
        }
        vm.Data.hasWhereUsed.value = val;
        vm.selectedWhereUsed = val;
        vm.whereusedShow = true;
      },
      'categoryId': (vm, val, viewValue) => {
        vm.selectedCategory = val || [];
        if(val){
          vm.Data.categoryId.value = val;
        }
        vm.categoryShow = true;
        vm.showValue = viewValue;
      },
      'status': (vm, val) => {
        vm.selectedStatus = val || [];
        vm.Data.status.value = val;
        vm.statusShow = true;
      }
    };

    /**
     * Sets chips, when there is no default template provided
     * @param vm
     */
    function setInitialPresetChips(vm) {
      const chips = ['objectNumber', 'objectName', 'categoryId', 'description', 'status'];
      chips.forEach((chipName) => {
        setMatcher[chipName](vm, null);
        vm.selectedValue.push(selectedValMatcher[chipName]);
      });
    }

    class AdditionalInfoListItem {
      constructor(value) {
        this.value = value;
        this.type = 'text';
      }
    }

    /**
     * Used to get current state of chips values or of a particular chip
     * @param vm
     * @param prop {string} - property to get value of
     * @returns
     */
    function getMatchingValue(vm, prop) {
      const matcher = {
        objectNumber: vm[objectNumberMatcher[vm.currentObjectType]] || '',
        configName: vm.selectedConfiguration || '',
        revision: vm.revision || '',
        objectName: vm[objectNameMatcher[vm.currentObjectType]] || '',
        description: vm.description || '',
        uom: vm.uom || '',
        procurementType: vm.pt || '',
        projectNames: vm.pn || '',
        tags: vm.tags || '',
        fuseCost: vm.cost || '',
        hasBOM: _.isBoolean(vm.selectedBOM) ? vm.selectedBOM : null,
        hasWhereUsed: _.isBoolean(vm.selectedWhereUsed) ? vm.selectedWhereUsed : null,
        categoryId: vm.selectedCategory || [],
        status: vm.selectedStatus || []
      };
      return prop ? matcher[prop] : matcher;
    }

    const objectNameMatcher = {
      parts: 'partName',
      products: 'productName',
      documents: 'documentName'
    };

    const objectNumberMatcher = {
      parts: 'partNumber',
      products: 'productNumber',
      documents: 'documentNumber'
    };

    /**
     * Updates all saved default presets in accordance with hash key, came from back end
     * @param templateKeys
     */
    function updateAllDefaultPresets(templateKeys) {
      const presetHashKeys = _.map(templateKeys, (value, key) => {
        if(key.indexOf(features.searchPreset) !== -1) {
          return {value, key};
        }
        return false;
      }).filter((val) => val);
      presetHashKeys.filter((item) => localStorage.getItem(item.key) !== item.value)
        .forEach((item) => {
          const objectType = item.key.slice(features.searchPreset.length);
          localStorage.removeItem(getName(objectType));
          localStorage.removeItem(item.key);
        });
    }

    function setDefaultTemplateKey(tabName, value) {
      localStorage.setItem(`${features.searchPreset}${tabName}`, value);
    }

    /**
     * Used to identify, whether the chip is open
     * @param vm
     * @returns
     */
    function getChipShowMatcher(vm) {
      return {
        objectNumber: vm.pnumberShow,
        configName: vm.configurationShow,
        revision: vm.revisionShow,
        objectName: vm.pnShow,
        description: vm.descriptionShow,
        uom: vm.uomShow,
        procurementType: vm.ptShow,
        projectNames: vm.pnameShow,
        tags: vm.tagsShow,
        fuseCost: vm.costShow,
        hasBOM: vm.bomShow,
        hasWhereUsed: vm.whereusedShow,
        categoryId: vm.categoryShow,
        status: vm.statusShow,
        additionalInfoList: vm.additionalInfoShow
      }
    }

    /**
     * Updates search preset saved to local storage
     * @param vm
     * @param tabName
     */
    function updateSearchPreset(vm, tabName) {
      const previousState = getSavedSearchPreset(tabName) || {templateData: {}};
      previousState.templateData.searchPreset = getActualSearchState(vm.advancedSearchSections);
      saveSearchPreset(tabName, previousState);
    }

    /**
     * Gets actual model of search preset state
     */
    function getActualSearchState(sections, isForCall) {
      const presetState = {};
      sections.forEach((section) => {
        const chips = {};
        section.getRecords()
          .filter((record) => record.isShown())
          .forEach((record) => chips[record.id] = isForCall ? record.getRequestData() : record.getExport());
        if(!_.isEmpty(chips)) {
          presetState[section.id] = chips;
        }
      });
      return presetState;
    }

    /**
     * Toggles details of particular chip
     * @param vm
     * @param prop
     */
    function toggleChipDetails(vm, prop) {
      const toggler = getToggler(vm);
      const currentState = toggler[prop] ? toggler[prop]() : vm.toggle[prop];
      _.forEach(toggler, (val) => {val(false)});
      vm.toggle = vm.toggle.map(() => true);
      if(toggler[prop]) {
        toggler[prop](!currentState)
      }
      if (vm.toggle[prop]){
        vm.toggle[prop] = !currentState;
      }
    }

    function getToggler(vm) {
      return {
        objectNumber: (val) => _.isNil(val) ?  vm.togglepartNumber : vm.togglepartNumber = val,
        configName: (val) => _.isNil(val) ?  vm.toggleConfiguration : vm.toggleConfiguration = val,
        revision: (val) => _.isNil(val) ?  vm.togglepartRevision : vm.togglepartRevision = val,
        objectName: (val) => _.isNil(val) ?  vm.togglePN : vm.togglePN = val,
        description: (val) => _.isNil(val) ?  vm.toggleDescription : vm.toggleDescription = val,
        uom: (val) => _.isNil(val) ?  vm.togglepartUOM : vm.togglepartUOM = val,
        procurementType: (val) => _.isNil(val) ?  vm.togglepartPT : vm.togglepartPT = val,
        projectNames: (val) => _.isNil(val) ?  vm.togglepartPN : vm.togglepartPN = val,
        tags: (val) => _.isNil(val) ?  vm.togglepartTags : vm.togglepartTags = val,
        fuseCost: (val) => _.isNil(val) ?  vm.togglepartCost : vm.togglepartCost = val
      };
    }

    function getOpenChipMatcher(vm) {
      return {
        objectNumber: vm.togglepartNumber,
        configName: vm.toggleConfiguration,
        revision: vm.togglepartRevision,
        objectName: vm.togglePN,
        description: vm.toggleDescription,
        uom: vm.togglepartUOM,
        procurementType: vm.togglepartPT,
        projectNames: vm.togglepartPN,
        tags: vm.togglepartTags,
        fuseCost: vm.togglepartCost
      }
    }

    /**
     * checks, whether the preset values are empty or not
     * @param presetData
     * @returns {boolean}
     */
    function isPresetMeaningful(presetData, keyword) {
      return _.some(presetData, (chip, chipName) => {
        return chipName === 'additionalInfoList' ? !isAdditionalInfoListEmpty(chip) : _.isBoolean(chip.value)
          || !_.isEmpty(chip.value);
      });
    }

    function isAdditionalInfoListEmpty(addInfo) {
      if(_.isEmpty(addInfo)){
        return true;
      }
      return _.every(addInfo, ({value}, key) => {
        return _.isEmpty(value) && !_.isBoolean(value)
      });
    }

    function processNewDefaultPreset(tabName, preset) {
      if(!preset) {
        return;
      }
      notificationService.multyLineAlert(`Admin has set a default search preset for this table and it will be loaded.
        Any changes made to it will be retained in this browser for this user only`);
      saveSearchPreset(tabName, preset);
      setDefaultTemplateKey(tabName, preset.hashKey);
      $rootScope.$broadcast('presetChanged', preset.templateId);
    }

    return {
      saveSearchPreset,
      getSavedSearchPreset,
      updateSearchPreset,
      getAdvancedSearchScheme,
      setMatcher,
      setInitialPresetChips,
      AdditionalInfoListItem,
      getMatchingValue,
      updateAllDefaultPresets,
      getActualSearchState,
      toggleChipDetails,
      isPresetMeaningful,
      processNewDefaultPreset,
      getOpenChipMatcher
    };
  }
})();
