(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('dashboardCustomerController', dashboardCustomerController);

  /** @ngInject */
  function dashboardCustomerController($scope, $rootScope, introService, $interval, $state, AuthService, CustomerService, hostUrlDevelopment, errors, $mdToast, $http, Tasks, $timeout) {
    var vm = this;

    $scope.IntroOptionsBoardDashboard = {
      tooltipPosition: 'right',
      steps: introService.getIntroObj("dashboardTasksHint"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: false
    };
    $scope.IntroOptionsBoardDashboardSecond = {
      tooltipPosition: 'right',
      steps: introService.getIntroObj("dashboardCardsHint"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: false
    };
    $scope.BeforeChangeEvent = function (targetElement) {
      $timeout(function () {
        $('.introjs-skipbutton').hide();
        $(".introjs-helperLayer").addClass("introjs-helperLayer-dashboard");
        $(".introjs-overlay").addClass("introjs-overlay-dashboard");
        $(".introjs-overlay").click(function () {
          $scope.ExitMe();
        });
      });
    };
    $scope.BeforeChangeEventSecond = function (targetElement) {
      $timeout(function () {
        $('.introjs-skipbutton').hide();
        $(".introjs-helperLayer").addClass("introjs-helperLayer-dashboard");
        $(".introjs-overlay").addClass("introjs-overlay-dashboard");
        $(".introjs-overlay").click(function () {
          $scope.ExitMeSecond();
        });
      });
    };

    $scope.Complete = function (targetElement) {
      $timeout(function () {
        $("#step1").hide();
      });
    };
    $scope.Exit = function (targetElement) {
      $timeout(function () {
        $("#step1").hide();
      });
    };
    $scope.CompleteSecond = function (targetElement) {
      $timeout(function () {
        $("#step2").hide();
      });
    };

    $scope.ExitSecond = function (targetElement) {
      $timeout(function () {
        $("#step2").hide();
      });
    };
    vm.progress = true;
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.error = errors;

    var params = {
      customerId: vm.sessionData.userId
    };
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    // Data
    vm.tasks = Tasks;
    var now = new Date(),
      oneDay = 86400000,
      threeDays = 259200000,
      sevenDays = 604800000,
      tomorrow = now.setHours(24, 0, 0, 0),
      next3days = tomorrow + threeDays,
      next7days = tomorrow + sevenDays,
      yesterday = now.setDate(now.getDate() - 2);

    vm.widget1 = {
      ranges: {
        "TD": "Today",
        "N3D": "Next 3 days",
        "N7D": "Next 7 days"
      },
      currentRange: "TD",
      detail: "Shows number of tasks where due date is set for Today/Next 3 days/Next 7 days based on your selection",
      dueTasks: {
        TD: {
          completed: 0,
          tasks: []
        },
        N3D: {
          completed: 0,
          tasks: []
        },
        N7D: {
          completed: 0,
          tasks: []
        }
      }
    };

    // Widget 2
    vm.widget2 = {
      title: "Overdue",
      data: {
        "label": "TASKS",
        "count": 4,
        "extra": {
          "label": "Yesterday's overdue",
          "count": 2
        }
      },
      detail: "Shows number of tasks where due date was set for yesterday AND earlier",
      overdueTasks: {
        tasks: [],
        yesterdaysOverdue: 0
      }
    };

    // Widget 3
    vm.widget3 = {
      title: "Cards",
      totalCount: 7, //test
      low: 2, //test
      medium: 1, //test
      high: 3, //test
      none: 1, //test
      boardList: [],
      boards: [],
      cardsCount: 0,
      cardsAssignedToMe: 0,
      ranges: {
        "TD": "Today",
        "N3D": "Next 3 days",
        "N7D": "Next 7 days"
      },
      currentRange: "TD",
      changeRange: function (key) {
        vm.widget3.currentRange = key;
        var date;
        switch (key) {
          case 'TD':
            date = tomorrow;
            break;
          case 'N3D':
            date = next3days;
            break;
          case 'N7D':
            date = next7days;
            break;
          default:
            console.log('err');
        }
        filterBoards(vm.widget3.currentRange);
      }
    };

    init();

    function init() {
      if (vm.sessionData.userId) {
        getBoards('GET', hostUrlDevelopment.test.getallboards);
        if (vm.tasks) {
          angular.forEach(vm.tasks, function (task) {
            if (task.dueDate >= tomorrow - oneDay && task.dueDate < tomorrow) {
              if (task.completed) {
                vm.widget1.dueTasks.TD.completed += 1;
              } else {
                vm.widget1.dueTasks.TD.tasks.push(task);
              }
            }
            if (task.dueDate >= tomorrow - oneDay && task.dueDate < next3days) {
              if (task.completed) {
                vm.widget1.dueTasks.N3D.completed += 1;
              } else {
                vm.widget1.dueTasks.N3D.tasks.push(task);
              }
            }
            if (task.dueDate < next7days && task.dueDate >= tomorrow - oneDay) {
              if (task.completed) {
                vm.widget1.dueTasks.N7D.completed += 1;
              } else {
                vm.widget1.dueTasks.N7D.tasks.push(task);
              }
            }
            if (task.dueDate < (yesterday + oneDay)) {
              if (task.dueDate && task.completed === false) {
                vm.widget2.overdueTasks.tasks.push(task);
                if (task.dueDate >= yesterday && task.dueDate <= (yesterday + oneDay)) {
                  vm.widget2.overdueTasks.yesterdaysOverdue += 1;
                }
              }
            }
          });
        }
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
    }

    function getBoards(method, url) {
      CustomerService.addNewMember(method, url)
        .then(function (response) {
        switch (response.code) {
          case 0:
            vm.customerProfileForm = $rootScope.customerProfileForm;
            vm.widget3.boardList = _.map(response.data.boards, function (value, key) {
              if (key !== 'dueCount') {
                value.id = key;
                return value;
              }
            }).filter(value => value);
            vm.widget3.boardList = _.sortBy(vm.widget3.boardList, 'id');
            filterBoards( vm.widget3.currentRange);
            break;
          default:
            console.error(response.message);
        }
      }).catch(function (response) {
        vm.progress = false;
        console.log(vm.error.erCatch);
      });
    }

    function filterBoards(date) {
      vm.widget3.boards = [];
      vm.widget3.cardsAssignedToMe = 0;
      vm.widget3.cardsCount = 0;
      _.forEach(vm.widget3.boardList, function (board) {
        let newBoard = angular.copy(board);
        newBoard.cards = [];
        let cardsCount = 0;
        if (date === 'TD') {
          _.forEach(board.dueToday, function (value, key) {
            let currentCount = value;
            _.forEach(board.boardPriority, function (priority) {
              if (value && priority.name === key && currentCount <= value) {
                newBoard.cards.push({
                  id: priority.id,
                  color: priority.color,
                  name: priority.name,
                  width: value,
                  date: 'TD'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              } else if (value && key === 'noPriority' && currentCount <= value) {
                newBoard.cards.push({
                  id: 'undefined',
                  name: 'no priority',
                  color: 'grey',
                  width: value,
                  date: 'TD'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              }
            });
          });
        }
        if (date === 'N3D') {
          _.forEach(board.next3Days, function (value, key) {
            let currentCount = value;
            _.forEach(board.boardPriority, function (priority) {
              if (value && priority.name === key && currentCount <= value) {
                newBoard.cards.push({
                  id: priority.id,
                  color: priority.color,
                  name: priority.name,
                  width: value,
                  date: 'N3D'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              } else if (value && key === 'noPriority' && currentCount <= value) {
                newBoard.cards.push({
                  id: 'undefined',
                  name: 'no priority',
                  color: 'grey',
                  width: value,
                  date: 'N3D'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              }
            });
          });
        }
        if (date === 'N7D') {
          _.forEach(board.next7Days, function (value, key) {
            let currentCount = value;
            _.forEach(board.boardPriority, function (priority) {
              if (value && priority.name === key && currentCount <= value) {
                newBoard.cards.push({
                  id: priority.id,
                  color: priority.color,
                  name: priority.name,
                  width: value,
                  date: 'N7D'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              } else if (value && key === 'noPriority' && currentCount <= value) {
                newBoard.cards.push({
                  id: 'undefined',
                  name: 'no priority',
                  color: 'grey',
                  width: value,
                  date: 'N7D'
                });
                currentCount++;
                cardsCount += value;
                vm.widget3.cardsAssignedToMe += value;
              }
            });
          });
        }
        newBoard.cardsCount = cardsCount;
        if (newBoard.cards) {
          vm.widget3.boards.push(newBoard);
        }
        vm.widget3.cardsCount += newBoard.cards.length;
      });
    }
  }
})();
