(function () {
  'use strict';

  angular
    .module('app.customer.scrumboard')
    .controller('cardTemplateController', cardTemplateController);

    cardTemplateController.$inject = ['$scope', 'hostUrlDevelopment', '$rootScope', 'ScrumboardService', 'errors', 'AuthService',
                                      '$state', '$mdToast', '$document', '$mdDialog', 'BoardService', 'DialogService', 'pageTitleService', 'pageTitles'];

  /** @ngInject */
  function cardTemplateController($scope, hostUrlDevelopment, $rootScope, ScrumboardService, errors, AuthService,
                                  $state, $mdToast, $document, $mdDialog, BoardService, DialogService, pageTitleService, pageTitles) {
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

    vm.progress = true;
    //For Service Call Parameter
    var params = '';
    var data = '';

    // Data
    vm.board = BoardService.data || {};
    vm.tasks = [];
    vm.cardTemplateName = 'Template Name';

    vm.enableDefaultcard = false;

    // Methods
    vm.openCardDialog = DialogService.openCardDialog;
    vm.createTemplate = createTemplate;
    vm.getBoardById = getBoardById;
    vm.onlyDefaultTemplate = onlyDefaultTemplate;
    vm.setDefaultCardTemplate = setDefaultCardTemplate;
    vm.removeCardTemplate = removeCardTemplate;

    $scope.$on('SendUp', function () {
      init();
    });
    // this is used for first board create id
    $scope.$on('first-board-create', function (event, argu) {
      vm.boradData = argu;
      init();
    });

    $rootScope.$on('updateCardTemplates', function() {
      init();
    });
    init();
    // vm.allowDefaultTemplate = vm.boradData.allowChoosingTemplates;
    function init() {
      getBoardById();
    }

    function onlyDefaultTemplate() {
      var confirm;
      if (vm.allowDefaultTemplate) {
        confirm = $mdDialog.confirm()
          .title("Are you sure you want to change the template setting?")
          .ok('Change setting')
          .cancel('No');
        $mdDialog.show(confirm)
          .then(function () {
            if (vm.sessionData.proxy === true) {
              params = {
                customerId: vm.sessionData.customerAdminId,
                boardId: BoardService.data.id,
                allowTemplateCards: vm.allowDefaultTemplate
              };
            } else {
              params = {
                customerId: vm.sessionData.userId,
                boardId: BoardService.data.id,
                allowTemplateCards: vm.allowDefaultTemplate
              };
            }
            ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.allowtemplatecards, params, '', header)
              .then(function (response) {
                //For Progress Loader
                vm.progress = false;
                switch (response.code) {
                  case 0:
                    $rootScope.$broadcast('refreshBoardView');
                    $rootScope.$broadcast("SendUp", "some data");
                    var message = "Details Saved Successfully";
                    $mdToast.show($mdToast.simple().textContent(message).position('top right'));
                    break;
                  case 1006:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                    break;
                  case 4006:
                    $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                    break;
                  default:
                    console.log(response.message);
                }
                return response.code === 0;
              })
              .catch(function (response) {
                vm.progress = false;
                console.error(response);
              });
          }, function () {
            vm.allowDefaultTemplate = vm.allowDefaultTemplate ? false : true;
          });
      } else {
        $mdDialog.show(
          {
            template: '<md-dialog md-theme="default" class="_md md-default-theme md-transition-in">' +
              '<md-dialog-content class="md-dialog-content">' +
              '<h2 class="md-title ng-binding text-copy-clipboard ts-dialog-heaing">Are you sure you want to change the template setting?</h2>' +
              '<ul class="note-ul"><li>* Make sure to create at least one template</li><li>* Make sure to select the default template</li></ul>' +
              '</md-dialog-content>' +
              '<md-dialog-actions>' +
              '<div class="action-buttons">' +
              '<button class="md-confirm-button md-button md-ink-ripple" type="button" ng-click="noDefaultDialog()">' +
              '<span class="ng-binding ng-scope">No</span>' +
              '</button>' +
              '<button class="md-confirm-button md-button md-ink-ripple" type="button" ng-click="changeSettingDialog()">' +
              '<span class="ng-binding ng-scope">Change Setting</span>' +
              '</button>' +
              '</div>' +
              '</md-dialog-actions>' +
              '</md-dialog>',
            controller: defaultTemplateController,
            controllerAs: 'vm',
            skipHide: true
          }
        );
      }
    }

    function defaultTemplateController($scope, $mdDialog) {
      $scope.noDefaultDialog = function () {
        vm.allowDefaultTemplate = vm.allowDefaultTemplate ? false : true;
        $mdDialog.cancel();
      }
      $scope.changeSettingDialog = function () {
        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            boardId: BoardService.data.id,
            allowTemplateCards: vm.allowDefaultTemplate
          };
        } else {
          params = {
            customerId: vm.sessionData.userId,
            boardId: BoardService.data.id,
            allowTemplateCards: vm.allowDefaultTemplate
          };
        }
        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.allowtemplatecards, params, '', header)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                $rootScope.$broadcast('refreshBoardView');
                $rootScope.$broadcast("SendUp", "some data");
                var message = "Details Saved Successfully";
                $mdToast.show($mdToast.simple().textContent(message).position('top right'));
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                break;
              case 4006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                break;
              default:
                console.log(response.message);
            }
            return response.code === 0;
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
        $mdDialog.cancel();
      }
    }

    function setDefaultCardTemplate(templateCardId) {

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          boardId: BoardService.data.id,
          cardId: templateCardId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId,
          boardId: BoardService.data.id,
          cardId: templateCardId
        };
      }

      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to change the default template for this Board?')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {
        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.defaultcard, params, '', header)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                vm.enableDefaultcard = true;
                // $rootScope.$broadcast("SendUp", "some data");
                var message = "Default card Saved Successfully";
                $mdToast.show($mdToast.simple().textContent(message).position('top right'));
                break;
              case 1006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                break;
              case 4006:
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(5000));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }, function (ev) {
        vm.enableDefaultcard = false;
        $rootScope.$broadcast("SendUp", "some data");
      });

    }

    function getBoardById() {
      vm.cardTemplateObjects = [];
      vm.progressGetBoard = true;

      $rootScope.$emit('boardLoaded', true);

      params = {
        customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : undefined,
        boardId: BoardService.data.id === undefined ? $state.params.id : BoardService.data.id
      };

      ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.boardbyidnew, params, '', header)
        .then(function (response) {
          vm.progressGetBoard = false;
          switch (response.code) {
            case 0:
              pageTitleService.setPageTitle(response.data.name + ' ' + pageTitles.individualBoard);
              vm.allowDefaultTemplate = response.data.allowChoosingTemplates;
              vm.templatesCardList = response.data.templatesCardList;
              if (vm.templatesCardList.length) {
                angular.forEach(vm.templatesCardList, function (cardTemplate) {
                  vm.cardTemplateObjects.push(cardTemplate);
                });
              }
              vm.defaultcardId = response.data.defaultCard;
              $rootScope.$broadcast('refreshBoardView');
              $rootScope.$emit('boardLoaded', true);
              break;
            case 403:
              vm.progress = false;
              console.log(response.message);
              break;
            case 1006:
              vm.progress = false;
              console.log(response.message);
              break;
            case 4004:
              vm.progress = false;
              console.log(response.message);
              break;
            case 4006:
              vm.progress = false;
              console.log(response.message);
              break;
            default:
              vm.progress = false;
              console.log(response.message);
          }
        }).
      catch(function (response) {
        vm.progress = false;
        console.log(response.message);
      });
    }

    function createTemplate() {
      if (vm.sessionData.proxy == true) {
        params = {
          boardId: vm.board.id || vm.boradData.id,
          listId: '',
          customerId: vm.sessionData.customerAdminId
        }
      } else {
        params = {
          boardId: vm.board.id || vm.boradData.id,
          listId: '',
          customerId: vm.sessionData.userId
        }
      }
      data = {
        cardTitle: vm.cardTemplateName,
        isTemplate: true
      };

      ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.saveorupdatecard, params, data, header)
        .then(function (response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              if (response.data) {
                vm.cardId = response.data.cardId;
                vm.isTemplate = response.data.isTemplate;
              }
              vm.cardTemplateName = 'Template Name';
              $rootScope.$broadcast("SendUp", "some data");
              break;
            case 1006:
              vm.card.name = vm.cardcopy.name;
              console.log(response.message);
              break;
            case 4006:
              break;
            case 4004:
              vm.cardTemplateName = 'Template Name';
              $mdToast.show($mdToast.simple().textContent('Template name required').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
              console.log(response.message);
          }
        })
        .then(function () {
          if (vm.cardId && vm.isTemplate) {
            vm.openCardDialog(null, vm.cardId, function () {}, vm.tasks, '', '', '', '', vm.isTemplate);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.error(response);
        });
    }

    function removeCardTemplate(cardTemplateId, ev) {
      var confirm = $mdDialog.confirm({
        title: 'Remove Card',
        parent: $document.find('#scrumboard'),
        textContent: 'Are you sure want to remove card template?',
        ariaLabel: 'remove card',
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        ok: 'Remove',
        cancel: 'Cancel'
      });

      $mdDialog.show(confirm).then(function () {

        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            cardId: cardTemplateId
          }
        } else {
          params = {
            cardId: cardTemplateId
          }
        }

        ScrumboardService.dataManipulation('POST', hostUrlDevelopment.test.removecard, params, '', header)
          .then(function (response) {
            //For Progress Loader
            vm.progress = false;
            switch (response.code) {
              case 0:
                $rootScope.$broadcast("SendUp", "some data");
                $mdToast.show($mdToast.simple().textContent("Card Template Removed Successfully...").position('top right'));
                break;
              case 1006:
                console.log(response.message);
                $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
                break;
              case 4006:
                break;
              case 10:
                $mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
                break;
              default:
                console.log(response.message);
            }
          })
          .catch(function (response) {
            vm.progress = false;
            console.error(response);
          });
      }, function () {
        // $rootScope.$broadcast("SendUp", "some data");
      });
    }

  }
})();
