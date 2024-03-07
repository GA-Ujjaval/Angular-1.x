(function () {
  'use strict';
  angular
    .module('app.customer.scrumboard')
    .controller('BoardsViewController', BoardsViewController);

  /** @ngInject */
  function BoardsViewController($timeout, hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, $scope, introService, $rootScope) {
    $scope.cleanPath = false;
    $scope.CompletedEvent = function () {
      $scope.cleanPath = false;
    };
    $scope.ExitEvent = function () {
      $scope.cleanPath = false;
    };

    $scope.BeforeChangeEvent = function (targetElement) {
      $scope.cleanPath = true;
      $timeout(function () {
        $("#step3").css({
          'position': 'relative',
          'z-index': '9999999'
        });
        $(".introjs-helperLayer").css({'background-color': '#039be5'});
        $('.introjs-skipbutton').hide();
      })

    };

    $scope.IntroOptions = {
      steps: introService.getIntroObj("boards"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>',
    };
    /*$scope.cleaningPath = function() {
        $timeout(function(){$scope.cleanPath = true;});
    };*/

    var vm = this;
    vm.boardList = [];

    //For Error Constnat
    vm.error = errors;

    //For Progress Loader
    vm.progress = true;

    vm.sessionData = {};

    vm.sessionData = AuthService.getSessionData('customerData');

    var params = '';

    vm.openBoard = openBoard;

    function openBoard(id) {
      vm.progress = true;
      $rootScope.$emit('boardLoaded', true);
      $state.go('app.customer.scrumboard.boards.board', {id: id});
    }

    init();

    function init() {
      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboards, params, '', header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:

              angular.forEach(response.data, function (val, key) {
                vm.boardList.push({
                  name: val.boardTitle,
                  id: val.boardId
                });
                ScrumboardService.allBoardsData = vm.boardList;
              });

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
        })
    }
  }
})();
