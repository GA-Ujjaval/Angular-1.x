(function () {
  'use strict';

  angular
    .module('app.customer.todo')
    .controller('TaskDialogController', TaskDialogController);

  /** @ngInject */
  function TaskDialogController(DialogService, hostUrlDevelopment, ScrumboardService, errors, AuthService, $state, $mdToast, MainTablesService,
                                $mdDialog, $document, Task, Tasks, Card, event, $parent, newTask, callback, Members, msUtils, BoardService, $timeout, $location, isTemplate, isConfigEnable) {


    var vm = this;
    vm.widthOfCardDialog = null;

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

    //For payload Call
    var data = '';

    // Data
    vm.changeItems = [];
    vm.defualtValue = 'affected';
    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';
    vm.tags = '';
    vm.card = Card;
    vm.newTask = newTask || false;
    vm.members = [];
    vm.isLockedOpen = true;
    vm.labels = [];
    var Id = '';
    vm.task = angular.copy(Task);
    vm.isLatest = true;
    vm.changeItemsTask = [];
    vm.isTemplate = isTemplate || false;
    vm.boardData = BoardService.data || {};

    if (Task === undefined) {
      vm.title = '';
      init();
    } else {
      Task.id = Task.taskId ? Task.taskId : Task.id;
      vm.title = Task.taskSeqId;
      init();
    }

    function init() {
      getallfuseobject(false);
      //For Progress Loader
      vm.progressEmail = true;

      if (Task) {
        if (Task.cardId !== null){
          if (vm.sessionData.proxy == true) {
            params = {
                customerId: vm.sessionData.customerAdminId,
                cardId: Task.cardId
            };
        }
        else {
            params = {
                cardId: Task.cardId
            }
        }
        ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboardbycardid, params, '', header)
            .then(function (response) {
                switch (response.code) {
                    case 0:
                        vm.board = response.data;
                        angular.forEach(vm.board.cards, function (value, key) {
                            if (value.id === Task.cardId) {
                                vm.card = value;
                            }
                        });
                        break;
                    case 4006:
                        console.log(response.message);
                        break;
                    default:
                        // console.log(response.message);
                }
            })
            .catch(function (response) {
                vm.progress = false;
                vm.progressEmail = false;
                vm.progressCardData = false;
                $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
            });
        }

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            taskId: Task.id
          };
        } else {
          params = {
            taskId: Task.id
          };
        }

        ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.gettaskbytaskid, params, '', header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.changeItemsTask = response.data.idChangeItemsList;
                vm.changeItems = response.data.idChangeItemsList;
                vm.idChangeItems = response.data.idChangeItemsList;
                vm.currentChangeItems = response.data.idChangeItemsList;
                vm.tidChangeItems = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(vm.task.idChangeItems, function (va, k) {
                    if (va === value.objectId) {
                      vm.tidChangeItems.push(value.displayObjectId);
                    }
                  });
                });
                vm.task.idChangeItems = vm.tidChangeItems;
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
            vm.progressCardData = false;
            $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
          });
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getuserlist, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              var members = [];
              angular.forEach(response.data.Members, function (value, key) {
                var FullName = value.firstName + ' ' + value.lastName;
                if (value.isActive === true && value.status === true) {
                  members.push({
                    id: value.userId,
                    name: FullName
                  });
                }
              });
              vm.members = members;
              //For Progress Loader
              vm.progressEmail = false;
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
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    vm.tasks = Tasks;
    vm.copymember = [];

    if (vm.task === undefined) {} else {
      vm.tasks.idMembers = vm.task.idMembers;
      if (Task.startDate == null) {
        vm.task.startDate = null;
      } else {
        vm.task.startDate = new Date(moment(Task.startDate).format('YYYY/MM/DD HH:mm:ss'));
      }

      if (Task.dueDate == null) {
        vm.task.dueDate = null;
      } else {
        vm.task.dueDate = new Date(moment(Task.dueDate).format('YYYY/MM/DD HH:mm:ss'));
      }
    }

    if (!vm.task) {
      vm.tasks.idMembers = [];
      vm.task = {
        'id': '',
        'idMembers': [],
        'title': '',
        'notes': '',
        'idChangeItems': [],
        'startDate': null,
        'startDateTimeStamp': new Date().getTime(),
        'dueDate': null,
        'dueDateTimeStamp': '',
        'completed': false,
        'starred': false,
        'important': false,
        'deleted': false,
        'tags': [],
        'idTags': [],
        'comments': [],
        'activities': []
      };
      vm.title = 'New Task';
    }

    vm.$parentScope = $parent;

    // Methods
    vm.addNewTask = addNewTask;
    vm.saveTask = saveTask;
    vm.deleteTask = deleteTask;
    vm.newTag = newTag;
    vm.closeDialog = closeDialog;
    vm.exists = msUtils.exists;
    vm.toggleInArray = msUtils.toggleInArray;
    vm.onItemChange = onItemChange;
    /* Labels */
    vm.labelQuerySearch = labelQuerySearch;
    vm.labelSearch = labelSearch;
    vm.filterChangeItems = filterChangeItems;
    vm.filterChangeItem = filterChangeItem;
    vm.addNewLabel = addNewLabel;
    vm.removeLabel = removeLabel;
    /* Members */
    vm.memberQuerySearch = memberQuerySearch;
    vm.filterMember = filterMember;
    /* Comment */
    vm.addNewComment = addNewComment;
    /* Avatar Image Availability*/
    vm.isAvatarAvailable = isAvatarAvailable;
    /* default avatar */
    vm.defaultAvatar = defaultAvatar;
    /* Attachment */
    vm.gotoAttachment = gotoAttachment;
    vm.handleStartDateChange = handleStartDateChange;
    vm.handleDueDateChange = handleDueDateChange;
    vm.addTaskNote = addTaskNote;
    vm.addMember = addMember;
    vm.removeMember = removeMember;
    vm.changeItemFuntion = changeItemFuntion;
    vm.openCardDialog = DialogService.openCardDialog;
    vm.getallfuseobject = getallfuseobject;
    vm.removechangeItem = removechangeItem;

    function getallfuseobject(progress) {
      vm.progressCardData = progress;

      MainTablesService.getallfuseobjectcustom()
        .then(function (response) {

          switch (response.code) {
            case 0:
              vm.changeItems = response.data;
              angular.forEach(vm.changeItems, function(value,key){
                value.name = value.displayObjectId;
                value.id = value.objectId
              });
              vm.idChangeItems = response.data;
              vm.currentChangeItems = response.data;
              vm.progressCardData = false;
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
          vm.progressCardData = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }
    vm.existAffectedObject = existAffectedObject;
    function existAffectedObject(changeItems) {
      return !!vm.changeItemsTask.find(idChangeItem => idChangeItem.id === changeItems.objectId);
    }

    function changeItemFuntion(changeItems) {
      if (changeItems != undefined || changeItems) {
        var commenttaskId;
        vm.objectId = '';
        if (Id) {
          commenttaskId = Id;
        } else {
          commenttaskId = vm.task.id;
        }

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            taskId: commenttaskId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            taskId: commenttaskId
          }
        }

        if (typeof changeItems === 'object') {
          angular.forEach(vm.changeItems, function (value, key) {
            if (changeItems.name === value.name) {
              vm.objectId = value.id;
              data = {
                color: "Red",
                id: vm.objectId,
                name: changeItems.name
              };
            }
          });
        } else {
          angular.forEach(vm.changeItems, function (value, key) {
            if (changeItems === value.displayObjectId) {
              vm.objectId = value.objectId;
            }
          });
          data = {
            color: "Red",
            id: vm.objectId,
            name: changeItems
          };
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemtask, params, data, header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.task.activities = response.data.activities;
                vm.changeItemsTask = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(response.data.changeItemList, function (val, keys) {
                    if (value.id === val.id) {
                      vm.changeItemsTask.push(value);
                    }
                  });
                  return vm.exists(value.name, vm.idChangeItems);
                });
                $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                break;
              case 1006:
              console.log('vm.task.idChangeItems : ', vm.task.idChangeItems);
                vm.changeItemsTask = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(vm.task.idChangeItems, function (val, keys) {
                    if (value.id === val) {
                      vm.changeItemsTask.push(value);
                    }
                  });
                  return vm.exists(value.name, vm.idChangeItems);
                });
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4002:
                vm.selectedDuedate = '';
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                vm.task.idChangeItems = [];
                vm.changeItemsTask = [];
                $mdToast.show($mdToast.simple().textContent('Task title required.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
    }

    function removechangeItem(changeItems){
      if (changeItems != undefined || changeItems) {
        var commenttaskId;
        vm.objectId = '';
        if (Id) {
          commenttaskId = Id;
        } else {
          commenttaskId = vm.task.id;
        }

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            taskId: commenttaskId
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            taskId: commenttaskId
          }
        }
        if (typeof changeItems === 'object') {
          angular.forEach(vm.changeItems, function (value, key) {
            if (changeItems.id === value.objectId) {
              vm.objectId = value.objectId;
              data = {
                color: "Red",
                id: vm.objectId,
                name: changeItems.name
              };
            }
          });

        } else {
          angular.forEach(vm.changeItems, function (value, key) {
            if (changeItems === value.displayObjectId) {
              vm.objectId = value.objectId;
            }
          });
          data = {
            color: "Red",
            id: vm.objectId,
            name: changeItems
          };
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.changeitemtask, params, data, header)
          .then(function (response) {
            switch (response.code) {
              case 0:
                vm.task.activities = response.data.activities;
                vm.changeItemsTask = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(response.data.changeItemList, function (val, keys) {
                    if (value.id === val.id) {
                      vm.changeItemsTask.push(value);
                    }
                  });
                  return vm.exists(value.name, vm.idChangeItems);
                });
                $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
                break;
              case 1006:
                vm.changeItemsTask = [];
                angular.forEach(vm.changeItems, function (value, key) {
                  angular.forEach(Task.idChangeItems, function (val, keys) {
                    if (value.id === val) {
                      vm.changeItemsTask.push(value);
                    }
                  });
                  return vm.exists(value.name, vm.idChangeItems);
                });
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4002:
                vm.selectedDuedate = '';
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                vm.task.idChangeItems = [];
                $mdToast.show($mdToast.simple().textContent('Task title required.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
    }

    function addMember() {

      //For Progress Loader
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      if (Id) {
        data = {
          taskId: Id,
          ownerIdList: vm.task.idMembers
        };
      } else {
        data = {
          taskId: vm.task.id,
          ownerIdList: vm.task.idMembers
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremoveowner, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              vm.copymember = response.data.ownerIdList;
              vm.task.activities = response.data.activities;
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.copytask = angular.copy(Task);
              if (vm.copytask == undefined) {
                if (vm.copymember.length > 0) {
                  vm.tasks.idMembers = vm.copymember;
                  vm.task.idMembers = vm.copymember;
                } else {
                  vm.tasks.idMembers = [];
                }
              } else {
                if (vm.copytask.idMembers.length > 0) {
                  vm.tasks.idMembers = vm.copytask.idMembers;
                  vm.task.idMembers = vm.copytask.idMembers;
                } else {
                  vm.tasks.idMembers = [];
                }
              }
              //For Progress Loader
              vm.progressEmail = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              vm.progressEmail = false;
              vm.task.idMembers = [];
              vm.tasks.idMembers = [];
              $mdToast.show($mdToast.simple().textContent('Task title required.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent('Task title required.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function removeMember(member) {

      //For Progress Loader
      vm.progressEmail = true;
      vm.copymember = _.cloneDeep(vm.tasks.idMembers);
      var d = vm.tasks.idMembers.indexOf(member);
      if (d > -1) {
        vm.tasks.idMembers.splice(d, 1);
      }
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }
      if (Id) {
        data = {
          taskId: Id,
          ownerIdList: vm.tasks.idMembers
        };
      } else if (vm.task.taskId) {
        data = {
          taskId: vm.task.taskId,
          ownerIdList: vm.tasks.idMembers
        };
      } else {
        data = {
          taskId: vm.task.id,
          ownerIdList: vm.tasks.idMembers
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.addremoveowner, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;

              vm.task.activities = response.data.activities;
              vm.copymember = response.data.ownerIdList;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              if (vm.copymember.length == 0) {
                vm.copytask = angular.copy(Task);
                vm.tasks.idMembers = vm.copytask.idMembers;
              } else {
                vm.tasks.idMembers = vm.copymember;
                vm.task.idMembers = vm.copymember;
              }
              //For Progress Loader
              vm.progressEmail = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            default:
              $mdToast.show($mdToast.simple().textContent('Title Is Required...').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function addTaskNote() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }
      if (Id) {
        data = {
          taskId: Id,
          notes: vm.task.notes
        };
      } else {
        data = {
          taskId: vm.task.id,
          notes: vm.task.notes
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.createtask, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.task.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.task.notes = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              break;
            case 4004:
              vm.task.notes = '';
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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

    function handleStartDateChange() {
      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      if (Id) {
        data = {
          taskId: Id,
          startDate: vm.task.startDate
        };
      } else {
        data = {
          taskId: vm.task.id,
          startDate: vm.task.startDate
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.updatetaskdate, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.task.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.task.startDate = null;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              vm.selectedDuedate = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              vm.task.startDate = null;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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

    function handleDueDateChange() {

      //For Progress Loader
      vm.progressEmail = true;

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      if (Id) {
        data = {
          taskId: Id,
          dueDate: vm.task.dueDate
        };
      } else {
        data = {
          taskId: vm.task.id,
          dueDate: vm.task.dueDate
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.updatetaskdate, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;

              vm.task.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              vm.task.dueDate = null;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              //For Progress Loader
              vm.progressEmail = false;
              vm.selectedDuedate = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              //For Progress Loader
              vm.progressEmail = false;
              vm.task.dueDate = null;
              $mdToast.show($mdToast.simple().textContent('Task title required.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              //For Progress Loader
              vm.progressEmail = false;
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          //For Progress Loader
          vm.progressEmail = false;
          console.error(response);
        });
    }

    /**
     *  Scroll to attachment section
     */
    function gotoAttachment() {
      setTimeout(function () {
        ($document.find('.attachment-list').length > 0) && (scrollTo(
          $document.find('md-dialog').find('md-dialog-content'),
          $document.find('.attachment-list')
        ));
      }, 500);
    }

    /**
     * target - target element , source - source element
     * scroll to source element position
     * @param target
     * @param source
     */
    function scrollTo(target, source) {
      var sourceElTop = Math.round($(source).offset().top || 0),
        targetElTop = Math.round($(target).offset().top || 0);
      $(target).animate({
        scrollTop: sourceElTop - targetElTop
      }, "slow");
    }

    /**
     * default avatar
     * @param index
     */
    function defaultAvatar(nameOfOwner) {
      if (angular.isDefined(nameOfOwner)) {
        var initials = (nameOfOwner || '').match(/\b\w/g);
        initials = (initials.shift() + initials.pop()).toUpperCase();
        return initials;
      }
    }

    /**
     * find avatar image existance
     * @param index
     */
    function isAvatarAvailable(avatar) {
      return avatar ? true : false;
    }

    $timeout(function () {
      function getWidth() {
        return (3 * $('#task-dialog')[0].clientWidth / 4);
      }
      vm.widthOfCardDialog = getWidth();
    });

    function labelQuerySearchStatus(chip) {
      if (labelSearch(chip) != undefined) {
        return chip ? labelSearch(chip).map(function (item) {
          return item.status;
        }) : [];
      }
    }

    vm.parseStrings = function (str1) {
      if (str1) {
        var objectNumber1 = str1.objectNumber || '';
        var configName1 = str1.configName || '';
        var revision1 = str1.revision || '';
        var minorRevision1 = str1.minorRevision || '';
        var status1 = str1.status || '';
        var objectName1 = str1.objectName || '';
      }
      if (isConfigEnable && configName1) {
        return "[ "+ objectNumber1 + " - Config.: " + configName1 + " - Rev. " + revision1 + "." + minorRevision1 +" ] [ "+ status1 +" ] " + objectName1;
      } else {
        return "[ "+ objectNumber1 + " - Rev. " + revision1 + "." + minorRevision1 +" ] [ "+ status1 +" ] " + objectName1;
      }
    };
    vm.parseChip = function (chip) {
      var str;
      if (isConfigEnable && chip.configName) {
        return str = '[ ' + chip.objectNumber + ' - Config.: ' + chip.configName +' - Rev. ' + chip.revision + ' ]' + '\xa0\xa0\xa0' + '[ ' + chip.status + ' ]' + '\xa0\xa0\xa0' + chip.objectName;
      } else {
        return str = '[ ' + chip.objectNumber + ' - Rev. ' + chip.revision + ' ]' + '\xa0\xa0\xa0' + '[ ' + chip.status + ' ]' + '\xa0\xa0\xa0' + chip.objectName;
      }
    };

    /**
     * Add new task
     */
    function addNewTask() {

      if (vm.task.title == undefined) {
        return vm.task.title;
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: vm.sessionData.customerAdminId
        }
      }

      if (vm.task.id) {
        data = {
          taskId: vm.task.id,
          taskTitle: vm.task.title,
          taskType: "Regular"
        };
      } else {
        data = {
          taskTitle: vm.task.title,
          taskType: "Regular"
        };
      }

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.createtask, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.tasks.idMembers = response.data.ownerIdList;
              vm.copymember = angular.copy(vm.tasks.idMembers);
              vm.task.idMembers = response.data.ownerIdList;
              vm.task.id = angular.copy(response.data.taskId);
              Id = angular.copy(response.data.taskId);
              vm.task.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              vm.task.title = '';
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4004:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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
     * Save task
     */
    function saveTask() {
      if (vm.newTask) {
        vm.task.title && (vm.tasks.unshift(vm.task));
      } else {
        // Dummy save action
        for (var i = 0; i < vm.tasks.length; i++) {
          if (vm.tasks[i].id === vm.task.id) {
            vm.tasks[i] = angular.copy(vm.task);
            break;
          }
        }
      }
    }

    /**
     * Delete task
     */
    function deleteTask() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .content('The Task will be deleted.')
        .ariaLabel('Delete Task')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(event);

      $mdDialog.show(confirm).then(function () {
        // Dummy delete action
        for (var i = 0; i < vm.tasks.length; i++) {
          if (vm.tasks[i].id === vm.task.id) {
            vm.tasks[i].deleted = true;
            break;
          }
        }
      }, function () {
        // Cancel Action
      });
    }


    /**
     * Set vm.task.idChangeItems to [id]
     *
     * @param id
     */
    function onItemChange(id) {
      if (id !== null) {
        vm.task.idChangeItems = [id];
      }
    }

    /**
     * Add label chips
     *
     * @param query
     * @returns {filterFn}
     */
    function labelQuerySearch(query) {
      vm.stats = {};
      return query ? labelSearch(query).map(function (item) {
        vm.stats[item.displayObjectId] = item.status;
        return item.displayObjectId;
      }) : [];
    }

    function labelSearch(query) {
      if (vm.isLatest) {
        vm.currentChangeItemsLatest = _.filter(vm.currentChangeItems, ['isLatest', 'true']);
      } else {
        vm.currentChangeItemsLatest = vm.currentChangeItems;
      }
      if (vm.currentChangeItemsLatest != undefined) {
        return query ? vm.currentChangeItemsLatest.filter(createFilterFor(query)) : [];
      }

    }

    /**
     * ChangeItems filter
     *
     * @param idChangeItem
     * @returns {boolean}
     */
    function filterChangeItems(idChangeItem) {
      if (idChangeItem.displayObjectId) {
        if (!vm.searchChangeItemText || vm.searchChangeItemText === '') {
          return true;
        }
        return angular.lowercase(idChangeItem.displayObjectId).indexOf(angular.lowercase(vm.searchChangeItemText)) >= 0;
      } else {
        if (!vm.searchChangeItemText || vm.searchChangeItemText === '') {
          return true;
        }
        return angular.lowercase(idChangeItem).indexOf(angular.lowercase(vm.searchChangeItemText)) >= 0;
      }
    }

    /**
     * ChangeItems filter
     *
     * @param idChangeItem
     * @returns {boolean}
     */
    function filterChangeItem(idChangeItem) {
      if (idChangeItem.displayObjectId) {
        if (!vm.changeItemSearchText || vm.changeItemSearchText === '') {
          return true;
        }
        return angular.lowercase(idChangeItem.displayObjectId).indexOf(angular.lowercase(vm.changeItemSearchText)) >= 0;
      } else {
        if (!vm.changeItemSearchText || vm.changeItemSearchText === '') {
          return true;
        }
        return angular.lowercase(idChangeItem).indexOf(angular.lowercase(vm.changeItemSearchText)) >= 0;
      }
    }

    /**
     * Add new label
     */
    function addNewLabel() {
      vm.tags.push({
        id: msUtils.guidGenerator(),
        name: vm.newLabelName,
        color: vm.newLabelColor
      });

      vm.newLabelName = '';
    }

    /**
     * Remove label
     */
    function removeLabel() {
      var arr = vm.tags;
      arr.splice(arr.indexOf(arr.getById(vm.editLabelId)), 1);

      angular.forEach(vm.tasks, function (task) {
        if (task.idLabels && task.idLabels.indexOf(vm.editLabelId) > -1) {
          task.idLabels.splice(task.idLabels.indexOf(vm.editLabelId), 1);
        }
      });

      vm.newLabelName = '';
    }

    /**
     * Add member chips
     *
     * @param query
     * @returns {Array}
     */
    function memberQuerySearch(query) {
      return query ? vm.members.filter(createFilterFors(query)) : [];
    }

    /**
     * Member filter
     *
     * @param member
     * @returns {boolean}
     */
    function filterMember(member) {
      if (!vm.memberSearchText || vm.memberSearchText === '') {
        return true;
      }

      return angular.lowercase(member.name).indexOf(angular.lowercase(vm.memberSearchText)) >= 0;
    }

    /**
     * New tag
     *
     * @param chip
     * @returns {{label: *, color: string}}
     */
    function newTag(chip) {
      var tagColors = ['#388E3C', '#F44336', '#FF9800', '#0091EA', '#9C27B0'];

      return {
        name: chip,
        label: chip,
        color: tagColors[Math.floor(Math.random() * (tagColors.length))]
      };
    }

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.cancel();
      //window.history.replaceState('', '', $location.path());
    }

    if (vm.$parentScope.modalInstance) {
      vm.$parentScope.modalInstance.then(function (answer) {
        // Success logs
      }, function () {
        // $mdDialog.cancel() or $mdDialog.dismiss() event.
        vm.saveTask();
        (callback || angular.noop)(vm.task, $parent.standardView, true);
      });
    }

    /**
     * Add new comment
     *
     * @param newCommentText
     */
    function addNewComment(newCommentText) {

      //For Progress Loader
      vm.progressEmail = true;

      var commenttaskId;
      if (Id) {
        commenttaskId = Id;
      } else {
        commenttaskId = vm.task.id;
      }

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          taskId: commenttaskId
        }
      } else {
        params = {
          customerId: vm.sessionData.userId,
          taskId: commenttaskId
        }
      }

      data = {
        message: newCommentText
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.commenttask, params, data, header)
        .then(function (response) {

          switch (response.code) {
            case 0:

              //For Progress Loader
              vm.progressEmail = false;

              vm.member = [];
              angular.forEach(vm.members, function (value) {
                if (value.id == vm.sessionData.userId) {
                  vm.member.push(value);
                }
              });
              var newComment = {
                idMember: vm.member[0].id,
                message: newCommentText,
                time: new Date()
              };
              vm.task.comments.unshift(newComment);
              vm.task.activities = response.data.activities;
              $mdToast.show($mdToast.simple().textContent("Details Saved Successfully...").position('top right'));
              break;
            case 1006:
              //For Progress Loader
              vm.progressEmail = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4002:
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4006:
              vm.newCommentText = '';
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 403:
              vm.newCommentText = '';
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
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

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getByIds = function (value) {
      return this.filter(function (x) {
        return x.objectId === value;
      })[0];
    };

    /**
     * Get Randaom value from array
     * @returns {*}
     */
    Array.prototype.randomElement = function () {
      return this[Math.floor(Math.random() * this.length)]
    };

    /**
     * Filter for chips
     *
     * @param query
     * @returns {filterFn}
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      if (lowercaseQuery != undefined) {
        return function filterFn(item) {
          if (item != undefined && item.displayObjectId != undefined) {
            return angular.lowercase(item.displayObjectId).indexOf(lowercaseQuery) >= 0;
          }
        };
      }
    }

    function createFilterFors(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(item) {
        return angular.lowercase(item.name).indexOf(lowercaseQuery) >= 0;
      };
    }

  }
})();
