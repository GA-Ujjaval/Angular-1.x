(function () {
  angular
    .module('app.core')
    .directive('mfAdvancedNumberingCategoryTable',
      function (advancedNumberingService, attributesUtils, fuseUtils, $mdToast, $mdDialog, algorithmsService,
                advancedNumberingStateService, validationService, $timeout, uiGridGridMenuService) {

        const state = advancedNumberingStateService;
        const adNumServ = advancedNumberingService;
        const schemes = ['default', 'custom', 'parent'];
        const actionMessages = {
          schemeUpdated: 'Changes are saved'
        };
        const INTENDED_CATEGORY_NAME =
          'app/core/directives/mf-advanced-numbering-category-table/cell-templates/cell-template-with-indentation.html';
        const EDITABLE_GRID_CELL =
          'app/core/directives/mf-advanced-numbering-category-table/cell-templates/editable-grid-cell.html';
        const SCHEME_COLUMN_DROPDOWN =
          'app/core/directives/mf-advanced-numbering-category-table/cell-templates/scheme-column-template.html';
        const TEST_NEXT_NUMBERS_COLUMN =
          'app/core/directives/mf-advanced-numbering-category-table/cell-templates/test-next-numbers-column.html';
        const INACTIVE_GRID_CELL = 'app/core/directives/mf-advanced-numbering-category-table/cell-templates/grayed-out-grid-cell.html';
        const requiredColumnTemplate = fuseUtils.getCommonHeaderTemplate({
          style: 'required-mark',
          text: '*',
          isTooltipNeeded: false
        });

        const COLUMN_MATCHER = {
          categoryName: {cellTemplate: INTENDED_CATEGORY_NAME},
          prefix: {cellTemplate: EDITABLE_GRID_CELL, headerCellTemplate: requiredColumnTemplate},
          suffix: {cellTemplate: EDITABLE_GRID_CELL},
          startingNumber: {cellTemplate: EDITABLE_GRID_CELL, headerCellTemplate: requiredColumnTemplate},
          scheme: {cellTemplate: SCHEME_COLUMN_DROPDOWN},
          testNextNumbers: {cellTemplate: TEST_NEXT_NUMBERS_COLUMN},
          increment: {cellTemplate: EDITABLE_GRID_CELL, headerCellTemplate: requiredColumnTemplate},
          runningNumber: {cellTemplate: INACTIVE_GRID_CELL}
        };

        function link(scope) {
          const vm = scope;
          scope.vm = scope;
          vm.advancedNumberingStateService = state;
          vm.handleDropdownChange = handleDropdownChange;
          vm.getNextSingleCategoryNumbers = getNextSingleCategoryNumbers;
          vm.updateSingleCategoryScheme = updateSingleCategoryScheme;
          vm.processInput = processInput;
          vm.resetInvalid = resetInvalid;
          vm.checkEditable = checkEditable;
          vm.getTooltipText = getTooltipText;

          vm.schemes = schemes;
          vm.tableOptions = {
            data: [],
            columnDefs: buildAdvancedNumberingColumns(getAttributes()),
            showTreeExpandNoChildren: false,
            enableFiltering: true,
            initialized: false,
            onRegisterApi: function (gridApi) {
              vm.tableApi = gridApi;
              vm.tableApi.core.on.rowsRendered(scope, function () {
                vm.tableOptions.initialized = true;
              });
              vm.tableApi.pinning.on.columnPinned(scope, function (colDef) {
                let gridCol;
                _.forEach(vm.tableApi.grid.columns, function (val) {
                  if (val.field === colDef.field) {
                    gridCol = val;
                  }
                });
                if(gridCol) {
                  uiGridGridMenuService.toggleColumnVisibility(gridCol);
                  $timeout(function () {
                    uiGridGridMenuService.toggleColumnVisibility(gridCol);
                  }, 0);
                }
              });
            }
          };

          function checkEditable() {
            return state.isEditable(vm.OBJECT_TYPE);
          }

          vm.$watch(vm.checkEditable, function (newVal) {
            vm.isEditable = newVal;
            if (!vm.isEditable) {
              state.touchedRowsCache.invalidate();
            }
          });

          vm.$watch('objectType', function (newVal) {
            if (newVal) {
              vm.OBJECT_TYPE = vm.objectType + 's';
              setTableData(vm, vm.OBJECT_TYPE);
            }
          });

          vm.$on('discardAdvancedNumberingChanges', function () {
            setTableData(vm, vm.OBJECT_TYPE);
          });

          vm.$on('$destroy', function () {
            state.touchedRowsCache.invalidate();
          });

          vm.$on('getCategoryTable:mf-advanced-numbering', function () {
            vm.$emit('categoryTable:mf-advanced-numbering', vm.tableOptions.data);
          });

          vm.$on('currentSchemeInUseChangedToParts', () => {
            vm.tableOptions.data.forEach((row) => {
              row.scheme = 'default';
              row.prefix = '';
              row.suffix = '';
              row.startingNumber = '';
              row.increment = '';
            })
          });
        }

        function getTooltipText() {
          if (!state.mode.isEditable()) {
            return `Click "Edit" to make changes`
          }
          return 'Create new Default Scheme to make changes'
        }

        function getNextSingleCategoryNumbers(vm, row) {
          const popupMessage = 'Next Numbers:';
          row.objectType = vm.OBJECT_TYPE;
          adNumServ.getSingleCategoryNextNumbers(row)
            .then(function (numbers) {
              const confirm = $mdDialog.alert()
                .title(popupMessage + ' ' + numbers.join(', '))
                .ok('ok');
              $mdDialog.show(confirm);
            })
            .catch(showError)
        }

        const proxy = {
          set: function (target, prop, value) {
            if (prop !== '$$hashKey') {
              state.touchedRowsCache.push(target);
            }
            target[prop] = value;
            return true;
          }
        };

        function setTableData(vm, objectType) {
          vm.progress = true;
          state.touchedRowsCache.invalidate();
          adNumServ.getTableData(objectType)
            .then(function (res) {
              vm.tableOptions.data = getTableData(res)
                .map((row) => new Proxy(row, proxy));
              vm.progress = false;
              // remove previously cached rows
              state.lastValidTableSchemeCache.invalidate();
            })
        }

        function getTableData(tree) {
          return algorithmsService.getFlatArray({
            hierarchicalArr: tree,
            parentFieldName: 'parentCategory',
            subNodesArrayName: 'categoryResponseList',
            callBack: processArray
          })
        }

        function processArray(flatRow, hierarchicalRow, getDepthLevel) {
          flatRow.$$treeLevel = getDepthLevel(hierarchicalRow);
          const schemeData = hierarchicalRow.fuseAdvancedNumbering_active || hierarchicalRow.fuseAdvancedNumbering_edit;
          Object.assign(flatRow, schemeData);

          const properties = ['categoryResponseList', 'parentCategory', 'advancedNumbering'];
          properties.forEach(function (prop) {
            delete flatRow[prop]
          });
          return flatRow;
        }

        function getAttributes() {
          return attributesUtils.getAdvancedNumberingAttributes();
        }

        function buildAdvancedNumberingColumns(attributes) {
          const colDef = attributes.map(function (attr) {
            return buildColDef(attr);
          });
          _.forEach(colDef, col => {
            col.headerCellClass = setHeaderHeight;
          });
          return colDef;
        }

        function setHeaderHeight(grid) {
          const isColumnHigh = grid.columns.some(function (col) {
            return col.displayName.length > 24;
          });

          return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
        }

        function buildColDef(attr) {
          return Object.assign(fuseUtils.parseAttributes(attr), COLUMN_MATCHER[attr.value]);
        }

        function processInput(data, field, row) {
          const validationResult = validateInput(data, field, row);
          if(_.isEmpty(row.invalid)) {
            state.lastValidTableSchemeCache.set(row.categoryId, row)
          }
          return validationResult;
        }

        function validateInput(data, field, row) {
          const trimmedInput = data.trim();
          row.invalid = row.invalid ? row.invalid : {};
          if(field === 'prefix' || field === 'suffix'){
            const spaceValidation = validationService.spaceCharsValidator(trimmedInput);
            if(spaceValidation && spaceValidation.error) {
              row.invalid[field] = spaceValidation.error;
              return '';
            }
          }
          if (field !== 'increment' && field !== 'startingNumber' && field !== 'prefix') {
            return true;
          }
          if (trimmedInput.length === 0) {
            row.invalid[field] = 'This field is required';
            return '';
          }
          if (!fuseUtils.isNumber(data) && field !== 'prefix') {
            row.invalid[field] = 'Please, provide numeric value';
            return '';
          }
          return true;
        }

        function resetInvalid(row) {
          row.invalid = false;
        }

        function handleDropdownChange(vm, row) {
          row.increment = row.increment || 1;
          updateSingleCategoryScheme(vm, row);
        }

        function updateSingleCategoryScheme(vm, row) {
          row.objectType = vm.OBJECT_TYPE;
          adNumServ.updateSingleCategoryScheme(row.categoryId, row)
            .then(function () {
              $mdToast.show($mdToast.simple().textContent(actionMessages.schemeUpdated).position('top right').hideDelay(1000));
            })
            .catch((err) => {
              _.assign(row, state.lastValidTableSchemeCache.get(row.categoryId));
              showError(err);
            })
        }

        function showError(err) {
          $mdToast.show($mdToast.simple().textContent(err)
            .toastClass("md-error-toast-theme").position('top right').hideDelay(4000));
        }

        return {
          templateUrl: 'app/core/directives/mf-advanced-numbering-category-table/mf-advanced-numbering-category-table.html',
          restrict: 'E',
          link: link,
          scope: {
            objectType: '='
          }
        }
      })
})();
