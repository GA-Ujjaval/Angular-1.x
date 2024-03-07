(function() {
  'use strict';

  angular
    .module('app.objects')
    .controller('SelectObjectSizeController', SelectObjectSizeController);


  function SelectObjectSizeController (Count, $mdDialog) {

    var vm = this;

    vm.objectsDefaultSize = Count;

    //Methods
    vm.saveDialog = saveDialog;
    vm.closeDialog = closeDialog;

    function saveDialog(val) {
      $mdDialog.hide(val);
    }
    function closeDialog() {
      $mdDialog.hide();
    }
  }

})();
