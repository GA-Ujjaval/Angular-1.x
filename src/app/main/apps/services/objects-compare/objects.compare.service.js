(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('objectsCompareService', objectsCompareService);


  /** @ngInject */
  function objectsCompareService(CustomerService, hostUrlDevelopment, AuthService) {

    var service = {
      getDataForComparison: getDataForComparison,
      getFlatArray: getFlatArray,
      linkScrollingTables: linkScrollingTables,
      compareTables: compareTables
    };

    var sessionData;

    function NoDataNeeded() {
      this.additionalInfo = false;
      this.attachmentData = false;
      this.basicInfo = false;
      this.bomFlatCompare = false;
      this.bomHierarchicalCompare = false;
    }

    /**
     *
     * @param dataParams {object} which configures needed back end data. possible fields:
     *  - additionalInfo {boolean}
     *  - attachmentData {boolean}
     *  - basicInfo {boolean}
     *  - bomFlatCompare {boolean}
     *  - bomHierarchicalCompare {boolean}
     * @param idsToCompare [{string}] - ids of compared objects
     * @returns {*}
     */
    function getDataForComparison(dataParams, idsToCompare) {
      sessionData = AuthService.getSessionData('customerData');
      var stringParams = {
        customerId: sessionData.proxy === true ? sessionData.customerAdminId : null,
        requestCompareObjectIds: idsToCompare
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.getcompareresponse, stringParams, Object.assign(new NoDataNeeded(), dataParams));
    }

    /**
     * Finds all the ui grid tables inside the container and synchronizes horizontal scrolling of them
     * @param containerId {string}
     */
    function linkScrollingTables(containerId) {
      var tableCollection = window.document.querySelectorAll('#' + containerId + ' .ui-grid-viewport');
      var convertCollectionToArr = [].slice;
      var tableArray = convertCollectionToArr.call(tableCollection);
      var scrollingTables = tableArray.filter(function (table, i) {
        return (i + 1) % 2 === 0;
      });
      if (scrollingTables.length === 0) {
        return;
      }
      if (scrollingTables[0].onscroll) {
        return;
      }
      scrollingTables.forEach(function (table) {
        table.onscroll = getScrollLinkingFunc(table, scrollingTables);
      });
    }

    function getScrollLinkingFunc(table, scrollingTables) {
      return function () {
        var topScrollPosition = table.scrollTop;
        var ratio = table.scrollLeft / (table.clientWidth - table.scrollWidth);

        scrollingTables
          .filter(function (tab) {
            return table.$$hashKey !== tab.$$hashKey
          })
          .forEach(function (table) {
            if (table.scrollTop !== topScrollPosition) {
              table.scrollTop = topScrollPosition;
            } else {
              table.scrollLeft = _.round(ratio * (table.clientWidth - table.scrollWidth), 0);
            }
          });
      }
    }

    /**
     * The function flattens incoming hierarchical array.
     * e.x.: [{ children: [ { children: [ {} ] } ] }, {children: [{}, ... ,{}]}].
     * @param settings {object} with parameters:
     *   - hierarchicalArr [array of objects]
     *   - parentFieldName {string} The name of the field, where to store the link
     *                              to the parent for every single object
     *   - subNodesArrayName {string} The name of the field, where the child nodes a stored
     *   - callBack {function} - the function to be executed for every object in flattened array
     *       callbackArguments: flatRow - the resulting row. Copy of the hierarchical row.
     *                                    So, flatRow !=== hierarchicalRow
     *                          hierarchicalRow - the hierarchical row, corresponding with the flatRow.
     *                                            It is inside the tree
     *                          getDepthLevel {function} - function, which can be used to get the depth of the
     *                                                     hierarchicalRow inside the tree.
     *                                                     arguments: hierarchicalRow
     * @returns {Array|*}
     */
    function getFlatArray(settings) {
      var flatter = new ObjectFlatter(settings.parentFieldName, settings.subNodesArrayName, settings.callBack);
      return flatter.getFlatArray(settings.hierarchicalArr);
    }

    function ObjectFlatter(parentFieldName, subNodesArrayName, callBack) {
      var flatArr = [];

      this.getFlatArray = getFlatArray;

      function getFlatArray(hierarchicalArr) {
        flatArr.length = 0;
        var wrapper = {};
        wrapper[subNodesArrayName] = hierarchicalArr;
        return flattenObject(wrapper);
      }

      /**
       * Recursively flattens the incoming object
       * @returns array [{object},{object}]
       */
      function flattenObject(obj) {
        if (!obj[subNodesArrayName] || !obj[subNodesArrayName].length) return;

        obj[subNodesArrayName].forEach(function (hierarchicalRow) {
          hierarchicalRow[parentFieldName] = obj;
          var newFlatRow = getFlatRow(hierarchicalRow);
          if (newFlatRow) {
            flatArr.push(newFlatRow);
          }
          flattenObject(hierarchicalRow);
        });

        return flatArr;
      }

      function getFlatRow(hierarchicalRow) {
        return callBack(_.clone(hierarchicalRow), hierarchicalRow, getDepthLevel, getRootParent);
      }

      /**
       * Return the root parent of a giver hierarchicalRow. If the given arguments is a root parent,
       * then parent === hierarhicalRow in the callback
       * @param treeNode
       * @returns {*}
       */
      function getRootParent(treeNode) {
        var currentNode = treeNode;
        while (currentNode[parentFieldName][parentFieldName]) {
          currentNode = currentNode[parentFieldName];
        }
        return currentNode;
      }

      function getDepthLevel(treeNode) {
        var level = -1;
        var currentNode = treeNode;

        while (currentNode[parentFieldName]) {
          currentNode = currentNode[parentFieldName];
          level++;
        }
        return level;
      }
    }

    /**
     * To get more info on settings look at CompareTablesProcessor class
     * @returns [ [{object}] , ..., [{object}] ]
     */
    function compareTables(settings) {
      return new CompareTablesProcessor(settings)
        .matchRows()
        .sortAdditional()
        .handleDeletedRows()
        .handleNewRows()
        .mapChangedRows()
        .getData();
    }

    /**
     * Class which is responsible for handling data to compare in several tables. Makes the data consistent.
     * Should be used when we need to compare data for several objects in several tables.
     * e.x. used to generate data for attachment compare of objects.
     *   In order to get proper result you should call methods in the next sequence, otherwise it will not work:
     * 1.sortAdditional
     * 2.handleDeletedRows
     * 3.handleNewRows
     * @param settings {object}, field:
     *  - tablesData {object} - the data of tables to be compared. contains initial rows of tables
     *                          (e.x. 3 rows for 1st, 1 for 2nd, 5 for 3d)
     *  - codeFieldName {string} - the name of the field, where the comparison code is set.
     *                             (compare code shows the relation between compared object and base object)
     *  - dataFieldName {string} - the name of the field (it will be an object)
     *                             which contain the info about particular property of compared object and
     *  - compareSuffix {string} - As a result we will get object with fields. Every meaningful field will have its
     *                             copy with this suffix (fieldName + compareSuffix) in order to be able to determine
     *                             the compare code of a particular field in resulting object
     *  - newValue {string} - possible value of compareCode. means that the field is new
     *  - discard {string} - possible value of compareCode. means that the field is discarded/deleted
     *  - change {string} - possible value of compareCode. means that the field is changed
     * @constructor
     */
    function CompareTablesProcessor(settings) {

      let data = settings.tablesData.map((table) => {
        return table ? table : [];
      });

      var codeFieldName = settings.codeFieldName;
      var dataFieldName = settings.dataFieldName;
      var compareSuffix = settings.compareSuffix;
      var statusCode = {
        new: settings.newValue,
        discard: settings.discard,
        change: settings.change
      };

      this.sortAdditional = sortAdditional;
      this.handleDeletedRows = handleDeletedRows;
      this.handleNewRows = handleNewRows;
      this.getData = getData;
      this.mapChangedRows = mapChangedRows;
      this.matchRows = matchRows;

      function matchRows() {
        data.forEach((table) => {
          table.sort((a, b) => {
            return a.name > b.name ? 1 : -1;
          })
        });
        return this;
      }

      function mapChangedRows() {
        const baseTableIndex = 0;
        data[baseTableIndex].forEach( (row, index) => {
          const sameLevelRows = getSameLevelRows(index, data);
          const isChanged = sameLevelRows.some((row) => {
            return isRowChanged(row);
          });
          if (isChanged) {
            sameLevelRows.forEach((row) => {
              row[settings.changedRowMark] = true;
            })
          }
        });
        return this;
      }

      function isRowChanged(row) {
        return _.some(row, function (value, key) {
          if (key.indexOf(compareSuffix) !== -1 && value !== 'SAME' && value !== 'BASE') {
            return true;
          }
        })
      }

      function getSameLevelRows(i, arr) {
        return arr.map((table) => {
          return table[i];
        });
      }

      function getData() {
        return data;
      }

      /**
       * Moves all additional rows (all new rows) to the end of the corresponding array
       * @returns {sortAdditional}
       */
      function sortAdditional() {
        data.forEach(function (table) {
          table.sort(compareRows)
        });
        return this;
      }

      function compareRows(a, b) {
        if (a[codeFieldName] === statusCode.new) {
          return 1;
        }
        if (b[codeFieldName] === statusCode.new) {
          return -1;
        }
      }

      /**
       * For every deleted row it inserts its copy to table, where the row was deleted
       * @returns {handleDeletedRows}
       */
      function handleDeletedRows() {
        var baseTable = data[0];
        var comparedTables = data.slice(1);
        baseTable.forEach((baseItem, i) => {
          comparedTables.forEach(insertDeletedRow.bind(null, baseItem, i));
        });
        return this;
      }

      function insertDeletedRow(baseItem, i, comparedTable) {
        if (_.findIndex(comparedTable, new HelpObj(baseItem[dataFieldName])) === -1) {
          comparedTable.splice(i, 0, new PresetRow(baseItem, statusCode.discard));
        }
      }

      function HelpObj(data) {
        this[dataFieldName] = data;
      }

      function PresetRow(base, compareCode) {
        Object.assign(this, base);
        _.forEach(this, function (value, key, source) {
          if (key.indexOf(compareSuffix) !== -1) {
            source[key] = compareCode;
          }
        })
      }

      /**
       * Create a new row for every newly added row. Make the number of rows equal in all the tables
       * @returns {handleNewRows}
       */
      function handleNewRows() {
        var comparedArrays = data.slice(1);
        var baseIndex = 0;
        var compareIndex = 1;
        var arraysOfNewRows = getArraysOfNewRows(data, comparedArrays, baseIndex, compareIndex);
        var setOfNewRows = getSetOfNewRows(arraysOfNewRows);
        var projections = arraysOfNewRows.map(getProjection.bind(null, setOfNewRows));
        comparedArrays = comparedArrays.map(function (arr, i) {
          return _.concat(arr, projections[i]);
        });

        data[baseIndex] = _.concat(data[baseIndex], _.fill(new Array(setOfNewRows.length), new EmptyRow()));
        data = _.concat([data[baseIndex]], comparedArrays);
        return this;
      }

      /**
       * Returns array of arrays of newly added rows for each table and removes these rows from initial array
       * (which contains all the data for particular table)
       * @param sourceData [ [{object}] ] - the main array of data to be processed
       * @param comparedArrays [ [{object}] ] - the arrays, which are not the base of comparison
       * @param baseIndex {number} - the index of the base table
       * @param compareIndex {number} - the index of the start of compared tables
       * @returns {*}
       */
      function getArraysOfNewRows(sourceData, comparedArrays, baseIndex, compareIndex) {
        var lengths = sourceData.map(function (table) {
          return table.length;
        });
        var baseLength = lengths[baseIndex];
        var comparedLengthes = lengths.slice(compareIndex);
        var differences = comparedLengthes.map(function (length) {
          return length - baseLength;
        });
        return differences.map(function (difference, i) {
          return popLastRows(comparedArrays[i], difference);
        });
      }

      /**
       * Gets the array of arrays of newly added rows and return an array which is a union of these sets
       * @param arraysOfNewRows [ [{object}] ]
       * @returns {Array}
       */
      function getSetOfNewRows(arraysOfNewRows) {
        var settings = arraysOfNewRows.slice();
        settings.push(dataFieldName);
        return _.unionBy.apply(null, settings);
      }

      function EmptyRow() {
      }

      function getProjection(projectionDestination, projectionSource) {
        return projectionDestination.map(function (item, i) {
          var intersection = _.find(projectionSource,
            new HelpObj(projectionSource[i] ? projectionSource[i][dataFieldName] : null));
          return intersection ? intersection : new EmptyRow();
        });
      }

      function popLastRows(arr, n) {
        var result = [];
        for (var i = 0; i < n; i++) {
          result.push(arr.pop());
        }
        return result;
      }
    }


    return service;
  }
})();
