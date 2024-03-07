(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('blobService', blobService);


  /** @ngInject */
  function blobService() {
    const service = {
      download
    };

    const mimes = {
      'pdf': 'application/pdf',
      'csv': 'text/csv;charset=UTF-8'
    };

    const extensions = {
      'pdf': '.pdf',
      'csv': '.csv'
    };

    function download(binData, type, fileName) {
      const contentType = mimes[type];
      const blob = new Blob([binData], {type: contentType});
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName}${extensions[type]}`;
      document.body.appendChild(link);
      link.click();
    }

    return service;
  }
})();
