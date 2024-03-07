(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('ObjectsController', ObjectsController);

  /** @ngInject */
  function ObjectsController($state, CustomerService, hostUrlDevelopment, errors) {
    const vm = this;
    vm.progress = true;
    init();

    function init() {
      const params = {
        partNumber: $state.params.pn ? $state.params.pn : 'null',
        revision: $state.params.rev ? $state.params.rev : null,
        minorRevision: $state.params.mrev ? $state.params.mrev : null
      };
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.generateurlfromobjectnumber, params)
        .then(function (response) {
          if (response.code === 0 && !_.isEmpty(response.data)) {
            if (response.data.objectType === 'parts') {
              $state.go('app.objects.part.parts.basicInfo', {
                id: response.data.objectId
              });
            } else if (response.data.objectType === 'products') {
              $state.go('app.objects.products.details.basicInfo', {
                id: response.data.objectId
              });
            } else if (response.data.objectType === 'documents') {
              $state.go('app.objects.documents.details.basicInfo', {
                id: response.data.objectId
              });
            }
          } else {
            $state.go('app.customer.dashboard');
          }
        })
        .catch(function () {
          console.log(errors.erCatch);
          $state.go('app.customer.dashboard');
        });
    }
  }
})();
