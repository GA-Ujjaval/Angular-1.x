(function () {
    'use strict';

    angular
      .module('app.core')
      .factory('UserActionStoryStorage', function (objectPageEnum, errors, helperData) {

        class RowData {
          constructor(row, costId) {
            this.id = row.objectId;
            this.uniqueIdentity = row.uniqueIdentity ? row.uniqueIdentity : null;
            this.parentIndex = row.parentIndex ? row.parentIndex : null;
            this.cost = ((typeof row.fuseCost) === 'string') ? row.fuseCost.split(' ')[1] : (row.fuseCost + '');
            if (row.fuseCost === errors.noAvailableCurrency) {
              this.costTypeError = true;
            }
            if (!this.uniqueIdentity) {
              delete this.uniqueIdentity;
            }
            if (!this.parentIndex) {
              delete this.parentIndex;
            }
            if (this.uniqueIdentity) {
              this.qty = row.quantity;
            }
          }
        }

        class PackedObject {
          constructor(rowsChanged, costType) {
            this.rowsChanged = rowsChanged;
            this.newCostType = costType;
          }
        }

        function UserActionStoryStorage(vmRef) {
          const vm = vmRef;

          this.getStory = getStory;

          function getStory(pageType) {
            const tableContent = pageType === objectPageEnum.heirarchicalPage ?
              vm.hierarchicalGridOptions.data : vm.flatViewGridOptions.data;
            const appliedCostTypes = getCostTypesApplied(tableContent);
            const packedTableData = getPackedTableData(appliedCostTypes, tableContent);
            packedTableData.forEach(function (packedObject) {
              if (packedObject.newCostType === helperData.rollupCostId) {
                packedObject.newCostType = helperData.backendRollupCostId;
              }
            });

            const story = {actionStory: packedTableData};

            if (pageType === objectPageEnum.flatPage) {
              story.unitCost = vm.unitCostValue;
            }

            return story;
          }

          function getCostTypesApplied(tableContent) {
            var appliedCostTypes = [];
            tableContent.forEach(function (row) {
              if (row.objectId) {
                appliedCostTypes.push(row.costType);
              }
            });

            return _.uniq(appliedCostTypes);
          }

          function getPackedTableData(appliedCostTypes, tableContent) {
            return appliedCostTypes.map(function (costType) {
              return getPackedCostObject(costType, tableContent);
            });
          }

          function getPackedCostObject(costType, tableContent) {
            const rowsChanged = tableContent
              .filter((row) => {
                return row.costType === costType
              })
              .map((row) => {
                return new RowData(row, costType);
              });
            return new PackedObject(rowsChanged, costType);
          }
        }

        return UserActionStoryStorage;
      });
  }
)();
