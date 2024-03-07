(function () {
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('PriorityMenuController', PriorityMenuController);

    /** @ngInject */
    function PriorityMenuController(hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, $document, $mdColorPalette, $mdDialog, fuseGenerator, msUtils, BoardService) {
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
        vm.board = BoardService.data || {};
        vm.palettes = $mdColorPalette;
        vm.rgba = fuseGenerator.rgba;
        vm.hue = 500;
        vm.newLabelColor = 'red';
        vm.newLabelName = '';

        // Methods
        vm.addNewLabel = addNewLabel;
        vm.addNewLabels = addNewLabels;
        vm.removeLabel = removeLabel;

        /**
         * Add New Label
         */
        function addNewLabel(label) {
            vm.progress = true;
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
            var boardPriority = [];
            if (vm.newLabelName != '') {
                boardPriority.push({
                    name: vm.newLabelName,
                    color: vm.newLabelColor
                });
                vm.newLabelName = '';
            }
            if(label){
              boardPriority.push({
                  id: label.id,
                  name: label.name,
                  color: label.color
              });
            }

            data = {
                boardId: BoardService.data.id,
                boardPriority: boardPriority
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            var labels = [];
                            if (response.data.boardPriority.length > 0) {
                                angular.forEach(response.data.boardPriority, function (value, key) {
                                    labels.push({
                                        id: value.id,
                                        name: value.name,
                                        color: value.color
                                    })
                                });
                            }
                            vm.board = BoardService.data;
                            if (response.data.isWhereused === "true") {
                                vm.isWhereused = true;
                            }
                            else {
                                vm.isWhereused = false;
                            }
                            if (response.data.isResolutionTask === "true") {
                                vm.isResolutionTask = true;
                            }
                            else {
                                vm.isResolutionTask = false;
                            }
                            if (response.data.isRevModification === "true") {
                                vm.isRevModification = true;
                            }
                            else {
                                vm.isRevModification = false;
                            }
                            vm.board.id =  response.data.boardId;
                            vm.board.isWhereused = vm.isWhereused;
                            vm.board.isResolutionTask = vm.isResolutionTask;
                            vm.board.isRevModification = vm.isRevModification;
                            vm.board.labels = labels;
                            BoardService.data.labels = labels;
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

        /**
         * Add New Label color
         */
        function addNewLabels(labelid,labelname,labelcolor) {
            vm.progress = true;
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
            var boardPriority = [];
            boardPriority.push({
                  id: labelid,
                  name: labelname,
                  color: labelcolor
            });

            data = {
                boardId: BoardService.data.id,
                boardPriority: boardPriority
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            var labels = [];
                            if (response.data.boardPriority.length > 0) {
                                angular.forEach(response.data.boardPriority, function (value, key) {
                                    labels.push({
                                        id: value.id,
                                        name: value.name,
                                        color: value.color
                                    })
                                });
                            }
                            vm.board = BoardService.data;
                            if (response.data.isWhereused === "true") {
                                vm.isWhereused = true;
                            }
                            else {
                                vm.isWhereused = false;
                            }
                            if (response.data.isResolutionTask === "true") {
                                vm.isResolutionTask = true;
                            }
                            else {
                                vm.isResolutionTask = false;
                            }
                            if (response.data.isRevModification === "true") {
                                vm.isRevModification = true;
                            }
                            else {
                                vm.isRevModification = false;
                            }
                            vm.board.id =  response.data.boardId;
                            vm.board.isWhereused = vm.isWhereused;
                            vm.board.isResolutionTask = vm.isResolutionTask;
                            vm.board.isRevModification = vm.isRevModification;
                            vm.board.labels = labels;
                            BoardService.data.labels = labels;
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

        /**
         * Remove label
         *
         * @param ev
         * @param labelId
         */
        function removeLabel(ev, index) {
            var confirm = $mdDialog.confirm({
                title: 'Remove Priority',
                parent: $document.find('#scrumboard'),
                textContent: 'Are you sure want to remove priority?',
                ariaLabel: 'remove priority',
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                ok: 'Remove',
                cancel: 'Cancel'
            });

            $mdDialog.show(confirm).then(function () {
                var priority = vm.board.labels.splice(index, 1);
                var arr = priority[0].id;
                if (vm.sessionData.proxy == true) {
                    params = {
                        boardId: BoardService.data.id,
                        priorityId: arr,
                        customerId: vm.sessionData.customerAdminId
                    }
                }
                else {
                    params = {
                        boardId: BoardService.data.id,
                        priorityId: arr,
                        customerId: vm.sessionData.userId
                    }
                }

                ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removepriority, params, '', header)
                    .then(function (response) {
                        //For Progress Loader
                        vm.progress = false;
                        switch (response.code) {
                            case 0:
                                BoardService.data = response.data;
                                $mdToast.show($mdToast.simple().textContent("Remove Priority Successfully...").position('top right'));
                                break;
                            case 4004:
                                console.log(response.message);
                                break;
                            case 1006:
                                console.log(response.message);
                                break;
                            case 4006:
                                console.log(response.message);
                                break;
                            default:
                                console.log(response.message);
                        }
                    })
                    .catch(function (response) {
                        vm.progress = false;
                        $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                    });

            }, function () {
                // Canceled
            });
        }

    }
})();
