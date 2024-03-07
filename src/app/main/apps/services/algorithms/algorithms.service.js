(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('algorithmsService', algorithmsService);

  function algorithmsService() {

    /**
     * The function flattens incoming hierarchical array.
     * e.x.: [{ children: [ { children: [ {} ] } ] }, {children: [{}, ... ,{}]}].
     * @param settings {object} with parameters:
     *   - hierarchicalArr [array of objects]
     *   - parentFieldName {string} The name of the field, where to store the link
     *                              to the parent for every single object
     *   - subNodesArrayName {string} The name of the field, where the child nodes a stored
     *   - callBack {function} - the function to be executed for every object in flattened array
     *       callbackArguments: flatRow - the resulting row
     *                          hierarchicalRow - the hierarchical row, corresponding with the flatRow
     *                          getDepthLevel {function} - function, which can be used to get the depth of the
     *                                                     hierarchicalRow inside the tree.
     *                                                     arguments: hierarchicalRow
     * @returns {Array|*}
     */
    function getFlatArray(settings){
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
          flatArr.push(new FlatRow(hierarchicalRow));
          flattenObject(hierarchicalRow);
        });

        return flatArr;
      }

      function FlatRow(hierarchicalRow) {
        return callBack(_.clone(hierarchicalRow), hierarchicalRow, getDepthLevel);
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

    function AlphaNumericSorter(){

      this.alphanumericSort = alphanumericSort;


      /**
       * Standard sorting function, which compares numbers and letters separately.
       * Letters are greater than numbers by default.
       * E.x. 'ab15' is greater then 'ab9' by this function,
       * because it is comparing numbers as numbers, not as strings.
       * @param a - the first value to compare
       * @param b - the second value to compare
       * @returns {boolean} for the sorting algorithm, to define which parameter is greater
       */
      function alphanumericSort(a, b){
        if(!a){  // pushing empty rows to the end
          return -1;
        }
        if(!b){  // pushing empty rows to the end
          return 1;
        }

        var parsedA = getParsedAlphaNumeric(a);
        var parsedB = getParsedAlphaNumeric(b);

        var length = Math.min(parsedA.length, parsedB.length);

        for(var i = 0; i < length; i++){
          var typeA = getType(parsedA[i]);
          var typeB = getType(parsedB[i]);

          if(typeA !== typeB){
            return typeA === 'string' ? 1 : -1 ;
          }
          if(parsedA[i] !== parsedB[i]){
            return parsedA[i] > parsedB[i] ? 1 : -1;
          }
        }

        return parsedA.length > parsedB.length ? 1 : -1;
      }

      function getParsedAlphaNumeric(string){
        var buffer = {
          type: getType(string[0]),
          value: string[0]
        };
        var parsedString = [];

        for(var i = 1; i < string.length; i++){
          var char = string[i];
          if(char === '.' && buffer.type === 'number'){
            buffer.value += char;
            continue;
          }
          var charType = getType(char);
          if(charType === buffer.type){
            buffer.value += char;
          }else{
            parsedString.push(buffer.value);
            buffer.value = char;
            buffer.type = charType;
          }
        }
        if(buffer.value){
          parsedString.push(buffer.type === 'number' ? +buffer.value : buffer.value);
        }
        return parsedString;
      }

      function getType(val){
        return !isNaN(val) ? 'number' : 'string';
      }
    }

    var alphaNumericSorter = new AlphaNumericSorter();

    return {
      getFlatArray: getFlatArray,
      alphanumericSort: alphaNumericSorter.alphanumericSort
    };
  }
})();
