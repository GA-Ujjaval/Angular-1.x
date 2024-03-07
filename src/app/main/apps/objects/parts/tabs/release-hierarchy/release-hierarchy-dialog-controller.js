(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('ReleaseHierarchyController', ReleaseHierarchyController);

  /** @ngInject */
  function ReleaseHierarchyController($mdDialog, hostUrlDevelopment, CustomerService, errors, $mdToast, AuthService, Object, $location, helperData, $rootScope, $filter) {

    var vm = this;

    //For Session---------------------------------------------------------------------------------------------------
    var sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header
    var header = {
      authId: sessionData.authId,
      channel_name: sessionData.channel_name,
      proxy: sessionData.proxy
    };

    //For Global Variable-------------------------------------------------------------------------------------------
    var params,
        checkAllFlag = false,
        count = 0;

    //Data
    vm.releaseHierarchyFlag = Object.releaseHierarchy;
    vm.releaseEditsHierarchyFlag = Object.releaseEditsHierarchy || false;
    vm.releaseHierarchy = [];
    vm.filterLevelsArray = [];
    vm.fromCards = Object.fromCards;

    vm.status = Object.status || 'Released';

    vm.statusText = 'Status Change (Released)';

    if (vm.status === 'InDevelopment') {
      vm.statusText = 'Status Change (InDevelopment)';
    } else if (vm.status === 'Obsolete') {
      vm.statusText = 'Status Change (Obsolete)';
    }

    if (vm.releaseHierarchyFlag) {
      if (Object.fromCards){
        vm.noteText = `NOTE: Moving card to this list will automatically change status to '${vm.status}' of Affected Object(s) and ALL of its child objects (this includes its child objects in the \'BOM\' tab, and, document objects in the \'Attachments\' tab).`;
      } else {
        if (Object.fromMainTable) {
          vm.noteText = `NOTE: Changing status to '${vm.status}' for these objects will also change status to '${vm.status}' for ALL of their child objects (this includes its child objects in the \'BOM\' tab, and, document objects in the \'Attachments\' tab).`;
        } else {
          vm.noteText = `NOTE: Changing status to '${vm.status}' for this object will also change status to '${vm.status}' for ALL of it\'s child objects (this includes its child objects in the \'BOM\' tab, and, document objects in the \'Attachments\' tab).`;
        }
      }
    } else {
      if (Object.fromCards){
        vm.noteText = `NOTE: Moving card to this list will automatically change status to '${vm.status}' of Affected Object(s)`;
      } else {
        if (Object.fromMainTable) {
          vm.noteText = `NOTE: Changing status to '${vm.status}' for selected object(s)`;
        } else {
          vm.noteText = `NOTE: Changing status to '${vm.status}' for that object`;
        }
      }
    }

    var collapsedItems = [];

    //Methods
    vm.closeDialog = closeDialog;
    vm.toggleReleaseHierarchy = toggleReleaseHierarchy;
    vm.checkAll = checkAll;
    vm.checkCollapsed = checkCollapsed;
    vm.changeCheckbox = changeCheckbox;
    vm.isDisabledCheckbox = isDisabledCheckbox;

    if (Object.arr && Object.arr.length !== 0) {
      if (Object.fromCards || Object.fromMainTable) {
        init(Object.arr[count]);
      } else {
        init(Object);
      }
    } else {
      init(Object);
    }

    vm.editPart = editPart;

    function editPart(ev, item) {
      params = {
        customerId: sessionData.proxy === true ? sessionData.customerAdminId : undefined,
        fuseObjectId: item.objectId,
        isBom: false
      };
      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbyid, params, '', header)
        .then(response => {
          vm.products = response.data;
          if (response.data.fuseCost == null || response.data.fuseCost === '') {
            vm.cost = '';
          } else {
            vm.cost = $filter('number')(response.data.fuseCost.replace(',', ''), 2);
          }
          if (response.data.costDetail != null) {
            if (response.data.costDetail.costSetting === helperData.backendRollupCostId) {
              vm.costSetting = helperData.rollupCostId;
              vm.costDisabled = true;
            } else {
              vm.costSetting = response.data.costDetail.costSetting;
              vm.costDisabled = false;
            }
            vm.manualCost = response.data.costDetail.manualCost;
            vm.rollupCost = response.data.costDetail.rollupCost || 0;
            vm.breakCost = response.data.costDetail.breakCost ? response.data.costDetail.breakCost : {};
          }

          if (response.data.qtyOnHand || response.data.qtyOnOrder || response.data.qtyTotal) {
            vm.quantityOnhand = response.data.qtyOnHand;
            vm.quantityOnorder = response.data.qtyOnOrder;
            vm.totalQuantity = response.data.qtyTotal;
          }

          vm.additionalInfoList = vm.products.additionalInfoList;
          editPartNumberingDialog(ev);
      });
    }

    function getObject() {
      return {
        objectId: vm.products.objectId,
        objectType: vm.products.objectType,
        objectName: vm.products.objectName,
        objectNumber: vm.products.objectNumber,
        categoryId: vm.products.categoryId,
        description: vm.products.description,
        revision: vm.products.revision,
        uom: vm.products.uom,
        fuseCost: vm.cost,
        costDetail: {
          manualCost: vm.manualCost,
          rollupCost: vm.rollupCost,
          costSetting: vm.costSetting === helperData.rollupCostId ? helperData.backendRollupCostId : vm.costSetting,
          breakCost: vm.breakCost
        },
        procurementType: vm.products.procurementType,
        projectNames: vm.products.projectNames,
        tags: vm.products.tags,
        additionalInfoList: vm.additionalInfoList,
        systemRevision: vm.products.systemRevision,
        minorRevision: vm.products.minorRevision,
        systemObjectNumber: vm.products.systemObjectNumber,
        systemMinorRevision: vm.products.systemMinorRevision,
        fuseObjectHistory: vm.products.fuseObjectHistory,
        qtyOnHand: vm.quantityOnhand,
        qtyOnOrder: vm.quantityOnorder,
        qtyTotal: vm.totalQuantity
      };
    }

    function editPartNumberingDialog(ev, advancedNumberFalg) {
      const lastStateName = $location.url().split('/')[$location.url().split('/').length - 1];
      $mdDialog.show({
        controller: 'editPartNumberingDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/edit-partnumbering-dialog/edit-partnumbering-dialog.html',
        targetEvent: ev,
        multiple: true,
        clickOutsideToClose: true,
        locals: {
          object: getObject(),
          products: vm.products,
          copyObject: 'Edit',
          objectId: '',
          configurationSettings: $rootScope.configurationSettings,
          isConfig: vm.products.isConfig,
          advancedNumbering: advancedNumberFalg,
          lastStateName: lastStateName,
          editPart: true
        }
      }).then(function (data) {
        checkAllFlag = false;
        vm.releaseHierarchy = [];
        init(Object);
      }, function () {

      });
    }

    function init(obj) {
      vm.progress = true;

      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId,
          objectId: obj.objectId || obj.id || obj
        };
      } else {
        params = {
          customerId: sessionData.userId,
          objectId: obj.objectId || obj.id || obj
        };
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.getallfuseobjectdata, params, '', header)
        .then(function(response) {

          if (!Object.withoutHierarchy) {

            vm.releaseHierarchy = _.concat(vm.releaseHierarchy, buildExtendedObject(response.data));

          } else{
            vm.releaseHierarchy.push(response.data[0]);
          }

          vm.releaseHierarchy.forEach(function(o){
            o.selected = o.selected ? true : o.status === 'Released';
          });

          if (!Object.fromCards && !Object.fromMainTable) {
            vm.releaseHierarchy.forEach(function(o){
              o.selected = (o.status === 'Released' || o.objectId === Object.objectId);
              o.disabledSelect = (o.objectId === Object.objectId);
            });
          }

          checkAll();

          count++;
          if ((Object.fromCards || Object.fromMainTable) && count <= Object.arr.length - 1) {
            init(Object.arr[count]);
          } else {
            vm.progress = false;
          }
        })
        .catch(function() {
          $mdToast.show($mdToast.simple().textContent(errors.erCatch).position('top right'));
        });
    }

    function buildExtendedObject(obj) {

      var arr = [];

      function extendObject(obj, level, parentId, ancestors) {

        angular.forEach(obj, function (o) {

          o.level = level;

          if (o.level === 0) {
            o.disabledSelect = (o.status === 'InDevelopment');
            o.selected = (o.status === 'InDevelopment')
          }

          if (level > 0) {
            o.ancestors = ancestors ? angular.copy(ancestors) : {};
            o.ancestors[level-1] = parentId;
          }

          arr.push(o);

          if( (o.docResponse && o.docResponse.length > 0) || (o.bomResponse && o.bomResponse.length > 0) ){
            var newLevel = angular.copy(level);
            newLevel++;
            o.parent = true;

            if(o.docResponse && o.docResponse.length > 0){
              extendObject(o.docResponse, newLevel, o.objectId, o.ancestors);
            }

            if(o.bomResponse && o.bomResponse.length > 0){
              extendObject(o.bomResponse, newLevel, o.objectId, o.ancestors);
            }
          }

        });
      }

      extendObject(obj, 0);

      return arr;
    }

    function toggleReleaseHierarchy(item) {

      item.collapsed = !item.collapsed;

      var addedItem = angular.copy(item.ancestors) || {};
      addedItem[_.size(addedItem)] = item.objectId;
      var obj = _.find(collapsedItems, function(o){return _.isEqual(o, addedItem)});

      var index = _.indexOf(collapsedItems, obj);

      if (index > -1) {
        collapsedItems.splice(index, 1);
      } else {
        collapsedItems.push(addedItem);
      }
    }

    function checkCollapsed (ancestors) {
      var res = false;
      angular.forEach(collapsedItems, function(colItem) {
        if (_.size(ancestors) >= _.size(colItem)) {

          var indx = _.size(colItem);
          var sameIndx = 0;

          for (var i = 0; i < indx; i++) {
            if (ancestors[i] === colItem[i]) {
              sameIndx += 1;
            }
          }
          if (sameIndx === indx) {
            res = true;
          }
        }
      });

      return res;
    }

    function checkAll() {
      checkAllFlag = !checkAllFlag;
      angular.forEach(vm.releaseHierarchy, function (item) {
        if (item.status !== 'Released' && !item.disabledSelect) {
          item.selected = checkAllFlag;
        }
      });
      checkAllFlag = !checkAllFlag;
    }

    function changeCheckbox(item) {
      let items = [];
      let {level, selected} = item;
      vm.releaseHierarchy.forEach(function (obj) {
        const {objectId, $$hashKey} = obj;
        if (items && _.map(items, ({id, key}) => objectId === id && $$hashKey !== key)[0] === true) {
          return;
        }
        if (obj.level > level && checkCommonAncestor(item, obj) ) {
          obj.selected = selected;
          items.push({key : $$hashKey, id: objectId});
        }
      });
    }

    /**
     * Takes 2 objects of ancestors
     * @param   {object} item - like parent
     * @param   {object} obj - like child
     *
     * @returns {boolean} true - if both objects from common ancestors
     */
    function checkCommonAncestor(item, obj) {
      if (!item.ancestors && obj.ancestors[0] === item.objectId) {
        return true;
      }
      for (var key in item.ancestors) {
        if (obj.ancestors[key] !== item.ancestors[key]) {return false;}
      }
      for (var key in obj.ancestors) {
        if (obj.ancestors[key] === item.objectId) {return true;}
      }

      return false;
    }

    /**
     * Close dialog
     */
    function closeDialog(release) {
      if (release) {
        $mdDialog.hide(_.filter(vm.releaseHierarchy, function(o) {
          return (o.selected);
        }));
      } else {
        $mdDialog.cancel();
      }
    }

    function isDisabledCheckbox (item) {
      return vm.releaseHierarchyFlag || item.status === 'Released' || item.disabledSelect;
    }
  }
})();
