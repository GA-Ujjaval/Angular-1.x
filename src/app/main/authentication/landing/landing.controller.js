(function ()
{
    'use strict';

    angular
        .module('app.landing')
        .controller('landingController', landingController);

    /** @ngInject */
    function landingController($state)
    {
        var vm = this;
      vm.channelNameFunction = channelNameFunction;

      function channelNameFunction(channel){
        //console.log('channel - ',channel);
        $state.go('app.login', {channelName: channel});
      }
    }
})();
