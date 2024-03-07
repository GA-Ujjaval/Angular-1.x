(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('ToggleHandler', GlobalSettingsService);

  /**
   * Responsible for synchronization of state for expand-collapse button when user clicks individual +/-
   * sign in bom hierarchical table.
   * @returns {ToggleHandler}
   * @constructor
   */

  function GlobalSettingsService(rowStates) {


    function getMonotonousArray(size, offset) {
      var newArr = [];
      for (var i = 0; i < size; i++) {
        newArr.push(i + offset);
      }
      return newArr;
    }

    class ToggleHandler {
      constructor(scope) {
        this._scope = scope;
      }

      addListeners() {
        this._removeCollapseListener = this._scope.gridApi.treeBase.on.rowCollapsed(this._scope, this._handleManualToggle.bind(this));
        this._removeExpandedListener = this._scope.gridApi.treeBase.on.rowExpanded(this._scope, this._handleManualToggle.bind(this));
      }

      removeListeners() {
        this._removeCollapseListener();
        this._removeExpandedListener();
      }

      _handleManualToggle() {
        this._scope.setLevels();
        this._scope.currentLevel = this._getExpandedLevels(this._scope.gridApi.grid.rows, this._scope.levels.length);
      }

      _getExpandedLevels(gridRows, maxLevel) {
        const levels = getMonotonousArray(maxLevel, 1);
        const availableLevels = levels.map((level) => {
          return this._isLevelAvailable(gridRows, level);
        });
        const firstNotAvailableIndex = _.findIndex(availableLevels, (isAvailable) => {
          return isAvailable === false;
        }) + 1;
        return firstNotAvailableIndex ? firstNotAvailableIndex : maxLevel;
      }

      _isLevelAvailable(gridRows, level) {
        return !gridRows
          .filter((gridRow) => {
            return (gridRow.entity.objectId) && ((gridRow.entity.level) === level);
          })
          .some((gridRow) => {
            return gridRow.treeNode.state === rowStates.collapsed;
          });
      }

      _isSubAssembly(children) {
        return children.some((child) => {
          return child.row.entity.slNo
        })
      }
    }

    return ToggleHandler;
  }
})();
