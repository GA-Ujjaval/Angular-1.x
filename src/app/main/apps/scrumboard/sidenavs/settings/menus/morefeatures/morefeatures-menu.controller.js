
(function () {
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('MoreFeaturesMenuController', MoreFeaturesMenuController);

    /** @ngInject */
    function MoreFeaturesMenuController(hostUrlDevelopment, introService, $rootScope, $location, $timeout, ScrumboardService, errors, AuthService, $state, $mdToast, $document, $mdDialog, BoardService) {
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
        vm.tasks = [];
        vm.isWhereused = vm.board.isWhereused;
        vm.isResolutionTask = vm.board.isResolutionTask;
        vm.isRevModification = vm.board.isRevModification;
        angular.forEach(vm.board.cards, function(value,key){
            if(value.whereUsedTab === "true"){
                vm.isWhereused = true;
            }
            else{
                vm.isWhereused = false;
            }

            if(value.resolutionTasksTab === "false"){
                vm.isResolutionTask = false;
            }
            else{
                vm.isResolutionTask = true;
            }

            if(value.modificationsTab === "false"){
                vm.isRevModification = false;
            }
            else{
                vm.isRevModification = true;
            }
        });

        // Methods
        vm.CardWhereUsed = CardWhereUsed;
        vm.CardresolutionTasksTab = CardresolutionTasksTab;
        vm.CardisRevModification = CardisRevModification;
        init();

        function init() {
          if($location.url() == '/customer/scrumboard/boards/add' &&  $rootScope.helpIntroAddBoard != true){
            $rootScope.IntroOptionsBoard.steps = introService.getIntroObj("addNewBoard");
            $timeout(function () {
              $rootScope.CallMeScrumboard();
            });
          }

          if($location.url() === '/customer/scrumboard/boards/add' &&  $rootScope.helpIntroAddBoard == true){
            $timeout(function(){
              $( ".question-icon" ).hide();
            });
          }
        }

        function CardWhereUsed() {
            if (vm.board.isWhereused === true) {
                vm.board.isWhereused = "false";
            }
            else {
                vm.board.isWhereused = "true";
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
                isWhereused: vm.board.isWhereused
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            if (response.data.isWhereused === "false") {
                                vm.board.isWhereused = false;
                            }
                            else {
                                vm.board.isWhereused = true;
                            }
                            var lists = [];
                            var cardList = [];
                            if (response.data.list) {
                                if (response.data.list.length > 0) {
                                    angular.forEach(response.data.list, function (value, key) {
                                        if (value.cardList) {
                                            if (value.cardList.length > 0) {
                                                var flag = false;
                                                angular.forEach(value.cardList, function (value2, key2) {
                                                    var idChangeItems = [];
                                                    var priority = [];
                                                    var total = 0;
                                                    var checked = 0;
                                                    if(value2.cardDescription == null){
                                                        value2.cardDescription = '';
                                                    }
                                                    angular.forEach(vm.tasks, function (val) {
                                                        if (value2.cardId === val.cardId) {
                                                            total++;
                                                            if (val.completed === true) {
                                                                checked++;
                                                            }
                                                            flag = true;
                                                        }
                                                    });
                                                    angular.forEach(value2.changeItemList, function (value3, key3) {
                                                        idChangeItems.push(value3.id);
                                                    });
                                                    priority.push(value2.cardPriority);
                                                    cardList.push({
                                                        id: value2.cardId,
                                                        name: value2.cardTitle,
                                                        description: value2.cardDescription,
                                                        idAttachmentCover: value2.idAttachmentCover,
                                                        idMembers: value2.membersIdList,
                                                        idLabels: priority,
                                                        cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                                                        idChangeItems: idChangeItems,
                                                        attachments: value2.attachmentsList,
                                                        subscribed: false,
                                                        checklists: value2.changeItemList,
                                                        checkItems: total || 0,
                                                        checkItemsChecked: checked || 0,
                                                        comments: value2.comments,
                                                        activities:value2.activities,
                                                        due: value2.dueDate,
                                                        resolutionTasksTab: response.data.isResolutionTask,
                                                        modificationsTab: response.data.isRevModification,
                                                        whereUsedTab: response.data.isWhereused,
                                                        modifications: value2.modifications,
                                                        resolutionTasks: value2.resolutionTasks,
                                                        whereUsed: value2.whereUsed
                                                    });
                                                });
                                            }
                                        }
                                        lists.push({
                                            id: value.listId,
                                            name: value.listTitle,
                                            frozenList: value.frozenList,
                                            objectStatus: value.objectStatus,
                                            approveMandatory: value.approveMandatory,
                                            idCards: value.cardIdSet
                                        })
                                    });
                                }
                            }

                            vm.board = BoardService.data;

                            vm.board.id =  response.data.boardId;
                            vm.board.lists = lists;
                            vm.board.cards = cardList;
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

        function CardresolutionTasksTab() {
            if (vm.board.isResolutionTask === true) {
                vm.board.isResolutionTask = "false";
            }
            else {
                vm.board.isResolutionTask = "true";
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
                isResolutionTask: vm.board.isResolutionTask
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:

                            if (response.data.isResolutionTask === "true") {
                                BoardService.data.isResolutionTask = true;
                            }
                            else {
                                BoardService.data.isResolutionTask = false;
                            }
                            var lists = [];
                            var cardList = [];
                            if (response.data.list) {
                                if (response.data.list.length > 0) {
                                    angular.forEach(response.data.list, function (value, key) {
                                        if (value.cardList) {
                                            if (value.cardList.length > 0) {
                                                var flag = false;
                                                angular.forEach(value.cardList, function (value2, key2) {
                                                    var idChangeItems = [];
                                                    var priority = [];
                                                    var total = 0;
                                                    var checked = 0;
                                                    if(value2.cardDescription == null){
                                                        value2.cardDescription = '';
                                                    }
                                                    angular.forEach(vm.tasks, function (val) {
                                                        if (value2.cardId === val.cardId) {
                                                            total++;
                                                            if (val.completed === true) {
                                                                checked++;
                                                            }
                                                            flag = true;
                                                        }
                                                    });
                                                    angular.forEach(value2.changeItemList, function (value3, key3) {
                                                        idChangeItems.push(value3.id);
                                                    });
                                                    priority.push(value2.cardPriority);
                                                    cardList.push({
                                                        id: value2.cardId,
                                                        name: value2.cardTitle,
                                                        description: value2.cardDescription,
                                                        idAttachmentCover: value2.idAttachmentCover,
                                                        idMembers: value2.membersIdList,
                                                        idLabels: priority,
                                                        cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                                                        idChangeItems: idChangeItems,
                                                        attachments: value2.attachmentsList,
                                                        subscribed: false,
                                                        checklists: value2.changeItemList,
                                                        checkItems: total || 0,
                                                        checkItemsChecked: checked || 0,
                                                        comments: value2.comments,
                                                        activities:value2.activities,
                                                        due: value2.dueDate,
                                                        resolutionTasksTab: response.data.isResolutionTask,
                                                        modificationsTab: response.data.isRevModification,
                                                        whereUsedTab: response.data.isWhereused,
                                                        modifications: value2.modifications,
                                                        resolutionTasks: value2.resolutionTasks,
                                                        whereUsed: value2.whereUsed
                                                    });
                                                });
                                            }
                                        }
                                        lists.push({
                                            id: value.listId,
                                            name: value.listTitle,
                                            frozenList: value.frozenList,
                                            objectStatus: value.objectStatus,
                                            approveMandatory: value.approveMandatory,
                                            idCards: value.cardIdSet
                                        })
                                    });
                                }
                            }

                            vm.board = BoardService.data;
                            vm.board.id =  response.data.boardId;
                            vm.board.lists = lists;
                            vm.board.cards = cardList;
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

        function CardisRevModification() {
            if (vm.board.isRevModification === true) {
                vm.board.isRevModification = "false";
            }
            else {
                vm.board.isRevModification = "true";
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
                isRevModification: vm.board.isRevModification
            };

            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:

                            if (response.data.isRevModification === "true") {
                                vm.board.isRevModification = true;
                            }
                            else {
                                vm.board.isRevModification = false;
                            }
                            var lists = [];
                            var cardList = [];
                            if (response.data.list) {
                                if (response.data.list.length > 0) {
                                    angular.forEach(response.data.list, function (value, key) {
                                        if (value.cardList) {
                                            if (value.cardList.length > 0) {
                                                var flag = false;
                                                angular.forEach(value.cardList, function (value2, key2) {
                                                    var idChangeItems = [];
                                                    var priority = [];
                                                    var total = 0;
                                                    var checked = 0;
                                                    if(value2.cardDescription == null){
                                                        value2.cardDescription = '';
                                                    }
                                                    angular.forEach(vm.tasks, function (val) {
                                                        if (value2.cardId === val.cardId) {
                                                            total++;
                                                            if (val.completed === true) {
                                                                checked++;
                                                            }
                                                            flag = true;
                                                        }
                                                    });
                                                    angular.forEach(value2.changeItemList, function (value3, key3) {
                                                        idChangeItems.push(value3.id);
                                                    });
                                                    if(value2.cardPriority != null){
                                                        priority.push(value2.cardPriority);
                                                    }
                                                    cardList.push({
                                                        id: value2.cardId,
                                                        name: value2.cardTitle,
                                                        description: value2.cardDescription,
                                                        idAttachmentCover: value2.idAttachmentCover,
                                                        idMembers: value2.membersIdList,
                                                        idLabels: priority,
                                                        cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3df',
                                                        idChangeItems: idChangeItems,
                                                        attachments: value2.attachmentsList,
                                                        subscribed: false,
                                                        checklists: value2.changeItemList,
                                                        checkItems: total || 0,
                                                        checkItemsChecked: checked || 0,
                                                        comments: value2.comments,
                                                        activities:value2.activities,
                                                        due: value2.dueDate,
                                                        resolutionTasksTab: response.data.isResolutionTask,
                                                        modificationsTab: response.data.isRevModification,
                                                        whereUsedTab: response.data.isWhereused,
                                                        modifications: value2.modifications,
                                                        resolutionTasks: value2.resolutionTasks,
                                                        whereUsed: value2.whereUsed
                                                    });
                                                });
                                            }
                                        }
                                        lists.push({
                                            id: value.listId,
                                            name: value.listTitle,
                                            frozenList: value.frozenList,
                                            objectStatus: value.objectStatus,
                                            approveMandatory: value.approveMandatory,
                                            idCards: value.cardIdSet
                                        })
                                    });
                                }
                            }
                            vm.board = BoardService.data;
                            vm.board.id =  response.data.boardId;
                            vm.board.lists = lists;
                            vm.board.cards = cardList;
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
