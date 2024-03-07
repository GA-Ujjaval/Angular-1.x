(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('BomService', BomService);


  /** @ngInject */
  function BomService(CustomerService, hostUrlDevelopment, AuthService) {
    var service = {
      removePartFromBom: removePartFromBom,
      addPartToBom: addPartToBom,
      getFuseObjectById: getFuseObjectById,
      getFuseObjectConfigurationsById: getFuseObjectConfigurationsById,
      changeConfiguration: changeConfiguration
    };


    var sessionData;
    var headers;

    /**
     * sets proper header for request. this is needed to handle situation,
     * when user logs out and then logs in as other user
     */
    function setAuthData() {
      sessionData = AuthService.getSessionData('customerData');
      headers = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      }
    }

    /**
     *
     * @param bomId - bom id of the parent part
     * @returns {*}
     */
    function removePartFromBom(bomId) {
      setAuthData();

      var params = {
        bomId: bomId
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.removebom, params, '', headers);
    }


    /**
     *
     * @param parentPartId - id of the parent part
     * @param childPart - object, which contains properties:
     *        bomId - the bomId of parentPart,
     *        objectKey - the id of the child part,
     *        bomPackage - 'location' field
     *        referenceDesignator - the array of reference designators
     *        quantity - the quantity of the part
     *        notes - notes attached to the part
     * @returns {*} promise
     */
    function addPartToBom(parentPartId, childPart) {
      setAuthData();

      var params;
      if (sessionData.proxy === true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectId: parentPartId
        }
      }
      else {
        params = {
          customerId: sessionData.userId,
          objectId: parentPartId
        }
      }
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatebom, params, childPart, headers)
    }

    function getFuseObjectById(objectId, level = 2) {
      setAuthData();
      var params;
      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          fuseObjectId: objectId,
          bomLevel: level
        };
      } else {
        params = {
          fuseObjectId: objectId,
          bomLevel: level
        };
      }

      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', headers)
        .then(function (res) {

          return new Promise(function (resolve, reject) {
            resolve(res);
          })
        }, function (err) {
          return new Promise(function (resolve, reject) {
            reject(err);
          })
        })
    }

    /**
     * @param id - the Fuse id of the object
     */
    function getFuseObjectConfigurationsById(id) {
      setAuthData();
      if (sessionData.proxy == true) {
        var params = {
          customerId: sessionData.customerAdminId,
          fuseObjectId: id
        };
      } else {

        var params = {
          userId: sessionData.userId,
          fuseObjectId: id
        };
      }
      return CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectconfigurationsbyid, params, '', headers)
    }

    /**
     * @param newConfigurationId - the id of new chosen part
     * @param row - row in the ui grid, which contain properties:
     *        bomId - the bomId of parentPart,
     *        objectId - the id of the parent part,
     *        objectKey - the id of the child part,
     *        bomPackage - 'location' field
     *        referenceDesignator - the array of reference designators
     *        quantity - the quantity of the part
     *        notes - notes attached to the part
     * @param id - the id of the parent part
     * @returns {*} promise
     */

    function changeConfiguration(newConfigurationId, row, id) {
      setAuthData();
      var params;
      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectId: id
        }
      }
      else {
        params = {
          customerId: sessionData.userId,
          objectId: id
        }
      }

      var data = {
        bomId: row.bomId,
        objectKey: newConfigurationId,
        bomPackage: row.bomPackage,
        referenceDesignator: row.referenceDesignator,
        quantity: row.quantity,
        notes: row.notes
      };

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.saveorupdatebom, params, data, headers);
    }


    return service;
  }
})();
