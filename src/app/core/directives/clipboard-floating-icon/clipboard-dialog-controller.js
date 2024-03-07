(function () {
  angular
    .module('app.objects')
    .controller('ClipboardDialogController', ClipboardDialogController);

  function ClipboardDialogController(params, $scope, $mdDialog, attributesUtils, clipboardService, fuseUtils, AuthService, ScrumboardService, hostUrlDevelopment) {

    var vm = this;
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    let header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    vm.params = params;
    //methods
    vm.closeDialog = closeDialog;
    vm.removeItem = removeItem;
    vm.removeAllItems = removeAllItems;
    vm.addClipboardToBom = addClipboardToBom;
    vm.addClipboardToCard = addClipboardToCard;
    vm.closePopup = closePopup;



    vm.cardProgress = true;

    let param = {};


    if (params.isCard) {
      vm.clipboardTableOptions = {
        columnDefs: [],
        data: [],
        enableCellEdit: false,
        initialized: false,
        onRegisterApi: function (gridApi) {
          vm.clipboardUiGrid = gridApi;

          vm.clipboardUiGrid.core.on.rowsRendered($scope, function () {
            if ((vm.clipboardTableOptions.data.length > 0) && !vm.clipboardTableOptions.initialized) {
                vm.clipboardTableOptions.initialized = true;
                vm.cardProgress = false;
            }
          });
        }
      };
      let promises = [];
      _.forEach(params.rowsForGrid, row => {
        row.displayObjectId = `[ ${row.objectNumber}${row.configName ? ' - Config.: ' + row.configName : ''} - Rev. ${row.revision} ]   [ ${row.status} ]   ${row.objectName}`;
        if (vm.sessionData.proxy === true) {
          param = {
            customerId: vm.sessionData.customerAdminId,
            cardId: params.card.id
          };
        } else {
          param = {
            customerId: vm.sessionData.userId,
            cardId: params.card.id
          };
        }

        let data = {
          id: row.objectId,
          color: 'Red',
          name: row.displayObjectId
        };

        promises.push(ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.checkitemcard, param, data, header));
      });

      Promise.all(promises).then(responses => {
        _.forEach(responses, (response, index) => {
          if (response.code === 0) {
            if (response.data.length === 0) {
              params.rowsForGrid[index].cardStatus = 'Not Used';
            } else {
              params.rowsForGrid[index].cardStatus = 'Is Used';
              params.rowsForGrid[index].cardName = '';
              _.forEach(response.data, row => {
                params.rowsForGrid[index].cardName +=`Board: ${row.boardName}. Card: ${row.cardTitle}\n`;
              });
            }
          }
        });
      }).then(() => {
        vm.clipboardTableOptions.columnDefs = buildClipboardTableColumns();
        vm.clipboardTableOptions.data = buildClipboardTableData();
        vm.clipboardUiGrid.core.handleWindowResize();
      });
    } else {
      vm.clipboardTableOptions = {
        columnDefs: buildClipboardTableColumns(),
        data: buildClipboardTableData(),
        enableCellEdit: false,
        onRegisterApi: function (gridApi) {
          vm.clipboardUiGrid = gridApi;
        }
      };
    }

    function closeDialog() {
      $mdDialog.cancel();
    }

    function buildClipboardTableColumns() {
      var attributes = getAttributes();
      var columns = [];

      attributes.forEach(function (attr) {
        var colDef = fuseUtils.parseAttributes(attr);
        if (attr.value === 'deletion') {
          colDef.cellTemplate = 'app/core/directives/clipboard-floating-icon/clipboard-deletion-cell-template.html';
          colDef.headerCellTemplate = '<div class="clipboard-deletion-container"><md-tooltip class="md-tooltip">Remove item(s) from the clipboard</md-tooltip><img class="clipboard-deletion-icon" ng-click="grid.appScope.vm.removeAllItems()" src="assets/images/ecommerce/clear_grey_48x48.png"></div>';
          colDef.width = 40;
        }

        if (attr.value === 'objectType') {
          colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/part-type-cell-template.html';
          colDef.width = 70;
        }

        if (attr.value === 'bomPackage' || attr.value === 'quantity' || attr.value === 'refDocs' || attr.value === 'notes') {
          colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/clipboard-input-template.html';
          colDef.width = 105;
        }

        if (attr.value === 'configName') {
          colDef.width = 115;
        }
        if (attr.value === 'objectName') {
          colDef.width = 100;
        }
        if (attr.value === 'cardName') {
          colDef.cellTemplate = 'app/core/directives/clipboard-floating-icon/clipboard-card-where-used-template.html';
          colDef.width = 200;
        }
        if (attr.value === 'cardStatus') {
          colDef.width = 70;
        }
        if (attr.value === 'status') {
          colDef.width = 80;
        }
        if (attr.value === 'revision') {
          colDef.width = 90;
        }
        if (attr.value === 'objectNumber') {
          colDef.width = 115;
        }

        colDef.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (row.entity.objectType === 'documents' && params.isBom) {
            return 'grayed-out';
          }
        };

        columns.push(colDef);
      });

      return columns;
    }

    function getAttributes() {
      var attributes = params.isBom ? attributesUtils.getBomClipboardAttributes() : (params.isCard ? attributesUtils.getClipboardCardAttributes() : attributesUtils.getClipboardAttributes());
      return (params.isConfigEnabled) ? attributes : _.filter(attributes, function (attr) {
        return attr.value !== 'configName';
      });
    }

    function removeItem(item) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove the item from the clipboard?')
        .ariaLabel('clipboard-remove-confirm')
        .ok('Yes')
        .cancel('No')
        .multiple(true);

      $mdDialog.show(confirm).then(function () {
        clipboardService.removeItem(item.objectId);
        vm.clipboardTableOptions.data = removeItemFromTable(item.objectId, vm.clipboardTableOptions.data);
        if (!clipboardService.getItemsCount())
          $mdDialog.hide();
      }, function () {
      })

    }

    function removeItemFromTable(id, rows) {
      rows = _.filter(rows, function (row) {
        return row.objectId !== id
      });
      return rows;
    }

    function removeAllItems() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove all the items from the clipboard?')
        .ariaLabel('clipboard-remove-confirm')
        .ok('Yes')
        .cancel('No')
        .multiple(true);

      $mdDialog.show(confirm).then(function () {
        vm.clipboardTableOptions.data.length = 0;
        clipboardService.removeAllItems();
        $mdDialog.hide();
      }, function () {
      });
    }



    function buildClipboardTableData() {
      params.rowsForGrid.map(function (row) {
        row.quantity = 1;
      });
      return params.rowsForGrid;
    }

    function addClipboardToBom() {
      closePopup();
      $mdDialog.show({
        controller: 'BulkDeleteController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/bulk-delete/bulk-delete.html',
        clickOutsideToClose: false,
        locals: {
          selectedRows: _.filter(vm.clipboardTableOptions.data, function (part) {
            return part.objectType !== 'documents'
          }),
          isRemoveQuantitiesFlatView: true,
          params: {
            operationType: 'addToBom'
          },
          targetQuatity: ''
        }
      }).then(function (val) {
      });
    }

    vm.showConfirmIsUsed = showConfirmIsUsed;

    function showConfirmIsUsed() {
      let isUsed = _.find(vm.clipboardTableOptions.data, row => row.cardStatus === 'Is Used');
      if (isUsed) {
        let confirm = $mdDialog.confirm()
          .title('One or more objects are used in other cards. \nWould you still like to proceed?')
          .ariaLabel('Confirm where-used?')
          .ok('Yes')
          .multiple(true)
          .cancel('No');
        $mdDialog.show(confirm).then(function () {
          addClipboardToCard();
        }, function () {
        });
      } else {
        addClipboardToCard();
      }

    }

    function addClipboardToCard() {
      closePopup();
      $mdDialog.show({
        controller: 'BulkDeleteController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/bulk-delete/bulk-delete.html',
        clickOutsideToClose: false,
        multiple: params.isCard,
        locals: {
          selectedRows: vm.clipboardTableOptions.data,
          isRemoveQuantitiesFlatView: false,
          params: {
            card: params.card,
            operationType: 'addToCard',
            color: params.color,
            isCard: params.isCard
          },
          targetQuatity: ''
        }
      }).then(function (val) {
      });
    }

    function closePopup() {
      $mdDialog.hide();
    }
  }

})();
