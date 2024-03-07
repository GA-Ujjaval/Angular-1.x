(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('CachingMap', CachingMap);

  /**
   * Caches the data in a map by keys, does deep copies of all values
   * @returns {Cache}
   */

  function CachingMap() {
    function Cache() {
      this.cache = {};
    }

    Cache.prototype.set = function (key, value) {
      this.cache[key] = _.cloneDeep(value);
    };
    Cache.prototype.get = function (key) {
      if (!key) {
        return _.cloneDeep(this.cache);
      }
      return _.cloneDeep(this.cache[key]);
    };
    Cache.prototype.invalidate = function () {
      this.cache = {};
    };

    return Cache;
  }
})();
