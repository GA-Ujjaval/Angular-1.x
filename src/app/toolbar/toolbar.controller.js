(function () {
  'use strict';

  angular
    .module('app.toolbar')
    .controller('ToolbarController', ToolbarController);

  /** @ngInject */
  function ToolbarController($rootScope, $http, $location, $q, $state, hostUrlDevelopment, AdminService, AuthService, GlobalSettingsService,
                             $timeout, $mdSidenav, $translate, $mdToast, msNavigationService, errors, $cookies, $filter, helpSettingService, fuseUtils) {
    var vm = this;

    /**
     * This is done to set $rootScope.enableProducts value.
     */
    if ($rootScope.enableProducts === undefined) {
      GlobalSettingsService.getProxydetails();
    }

    vm.sessionData = {};
    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    vm.bodyEl = angular.element('body');
    vm.userStatusOptions = [
      {
        'title': 'Online',
        'icon': 'icon-checkbox-marked-circle',
        'color': '#4CAF50'
      },
      {
        'title': 'Away',
        'icon': 'icon-clock',
        'color': '#FFC107'
      },
      {
        'title': 'Do not Disturb',
        'icon': 'icon-minus-circle',
        'color': '#F44336'
      },
      {
        'title': 'Invisible',
        'icon': 'icon-checkbox-blank-circle-outline',
        'color': '#BDBDBD'
      },
      {
        'title': 'Offline',
        'icon': 'icon-checkbox-blank-circle-outline',
        'color': '#616161'
      }
    ];
    vm.languages = {
      en: {
        'title': 'English',
        'translation': 'TOOLBAR.ENGLISH',
        'code': 'en',
        'flag': 'us'
      },
      es: {
        'title': 'Spanish',
        'translation': 'TOOLBAR.SPANISH',
        'code': 'es',
        'flag': 'es'
      },
      tr: {
        'title': 'Turkish',
        'translation': 'TOOLBAR.TURKISH',
        'code': 'tr',
        'flag': 'tr'
      }
    };

    vm.boardLoaded = false;

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.logout = logout;
    vm.changeLanguage = changeLanguage;
    vm.setUserStatus = setUserStatus;
    vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
    vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
    vm.search = search;
    vm.searchResultClick = searchResultClick;
    vm.changeLogo = changeLogo;
    var params = '';
    var header = '';
    //////////

    $rootScope.$on('boardLoaded', (event, value) => {
      vm.boardLoaded = value;
    });

    init();

    /**
     * Initialize
     */
    function init() {
      // Select the first status as a default
      vm.userStatus = vm.userStatusOptions[0];
      vm.setting = false;
      // Get the selected language directly from angular-translate module setting
      vm.selectedLanguage = vm.languages[$translate.preferredLanguage()];

      vm.sessionData = AuthService.getSessionData('customerData');
      if (vm.sessionData.userId) {
        params = {
          customerId: vm.sessionData.userId
        };
        header = {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name,
          proxy: vm.sessionData.proxy
        };
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.userId
          };
          header = {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: false
          };
        }
        getProfileDetailCall();
      } else {
        $mdToast.show($mdToast.simple().textContent('No Session found').position('top right'));
      }
    }

    function getProfileDetailCall() {
      GlobalSettingsService.getProfile()
        .then(function (profileResponse) {
          vm.progress = false;
          if (profileResponse.code === 0) {
            let info = profileResponse.data;
            $rootScope.customerProfileForm = profileResponse.data;
            $rootScope.introGlobalHelp = (info.helpSetting.helpIntroGlobalHelp === 'true');
            $rootScope.introSettingFlag = _.get(profileResponse, 'data.helpSetting.helpIntroSetting');
            $rootScope.introBotFlag = _.get(profileResponse, 'data.botSetting.botIntroSetting');
            $rootScope.introNavigationFlag = info.helpSetting.helpIntroNavigation;
            $rootScope.showBot = (info.helpSetting.botIntroSetting === 'true');
            $rootScope.objectsDefaultSize = (!info.helpSetting.defaultObjectCount || info.helpSetting.defaultObjectCount === null) ? 100 :
              (info.helpSetting.defaultObjectCount === '-1' ? 'All' : parseInt(info.helpSetting.defaultObjectCount));
            $rootScope.objectsDefaultSizePart = (!info.helpSetting.defaultObjectCountPart || info.helpSetting.defaultObjectCountPart === null) ? 100 :
              (info.helpSetting.defaultObjectCountPart === '-1' ? 'All' : parseInt(info.helpSetting.defaultObjectCountPart));
            $rootScope.objectsDefaultSizeProduct = (!info.helpSetting.defaultObjectCountProduct || info.helpSetting.defaultObjectCountProduct === null) ? 100 :
              (info.helpSetting.defaultObjectCountProduct === '-1' ? 'All' : parseInt(info.helpSetting.defaultObjectCountProduct));
            $rootScope.objectsDefaultSizeDocument = (!info.helpSetting.defaultObjectCountDocument || info.helpSetting.defaultObjectCountDocument === null) ? 100 :
              (info.helpSetting.defaultObjectCountDocument === '-1' ? 'All' : parseInt(info.helpSetting.defaultObjectCountDocument));
            $rootScope.helpIntroAddBoard = info.helpSetting.helpIntroScrumboard;
            $rootScope.introSettingSidenavFlag = info.helpSetting.helpIntroSettingSidenav;
            $rootScope.introGlobalHelpScrumboard = ($rootScope.introGlobalHelp === false && $location.url() !== '/customer/scrumboard/boards/add');
            $rootScope.linkTarget = (info.helpSetting.linkTarget ? info.helpSetting.linkTarget === 'true' : false);
            GlobalSettingsService.setUserFullName(info.firstName + ' ' + info.lastName);
            helpSettingService.addData(info);
            //MixPanel start
            if (window.tokenMixPanel) {
              let startMixPanelTime = Date.now();
              $cookies.put('startMixPanelTime', startMixPanelTime);
              startMixPanelTime = $filter('date')(startMixPanelTime, 'dd.MM.yyyy, hh:mm:ss a');
              mixpanel.identify(profileResponse.data.userId);
              let fullNameForMPanel = profileResponse.data.firstName + ' ' + profileResponse.data.lastName;
              mixpanel.people.set({
                'name': fullNameForMPanel,
                'first name': profileResponse.data.firstName,
                'last name': profileResponse.data.lastName,
                'email': profileResponse.data.userEmail,
                'role': profileResponse.data.userRoleSet,
                'company name': profileResponse.data.organizationName,
                'Last entry time': startMixPanelTime,
                'Logout time': 'in session',
                'Duration of last session': 'in session',
                'status': 'active'
              });
            }
            //MixPanel end
            vm.customerProfileForm = profileResponse.data;
            $rootScope.userProfileForm = profileResponse.data;
          } else {
            $rootScope.objectsDefaultSize = 100;
          }
        })
        .catch(function () {
          vm.progress = false;
          console.log(vm.error.erCatch);
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
     * Sets User Status
     * @param status
     */
    function setUserStatus(status) {
      vm.userStatus = status;
    }

    /**
     * Logout Function
     */
    function logout() {

      if (vm.sessionData.proxy === true) {
        AuthService.proxyLogout('customerData', vm.sessionData);
        $state.go('app.admin.dashboard');
      }
      else {

        //MixPanel start
        if (window.tokenMixPanel) {

          var loginTime = +$cookies.get('startMixPanelTime');
          var logoutTime = Date.now();
          var duration = logoutTime - loginTime;

          duration = $filter('date')(duration, 'HH:mm:ss', 'UTC');
          loginTime = $filter('date')(loginTime, 'dd.MM.yyyy, hh:mm:ss a');
          logoutTime = $filter('date')(logoutTime, 'dd.MM.yyyy, hh:mm:ss a');
          $cookies.remove('startMixPanelTime');

          mixpanel.people.set({
            'Logout time': logoutTime,
            'Duration of last session': duration,
            'status': 'not active'
          });

          mixpanel.track(
            'session',
            {
              'session time': duration,
              'login time': loginTime,
              'logout time': logoutTime
            }
          );
        }
        //MixPanel end
        var header = {
          authId: vm.sessionData.authId,
          channel_name: vm.sessionData.channel_name
        };
        logoutCall('POST', hostUrlDevelopment.test.logout, '', '', header);
      }

    }

    function changeLogo(isChangeLogo) {
      fuseUtils.isChangeLogo = isChangeLogo;
    }

    function logoutCall(method, url, params, data, header) {
      AdminService.dataManipulation(method, url, params, data, header)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              var userData = AuthService.getSessionData('customerData');
              $cookies.put('userId', userData.userId);
              $cookies.put('returnUrl', window.location.pathname);
              $mdToast.show($mdToast.simple().textContent('Logout successfully !!').position('top right'));
              AuthService.userLogout('customerData');
              //$state.go('app.landing');
              $state.go('app.login', {channelName: 'aws'});
              break;
            default:
              //console.log(response.message);
              $mdToast.show($mdToast.simple().textContent('Some Issue').position('top right'));
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent('Connection Issue').position('top right'));
        });
    }

    vm.onChange = function (state, flag) {
      if (state == false && flag == 'help') {
        $http({
          method: 'POST',
          url: hostUrlDevelopment.test.helpsetting,
          headers: {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
          },
          data: {
            helpIntroGlobalHelp: false,
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
      } else if (state == true && flag == 'help') {
        $http({
          method: 'POST',
          url: hostUrlDevelopment.test.helpsetting,
          headers: {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
          },
          data: {
            helpIntroGlobalHelp: true,
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
      } else if (state == false && flag == 'bot') {
        $http({
          method: 'POST',
          url: hostUrlDevelopment.test.helpsetting,
          headers: {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
          },
          data: {
            botIntroSetting: false,
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin',
            customerId: vm.sessionData.userRoleSet[0] == 'customer_admin' ? vm.sessionData.userId : null
          }
        }).then(function successCallback(response) {},
          function errorCallback(response) {});
      } else if (state == true && flag == 'bot') {
        $http({
          method: 'POST',
          url: hostUrlDevelopment.test.helpsetting,
          headers: {
            authId: vm.sessionData.authId,
            channel_name: vm.sessionData.channel_name,
            proxy: vm.sessionData.userRoleSet[0] == 'customer_admin'
          },
          data: {
            botIntroSetting: true,
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
      if ($rootScope.introGlobalHelp == false) {
        $("a.introjs-hint div").hide();
      } else {
        $("a.introjs-hint div").show();
      }
      if ($rootScope.introGlobalHelp == false && $location.url() != '/customer/scrumboard/boards/add') {
        $rootScope.introGlobalHelpScrumboard = false;
      } else {
        $rootScope.introGlobalHelpScrumboard = true;
      }
      if ($rootScope.showBot == false && $location.url() != '/customer/scrumboard/boards/add') {
        $rootScope.showBot = false;
      } else {
        $rootScope.showBot = true;
      }
    };

    /**
     * Change Language
     */
    function changeLanguage(lang) {
      vm.selectedLanguage = lang;

      /**
       * Show temporary message if user selects a language other than English
       *
       * angular-translate module will try to load language specific json files
       * as soon as you change the language. And because we don't have them, there
       * will be a lot of errors in the page potentially breaking couple functions
       * of the template.
       *
       * To prevent that from happening, we added a simple "return;" statement at the
       * end of this if block. If you have all the translation files, remove this if
       * block and the translations should work without any problems.
       */
      if (lang.code !== 'en') {
        var message = 'Fuse supports translations through angular-translate module, but currently we do not have any translations other than English language. If you want to help us, send us a message through ThemeForest profile page.';

        $mdToast.show({
          template: '<md-toast id="language-message" layout="column" layout-align="center start"><div class="md-toast-content">' + message + '</div></md-toast>',
          hideDelay: 7000,
          position: 'top right',
          parent: '#content'
        });

        return;
      }

      // Change the language
      $translate.use(lang.code);
    }

    /**
     * Toggle horizontal mobile menu
     */
    function toggleHorizontalMobileMenu() {
      vm.bodyEl.toggleClass('ms-navigation-horizontal-mobile-menu-active');
    }

    /**
     * Toggle msNavigation folded
     */
    function toggleMsNavigationFolded() {
      msNavigationService.toggleFolded();
    }

    /**
     * Search action
     *
     * @param query
     * @returns {Promise}
     */
    function search(query) {
      var navigation = [],
        flatNavigation = msNavigationService.getFlatNavigation(),
        deferred = $q.defer();

      // Iterate through the navigation array and
      // make sure it doesn't have any groups or
      // none ui-sref items
      for (var x = 0; x < flatNavigation.length; x++) {
        if (flatNavigation[x].uisref) {
          navigation.push(flatNavigation[x]);
        }
      }

      // If there is a query, filter the navigation;
      // otherwise we will return the entire navigation
      // list. Not exactly a good thing to do but it's
      // for demo purposes.
      if (query) {
        navigation = navigation.filter(function (item) {
          if (angular.lowercase(item.title).search(angular.lowercase(query)) > -1) {
            return true;
          }
        });
      }

      // Fake service delay
      $timeout(function () {
        deferred.resolve(navigation);
      }, 1000);

      return deferred.promise;
    }

    /**
     * Search result click action
     *
     * @param item
     */
    function searchResultClick(item) {
      // If item has a link
      if (item.uisref) {
        // If there are state params,
        // use them...
        if (item.stateParams) {
          $state.go(item.state, item.stateParams);
        }
        else {
          $state.go(item.state);
        }
      }
    }
  }

})();
