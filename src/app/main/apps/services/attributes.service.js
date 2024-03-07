(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('AttributesService', AttributesService);

  function AttributesService(CustomerService, hostUrlDevelopment, AuthService) {

    var service = {
      getAttributesList: getAttributesList,
      removeAttribute: removeAttribute,
      addOrUpdateAttribute: addOrUpdateAttribute,
      getAttributeDetailsById: getAttributeDetailsById
    };


    var sessionData;
    var headers;

    function setAuthData() {
      sessionData = AuthService.getSessionData('customerData');
      headers = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      }
    }

    function getAttributesList(incAttributesOfType) {
      var attributesOfType = incAttributesOfType || null;
      setAuthData();
      var params;
      if (sessionData.proxy === true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectType: attributesOfType
        }
      } else {
        params = {
          customerId: sessionData.userId,
          objectType: attributesOfType
        }
      }


      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getattributeslist, params, '', headers)
    }

    function getAttributeDetailsById(attributeId) {
      setAuthData();
      var params;
      if (sessionData.proxy === true) {
        params = {
          customerId: sessionData.customerAdminId,
          attributeId: attributeId
        }
      } else {
        params = {
          customerId: sessionData.userId,
          attributeId: attributeId
        }
      }
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getattributebyid, params, '', headers)
    }

    function removeAttribute(attId) {
      setAuthData();

      var params;
      if (sessionData.proxy === true) {
        params = {
          customerId: sessionData.customerAdminId,
          attributeId: attId
        }
      } else {
        params = {
          customerId: sessionData.userId,
          attributeId: attId
        }
      }
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeattribute, params, '', headers)
    }

    function addOrUpdateAttribute(params, data) {
      setAuthData();

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdateattribute, params, data, headers)
    }

    return service;
  }
})();

