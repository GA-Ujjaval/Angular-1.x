(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .controller('ScrumboardController', ScrumboardController);

  /** @ngInject */
  function ScrumboardController(hostUrlDevelopment, $http, ScrumboardService, errors, AuthService, $state, $mdSidenav, CardFilters, $mdToast, BoardService, $scope, $timeout, $rootScope, introService, $location) {
    var vm = this;
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.checkBoardName = checkBoardName;

    function checkBoardName(boardName) {
      if (boardName.trim().length === 0) {
        return ''
      }
    }

    $rootScope.ChangeEvent = function (targetElement) {
      $timeout(function () {
        $(".introjs-helperLayer").css({'background-color': 'rgb(255,255,255)'});
        if (vm.sessionData.userRoleSet[0] != 'customer_admin' && targetElement.id != 'step1') {
          if (vm.board.lists.length == 1) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-one");

          }
          else if (vm.board.lists.length == 2) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-two");

          }
          else if (vm.board.lists.length == 3) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-three");

          }
          else if (vm.board.lists.length == 4) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-four");
          }
          else if (vm.board.lists.length == 5) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-five");
          }
          else if (vm.board.lists.length == 6) {
            $(".introjs-helperLayer").addClass("introjs-helperLayer-settings-six");
          }
          //$(".introjs-helperLayer" ).attr( "style", "width: " + vm.board.lists.length*344 + "px !important;" );
          $("#board .list-wrapper .list .list-header").addClass('introjs-helperLayer-user');
        } else if (vm.sessionData.userRoleSet[0] != 'customer_admin' && targetElement.id == 'step1') {
          $("#board .list-wrapper .list .list-header").removeClass('introjs-helperLayer-user');
        }
      })
    };
    $rootScope.AfterChangeEvent = function () {
      $(".introjs-button").css({'display': 'inline-block'});
      if ($location.url() != '/customer/scrumboard/boards/add') {
        $('.introjs-skipbutton').hide();
      } else {
        $('.introjs-skipbutton').hide();
        if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
          $('.introjs-skipbutton').show();
        }
      }
    };
    $rootScope.Complete = function () {
      $timeout(function () {
        if (vm.sessionData.userRoleSet[0] != 'customer_admin') {
          $("#board .list-wrapper .list .list-header").removeClass('introjs-helperLayer-user');
        }
      });
    };

    $rootScope.CompleteEvent = function (targetElement) {
      $timeout(function () {
        if (vm.sessionData.userRoleSet[0] != 'customer_admin') {
          $("#board .list-wrapper .list .list-header").removeClass('introjs-helperLayer-user');
        }
      });
      if ($location.url() == '/customer/scrumboard/boards/add') {
        $http({
          method: 'POST',
          url: hostUrlDevelopment.test.helpsetting,
          headers: {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
          },
          data: {
            helpIntroScrumboard: true,
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin',
            customerId: vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId : null
          }
        }).then(function successCallback(response) {
          console.log(response);
        }, function errorCallback(response) {
          console.log(response);
        });
      }
    };
    $rootScope.IntroOptionsBoard = {
      steps: [],
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>',
      doneLabel: 'Got it'
    };
    if (vm.sessionData.userRoleSet[0] == 'customer_admin') {
      $rootScope.IntroOptionsBoard.steps = introService.getIntroObj("scrumboard");
    } else {
      $rootScope.IntroOptionsBoard.steps = introService.getIntroObj("userScrumboard");
    }
    if ($rootScope.IntroOptionsBoard.steps[3]) {
      $('.introjs-button').addClass('introjs-disabled');
    }

    //For Error Constnat
    vm.error = errors;

    //For Progress Loader
    vm.progress = false;

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
    var data = '';

    // Data
    vm.currentView = 'board';
    vm.board = BoardService.data || {};
    vm.boardBackup = angular.copy(BoardService.data) || {};
    vm.boardList = ScrumboardService.allBoardsData || [];
    vm.boardSelectorVisible = false;
    vm.newLabelColor = 'red';

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.updateBoardUri = updateBoardUri;
    vm.clearFilters = CardFilters.clear;
    vm.filteringIsOn = CardFilters.isOn;

    if (ScrumboardService.allBoardsData.length < 1) {
      init();
    }

    $scope.$on('refreshBoard', refreshBoard);

    function refreshBoard() {
      init();
    }

    $scope.$on('promoteDemoteInProgress', (event, value) => {
      vm.progress = value;
    });

    function init() {

    }

    vm.loadBoards = loadBoards;

    function loadBoards() {
      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId
      };
      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboards, params, '', header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:
              var flag = [];
              angular.forEach(response.data, function (val, key) {
                flag.push({
                  name: val.boardTitle,
                  id: val.boardId
                });
              });
              ScrumboardService.allBoardsData = flag;
              vm.boardList = flag;

              vm.boardSelectorVisible = !vm.boardSelectorVisible;
              break;
            case 403:
              console.log(response.message);
              break;
            case 1006:
              console.log(response.message);
              break;
            case 4004:
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
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }


    ////////
    /**
     * Update Board Uri
     *
     * Once you connect your app to your server,
     * you would do this on your API server.
     */
    function updateBoardUri() {

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

      if (vm.board.id) {
        data = {
          boardId: vm.board.id,
          boardTitle: vm.board.name
        };

      } else {
        data = {
          boardTitle: vm.board.name
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdateboard, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              if (response.data.isWhereused === "false") {
                vm.isWhereused = false;
              }
              else {
                vm.isWhereused = true;
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
              vm.board.boardRole = [];
              vm.board = {
                name: response.data.boardTitle,
                boardRole: response.data.boardRole,
                id: response.data.boardId,
                settings: {
                  color: response.data.boardColor,
                  subscribed: false,
                  cardCoverImages: response.data.cardCoverImage
                },
                isWhereused: vm.isWhereused,
                isResolutionTask: vm.isResolutionTask,
                isRevModification: vm.isRevModification,
                lists: [],
                cards: [],
                members: [],
                labels: response.data.boardPriority
              };
              BoardService.data.isWhereused = vm.isWhereused;
              BoardService.data.isResolutionTask = vm.isResolutionTask;
              BoardService.data.isRevModification = vm.isRevModification;
              BoardService.data.boardRole = response.data.boardRole;
              BoardService.data.labels = response.data.boardPriority;
              BoardService.data = vm.board;
              //$mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              $mdToast.show($mdToast.simple().textContent('Details Saved Successfully...').position('top right'));
              $scope.$broadcast("first-board-create", vm.board);
              console.log(vm.board);
              $state.go('app.customer.scrumboard.boards.board', {id: vm.board.id});
              break;
            case 1006:
              BoardService.data = vm.boardBackup;
              vm.board = vm.boardBackup;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log("defualt :", response.message);

          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId) {
      if (vm.board.name === 'Untitled' || vm.board.name === '') {
        $mdToast.show($mdToast.simple().textContent('Give a New Name for Board').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
      }
      else {
        //console.log('sidenavId : ',sidenavId);
        $mdSidenav(sidenavId).toggle();
        if (sidenavId == 'settings-sidenav') {
          $rootScope.$broadcast('sidenavOpened');
        }
      }
    }


    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getById = function (value) {
      return this.filter(function (x) {
        return x.id === value;
      })[0];
    };
  }
})();
