(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('MainTablesService', MainTablesService);


  /** @ngInject */
  function MainTablesService(CustomerService, hostUrlDevelopment) {

    var service = {
      getAllFuseObjects: getAllFuseObjects,
      getFuseParts: getFuseParts,
      removeCache: removeCache,
      getFuseDocuments: getFuseDocuments,
      getFuseProducts: getFuseProducts,
      getAllFuseObjectsWhereusedCheck: getAllFuseObjectsWhereusedCheck,
      getallfuseobjectcustom: getallfuseobjectcustom
    };


    function removeCache() {
    }

    function getAllFuseObjects() {
      const params = {
        fuseObjectType: ''
      };
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '')
    }

    function getFuseParts(size) {
      const params = {
        fuseObjectType: 'parts',
        defaultObjectCount: size
      };
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '')
    }

    function getFuseDocuments(size) {
      const params = {
        fuseObjectType: 'documents',
        defaultObjectCount: size
      };
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '')
    }

    function getFuseProducts(size) {
      const params = {
        fuseObjectType: 'products',
        defaultObjectCount: size
      };

      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '')
    }

    function getAllFuseObjectsWhereusedCheck(id, products) {
      const params = {
        oType: products.objectType,
        oId: id,
        oData: 'wu'
      };
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '')
    }

    function getallfuseobjectcustom() {
      const params = {
        fuseObjectType: ''
      };
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobjectcustom, params, '')
    }

    return service;
  }
})
();
