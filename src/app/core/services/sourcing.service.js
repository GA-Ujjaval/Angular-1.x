(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('sourcingUtils', sourcingUtils);

  /** @ngInject */
  function sourcingUtils(uiGridTreeBaseService) {


    var service = {
      addSourcingPrefix: addSourcingPrefix,
      checkLength: checkLength,
      applyFlattenOnSourcing: applyFlattenOnSourcing,
      checkPadding: checkPadding,
      showAllSourcingRows: showAllSourcingRows,
      toggleSourcingGridRow: toggleSourcingGridRow,
      extendSourcingData: extendSourcingData,
      getSourcingHeaderTemplate: getSourcingHeaderTemplate
    };

    return service;

    //////////

    function addSourcingPrefix(type, obj) {
      if (type == 'mfr') {
        obj = _.mapKeys(obj, function (value, key) {
          return 'mfr' + key.charAt(0).toUpperCase() + key.slice(1);
        });
      } else {
        obj = _.mapKeys(obj, function (value, key) {
          return 'supp' + key.charAt(0).toUpperCase() + key.slice(1);
        });
      }
      return obj;
    }

    function checkLength(row, length) {
      return (_.isEmpty(row) || length == 1);
    }

    /**
     * Apply Flatten On Sourcing
     * @param targetArr
     * @param bom
     * @param bomCompare
     * @returns {*|Array}
     */
    function applyFlattenOnSourcing(targetArr, bom, bomCompare) {

      var flattenArr = [],
        level = 0;

      angular.forEach(targetArr, function (o) {

        if (!bom) {
          o.level = level;
          o.$$treeLevel = level;
        }

        if ((o.mfrList && o.mfrList.length > 1) || (o.suppList && o.suppList.length > 1)) {
          if (bom) {
            o.sourcingParent = true;
          }
          if (bomCompare) {
            var ancestorsNew = angular.copy(o.ancestors) || {};
            ancestorsNew[o.level] = o.objectId;
          }
          o.mfrList ? _.merge(o, o.mfrList[0]) : false;
          o.suppList ? _.merge(o, o.suppList[0]) : false;

          flattenArr.push(o);

          flattenSuppMfr(o.mfrList || [], o.suppList || [], targetArr, o.level + 1, o.compareCode, o.showChangesFlag, ancestorsNew, o.objectId);

          o.mfrList = o.mfrList ? o.mfrList[0] : {};
          o.suppList = o.suppList ? o.suppList[0] : {};
        } else {
          if (o.mfrList && o.mfrList.length == 1) {
            _.merge(o, o.mfrList[0]);
            o.mfrList = o.mfrList[0];
          }
          if (o.suppList && o.suppList.length == 1) {
            _.merge(o, o.suppList[0]);
            o.suppList = o.suppList[0];
          }
          flattenArr.push(o);

        }
      });

      function flattenSuppMfr(mfrObj, suppObj, parentObj, level, parentCompareCode, parentShowChangesFlag, ancestors, parent) {
        var arr = [];
        if (mfrObj.length >= suppObj.length) {
          arr = mfrObj;
          var mfrFlag = true;
        } else {
          arr = suppObj;
        }

        angular.forEach(arr, function (o, idx) {

          o.level = level;
          o.$$treeLevel = level;
          if (bomCompare) {
            o.compareCode = o.compareCode ? o.compareCode : parentCompareCode;
            o.showChangesFlag = o.showChangesFlag ? o.showChangesFlag : parentShowChangesFlag;
            o.ancestors = ancestors ? ancestors : {};
          }
          o.sourcingChildren = true;
          o.parentObjectId = parent;

          if (idx != 0) {
            if (mfrFlag) {
              _.merge(o, suppObj[idx]);
            } else {
              _.merge(o, mfrObj[idx]);
            }
            o.mfrList = mfrObj[idx] || {};
            o.suppList = suppObj[idx] || {};
            parentObj.push(o);
            if (!o.objectId) {
              o.level = null;
            }

            flattenArr.push(o);
          }
        });
      }

      return flattenArr || [];
    }

    function checkPadding(arr, flag) {
      return _.map(arr, function (val) {
        if (flag == 'mfr') {
          return (val.mfrPartsList && val.mfrPartsList.length > 1);
        } else {
          return (val.suppPartsList && val.suppPartsList.length > 1);
        }
      });
    }

    function showAllSourcingRows(grid, flag, bomFlag, bomClick) {
      if (bomFlag) {

        angular.forEach(grid.grid.rows, function (row) {
          if (((row.entity.bomParent && bomClick && ((flag && !row.entity.bomCollapsed) || (!flag && row.entity.bomCollapsed))) ||
            (row.entity.sourcingParent && !bomClick && ((flag && !row.entity.sourcingCollapsed) || (!flag && row.entity.sourcingCollapsed)))) ||
            (row.entity.mfrPartsList && row.entity.mfrPartsList.length > 1) || (row.entity.suppPartsList && row.entity.suppPartsList.length > 1)) {
            toggleSourcingGridRow(row, grid, row.treeNode.children, row.treeNode.state, bomClick, true);
          }
        });

        if (bomClick) {
          grid.grid.allBomCollapsed = flag;
        } else {
          grid.grid.allSourcingCollapsed = flag;
        }

      } else {
        if (flag) {
          grid.treeBase.expandAllRows();
        } else {
          grid.treeBase.collapseAllRows();
        }
        angular.forEach(grid.grid.options.data, function (val) {
          if (val.bomParent) {
            val.bomCollapsed = flag;
          }
          if (val.sourcingParent) {
            val.sourcingCollapsed = flag;
          }
        });

        grid.grid.allSourcingCollapsed = flag;
      }
    }

    function toggleSourcingGridRow(row, grid, children, state, bomFlag) {
      if ((bomFlag && row.entity.bomCollapsed && !row.entity.sourcingCollapsed) ||
        (!bomFlag && row.entity.sourcingCollapsed && !row.entity.bomCollapsed) ||
        (!row.entity.bomCollapsed && !row.entity.sourcingCollapsed)) {
        uiGridTreeBaseService.toggleRowTreeState(grid.grid, row);
      }

      if (row.entity.bomParent || row.entity.sourcingParent) {

        if (bomFlag) {

          if (row.entity.bomCollapsed) {
            row.entity.bomCollapsed = !row.entity.bomCollapsed;
          } else if (row.entity.sourcingCollapsed) {
            row.entity.bomCollapsed = row.entity.sourcingCollapsed;
          } else {
            row.entity.bomCollapsed = (state == 'collapsed');
          }

          angular.forEach(children, function (value) {
            if (!value.row.entity.sourcingChildren && row.entity.bomCollapsed) {
              grid.core.clearRowInvisible(value.row);
              if (value.children.length) {
                recursiveClearInvisible(value.children, grid);
              }
            }
            if ((!value.row.entity.sourcingChildren && !row.entity.bomCollapsed) ||
              (value.row.entity.sourcingChildren && !row.entity.sourcingCollapsed)) {
              grid.core.setRowInvisible(value.row);
              if (value.children.length) {
                recursiveSetInvisible(value.children, grid);
              }
            }
          });

        } else {

          if (row.entity.sourcingCollapsed) {
            row.entity.sourcingCollapsed = !row.entity.sourcingCollapsed;
          } else if (row.entity.bomCollapsed) {
            row.entity.sourcingCollapsed = row.entity.bomCollapsed;
          } else {
            row.entity.sourcingCollapsed = (state == 'collapsed');
          }

          angular.forEach(children, function (value) {
            if (value.row.entity.sourcingChildren && row.entity.sourcingCollapsed) {
              grid.core.clearRowInvisible(value.row);
              if (value.children.length) {
                recursiveClearInvisible(value.children, grid);
              }
            }

            if ((!value.row.entity.sourcingChildren && !row.entity.bomCollapsed) ||
              (value.row.entity.sourcingChildren && !row.entity.sourcingCollapsed)) {
              grid.core.setRowInvisible(value.row);
              if (value.children.length) {
                recursiveSetInvisible(value.children, grid);
              }
            }
          });
        }
      } else {
        if (bomFlag) {
          row.entity.bomCollapsed = (state == 'collapsed');
        } else {
          row.entity.sourcingCollapsed = (state == 'collapsed');
        }
      }
      if(!children || (children && children.length === 0)){
        return;
      }
      let nextRow = children[0].row;
      let nextState = children[0].state;
      let nextChildren = nextRow.treeNode.children;
      while (nextChildren.length > 0) {
        toggleSourcingGridRow(nextRow, grid, nextChildren, nextState, bomFlag);
        nextRow = nextChildren[0].row;
        nextState = nextChildren[0].state;
        nextChildren = nextRow.treeNode.children;
      }

      const appliedFilters = _(grid.grid.columns)
        .map((col) => col.filters)
        .flatten()
        .map((filter) => filter.term)
        .filter((string) => string)
        .value()
        .length;
      if(appliedFilters){
        grid.grid.rows.forEach((row) => grid.core.clearRowInvisible(row));
      }
    }

    function recursiveSetInvisible(children, grid) {
      angular.forEach(children, function (item) {
        grid.core.setRowInvisible(item.row);
        if (item.children.length) {
          recursiveSetInvisible(item.children, grid)
        }
      });
    }

    function recursiveClearInvisible(children, grid) {
      angular.forEach(children, function (item) {
        grid.core.clearRowInvisible(item.row);
        if (item.children.length) {
          recursiveClearInvisible(item.children, grid)
        }
      });
    }

    function extendSourcingData(value) {
      if (!_.isEmpty(value.mfrPartsList)) {
        value.mfrList = _.map(value.mfrPartsList, function (val) {
          if (!_.isEmpty(val.costDetail) && val.costDetail[0]) {
            val.moq = val.costDetail[0].moq;
            val.cost = val.costDetail[0].cost;
            val.currency = val.costDetail[0].currency;
          } else {
            val.moq = '';
            val.cost = '';
            val.currency = '';
          }
          if (val.sourceObjectTableList.length > 0) {
            var mfrSource = _.find(val.sourceObjectTableList, {objectKey: value.objectId});
            if (mfrSource) {
              val.notes = mfrSource.notes
            }
          }
          return addSourcingPrefix('mfr', val);
        });
      }
      if (!_.isEmpty(value.suppPartsList)) {
        value.suppList = _.map(value.suppPartsList, function (val) {
          if (!_.isEmpty(val.costDetail) && val.costDetail[0]) {
            val.moq = val.costDetail[0].moq;
            val.cost = val.costDetail[0].cost;
            val.currency = val.costDetail[0].currency;
          } else {
            val.moq = '';
            val.cost = '';
            val.currency = '';
          }
          if (val.sourceObjectTableList.length > 0) {
            var suppSource = _.find(val.sourceObjectTableList, {objectKey: value.objectId});
            if (suppSource) {
              val.notes = suppSource.notes;
            }
          }
          return addSourcingPrefix('supp', val);
        });
      }
      if (value.costDetail && value.costDetail.costSetting && (value.mfrList || value.suppList)) {
        let mfrCostType = value.costDetail.costSetting;
        mfrCostType = mfrCostType.slice(0, -3);
        if (mfrCostType.indexOf('supp') !== -1 && value.suppList[0].suppObjectId !== mfrCostType && value.suppList)
        {
          const index = _.findIndex(value.suppList, {suppObjectId: mfrCostType});
          const newValue = value.suppList[0];
          value.suppList[0] = value.suppList[index];
          value.suppList[index] = newValue;
        }

        if (mfrCostType.indexOf('mfr') !== -1 && value.mfrList[0].mfrObjectId !== mfrCostType && value.mfrList)
        {
          const index = _.findIndex(value.mfrList, {mfrObjectId: mfrCostType});
          const newValue = value.mfrList[0];
          value.mfrList[0] = value.mfrList[index];
          value.mfrList[index] = newValue;
        }
      }
    }

    function getSourcingHeaderTemplate() {
      return '<div ng-class="{ \'sortable\': sortable }"><div class="ui-grid-vertical-bar">&nbsp;</div>' +
        '<div layout="row">' +
        '<md-icon ng-if="!grid.api.grid.allSourcingCollapsed && !grid.appScope.vm.bomCompareFlag" class="icon-menu-down show-more show-all"' +
        ' ng-click="grid.appScope.vm.sourcingUtils.showAllSourcingRows(grid.api, !grid.api.grid.allSourcingCollapsed, grid.appScope.vm.bomFlag)">' +
        '<md-tooltip ng-if="col.displayName === \'Manufacturer Part Number\'" class="md-tooltip">Click to show more Manufacturer Parts</md-tooltip>' +
        '<md-tooltip ng-if="col.displayName === \'Supplier Part Number\'" class="md-tooltip">Click to show more Supplier Parts</md-tooltip>' +
        '</md-icon>' +
        '<md-icon ng-if="!grid.api.grid.allSourcingCollapsed && grid.appScope.vm.bomCompareFlag" class="icon-menu-down show-more show-all"' +
        ' ng-click="grid.appScope.vm.toggleHierarchicalAllRow(true)">' +
        '<md-tooltip ng-if="col.displayName === \'Manufacturer Part Number\'" class="md-tooltip">Click to show more Manufacturer Parts</md-tooltip>' +
        '<md-tooltip ng-if="col.displayName === \'Supplier Part Number\'" class="md-tooltip">Click to show more Supplier Parts</md-tooltip>' +
        '</md-icon>' +
        '<md-icon ng-if="grid.api.grid.allSourcingCollapsed  && !grid.appScope.vm.bomCompareFlag" class="icon-menu-up show-more show-all"' +
        ' ng-click="grid.appScope.vm.sourcingUtils.showAllSourcingRows(grid.api, !grid.api.grid.allSourcingCollapsed, grid.appScope.vm.bomFlag)">' +
        '<md-tooltip ng-if="col.displayName === \'Manufacturer Part Number\'" class="md-tooltip">Click to show less Manufacturer Parts</md-tooltip>' +
        '<md-tooltip ng-if="col.displayName === \'Supplier Part Number\'" class="md-tooltip">Click to show less Supplier Parts</md-tooltip>' +
        '</md-icon>' +
        '<md-icon ng-if="grid.api.grid.allSourcingCollapsed && grid.appScope.vm.bomCompareFlag" class="icon-menu-up show-more show-all"' +
        ' ng-click="grid.appScope.vm.toggleHierarchicalAllRow(true)">' +
        '<md-tooltip ng-if="col.displayName === \'Manufacturer Part Number\'" class="md-tooltip">Click to show less Manufacturer Parts</md-tooltip>' +
        '<md-tooltip ng-if="col.displayName === \'Supplier Part Number\'" class="md-tooltip">Click to show less Supplier Parts</md-tooltip>' +
        '</md-icon>' +
        '<div class="ui-grid-cell-contents width-100-percent" col-index="renderIndex">' +
        '<span style="float: right; margin-right: 10px;" ui-grid-visible="col.sort.direction" ' +
        'ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }">' +
        '&nbsp;</span>' +
        '<div class="custom-ui-grid-header"> {{ col.displayName CUSTOM_FILTERS }}</div>' +
        '</div></div>' +
        '<div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader  && col.colDef.enableColumnMenu !== false"' +
        ' ng-click="toggleMenu($event)"><i class="ui-grid-icon-angle-down">&nbsp;</i></div><div class="ui-grid-filter" style="padding-top: 20px">' +
        '<div ng-if="filterable" class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
        '<input type="text" class="ui-grid-filter-input" ng-model="colFilter.term" ng-click="$event.stopPropagation()" ng-attr-placeholder="{{colFilter.placeholder || \'\'}}" />' +
        '<div class="ui-grid-filter-button" ng-click="colFilter.term = null"><i class="ui-grid-icon-cancel" ng-show="!!colFilter.term">&nbsp;</i> </div></div></div></div>';
    }


  }
}());
