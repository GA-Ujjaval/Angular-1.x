(function() {
  'use strict';

  angular
    .module('app.customer.todo')
    .controller('TodoController', TodoController);

  /** @ngInject */
  function TodoController(hostUrlDevelopment, $http, ScrumboardService, errors, AuthService, $state, $mdToast, $document, $mdDialog,
                          $mdSidenav, $filter, $scope, $timeout, introService, $location, MainTablesService,
                          GlobalSettingsService, $window, $rootScope) {

    $scope.BeforeChangeEvent = function(targetElement) {
      $timeout(function() {
        $(".introjs-button").css({
          'display': 'inline-block'
        });
        $('.introjs-skipbutton').hide();
        $(".introjs-helperLayer").css({
          'background-color': 'rgb(255,255,255)'
        });
      })

    };

    $scope.IntroOptions = {
      steps: introService.getIntroObj("todo"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };
    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Service Call Header---------------------------------------------------------------------------------------
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //For Service Call Parameter
    var params = '';
    vm.taskObj = null;

    //For payload Call
    var data = '';

    // Data
    vm.stateParams = '';
    var filterDate = {};
    vm.sortDate = '';
    var now = new Date(),
      oneDay = 86400000,
      threeDays = 259200000,
      sevenDays = 604800000,
      twoweeks = 1209600000,
      month = 2678400000,
      tomorrow = now.setHours(24, 0, 0, 0),
      next3days = tomorrow + threeDays,
      next7days = tomorrow + sevenDays,
      next2weeks = tomorrow + twoweeks,
      nextmonth = tomorrow + month,
      yesterday = now.setDate(now.getDate() - 2);
    vm.today = new Date();

    // Widget 4
    vm.widget4 = {
      currentRange: null,
      dueTasks: {
        TD: {
          tasks: []
        },
        N3D: {
          tasks: []
        },
        N7D: {
          tasks: []
        },
        OD: {
          tasks: []
        },
        ALL: {
          tasks: []
        },
        N2W: {
          tasks: []
        },
        NM: {
          tasks: []
        }
      }
    };

    vm.changeItems = [];

    var dateFilter = [{
        key: "N3D",
        value: "Next 3 days"
      },
      {
        key: "N7D",
        value: "Next 7 days"
      }, {
        key: "TD",
        value: "Today"
      }, {
        key: "OD",
        value: "Overdue"
      }, {
        key: "ALL",
        value: "All"
      }, {
        key: "N2W",
        value: "Next 2 weeks"
      }, {
        key: "NM",
        value: "Next month"
      }
    ];

    vm.completed = [];
    vm.colors = ['blue', 'blue-grey', 'orange', 'pink', 'purple'];

    function currentFilter() {
      dateFilter.forEach(function(date) {
        if (date.key == $state.params.date) {
          filterDate = date;
          vm.stateParams = $state.params.date;
          $window.localStorage.setItem(`TD-currentRange-${vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId}`, date.key);
        }
        const localDateFilter = $window.localStorage.getItem(`TD-currentRange-${vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId}`);
        if (localDateFilter && localDateFilter === date.key && !$state.params.date) {
          filterDate = date;
        }
      });
      if (Object.getOwnPropertyNames(filterDate).length < 1) {
        filterDate = dateFilter[4];
      }
    }

    currentFilter();

    vm.selectedFilter = {
      dueDate: filterDate.key
    };

    // Tasks will be filtered against these models
    vm.taskFilters = {
      search: '',
      idChangeItems: [],
      completed: '',
      deleted: false,
      important: '',
      starred: '',
      startDate: '',
      dueDate: ''
    };
    vm.taskFiltersDefaults = angular.copy(vm.taskFilters);
    vm.showAllTasks = true;

    vm.isTaskOpened = false;

    vm.taskOrder = '';
    vm.taskOrderDescending = false;

    vm.sortableOptions = {
      handle: '.handle',
      forceFallback: true,
      ghostClass: 'todo-item-placeholder',
      fallbackClass: 'todo-item-ghost',
      fallbackOnBody: true,
      sort: true
    };
    vm.msScrollOptions = {
      suppressScrollX: true
    };

    // Methods
    vm.preventDefault = preventDefault;
    vm.openTaskDialog = openTaskDialog;
    vm.changePathTodo = changePathTodo;
    vm.toggleCompleted = toggleCompleted;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleFilter = toggleFilter;
    vm.toggleFilterWithEmpty = toggleFilterWithEmpty;
    vm.filterByStartDate = filterByStartDate;
    vm.filterByDueDate = filterByDueDate;
    vm.resetFilters = resetFilters;
    vm.toggleChangeItemFilter = toggleChangeItemFilter;
    vm.isChangeItemExists = isChangeItemExists;
    vm.modalInstance = null;
    vm.completetaskFunction = completetaskFunction;
    vm.removeChecklistItem = removeChecklistItem;
    vm.markimportantFunction = markimportantFunction;
    vm.markstarredFunction = markstarredFunction;
    init();
    proxyDetails();

    $scope.$on('refreshTaskView', refreshTaskView);

    function refreshTaskView() {
      init();
    }

    function proxyDetails() {
      $rootScope.$watch('configurationSettings', value => {
        if (value !== undefined) {
          vm.configurationSettings = value;
        }
      });
    }

    /**
     * Initialize the controller
     */
    function init() {
      vm.progressCardData = true;
      vm.filterTaskDateInit = function(range) {
        vm.widget4.currentRange = range;
        if (vm.tasks) {
          vm.widget4.dueTasks[vm.widget4.currentRange].tasks = [];
          angular.forEach(vm.tasks, function(task) {
            vm.time = +moment(task.dueDate).valueOf();
            if (task.completed == false) {
              if (vm.time >= tomorrow - oneDay && vm.time < tomorrow) {
                vm.widget4.dueTasks.TD.tasks.push(task);
              }
              if (vm.time < next3days && vm.time >= tomorrow - oneDay) {
                vm.widget4.dueTasks.N3D.tasks.push(task);
              }
              if (vm.time < next7days && vm.time >= tomorrow - oneDay) {
                vm.widget4.dueTasks.N7D.tasks.push(task);
              }
              if ((vm.time < (yesterday + oneDay)) && vm.time) {
                vm.widget4.dueTasks.OD.tasks.push(task);
              }
              if (vm.time < next2weeks && vm.time >= tomorrow - oneDay) {
                vm.widget4.dueTasks.N2W.tasks.push(task);
              }
              if (vm.time < nextmonth && vm.time >= tomorrow - oneDay) {
                vm.widget4.dueTasks.NM.tasks.push(task);
              }
            }
          });
        }
      };
      vm.filterTaskDateInit(filterDate.key);

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }
      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.gettasklistbyuserid, params, '', header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function(value, key) {
                if (value.dueDate === null) {} else {
                  value.dueDate = $filter('date')(new Date(value.dueDate), 'fullDate');
                }
              });
              // for task update issue suggested by tosif
              vm.tasks = [];
              vm.tasks = response.data;

              if ($state.params.taskId && vm.tasks.length && !vm.isTaskOpened) {
                vm.tasks.forEach(function(task) {
                  if ($state.params.taskId === task.taskSeqId) {
                    vm.taskObj = task;
                  }
                });
                vm.isTaskOpened = true;
                openTaskDialog(null, vm.taskObj);
              }
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
        .catch(function(response) {
          vm.progress = false;
          console.error(response);
        });


      MainTablesService.getallfuseobjectcustom()
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              angular.forEach(response.data, function(value) {
                angular.forEach(vm.tasks, function(values) {
                  angular.forEach(values.idChangeItems, function(val) {
                    if (value.objectId === val) {
                      vm.changeItems.push(value);
                    }
                  });
                });
              });
              var newArr = [];
              angular.forEach(vm.changeItems, function(value, key) {
                var exists = false;
                angular.forEach(newArr, function(val2, key) {
                  if (angular.equals(value.objectId, val2.objectId)) {
                    exists = true
                  }
                });
                if (exists == false && value.objectId != "") {
                  newArr.push(value);
                }
              });
              vm.idChangeItems = newArr.map(function(item) {
                return item.objectId;
              });
              vm.progressCardData = false;
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });


    }

    vm.dueDateFilter = function(data) {
      if (vm.taskFilters.dueDate) {
        if (new Date() < new Date(data.dueDate)) {
          return true;
        }
      } else {
        return true;
      }
    };

    vm.filterTaskDate = function(range) {
      vm.widget4.currentRange = range;
      if ($location.url() !== '/customer/to-do/') {
        $state.go('app.customer.to-do', {date: ''}, {notify: false, reload: false});
      }
      $window.localStorage.setItem(`TD-currentRange-${vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId}`, range);
      currentFilter();
      if (vm.tasks) {
        vm.widget4.dueTasks[vm.widget4.currentRange].tasks = [];

        angular.forEach(vm.tasks, function(task) {
          vm.time = Date.parse(task.dueDate);
          if ($location.url() != '/customer/to-do/') {
            vm.widget4.dueTasks.ALL.tasks.push(task);
          }
          if (task.completed == false) {
            if (vm.time >= tomorrow - oneDay && vm.time < tomorrow) {
              vm.widget4.dueTasks.TD.tasks.push(task);
            }
            if (vm.time < next3days && vm.time >= tomorrow - oneDay) {
              vm.widget4.dueTasks.N3D.tasks.push(task);
            }
            if (vm.time < next7days && vm.time >= tomorrow - oneDay) {
              vm.widget4.dueTasks.N7D.tasks.push(task);
            }
            if ((vm.time < (yesterday + oneDay)) && (vm.time > 0)) {
              vm.widget4.dueTasks.OD.tasks.push(task);
            }
            if (vm.time < next2weeks && vm.time >= tomorrow - oneDay) {
              vm.widget4.dueTasks.N2W.tasks.push(task);
            }
            if (vm.time < nextmonth && vm.time >= tomorrow - oneDay) {
              vm.widget4.dueTasks.NM.tasks.push(task);
            }
          }
        });
      }
    };

    function markstarredFunction(task) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      data = {
        taskId: task.id,
        starred: task.starred
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.makestarred, params, data, header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function markimportantFunction(task) {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      data = {
        taskId: task.id,
        important: task.important
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.makestarred, params, data, header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function completetaskFunction(task) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          status: task.completed,
          taskId: task.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          status: task.completed,
          taskId: task.id
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.completetask, params, '', header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          vm.progress = false;
          console.error(response);
        });

    }

    /**
     * Prevent default
     *
     * @param e
     */
    function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * Remove checklist Item
     *
     * @param item
     */
    function removeChecklistItem(item) {

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          taskId: item.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          taskId: item.id
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.deletetask, params, '', header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.tasks.splice(vm.tasks.indexOf(item), 1);
              $mdToast.show($mdToast.simple().textContent("Task Removed Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              vm.selectedDuedate = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
          vm.progress = false;
          console.error(response);
        });
    }

    /**
     * Open new task dialog
     *
     * @param ev
     * @param task
     */
    function changePathTodo() {
      $state.go('app.customer.to-do', {
        taskId: undefined
      }, {
        reload: false,
        notify: false
      });
    }

    function openTaskDialog(ev, task) {
      vm.modalInstance = $mdDialog.show({
        onRemoving: function() {
          vm.changePathTodo();
        },
        controller: 'TaskDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          Task: task,
          Tasks: vm.tasks,
          Tags: '',
          ChangeItems: vm.changeItems,
          Card: '',
          event: ev,
          $parent: vm,
          newTask: (!task ? true : false),
          checklist: null,
          callback: null,
          Members: vm.members,
          isTemplate: false,
          isConfigEnable: vm.configurationSettings
        }
      });

      if (task != undefined) {
        $state.go('app.customer.to-do', {
          taskId: task.taskSeqId
        }, {
          reload: false,
          notify: false
        });
      }

      vm.modalInstance.then(function(answer) {
        // Success logs
      }, function() {
        init();
      });
    }

    /**
     * Toggle completed status of the task
     *
     * @param task
     * @param event
     */
    function toggleCompleted(task, event) {
      event.stopPropagation();
      task.completed = !task.completed;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          status: task.completed,
          taskId: task.id
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          status: task.completed,
          taskId: task.id
        }
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.completetask, params, '', header)
        .then(function(response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              $timeout(function () {
                angular.forEach(vm.tasks, function(tsk) {
                  if (tsk.id === task.id) {
                    tsk.completed = !task.completed;
                  }
                })
              }, 800)
              break;
            case 4006:
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function(response) {
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
      $mdSidenav(sidenavId).toggle();
    }

    /**
     * Toggles filter with true or false
     *
     * @param filter
     */
    function toggleFilter(filter) {
      vm.taskFilters[filter] = !vm.taskFilters[filter];

      checkFilters();
    }

    /**
     * Toggles filter with true or empty string
     * @param filter
     */
    function toggleFilterWithEmpty(filter) {
      //console.log('filter : ', filter);
      if (vm.taskFilters[filter] === '') {
        vm.taskFilters[filter] = true;
      } else {
        vm.taskFilters[filter] = '';
      }

      checkFilters();
    }

    /**
     * Reset filters
     */
    function resetFilters() {
      vm.showAllTasks = true;
      vm.taskFilters = angular.copy(vm.taskFiltersDefaults);
    }

    /**
     * Check filters and mark showAllTasks
     * as true if no filters selected
     */
    function checkFilters() {
      vm.showAllTasks = !!angular.equals(vm.taskFiltersDefaults, vm.taskFilters);
    }

    /**
     * Filter by startDate
     *
     * @param item
     * @returns {boolean}
     */
    function filterByStartDate(item) {
      if (vm.taskFilters.startDate === true) {
        return item.startDate === new Date();
      }

      return true;
    }

    /**
     * Filter Due Date
     *
     * @param item
     * @returns {boolean}
     */
    function filterByDueDate(item) {
      if (vm.taskFilters.dueDate === true) {
        return !(item.dueDate === null || item.dueDate.length === 0);
      }

      return true;
    }

    /**
     * Toggles tag filter
     *
     * @param id
     */
    function toggleChangeItemFilter(id) {
      var i = vm.taskFilters.idChangeItems.indexOf(id);

      if (i > -1) {
        vm.taskFilters.idChangeItems.splice(i, 1);
      } else {
        vm.taskFilters.idChangeItems.push(id);
      }

      checkFilters();
    }

    /**
     * Returns if tag exists in the tagsFilter
     *
     * @param id
     * @returns {boolean}
     */
    function isChangeItemExists(id) {
      return vm.taskFilters.idChangeItems.indexOf(id) > -1;
    }

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getByIds = function(value) {
      return this.filter(function(x) {
        return x.objectId === value;
      })[0];
    };

    // this logic for formatting chip text which is disply in Tasks list
    vm.formatWithConfigName = function(str1) {
      if (str1) {
        var objectNumber1 = str1.objectNumber || '';
        var configName1 = str1.configName || '';
        var revision1 = str1.revision || '';
        var minorRevision1 = str1.minorRevision || '';
        var status1 = str1.status || '';
        var objectName1 = str1.objectName || '';
      }
      if (vm.configurationSettings && configName1) {
        return "[ "+ objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 +" ] [ "+ status1 +" ] " + objectName1;
      } else {
        return "[ "+ objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 +" ] [ "+ status1 +" ] " + objectName1;
      }
    }

  }
})();
