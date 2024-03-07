(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('advancedNumberingStateService', advancedNumberingStateService);

  function advancedNumberingStateService(CachingMap, $rootScope) {

    function TouchedRowsCache() {
      let storage = [];
      this.push = function (newRow) {
        const oldCachedRow = _.find(storage, {categoryId: newRow.categoryId});
        if (!oldCachedRow) {
          storage.push(newRow);
          return;
        }
        if (oldCachedRow !== newRow) {
          const oldRowIndex = _.findIndex(storage, {categoryId: oldCachedRow.categoryId});
          storage[oldRowIndex] = newRow;
        }
      };
      this.invalidate = function () {
        storage.length = 0;
      };
      this.isValid = function () {
        if (storage.length === 0) {
          return true;
        }
        return !storage.some(isRowValid);
      };
      const isRowValid = (row) => row.scheme === 'custom' && (!row.prefix || !row.increment || !row.startingNumber);
    }

    /**
     * Class to hold data about initial vlaues of schemes
     * (it is not considering currentSchemeInUse chosen, just values, which can be filled in)
     * @constructor
     */
    function SchemeBackup() {
      CachingMap.apply(this, arguments);
    }

    SchemeBackup.prototype = Object.create(CachingMap.prototype);
    SchemeBackup.prototype.get = function (schemeType) {
      const cache = this.cache;
      if (!schemeType) {
        return _.cloneDeep(cache);
      }
      return _.cloneDeep(cache[schemeType]);
    };

    function isDiscardAvailable() {
      return mode.isEditable();
    }

    /**
     * Cache to hold current mode in use
     * @constructor
     */
    function Mode() {
      let currentMode;

      this.set = function (newMode) {
        currentMode = newMode;
      };
      this.isEditable = function () {
        return currentMode === 'edit';
      };
      this.get = function () {
        return currentMode;
      }
    }

    /**
     * Cache to check whether the 'save' button is disabled
     * @constructor
     */
    function ValidationCache() {
      CachingMap.apply(this, arguments);
    }

    ValidationCache.prototype = Object.create(CachingMap.prototype);
    ValidationCache.prototype.set = function (key, value) {
      this.cache[key] = _.cloneDeep(value);
    };
    ValidationCache.prototype.isValid = function isValid() {
      const isMainPartValid = !_.some(this.cache, this.isSchemeInvalid);
      const isTablePartValid = touchedRowsCache.isValid();

      return isTablePartValid && isMainPartValid;
    };

    ValidationCache.prototype.isSchemeInvalid = function (schemeData, schemeName) {
      // schemes other than 'parts' can have numberingScheme as 'parts'.
      // and only the 'parts' scheme has numberingScheme as null
      if (schemeData.numberingScheme === 'parts') {
        return false;
      }
      if (schemeData.numberingScheme === null && schemeName !== 'parts') {
        return false;
      }
      if (((!schemeData.startingNumber || !schemeData.prefix || !schemeData.increment) && schemeData.numberingScheme !== null) ||
        (schemeData.numberingScheme === null && (!schemeData.startingNumber || !schemeData.increment))) {
        return true;
      }
      return !isNumber(schemeData.startingNumber);
    };

    function isNumber(value) {
      return !isNaN(value);
    }

    function isEditable(objectType) {
      return mode.isEditable() && (currentSchemeInUse.get(objectType) !== 'parts');
    }

    function isTableHasCustomSchemes() {
      return new Promise((resolve) => {
        const deleter = $rootScope.$on('categoryTable:mf-advanced-numbering', (event, rows) => {
          deleter();
          resolve(isTableHasCustomSchemesImpl(rows))
        });
        $rootScope.$broadcast('getCategoryTable:mf-advanced-numbering');
      })
    }

    function isTableHasCustomSchemesImpl(rows) {
      return rows.some((row) => row.scheme === 'custom' || row.scheme === 'parent');
    }

    /**
     * tracking current scheme in use (radio button) for all object types
     */
    const currentSchemeInUse = new CachingMap();
    const schemeBackup = new SchemeBackup();
    const mode = new Mode();
    const validator = new ValidationCache();
    const touchedRowsCache = new TouchedRowsCache();
    const lastValidSchemeCache = new CachingMap();
    const lastValidTableSchemeCache = new CachingMap();

    return {
      isDiscardAvailable,
      isEditable,
      isTableHasCustomSchemes,
      mode,
      currentSchemeInUse,
      schemeBackup,
      validator,
      touchedRowsCache,
      lastValidSchemeCache,
      lastValidTableSchemeCache
    };
  }
})();
