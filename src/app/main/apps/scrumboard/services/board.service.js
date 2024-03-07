(function () {
  'use strict';

  angular
    .module('app.customer')
    .factory('BoardService', BoardService)
    /**
     *  Ellipsis is a series of dots (typically three, such as "…") that usually indicates an intentional omission of a word, sentence,
     *  or whole section from a text without altering its original meaning.
     */
    .filter('ellipsis', function () {
      return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace != -1) {
            //Also remove . and , so its gives a cleaner result.
            if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
              lastspace = lastspace - 1;
            }
            value = value.substr(0, lastspace);
          }
        }

        return value + (tail || ' …');
      };
    });

  /** @ngInject */
  function BoardService($q, $http, AuthService, ScrumboardService, hostUrlDevelopment, $state, msApi, errors, $mdToast, $rootScope, $location) {
    var service = {
      data: {},
      addData: {},
      taskData: [],
      cardData: [],
      members: [],
      getBoardData: getBoardData,
      addNewBoard: addNewBoard,
      getTaskData: getTaskData,
      getBoardListCard: getBoardListCard,
      getAllMembers: getAllMembers,
      getBoardBycardId: getBoardBycardId
    };

    var vm = this;
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;


    var header;

    function setAuthData() {
      vm.sessionData = AuthService.getSessionData('customerData');
      header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      }
    }

    function getBoardData(params) {
      setAuthData();

      var boardId = params.id;

      if (!params.cardId && !_.includes($location.url(), 'cardId=')) {

        // Create a new deferred object
        params = {
          customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId :  vm.sessionData.userId,
          boardId: boardId
        };

        let promises = [];

        promises.push(generateEmptyScrumboardObject('GET', hostUrlDevelopment.test.boardbyidnew, params, '', header));

        return Promise.all(promises)
          .then(([boardByIdResponse]) => {
            handlerBoardById(boardByIdResponse);
          });
      }
    }

    function handlerBoardById(response) {
      if (response.code === 0) {
        angular.forEach(response.data.cards, function (value) {
          value.cardTypeId = 'c6f3f5aee4974d27862e7dc2c483c3df';
          if (value.description == null) {
            value.description = '';
          }
        });
        if (response.data.settings.cardCoverImages === 'true') {
          response.data.settings.cardCoverImages = true;
        }
        if (response.data.settings.cardCoverImages === 'false') {
          response.data.settings.cardCoverImages = false;
        }
        vm.isWhereused = response.data.isWhereused === 'true';
        vm.isResolutionTask = response.data.isResolutionTask === 'true';
        vm.isRevModification = response.data.isRevModification === 'true';
        vm.board = {
          id: response.data.id,
          name: response.data.name,
          boardRole: response.data.boardRole,
          cardTypeId: 'c6f3f5aee4974d27862e7dc2c483c3dh',
          settings: {
            color: response.data.settings.color,
            subscribed: response.data.settings.subscribed,
            cardCoverImages: response.data.settings.cardCoverImages
          },
          isWhereused: vm.isWhereused,
          isResolutionTask: vm.isResolutionTask,
          isRevModification: vm.isRevModification,
          lists: response.data.lists,
          cards: response.data.cards,
          members: response.data.members,
          labels: response.data.labels,
          changeItems: response.data.changeItems
        };
        service.data = vm.board;
      } else {
        if ($state.current.name === 'app.customer.scrumboard.boards' || !$state.current.name) {
          $state.go('app.customer.scrumboard.boards', {
            notify: false,
            reload: false
          });
        }
        console.log(response.message);
      }
    }

    function getTaskData() {
      var vm = this;

      //For Session
      vm.sessionData = {};
      vm.sessionData = AuthService.getSessionData('customerData');

      // Create a new deferred object
      var deferred = $q.defer();

      var params = {};

      if (vm.sessionData.proxy == true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {
          customerId: vm.sessionData.userId
        }
      }

      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      generateEmptyScrumboardObject('GET', hostUrlDevelopment.test.gettasklistbyuserid, params, '', header)
        .then(function (response) {

          switch (response.code) {
            case 0:
              // Attach the data
              service.taskData = response.data;

              // Resolve the promise
              deferred.resolve(response.data);
              break;
            case 403:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 1006:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 4004:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 4006:
              deferred.reject(response);
              console.log(response.message);
              break;
            default:
              deferred.reject(response);
              console.log(response.message);
          }
        })
        .catch(function (response) {
          deferred.reject(response);
        });

      return deferred.promise;
    }

    function addNewBoard() {

      // Create a new deferred object
      var deferred = $q.defer();

      // Here you would make an API call to your server...
      addNewBoardCall()
        .then(function (response) {
          service.data = response;
          deferred.resolve(response);
        }).catch(function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    function addNewBoardCall() {
      // Create a new deferred object
      var deferred = $q.defer();

      var emptyObject = {
        name: 'Untitled',
        boardRole: [],
        settings: {
          color: '',
          subscribed: false,
          cardCoverImages: "false"
        },
        lists: [],
        cards: [],
        members: [],
        labels: []
      };

      // Resolve the promise
      deferred.resolve(emptyObject);

      return deferred.promise;
    }

    function generateEmptyScrumboardObject(method, url, params, data, headers) {
      return ScrumboardService.dataManipulation(method, url, params, data, headers);
    }

    function getBoardListCard() {
      var vm = this;
      //For Session
      vm.sessionData = {};
      vm.sessionData = AuthService.getSessionData('customerData');

      // Create a new deferred object
      var deferred = $q.defer();

      var params = null;

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

      generateEmptyScrumboardObject('GET', hostUrlDevelopment.test.getboards, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              // Attach the data
              service.cardData = response.data;
              // Resolve the promise
              deferred.resolve(response.data);
              break;
            case 403:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 1006:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 4004:
              deferred.reject(response);
              console.log(response.message);
              break;
            case 4006:
              deferred.reject(response);
              console.log(response.message);
              break;
            default:
              deferred.reject(response);
              console.log(response.message);
          }
        })
        .catch(function (response) {
          deferred.reject(response);
        });

      return deferred.promise;
    }

    /**
     * Gel All Members Information
     * @param headers
     * @returns {*} - Members List
     */
    function getAllMembers() {

      //For Session
      var sessionData = AuthService.getSessionData('customerData') || {};

      var params = null;
      // Create a new deferred object
      var deferred = $q.defer();

      // Header Information
      var header = {
        authId: sessionData.authId,
        channel_name: sessionData.channel_name,
        proxy: sessionData.proxy
      };


      if (sessionData.proxy == true) {
        params = {
          customerId: sessionData.customerAdminId
        }
      } else {
        params = {
          customerId: sessionData.userId
        }
      }

      service.members = [];

      generateEmptyScrumboardObject('GET', hostUrlDevelopment.test.getuserlist, params, '', header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              //console.log('View Member: ' ,JSON.stringify(response));
              angular.forEach(response.data.Members, function (value, key) {
                var FullName = value.firstName + ' ' + value.lastName;
                service.members.push({
                  id: value.userId,
                  name: FullName,
                  firstName: value.firstName,
                  lastName: value.lastName,
                  avatar: value.avatar,
                  auth: value.auth,
                  userEmail: value.userEmail,
                  userRoleSet: value.userRoleSet
                });
              });
              // Resolve the promise
              deferred.resolve(service.members);
              break;
            case 1006:
              console.log(response.message);
              deferred.reject(response);
              //$mdToast.show($mdToast.simple().textContent(response.message).position('top right'));
              break;
            case 4006:
              break;
            default:
              deferred.reject(response);
              console.log(response.message);
          }
        })
        .catch(function (response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }

    function getBoardBycardId(cardId, isTemplate, boardIdForTemplate) {
      setAuthData();

      var params;
      if (isTemplate) {
        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            cardId: cardId,
            boardId: boardIdForTemplate || vm.board.id
          };
        } else {
          params = {
            cardId: cardId,
            boardId: boardIdForTemplate || vm.board.id
          }
        }
      } else {
        if (vm.sessionData.proxy === true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            cardId: cardId
          };
        } else {
          params = {
            cardId: cardId
          }
        }
      }

      return ScrumboardService.dataManipulation('GET', hostUrlDevelopment.test.getboardbycardid, params, '', header)
    }

    return service;
  }
})();
