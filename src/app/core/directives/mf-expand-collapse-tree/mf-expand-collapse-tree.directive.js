/**
 * Directive is responsible for plus icon and expand / collapse hierarchical table functionality.
 * E.x. it is used in hierarchical BOM to provide the ability to expand the table to a certain level.
 * (opens a drop-down)
 */

(function () {
  angular
    .module('app.core')
    .directive('mfExpandCollapseTree', function (sourcingUtils, ToggleHandler, rowStates, CustomerService, hostUrlDevelopment) {

      function link(scope) {

        var vm = scope;
        vm.setLevels = setLevels;
        vm.toggleAll = toggleAll;

        const toggleHandler = new ToggleHandler(vm);

        setExpansionLevel = doAfterDecorator(setExpansionLevel, () => {
          toggleHandler.addListeners()
        });
        setExpansionLevel = doBeforeDecorator(setExpansionLevel, () => {
          toggleHandler.removeListeners()
        });
        vm.setExpansionLevel = setExpansionLevel;
        vm.currentLevel = 1;
        vm.levels = [];

        vm.gridRows = [];

        toggleHandler.addListeners();

        function toggleAll() {
          if (vm.currentLevel === vm.levels[vm.levels.length - 1]) {
            setExpansionLevel(1);
          } else {
            setExpansionLevel(vm.levels[vm.levels.length - 1])
          }
        }

        /**
         * Returns the max level of depth in the hierarchy
         * @returns {*}
         */
        function getMaxLevel() {
          if (scope.gridOptions.data.length === 0) {
            return;
          }
          return _.maxBy(scope.gridOptions.data.filter(
            function (row) {
              return row.objectId
            }), 'level').level;
        }

        /**
         * Assigns the array of available levels
         * i.e. [1,2,3,4,5]
         */
        function setLevels() {
          if (scope.levels.length) {
            return;
          }
          if (scope.maxLevel > 0) {
            var maxLevel = scope.maxLevel;
            var newLevels = [];
            for (var i = 0; i < maxLevel; i++) {
              newLevels.push(i + 1);
            }
            scope.levels = newLevels;
          } else {
            CustomerService.addNewMember('GET', hostUrlDevelopment.test.getfuseobjectbomlevel, {
              objectId: scope.objectId
            })
              .then( response => {
                var maxLevel = response.data.level;
                var newLevels = [];
                for (var i = 0; i < maxLevel; i++) {
                  newLevels.push(i + 1);
                }
                scope.levels = newLevels;
              });
          }

        }

        /**
         * Handles level changing
         * @param newLevel
         */
        function setExpansionLevel(newLevel) {
          if (newLevel === scope.currentLevel) {
            collapseTo(newLevel - 1);
            scope.currentLevel = newLevel - 1;
            vm.currentLevel = newLevel - 1;
            return;
          }

          if (newLevel > scope.currentLevel) {
            expandTo(newLevel);
          } else {
            collapseTo(newLevel);
          }
          vm.currentLevel = newLevel;
          scope.currentLevel = newLevel;
        }

        function doBeforeDecorator(fn, cb) {
          return function (...args) {
            cb();
            return fn(...args);
          }
        }

        function doAfterDecorator(fn, cb) {
          return function (...args) {
            const result = fn(...args);
            cb();
            return result;
          }
        }

        /**
         * collapses the table to the passed level
         * @param newLevel {number} - the level collapse to
         */
        function collapseTo(newLevel) {
          _.range(newLevel, scope.levels.length).forEach(collapseLevel);
        }

        function collapseLevel(level) {
          const gridRows = scope.gridApi.grid.rows;
          gridRows
            .filter(gridRow => {
              return (gridRow.entity.objectId) && ((gridRow.entity.level) === level);
            })
            .filter(gridRow => {
              return gridRow.treeNode.state === rowStates.expanded;
            })
            .forEach(gridRow => {
              sourcingUtils.toggleSourcingGridRow(gridRow, scope.gridApi, gridRow.treeNode.children, gridRow.treeNode.state, true);
            });
        }

        /**
         * Expands the table to the passed level
         * @param newLevel {number} - the level expand to
         */
        function expandTo(newLevel) {
          collapseTo(1);
          const levels = getMonotonousArray(--newLevel, 1);
          levels.forEach(expandLevel);
          scope.$emit('expandAllToLevel', ++newLevel);
          scope.$on('bom loading ended', function (event, value) {
            setTimeout(function () {
              vm.gridRows = value.grid.rows;
              levels.forEach(expandLevel);
            }, 0);
          });
        }

        function expandLevel(level){
          let gridRows = [];
          if (vm.gridRows.length) {
            gridRows = vm.gridRows;
          } else {
            gridRows = scope.gridApi.grid.rows;
          }
          gridRows
            .filter(function (gridRow) {
              return (gridRow.entity.objectId) && ((gridRow.entity.level) === level);
            })
            .filter((gridRow) => {
              return gridRow.treeNode.state === rowStates.collapsed;
            })
            .forEach(function (gridRow) {
              sourcingUtils.toggleSourcingGridRow(gridRow, scope.gridApi, gridRow.treeNode.children, gridRow.treeNode.state, true);
            });
        }

        /**
         * return array of {size} with [0 + offset, 1 + offset, ...]
         * @param size {number} - the size of the array
         * @param offset {number} - the number to be added to every array item
         * @returns {Array}
         */
        function getMonotonousArray(size, offset) {
          var newArr = [];
          for (var i = 0; i < size; i++) {
            newArr.push(i + offset);
          }
          return newArr;
        }
      }

      return {
        templateUrl: 'app/core/directives/mf-expand-collapse-tree/mf-expand-collapse-tree-directive.html',
        restrict: 'E',
        link: link,
        scope: {
          gridApi: '=',
          objectId: '=',
          gridOptions: '=',
          maxLevel: '='
        }
      }
    });
})();
