(function () {
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('ColorMenuController', ColorMenuController);

    /** @ngInject */
    function ColorMenuController($mdColorPalette, hostUrlDevelopment, ScrumboardService, $scope, errors, AuthService, $state, $mdToast, BoardService) {
        var vm = this;

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
        var data = '';

        // Data
        vm.boardService = BoardService;
        $scope.$watch('vm.boardService.data', value => {
          if (value !== undefined) {
            vm.board = value || {};
          }
        });

        vm.palettes = $mdColorPalette;

        // Methods
        vm.boardsettingscolor = boardSettingsColorFunction;
        vm.RemoveColor = removeColor;

        function removeColor() {
            vm.board.settings.color = 'Pacific Blue';
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
                boardColor: vm.board.settings.color
            };
            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            BoardService.data.settings.color = response.data.boardColor;
                            break;
                        case 4006:
                            break;
                        default:
                            console.log(response.message);
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
                });
        }

        function boardSettingsColorFunction(paletteNames) {
            vm.board.settings.color = paletteNames;
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
                boardColor: paletteNames
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            BoardService.data.settings.color = response.data.boardColor;
                            break;
                        case 4006:
                            break;
                        default:
                            console.log(response.message);
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
                });
        }
    }
})();
