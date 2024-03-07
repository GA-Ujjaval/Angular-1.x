(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, hostUrlDevelopment, $http, $rootScope, AuthService,introService, $timeout, $location)
    {
        var vm = this;
        //For Session---------------------------------------------------------------------------------------------------
        vm.sessionData = {};
        vm.sessionData = AuthService.getSessionData('customerData');
        var params = '';
        var header = '';

        if (vm.sessionData.userId) {
            params = {
                customerId: vm.sessionData.userId
            };
            header = {
                authId: vm.sessionData.authId,
                channel_name: vm.sessionData.channel_name,
                proxy: vm.sessionData.proxy
            };
            if(vm.sessionData.proxy == true){
                params = {
                    customerId: vm.sessionData.userId
                };
                header = {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: false
                };
            }
        }

        $scope.BeforeChangeEvent = function (targetElement) {
            $timeout(function(){
                $(".introjs-helperLayer").css({'background-color':'rgb(45,50,62)'});
                $(".ms-chat-bot-options").css('z-index','9999999');
                $(".ms-chat-bot-options").removeClass('introjs-fixParent');
            });
        };
        $scope.AfterChangeEvent = function(){
            $(".introjs-button").css({'display':'inline-block'});
            $('.introjs-skipbutton').hide();
                if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
                    $('.introjs-skipbutton').show();
                }
        };
        $scope.ExitEvent = function(targetElement) {
            $(".ms-chat-bot-options").css('z-index','50');
        };
        $scope.CompleteEvent = function(targetElement) {
            $(".ms-chat-bot-options").css('z-index','50');
            var req = {
                method: 'POST',
                url: hostUrlDevelopment.test.helpsetting,
                headers: {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
                },
                data: {
                    helpIntroNavigation  : true,
                    authId		 : vm.sessionData.authId,
                    channel_name : vm.sessionData.channel_name,
                    proxy        : vm.sessionData.userRoleSet[0] == 'customer_admin',
                    customerId   : vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId: null
                }
            }
            $http(req).then(function successCallback(response) {
                console.log(response);
            }, function errorCallback(response) {
                console.log(response);
            });
        };

      if(($location.url() == "/customer/dashboard")){
        $timeout(function () {
          if($rootScope.introGlobalHelp && $rootScope.introNavigationFlag != true) {
            $timeout(function () {
              $rootScope.CallMeNavigation();
            });
          }
        },1000);
      }

      $rootScope.IntroOptions = {
            steps: [],
            showStepNumbers: false,
            showBullets: false,
            exitOnOverlayClick: true,
            exitOnEsc:true,
            nextLabel: '<strong>NEXT!</strong>',
            prevLabel: '<span style="color:green">Previous</span>',
            doneLabel: 'Got it'
        };
        if(vm.sessionData.userRoleSet[0] == 'customer_admin') {
        $rootScope.IntroOptions.steps = introService.getIntroObj("navigation");
    } else {
        $rootScope.IntroOptions.steps = introService.getIntroObj("userNavigation");
    }
        // Data
        vm.bodyEl = angular.element('body');
        vm.folded = false;
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        // Methods
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;

        //////////

        /**
         * Toggle folded status
         */
        function toggleMsNavigationFolded()
        {
            vm.folded = !vm.folded;
        }

        // Close the mobile menu on $stateChangeSuccess
        $scope.$on('$stateChangeSuccess', function ()
        {
            vm.bodyEl.removeClass('ms-navigation-horizontal-mobile-menu-active');
        });

    }

})();
