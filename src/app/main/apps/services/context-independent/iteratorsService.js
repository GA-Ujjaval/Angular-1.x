(function () {

  'use strict';

  angular
    .module('app.objects')
    .factory('iteratorsService', iteratorsService);

  function iteratorsService(){

    function getRange(from, to){
      const range = {from, to};
      range[Symbol.iterator] = from < to ? getIncreasingRangeIterator : getDecreasingRangeIterator;
      return range;
    }

    function getIncreasingRangeIterator(){
      let current = this.from;
      const end = this.to;
      return {
        next(){
          if(current <= end){
            return {
              done: false,
              value: current++
            }
          }
          return {
            done: true
          }
        }
      }
    }

    function getDecreasingRangeIterator(){
      let current = this.from;
      const end = this.to;
      return {
        next(){
          if(current >= end){
            return {
              done: false,
              value: current--
            }
          }
          return {
            done: true
          }
        }
      }
    }

    return {
      getRange
    }

  }

})();
