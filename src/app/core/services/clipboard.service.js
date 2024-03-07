(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('clipboardService', clipboardService);

  /** @ngInject */
  function clipboardService(fuseUtils) {

    var service = {
      pushItem: pushItem,
      removeItem: removeItem,
      getAllSavedItems: getAllSavedItems,
      getItemsCount: getItemsCount,
      removeAllItems: removeAllItems
    };

    /**
     * holds the lengths of the clipboard for different users like this:
     * {user8: data, user123: data1}
     */
    var cacheLength = {};

    /**
     * Pushes arbitrary item to the localstorage
     * @param item - anything
     * @returns {string}
     */
    function pushItem(item) {
      try {
        var propertyName = fuseUtils.buildAttributeName('clipboard');
        var cache = getCache(propertyName);
        if (isItemSaved(item, cache))
          return;

        cache.push(item);
        setCache(cache);
        cacheLength[propertyName] = cache.length;
      } catch (e) {
        return 'limit is reached';
      }
    }

    /**
     * check if the item already saved.
     * it is needed to prevent from duplicates
     * @param item - anything
     * @param cache - localstorage content for a particular user
     * @returns {boolean}
     */
    function isItemSaved(item, cache) {
      return _.find(cache, {objectId: item.objectId}) ? true : false;
    }

    function removeItem(id) {
      var propertyName = fuseUtils.buildAttributeName('clipboard');
      var cache = getCache(propertyName);
      cache = _.filter(cache, function (part) {
        return part.objectId !== id
      });
      setCache(cache);
      cacheLength[propertyName] = cache.length;
    }

    function getAllSavedItems() {
      return getCache(fuseUtils.buildAttributeName('clipboard'));
    }

    function getItemsCount() {
      var propertyName = fuseUtils.buildAttributeName('clipboard');
      if (!cacheLength.hasOwnProperty(propertyName)) {
        initCacheLength(propertyName);
      }
      return angular.fromJson(localStorage.getItem(propertyName)) ? angular.fromJson(localStorage.getItem(propertyName)).length : 0;
    }

    function removeAllItems() {
      var propertyName = fuseUtils.buildAttributeName('clipboard');
      localStorage.removeItem(propertyName);
      cacheLength[propertyName] = 0;
    }

    function getCache(name) {
      return angular.fromJson(localStorage.getItem(name)) || [];
    }

    function setCache(cache) {
      localStorage.setItem(fuseUtils.buildAttributeName('clipboard'), angular.toJson(cache));
    }

    function initCacheLength(propertyName) {
      cacheLength[propertyName] = getCache(propertyName).length;
    }

    return service;
  }
}());
