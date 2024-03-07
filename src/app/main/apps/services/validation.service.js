(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('validationService', PageTitleService);

  function PageTitleService() {

    const errors = {
      empty: 'This field is required',
      numeric: 'Please, provide a positive numeric value',
      notDecimalNumeric: 'Please, provide a positive numeric value',
      positiveNumeric: 'Please, provide a positive numeric value',
      leadingSign: 'Please, provide a positive numeric value',
      spaceChars: 'Please, provide a positive numeric value'
    };

    function validationPipe(value, validators) {
      return validators.reduce((acc, validator) => acc ? acc : validator(value), null);
    }

    const emptyValidator = getValidator(isNotEmptyCheck, errors.empty);
    const leadingSignValidator = getValidator(isNotLeadingSignCheck, errors.leadingSign);
    const notDecimalNumberValidator = getValidator(isNotDecimalNumberCheck, errors.notDecimalNumeric);
    const positiveNumberValidator = getValidator(isPositiveNumberCheck, errors.positiveNumeric);
    const numberValidator = getValidator(isNumberCheck, errors.numeric);
    const spaceCharsValidator = getValidator(isWithoutSpaceCharsCheck, errors.spaceChars);

    function getValidator(checkFn, error) {
      return function (...args) {
        return checkFn(...args) ? null : {error};
      }
    }

    function isNotEmptyCheck(string = '') {
      return string && !!string.toString().trim().length
    }

    function isNotLeadingSignCheck(string = '', signs = ['+', '-']) {
      return !signs.some((sign) => sign === string[0])
    }

    function isNotDecimalNumberCheck(string = '') {
      return string.toString().indexOf('.') === -1
    }

    function isPositiveNumberCheck(string = '') {
      return +string > 0;
    }

    function isNumberCheck(val) {
      return !isNaN(val);
    }

    function isWithoutSpaceCharsCheck(string = '') {
      return !string.match(/\s/);
    }

    return {
      emptyValidator,
      leadingSignValidator,
      notDecimalNumberValidator,
      positiveNumberValidator,
      numberValidator,
      spaceCharsValidator,
      validationPipe
    };
  }
})();
