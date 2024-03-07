(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('localstorageCheckingService', localstorageCheckingService);


  /** @ngInject */
  function localstorageCheckingService(objectPageEnum) {

    const service = {
      isLocalStorageValid
    };

    /**
     * State machine which checks whether local storage for bom is valid or not
     * @constructor
     */
    function LocalStorageChecker(){

      var activeState;

      this.check = check;

      function check(opts){
        activeState = start;
        while((activeState !== valid) && (activeState !== invalid)){
          activeState(opts);
        }
        return activeState();
      }

      function start(opts){
        if(opts.basicInfo && opts.basicInfo !== 'null' && opts.basicInfo !== 'undefined'){
          activeState = basicInfo;
        }else{
          activeState = invalid;
        }
      }
      function basicInfo(opts){
        if(opts.pageType === objectPageEnum.heirarchicalPage){
          activeState = hierarchicalPage;
        }else{
          activeState = notHierarchicalPage;
        }
      }
      function hierarchicalPage(opts){
        if(opts.basicInfo.indexOf('level') !== -1){
          activeState = hasLevel;
        }else{
          activeState = invalid;
        }
      }
      function notHierarchicalPage(opts){
        if(opts.basicInfo.indexOf('level') === -1){
          activeState = hasNoLevel;
        }else{
          activeState = invalid;
        }
      }
      function hasLevel(opts){
        if(opts.isConfigEnabled){
          activeState = configEnabled;
        }else{
          activeState = configDisabled;
        }
      }
      function hasNoLevel(opts){
        if(opts.isConfigEnabled){
          activeState = configEnabled;
        }else{
          activeState = configDisabled;
        }
      }
      function configEnabled(opts){
        if(opts.basicInfo.indexOf('Configuration') !== -1){
          activeState = hasConfig;
        }else{
          activeState = invalid;
        }
      }
      function configDisabled(opts){
        if(opts.basicInfo.indexOf('Configuration') === -1){
          activeState = hasNoConfig;
        }else{
          activeState = invalid;
        }
      }
      function hasConfig(opts){
        if(opts.basicInfo.indexOf('associatedCardsList') !== -1){
          activeState = hasCards;
        }else{
          activeState = invalid;
        }
      }
      function hasNoConfig(opts){
        if(opts.basicInfo.indexOf('associatedCardsList') !== -1){
          activeState = hasCards;
        }else{
          activeState = invalid;
        }
      }
      function hasCards(opts){
        activeState = valid;
      }

      function valid(opts){ return true}
      function invalid(opts){ return false}

    }

    /**
     * Check whether the local storage data is valid
     * @param settings {object} with properties:
     *   - basicInfo - json to check from local storage
     *   - pageType {string} - the type of the page to check for (flat or hierarchical)
     *   - isConfigEnabled {boolean} - whether configurations are enabled or disabled
     * @returns {void|*}
     */
    function isLocalStorageValid(settings){
      const checker = new LocalStorageChecker();
      return checker.check(settings);
    }

    return service;
  }
})();

