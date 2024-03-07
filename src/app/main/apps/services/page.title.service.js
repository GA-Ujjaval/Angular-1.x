(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('pageTitleService', PageTitleService);

  function PageTitleService($rootScope) {

    const service = {
      setPageTitle: setPageTitle,
      setPageTitleInDetails: setPageTitleInDetails
    };

    function setPageTitle(newTitle) {
      $rootScope.$emit('changeTitleInDetails', {pageTitle: newTitle});
    }

    function setPageTitleInDetails(partNumber, revision, tabName) {
      $rootScope.$emit('changeTitleInDetails', {pageTitle: partNumber + (revision ? ' rev ' + revision : '') + (tabName ? '. ' + tabName : '')});
    }

    return service;
  }
})();
