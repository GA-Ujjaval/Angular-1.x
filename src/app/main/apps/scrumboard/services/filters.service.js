(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .factory('CardFilters', CardFiltersService);

  /** @ngInject */
  function CardFiltersService($rootScope) {
    //console.log('call');
    var service = {
      name: '',
      companySeqId: '',
      partName: '',
      partNumber: '',
      cardIds: [],
      labels: [],
      members: [],
      clear: clear,
      isOn: isOn
    };

    /**
     * Clear
     */
    function clear() {
      service.name = '';
      service.companySeqId = '';
      service.partName = '';
      service.partNumber = '';
      service.labels = [];
      service.cardIds = [];
      service.members = [];
      $rootScope.selectedFilter.dueDate = "ALL";
      $rootScope.filterCardDate($rootScope.selectedFilter.dueDate);
      $rootScope.$emit('boardLoaded', false);
      $rootScope.$emit('clearAll', true);
    }

    /**
     * Is on
     *
     * @returns {boolean}
     */
    function isOn() {
      return (!(service.name === '' && service.companySeqId === '' && service.partName === '' &&
        service.partNumber === '' && service.labels.length === 0 && service.members.length === 0));
    }

    return service;
  }
})();
