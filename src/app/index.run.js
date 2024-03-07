(function () {
  'use strict';

  angular
    .module('fuse')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $timeout, $state, AuthService, $cookies, $location, $window) {

    /**
     * ***************************************************************
     *    I just added this global instance for handling below issue
     * ***************************************************************
     * PLMBot - Card view appears windows appears 'behind' PLMBot. It should be in front
     *
     * see more here : https://github.com/fuseplmapp/new-fe-integration/issues/66
     *
     * @type {boolean}
     */
    $rootScope.plmBotPanelOpen = false;

    // Activate loading indicator
    var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      var session = AuthService.getSessionData('customerData');
      var stateAuth = toState.authenticate;
      var stateUserAuth = toState.authenticateUsers;
      var stateName = toState.name || '';

      //Condition For Those pages which open without session
      if (stateName === 'app.login' || stateName === 'app.createPassword' || stateName === 'app.forgotPassword' || stateName === 'app.createPassword.errorauthToken' || stateName === 'app.forgotPassword.messagedisplay') {
        //Condition for if session available than user redirection.
        if (session) {
          $rootScope.loadingProgress = true;
          if (session.auth === true && session.userAuth === true) {
            $state.transitionTo('app.admin.dashboard');
            event.preventDefault();
          }
          else if (session.auth === false && session.userAuth === true) {
            $state.transitionTo('app.customer.dashboard');
            event.preventDefault();
          }
          else if (session.auth === false && session.userAuth === false) {
            $state.transitionTo('app.customer.scrumboard.boards');
            event.preventDefault();
          }
        }
      } else {
        if (session) {
          if (session.auth === false && session.userAuth === true) {
            if (stateAuth === false) {
              $state.transitionTo('app.adminsetting.setting');
              event.preventDefault();
            }
          }
          else if (session.auth === false && session.userAuth === false) {
            if (stateUserAuth === false) {
              $state.transitionTo('app.customer.scrumboard.boards');
              event.preventDefault();
            }
          } else if (session.auth === true && session.userAuth === true) {
          }


        } else {
          $state.transitionTo('app.login', {channelName: 'aws'});
          event.preventDefault();
        }
      }
      $rootScope.$broadcast('doHide', false);
    });


    // De-activate loading indicator
    var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
      $rootScope.$broadcast('doHide', true);
      $timeout(function () {
        $rootScope.loadingProgress = false;
      });
    });

    // Store state in the root scope for easy access
    $rootScope.state = $state;

    // Cleanup
    $rootScope.$on('$destroy', function () {
      stateChangeStartEvent();
      stateChangeSuccessEvent();
    });
  }
})();
