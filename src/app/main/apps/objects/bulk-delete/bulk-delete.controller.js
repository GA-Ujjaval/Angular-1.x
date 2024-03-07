(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('BulkDeleteController', BulkDeleteController);


  function BulkDeleteController ($mdDialog, $timeout, $scope, CustomerService, $mdToast, AuthService, selectedRows, MainTablesService, params,
                                 hostUrlDevelopment, $q, errors, bulkDelete, fuseUtils, isRemoveQuantitiesFlatView, $stateParams, $rootScope,
                                 BomService, targetQuatity, ScrumboardService) {

    var vm = this;

    //For Session---------------------------------------------------------------------------------------------------
    var sessionData = AuthService.getSessionData('customerData');
    let header = {
      authId: sessionData.authId,
      channel_name: sessionData.channel_name,
      proxy: sessionData.proxy
    };

    // Data
    var parentPartId = $stateParams.id || null;
    vm.isRemoveQuantitiesFlatView = isRemoveQuantitiesFlatView;
    vm.errorCount = 0;
    vm.successCount = 0;
    vm.allRows = selectedRows.length;
    var objectIdBOM = $stateParams.id;
    vm.error = errors;
    var count = 0,
        removedRows = [];
    var changedParts = [];
    vm.params = params;

    var headers = {
      authId: sessionData.authId,
      channel_name: sessionData.channel_name,
      proxy: sessionData.proxy
    };
    //Methods
    vm.closeDialog = closeDialog;
    vm.abortProcess = abortProcess;
    vm.broadcastRefreshing = broadcastRefreshing;

    vm.bulkDeleteTableOptions = {
      initialized: false,
      columnDefs: buildBulkDeleteColumns(),
      data: selectedRows,
      rowHeight: 30,
      paginationPageSize: 100,
      paginationPageSizes: [
        {label: '25', value: 25},
        {label: '50', value: 50},
        {label: '75', value: 75},
        {label: '100', value: 100}
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      enableFiltering: true,
      enableSorting: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.bulkDeleteUiGrid = gridApi;

        var paginationApi = vm.bulkDeleteUiGrid.pagination;
        paginationApi.bulkTypePagination = true;

        vm.bulkDeleteUiGrid.core.on.renderingComplete($scope, function() {
          if ((vm.bulkDeleteTableOptions.data.length > 0) && !vm.bulkDeleteTableOptions.initialized) {
            $timeout(function() {
              vm.bulkDeleteTableOptions.initialized = true;
              if(vm.allRows) {
                vm.progress = true;
                if(isRemoveQuantitiesFlatView && params.operationType !== 'addToBom'){
                  removeQuantityOnHand(selectedRows[0]);
                }else if(params.operationType === 'addToBom'){
                  addPartToBom(selectedRows[0]);
                }else if(params.operationType === 'addNewRowToBomMatrix') {
                  addRowToBomMatrix(selectedRows[0]);
                }else if (params.operationType === 'addToCard') {
                  addPartToCard(selectedRows[0]);
                }else {
                  initDeletion(selectedRows[0]);
                }
              }
            });
          }

        });
      }
    };

    function buildBulkDeleteColumns() {
      var configCol = {
        field: 'configName',
        displayName: 'Configuration',
        width: 150,
      };

      var partNameCol =  {
          field: 'objectNumber',
          displayName: 'Part Number',
          width: 150,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/bulk-delete-object-number-cell.html'
        };
      return  [
        params.operationType === 'addNewRowToBomMatrix' ? configCol : partNameCol,
        {
          field: 'revision',
          displayName: 'Revision',
          width: 100
        },
        {
          field: 'deleteStatus',
          displayName: 'Status',
          width: 100
        },
        {
          field: 'message',
          displayName: 'Message'
        }
      ];
    }

    var clickCounter = 0;
    function closeDialog() {
      $mdDialog.hide(removedRows);

      if(params.operationType === 'addToBom' && !clickCounter){
        clickCounter++;
        $rootScope.$broadcast('refreshContent');
      }

      if(params.operationType === 'addToCard' && !clickCounter){
        clickCounter++;
        $rootScope.$broadcast('refreshContentInCard');
      }

      if(params.operationType === 'addNewRowToBomMatrix'){
        $rootScope.$broadcast('row added')
      }
      // $rootScope.$broadcast('updateTimeLIne', changedParts);
    }

    function abortProcess(processName) {
      vm.abort = true;
      $mdDialog.show({
        multiple: true,
        template: '<md-dialog>' +
        '<md-dialog-content>' +
        '<h2 class="md-title ng-binding">Do you want to abort '+processName+' process?</h2>' +
        '</md-dialog-content>' +
        '<md-dialog-actions>' +
        '<md-button ng-click="vm.closeDialog()" class="md-primary">' +
        'No' +
        '</md-button>' +
        '<md-button ng-click="vm.closeDialog(true)" class="md-primary">Yes</md-button>' +
        '</md-dialog-actions>' +
        '</md-dialog>',
        controller: function($mdDialog){
          var vm = this;
          vm.closeDialog = function(flag){
            if(flag){
              $mdDialog.cancel();
            }else{
              $mdDialog.hide();
            }
          }
        },
        controllerAs: 'vm',
        skipHide: true,
        clickOutsideToClose: false
      }).then(function() {
        vm.abort = false;
        if(!isRemoveQuantitiesFlatView){
          if (params.operationType === 'addToCard') {
            addPartToCard(selectedRows[count]);
          } else {
            initDeletion(selectedRows[count]);
          }
        }else{
          removeQuantityOnHand(selectedRows[count]);
        }
      }, function() {
        $mdDialog.hide();
        vm.progress = false;
        if (params.operationType === 'addToCard') {
          reloadCardInfo();
        } else {
          reloadBOMTable();
        }

      });
    }

    function reloadBOMTable(){
      $rootScope.$broadcast('reloadBOMTable');
    }

    function reloadCardInfo(){
      $rootScope.$broadcast('updateAffectedObjects');
    }

    const matcherParams = {
      bom: 'bomId',
      source: 'objectId',
      sourcePart: 'objectId',
      fuse: 'objectId'
    };

    const matcherEndPoint = {
      bom: 'removebom',
      source: 'deletesourcingobject',
      sourcePart: 'deletesourceobject',
      fuse: 'removefuseobject'
    };

    function deleteProcess(id, type) {
      vm.progress = true;

        params = {
          customerId: sessionData.proxy === true ? sessionData.customerAdminId : sessionData.userId
        };
        params[matcherParams[type]] = id;

      CustomerService.addNewMember('POST', hostUrlDevelopment.test[matcherEndPoint[type]], params, '', headers)
        .then(function(response) {
          selectedRows[count].message = response.message;
          if(response.code === 16){
            selectedRows[count].deleteStatus = 'Error';
            vm.errorCount++;
          }else{
            selectedRows[count].deleteStatus = 'Success';
            selectedRows[count].message = 'Successfully deleted';
            vm.successCount++;
            removedRows.push(selectedRows[count].objectId);
          }
          count++;
          MainTablesService.removeCache();
          scrollAnimate(initDeletion);
        })
        .catch(function() {
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function scrollAnimate(callback) {
      if(count === selectedRows.length){
        vm.progressCompleted = true;
        if (params.operationType === 'addToCard') {
          $rootScope.$broadcast('updateAffectedObjects');
        }
      }

      if(vm.errorCount + vm.successCount === vm.allRows){
        vm.progress = false;
        angular.element('#bulk-popup .ui-grid-viewport').animate({scrollTop : angular.element('#bulk-popup .ui-grid-canvas').height()});
      }else{
        vm.bulkDeleteUiGrid.core.scrollToIfNecessary(vm.bulkDeleteUiGrid.grid.getRow(vm.bulkDeleteTableOptions.data[count + 1]), null);
      }

      if((count <= vm.allRows - 1) && !vm.abort){
        callback(selectedRows[count]);
      }
    }

    function initDeletion(row) {
      if (row.status !== 'InDevelopment' && row.status !== '' && !row.bomId) {

        row.message = 'Can not delete Released/Obsolete Object';
        row.deleteStatus = 'Error';
        count ++;
        vm.errorCount++;
        scrollAnimate(initDeletion);

      } else if (row.hasWhereUsed && !row.bomId) {

        row.message = 'Can not delete Part/Product because it is associated with a card/bill-of-material.';
        row.deleteStatus = 'Error';
        count ++;
        vm.errorCount++;
        scrollAnimate(initDeletion);

      } else if (row.objectType === 'manufacturerPart' || row.objectType === 'supplierPart') {
        deleteProcess(row.objectId, 'sourcePart');
      } else if (row.objectType === 'manufacturer' || row.objectType === 'supplier') {
        deleteProcess(row.objectId, 'source');
      } else if (row.bomId && vm.params.notAll === true) {
        deleteProcess(row.bomId, 'bom');
      } else {
        var promises = [];

        if (row.hasBOM === 'Yes') {
          promises.push(bulkDelete.removeAllBoms(row));
        }else if (row.mfrPartsList.length || row.suppPartsList.length) {
          promises.push(bulkDelete.removeAllSourcing(row));
        }

        $q.all(promises).then(function () {
          deleteProcess(row.objectId, 'fuse')
        });
      }
    }

    function removeQuantityOnHand(row){
      var params;
      params = {
        objectIdInventory: row.objectId,
        objectIdBOM: objectIdBOM,
        totalreqQty: row.requiredQty
      };

      if (sessionData.proxy === true) {
        params.customerId = sessionData.customerAdminId
      } else {
        params.customerId = sessionData.userId
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.updateinventoryfrombom, params, '', headers)
        .then(function(response){
          if(response.code === 0) {
            selectedRows[count].deleteStatus = 'Success';
            selectedRows[count].message = 'Successfully changed';
            vm.successCount++;
            changedParts.push(response.data);
          }else if(response.code === 1006){
            selectedRows[count].deleteStatus = 'Error';
            selectedRows[count].message = response.message;
            vm.errorCount++;
          }else{
            selectedRows[count].deleteStatus = 'Error';
            selectedRows[count].message = response.message;
            vm.errorCount++;
          }
          count++;
          scrollAnimate(removeQuantityOnHand);
          // Update timeline when remove quantities from inventory.
          if (!vm.progress) {
            updateTimeline(objectIdBOM);
          }
        })
    }

    function broadcastRefreshing(){
      $rootScope.$broadcast('quantities removed', changedParts);
      changedParts = [];
    }

    function addPartToCard(row) {
      let param = {};
      if (sessionData.proxy === true) {
        param = {
          customerId: sessionData.customerAdminId,
          cardId: params.card.id
        };
      } else {
        param = {
          customerId: sessionData.userId,
          cardId: params.card.id
        };
      }
      let data = {
        id: row.objectId,
        color: 'Red',
        name: row.displayObjectId
      };
      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemcard, param, data, header)
        .then(function(res){
          if(res.code === 0){
            selectedRows[count].deleteStatus = 'Success';
            selectedRows[count].message = 'Successfully added';
            vm.successCount++;
          }else{
            selectedRows[count].deleteStatus = 'Error';
            selectedRows[count].message = res.message;
            vm.errorCount++;
          }
          count++;
          scrollAnimate(addPartToCard);
        });
    }

    function addPartToBom(row){
      if(!row.objectKey){
        row.objectKey = row.objectId;
      }

      row.refDocs = row.refDocs || '';
      row.refDocs = row.refDocs.trim().split(',');
      row.refDocs.map(function(refDes, i){
        if(refDes){
          row.refDocs[i] = refDes.trim();
        }else{
          row.refDocs[i] = 'fuse. this ref des does not exist';
        }
      });

      row.referenceDesignator = _.filter(row.refDocs, function(refDes){ return refDes !== 'fuse. this ref des does not exist' });
      BomService.addPartToBom(parentPartId, row)
        .then(function(res){
          if(res.code === 0){
            selectedRows[count].deleteStatus = 'Success';
            selectedRows[count].message = 'Successfully added';
            vm.successCount++;
          }else{
            selectedRows[count].deleteStatus = 'Error';
            selectedRows[count].message = res.message;
            vm.errorCount++;
          }
          count++;
          scrollAnimate(addPartToBom);
        })
    }

    function addRowToBomMatrix(parentPart){
      if(!parentPart.objectKey){
        parentPart.objectKey = parentPart.objectId;
      }
      BomService.addPartToBom(parentPart.objectKey, params.partToAdd)
        .then(function(res){
          if(res.code === 0){
            selectedRows[count].deleteStatus = 'Success';
            selectedRows[count].message = 'Successfully added';
            vm.successCount++;
          }else{
            selectedRows[count].deleteStatus = 'Error';
            selectedRows[count].message = res.message;
            vm.errorCount++;
          }
          count++;
          scrollAnimate(addRowToBomMatrix);
        })
    }

    // Update timeline when remove quantities from inventory.
    function updateTimeline(objectIdBOM) {
      var params;
      params = {
        objectIdBOM: objectIdBOM,
        totalreqQty: targetQuatity
      };

      if (sessionData.proxy === true) {
        params.customerId = sessionData.customerAdminId
      } else {
        params.customerId = sessionData.userId
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.addtimelinetobom, params, '', headers)
        .then(function(response){
          if(response.code === 0) {
            $rootScope.$broadcast('updateTimeLIne', response.data);
          }
        });
    }
  }

})();
