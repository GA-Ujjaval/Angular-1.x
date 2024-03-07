(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('decoratorsService', algorithmsService);

  function algorithmsService() {

    const service = {
      denyFrequentCalls: denyFrequentCallsDecorator,
      callOnce
    };

    function denyFrequentCallsDecorator(func, delay = 600) {
      function decoratedFunction() {
        const now = new Date();
        const timeGap = now - (func.lastRun || now);
        func.lastRun = now;
        if ((timeGap > delay) || timeGap === 0) {
          func.apply(this, arguments);
        }
      }
      decoratedFunction.__proto__ = func;
      return decoratedFunction;
    }

    function callOnce(func) {
      function wrapper(...args) {
        if (wrapper.isCalled) {
          return null;
        }
        wrapper.isCalled = true;
        return func(...args);
      }
      wrapper.__proto__ = func;
      return wrapper;
    }



    return service;

  }
})();
