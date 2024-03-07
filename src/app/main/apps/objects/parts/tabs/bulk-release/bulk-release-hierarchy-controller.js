(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('BulkReleaseController', BulkReleaseController);


  function BulkReleaseController ($mdDialog, $timeout, $scope, CustomerService, $mdToast, AuthService, Objects, status, MainTablesService,
                                 hostUrlDevelopment, errors, fuseUtils, isBulkRelease, $filter, $rootScope, isHierarchicalBulkRelease) {

    var vm = this;

    vm.$rootScope = $rootScope;

    //For Session---------------------------------------------------------------------------------------------------
    var sessionData = AuthService.getSessionData('customerData');
    var params = '';
    var flattenArr = null;
    // Data
    vm.errorCount = 0;
    vm.successCount = 0;
    var count = 0;
    var mainObjectsLength = Objects.length;
    var currentMainObjectIndex = 0;

    vm.status = status;

    vm.statusText = 'Status Change (Released)';

    if (vm.status === 'InDevelopment') {
      vm.statusText = 'Status Change (InDevelopment)';
    } else if (vm.status === 'Obsolete') {
      vm.statusText = 'Status Change (Obsolete)';
    }

    vm.Objects = Objects;
    vm.isBulkRelease = isBulkRelease;
    //Methods
    vm.closeDialog = closeDialog;
    vm.abortRelease = abortRelease;
    vm.broadcastBulkRelease = broadcastBulkRelease;

    if(isHierarchicalBulkRelease) {
      Objects.forEach(function (row) {
        row.$$treeLevel = 0;
      });
    }else{
      Objects.forEach(function (row) {
        row.$$treeLevel = undefined;
      });
    }

    var headers = {
      authId: sessionData.authId,
      channel_name: sessionData.channel_name,
      proxy: sessionData.proxy
    };

    function release(row) {
      vm.progress = true;

      if(Objects[count].status === vm.status){
        Objects[count].releaseStatus = 'Success';
        Objects[count].message = `Object already has the status (${vm.status})`;
        vm.successCount++;
        count++;
        scrollAnimate();
        return;
      }

      var params;

      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          isReleased: true
        }
      } else {
        params = {
          customerId: sessionData.userId,
          isReleased: true
        }
      }

      var data = {
        objectId: row.objectId,
        status: vm.status
      };

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.changestatus, params, data, headers)
        .then(function(response) {
          if (response.code === 0) {
            Objects[count].releaseStatus = 'Success';
            Objects[count].message = `Successfully ${vm.statusText}`;
            vm.successCount++;
            MainTablesService.removeCache();
          } else if (response.code === 1006) {
            Objects[count].releaseStatus = 'Error';
            Objects[count].message = response.message;
            vm.errorCount++;
          } else {
            Objects[count].releaseStatus = 'Error';
            Objects[count].message = 'Error';
            vm.errorCount++;
          }
          count++;
          scrollAnimate();
        })
        .catch(function() {
          $mdToast.show($mdToast.simple().textContent(errors.erCatch).position('top right'));
          vm.progress = false;
        });
    }

    vm.bulkReleaseTableOptions = {
      initialized: false,
      treeIndent: 15,
      showTreeExpandNoChildren: false,
      columnDefs: buildBulkReleaseColumns(),
      data: Objects,
      rowHeight: 30,
      paginationPageSize: 100,
      paginationPageSizes: [
        {label: '25', value: 25},
        {label: '50', value: 50},
        {label: '75', value: 75},
        {label: '100', value: 100}
      ],
      paginationTemplate: 'app/main/apps/objects/module-templates/pagination/part-pagination.html',
      totalParentItems: Objects.length,
      enableFiltering: true,
      enableSorting: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      onRegisterApi: function (gridApi) {

        // Keep a reference to the gridApi.
        vm.bulkReleaseUiGrid = gridApi;

        var paginationApi = vm.bulkReleaseUiGrid.pagination;
        paginationApi.bulkTypePagination = true;

        vm.bulkReleaseUiGrid.core.on.renderingComplete($scope, function() {
          if ((vm.bulkReleaseTableOptions.data.length > 0) && !vm.bulkReleaseTableOptions.initialized) {
            $timeout(function() {
              vm.bulkReleaseTableOptions.initialized = true;
              if(Objects.length) {
                vm.progress = true;
                if(isHierarchicalBulkRelease) {
                  Objects.forEach(function (part) {
                    fillInTable(part);
                  });
                }else{
                  release(Objects[0]);
                }
              }
            });
          }

        });
      }
    };

    function buildBulkReleaseColumns() {
      var columnsForIndividualRelease =  [
        {
          field: 'objectNumber',
          displayName: 'Part Number',
          width: 150,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/object-number-cell-for-bulk-release.html'
        },
        {
          field: 'revision',
          displayName: 'Revision',
          width: 100
        },
        {
          field: 'releaseStatus',
          displayName: 'Status',
          width: 100
        },
        {
          field: 'message',
          displayName: 'Message'
        }
      ];

      if(isBulkRelease){
        columnsForIndividualRelease.unshift({
          field: "checkbox",
          displayName: "",
          width:70,
          cellTemplate: 'app/main/apps/objects/parts/tabs/bulk-release/cell-templates/checkbox-template.html',
          enableFiltering: false,
          enableSorting: false
        });

        var columnsForBulkRelease = columnsForIndividualRelease;
        return columnsForBulkRelease;
      }

      return columnsForIndividualRelease;
    }

    function closeDialog() {
      $mdDialog.hide();
    }

    function abortRelease() {
      vm.abort = true;
      $mdDialog.show({
        multiple: true,
        template: '<md-dialog>' +
        '<md-dialog-content>' +
        '<h2 class="md-title ng-binding">Do you want to abort bulk release process?</h2>' +
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
        release(Objects[count]);
      }, function() {
        broadcastBulkRelease();
        $mdDialog.hide();
        vm.progress = false;
      });
    }

    function scrollAnimate() {
      if(vm.errorCount + vm.successCount == Objects.length){
        vm.progress = false;
        angular.element('#bulk-popup .ui-grid-viewport').animate({scrollTop : angular.element('#bulk-popup .ui-grid-canvas').height()});
      }else{
        vm.bulkReleaseUiGrid.core.scrollToIfNecessary(vm.bulkReleaseUiGrid.grid.getRow(vm.bulkReleaseTableOptions.data[count + 1]), null);
      }

      if((count <= Objects.length - 1) && !vm.abort){
        release(Objects[count]);
      }
    }

    function fillInTable(part) {
      var objectId = part.objectId;

      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectId: objectId
        };
      } else {
        params = {
          customerId: sessionData.userId,
          objectId: objectId
        };
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.getallfuseobjectdata, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          switch (response.code) {
            case 0:
              vm.boms = [];
              vm.boms = _.concat(vm.boms, buildExtendedObject(response.data));

              var maxLevel = 0;
              var bomsLength = vm.boms.length;

              for(var n = 0 ; n < bomsLength; n++) {
                if (vm.boms[n].objectType === 'documents') {
                  vm.boms[n].objectNumber = 'Document: ' + vm.boms[n].objectNumber;
                  var document = vm.boms.splice(n, 1)[0];
                  vm.boms.push(document);
                  bomsLength--;

                  document.$$treeLevel = 1;
                }

                if(maxLevel < vm.boms[n].level){
                  maxLevel = vm.boms[n].level;
                }
              }

              for(var ind = 0; ind < vm.bulkReleaseTableOptions.data.length; ind++){
                if(Objects[ind].objectId === objectId)
                  break;
              }

              //to escape having two equal rows in end and in start of table
              vm.boms.splice(0,1);

              vm.boms.forEach(function(row, i){
                var padding = '';
                for(var j = 0; j < row.level; j++){
                  padding += '  ';
                }
                row.objectNumber = padding + row.objectNumber;

                if(row.level < maxLevel) {
                  row.$$treeLevel = row.level;
                }

              });

              vm.boms.forEach(function(row){
                Objects.splice(ind+1, 0, row);
                ind++;
              });

              if((currentMainObjectIndex === mainObjectsLength - 1)) {
                vm.progress = false;
                release(Objects[0]);
              }
              currentMainObjectIndex++;
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          vm.hierarchicalViewProgressBar = false;
          vm.sourcingViewProgressBar = false;
          $mdToast.show($mdToast.simple().textContent(errors.erCatch).position('top right'));
        });
    }

    function buildExtendedObject(obj) {

      var arr = [];

      extendObject(obj, 0, arr);

      return arr;
    }

    function extendObject(obj, level, arr, parentId, ancestors) {

      angular.forEach(obj, function (row) {

        row.level = level;

        if (row.level === 0) {
          row.disabledSelect = (row.status === 'InDevelopment');
          row.selected = (row.status === 'InDevelopment')
        }

        if (level > 0) {
          row.ancestors = ancestors ? angular.copy(ancestors) : {};
          row.ancestors[level-1] = parentId;
        }

        arr.push(row);

        if( (row.docResponse && row.docResponse.length > 0) || (row.bomResponse && row.bomResponse.length > 0) ){
          var newLevel = angular.copy(level);
          newLevel++;
          row.parent = true;

          if(row.docResponse && row.docResponse.length > 0){
            extendObject(row.docResponse, newLevel, arr, row.objectId, row.ancestors);
          }

          if(row.bomResponse && row.bomResponse.length > 0){
            extendObject(row.bomResponse, newLevel, arr, row.objectId, row.ancestors);
          }
        }

      });
    }

    function broadcastBulkRelease(){
      $rootScope.$broadcast('bulkRelease', vm.successCount);
    }

  }



})();
