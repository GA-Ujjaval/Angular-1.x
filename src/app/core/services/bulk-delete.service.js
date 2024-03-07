(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('bulkDelete', bulkDelete);

  /** @ngInject */
  function bulkDelete($mdDialog, helpSettingService, CustomerService, hostUrlDevelopment, AuthService, $q) {

    //For Session---------------------------------------------------------------------------------------------------
    var sessionData = AuthService.getSessionData('customerData');


    var service = {
      deleteItems: deleteItems,
      removeRows: removeRows,
      removeAllBoms: removeAllBoms,
      removeAllSourcing: removeAllSourcing
    };

    return service;


    function deleteItems(selectedRows, notAll) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to Delete selected objects?')
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function () {

        $mdDialog.show({
          controller: 'BulkDeleteController',
          controllerAs: 'vm',
          templateUrl: 'app/main/apps/objects/bulk-delete/bulk-delete.html',
          clickOutsideToClose: false,
          locals: {
            selectedRows: selectedRows,
            isRemoveQuantitiesFlatView: false,
            params: {notAll: notAll},
            targetQuatity: ''
          }
        }).then(function (val) {
          helpSettingService.addData(val);
        }, function () {
        });
      }, function () {
      });
    }

    function removeRows(arr, rows) {
      _.remove(arr, function (val) {
        return _.find(rows, function (id) {
          return id == val.objectId || id == val.parentObjectId;
        });
      });
    }

    function removeAllBoms(obj) {
      var sessionData = AuthService.getSessionData('customerData');
      var deferred = $q.defer();

      var headers = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      };

      var params;

      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectId: obj.objectId
        };
      } else {
        params = {
          customerId: sessionData.userId,
          objectId: obj.objectId
        };
      }
      CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeallbom, params, '', headers)
        .then(function () {
          if (obj.mfrPartsList.length || obj.suppPartsList.length) {
            removeAllSourcing(obj).then(function () {
              deferred.resolve();
            });
          } else {
            deferred.resolve();
          }
        })
        .catch(function () {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
      return deferred.promise;
    }

    function removeAllSourcing(obj) {
      var deferred = $q.defer();
      var sourcingIndex;

      if (obj.mfrPartsList.length) {
        sourcingIndex = 0;
        removeSourcing(obj, obj.mfrPartsList[0], true);
      } else {
        sourcingIndex = 0;
        removeSourcing(obj, obj.suppPartsList[0]);
      }

      function removeSourcing(obj, sourceObj, mfrFlag) {
        var sessionData = AuthService.getSessionData('customerData');
        var headers = {
          authId: sessionData.authId,
          channel_name: sessionData.channel_name,
          proxy: sessionData.proxy
        };

        var params;

        if (sessionData.proxy == true) {
          params = {
            customerId: sessionData.customerAdminId,
            objectId: obj.objectId,
            sourceObjectId: sourceObj.objectId
          };
        } else {
          params = {
            customerId: sessionData.userId,
            objectId: obj.objectId,
            sourceObjectId: sourceObj.objectId
          };
        }

        CustomerService.addNewMember('POST', hostUrlDevelopment.test.removeassociatesourcing, params, '', headers)
          .then(function (response) {
            sourcingIndex++;
            if (mfrFlag) {
              if (obj.mfrPartsList.length != sourcingIndex) {
                removeSourcing(obj, obj.mfrPartsList[sourcingIndex], true);
              } else if (obj.suppPartsList.length) {
                sourcingIndex = 0;
                removeSourcing(obj, obj.suppPartsList[0]);
              } else {
                deferred.resolve(response);
              }
            } else {
              if (obj.suppPartsList.length != sourcingIndex) {
                removeSourcing(obj, obj.suppPartsList[sourcingIndex]);
              } else {
                deferred.resolve(response);
              }
            }
          })
          .catch(function (response) {
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      }

      return deferred.promise;
    }


  }
}());
