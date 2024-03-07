(function ()
{
    'use strict';

    angular
        .module('app.customer.scrumboard')
        .controller('FiltersSidenavController', FiltersSidenavController);

    /** @ngInject */
    function FiltersSidenavController(msUtils, BoardService, CardFilters, AuthService, ScrumboardService, hostUrlDevelopment, $scope, $rootScope, $mdMenu)
    {
        var vm = this;

        //For Session
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
        vm.board = BoardService.data || {};

        vm.cardFilters = CardFilters;

        vm.labels = BoardService.data.labels;

        vm.members = [];

        vm.selectedMenu = 'Settings';

        // Methods
        vm.exists = msUtils.exists;

        vm.partName = '';
        vm.partNumber = '';

        vm.toggleInArray = msUtils.toggleInArray;

        vm.clearFilters = CardFilters.clear;
        vm.filteringIsOn = CardFilters.isOn;

        /* Avatar Image Availability*/
        vm.isAvatarAvailable = isAvatarAvailable;
        /* default avatar */
        vm.defaultAvatar = defaultAvatar;
        vm.doFilterOnBoard = doFilterOnBoard;

        $rootScope.$on('clearAll', (event, data) => {
          if (data) {
            vm.partName = '';
            vm.partNumber = '';
          }
        });

        init();

        function doFilterOnBoard(partName, partNumber) {

          $rootScope.$emit('boardLoaded', true);

          if (!partName && !partNumber) {
            vm.cardFilters.partName = '';
            vm.cardFilters.partNumber = '';
            vm.cardFilters.cardIds = [];
            $rootScope.$emit('boardLoaded', false);
            return;
          }
          if (vm.sessionData.proxy === true) {
            params = {
              customerId: vm.sessionData.customerAdminId
            };
          }
          else {
            params = {
              customerId: vm.sessionData.userId
            };
          }
          if (partName) {
            vm.cardFilters.partName = partName;
          }

          if (partNumber) {
            vm.cardFilters.partNumber = partNumber;
          }
          params.boardId = vm.board.id;
          params.listIds = vm.board.lists.map(list => list.id);
          params.partName = partName;
          params.partNumber = partNumber;
          ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.filterinboards, params, '', header)
            .then(function (response) {
              vm.cardFilters.cardIds = response.data;
              $rootScope.$emit('boardLoaded', false);
            })
            .catch(function (response) {
              vm.progress = false;
              console.error(response);
            });
        }

        function init(){
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

            ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getuserbyrole, params, '', header)
                .then(function (response) {
                    //For Progress Loader
                    vm.progress = false;
                    switch (response.code) {
                        case 0:
                            var members = [];
                            angular.forEach(response.data.Members, function (value, key) {
                                var FullName = value.firstName + ' ' + value.lastName;
                                members.push({
                                    id: value.userId,
                                    name: FullName
                                });
                            });
                            vm.members = members;
                            break;
                        case 1006:
                            console.log(response.message);
                            //$mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
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
       * default avatar
       * @param index
       */
      function defaultAvatar (nameOfOwner)
      {
        var initials =  (nameOfOwner||'').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
      /**
       * find avatar image existance
       * @param index
       */
      function isAvatarAvailable(avatar)
      {
        return avatar? true : false;
      }

    }
})();
