(function () {
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('MembersMenuController', MembersMenuController);

    /** @ngInject */
    function MembersMenuController(hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, $document, $mdDialog, BoardService) {
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
        vm.newMemberSearchInput = '';
        vm.buttonDisable = true;

        vm.roleSet = [{
            disp: 'Project Engineer',
            val: 'project_engineer'
        }, {
            disp: 'Release Coordinator',
            val: 'release_coordinator'
        }, {
            disp: 'Project Manager',
            val: 'project_manager'
        }, {
            disp: 'Read Only',
            val: 'read_only'
        }];

        // Methods
        vm.addNewMember = addNewMember;
        vm.removeMember = removeMember;
        vm.addRoleChipsFunction = addRoleChipsFunction;
        vm.buttonDisableFunction = buttonDisableFunction;

        function buttonDisableFunction() {
            vm.buttonDisable = false;
        }

        /**
         * Add New Member
         */
        function addNewMember(boardRole) {
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
                boardRole: boardRole
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            vm.buttonDisable = true;
                            break;
                        case 4006:
                            break;
                        default:
                            console.log(response.message);
                    }
                })
                .catch(function (response) {
                    vm.progress = false;
                    console.error(response);
                });
        }

        /**
         * Remove member
         *
         * @param ev
         * @param memberId
         */
        function removeMember(ev, index) {
            var confirm = $mdDialog.confirm({
                title: 'Remove Roles',
                parent: $document.find('#scrumboard'),
                textContent: 'Are you sure want to remove roles?',
                ariaLabel: 'remove roles',
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                ok: 'Remove',
                cancel: 'Cancel'
            });

            $mdDialog.show(confirm).then(function () {
                vm.board.boardRole.splice(index, 1);
                addNewMember(vm.board.boardRole);
            }, function () {
                // Canceled
            });
        }

        function addRoleChipsFunction() {

            var length = vm.board.boardRole.length;
            var dataPush = false;
            vm.buttonDisable = true;
            if (vm.board.boardRole.length === 0) {
                vm.board.boardRole.push(vm.selectRole);
                addNewMember(vm.board.boardRole);
                vm.selectRole = '';
            }
            else if (length < 4) {
                angular.forEach(vm.board.boardRole, function (val, key) {
                    if (val === vm.selectRole) {
                        dataPush = true;
                    }
                });
                if (dataPush === false) {
                    vm.board.boardRole.push(vm.selectRole);
                    addNewMember(vm.board.boardRole);
                }
                vm.selectRole = '';
            }
        }

    }
})();
