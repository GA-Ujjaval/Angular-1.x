(function () {
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('SettingsSidenavController', SettingsSidenavController);

    /** @ngInject */
    function SettingsSidenavController($mdColorPalette, $http, $rootScope, hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, $mdSidenav, BoardService, $scope,$timeout, introService) {
        var vm = this;

        $scope.BeforeChangeEvent = function (targetElement) {
            $timeout(function(){
                $("#step5").css({'position':'relative'});
                $("#step6").css({'position':'relative'});
                $("#step7").css({'position':'relative'});
                $("#step8").css({'position':'relative'});
                $("#step9").css({'position':'relative'});
                $(".settings-sidenav").removeClass("introjs-fixParent");
                $(".introjs-tooltip").addClass("introjs-tooltip-right");
                $(".introjs-helperLayer").addClass("introjs-helperlayer-right");
                $(".introjs-tooltipReferenceLayer").addClass("introjs-helperlayer-right");
                $(".introjs-tooltipReferenceLayer").css({'z-index':'9999998'});
                $(".introjs-helperLayer").css({'height':'54px'});
                //$(".introjs-helperLayer").css({'background-color':'rgb(160,163,165)'});
                /*$(".ms-chat-bot-options").style('z-index','999999');*/
            });
        };
        $scope.AfterChangeEvent = function (targetElement) {
            $(".introjs-button").css({'display':'inline-block'});
            $('.introjs-skipbutton').hide();
            if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
                $('.introjs-skipbutton').show();
            }
            $timeout(function(){
                $(".settings-sidenav").addClass("settings-sidenav-transform");
                $(".header").css({'z-index':'auto'});
            });
        };
        $scope.Complete = function (targetElement) {
            $timeout(function(){
                $(".settings-sidenav").removeClass("settings-sidenav-transform");
                $(".header").css({'z-index':'49'});
            });
        };
        $scope.CompleteEvent = function (targetElement) {
            $timeout(function(){
                $(".settings-sidenav").removeClass("settings-sidenav-transform");
                $(".header").css({'z-index':'49'});
            });
            $http({
                method: 'POST',
                url: hostUrlDevelopment.test.helpsetting,
                headers: {
                    authId: vm.sessionData.authId,
                    channel_name: vm.sessionData.channel_name,
                    proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
                },
                data: {
                    helpIntroSettingSidenav  : true,
                    authId		 : vm.sessionData.authId,
                    channel_name : vm.sessionData.channel_name,
                    proxy        : vm.sessionData.userRoleSet[0] == 'customer_admin',
                    customerId   : vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId: null
                }
            }).then(function successCallback(response) {
                console.log(response);
            }, function errorCallback(response) {
                console.log(response);
            });
        };

        $scope.IntroOptionsBoard = {
            tooltipPosition : 'left',
            steps:introService.getIntroObj("scrumboardSetting"),
            showStepNumbers: false,
            showBullets: false,
            exitOnOverlayClick: true,
            exitOnEsc:true,
            nextLabel: '<strong>NEXT!</strong>',
            prevLabel: '<span style="color:green">Previous</span>',
            doneLabel: 'Got it'
        };

        //For Error Constnat
        vm.error = errors;

        vm.sessionData = {};
        vm.sessionData = AuthService.getSessionData('customerData');

        //For Service Call Header
        var header = {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.proxy
        };

        //For Service Call Parameter
        var params = '';

        // Data
        var data = '';
        vm.board = BoardService.data || {};

        vm.palettes = $mdColorPalette;
        vm.selectedMenu = 'Settings';

        // Methods
        vm.boardsettingscardCoverImages = boardsettingscardCoverImages;

        $scope.$on('sidenavOpened', function () {
            if($rootScope.introSettingSidenavFlag != true){
                $timeout(function () {
                    $rootScope.CallMeSetting();
                });
            }
        });

        function boardsettingscardCoverImages() {
            if (vm.board.settings.cardCoverImages === true) {
                vm.board.settings.cardCoverImages = false;
            }
            else {
                vm.board.settings.cardCoverImages = true;
            }

            if (vm.sessionData.proxy == true) {
                params = {
                    customerId: vm.sessionData.customerAdminId
                }
            }
            else {
                params = {
                    customerId: vm.sessionData.userId
                }
            }

            data = {
                boardId: BoardService.data.id,
                cardCoverImage: vm.board.settings.cardCoverImages
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            $rootScope.$broadcast("SendUp", "some data");
                            break;
                        case 4006:
                            break;
                        default:
                            console.log(response.message);
                            $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    console.error(response);
                });
        }
    }
})();
