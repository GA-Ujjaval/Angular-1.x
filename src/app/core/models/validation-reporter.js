(function () {
    'use strict';

    class ValidationReporter{
      constructor(isError = false, message){
        this.isError = isError;
        this.message = message;
      }
    }

    angular
      .module('app.core')
      .factory('ValidationReporter', function () {
        return ValidationReporter;
      });
  }
)();
