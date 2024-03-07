(function() {
  angular
    .module('app.core')
    .filter('removeProtocol', removeProtocol);

  function removeProtocol(){
    return function(input){
      if(!input)
        return;

      var count = input.indexOf('://');
      input = (count === -1)? input : input.slice(count+3);
      var wwwCount = input.indexOf('www.');
      if(wwwCount === -1)
        wwwCount = -4;
      input = input.slice(wwwCount+4);

      var isLastSlash;
      isLastSlash = (input[input.length - 1] === '/');

      if(isLastSlash){
        input = input.slice(0, -1);
      }
      return input;
    }
  }
})();
