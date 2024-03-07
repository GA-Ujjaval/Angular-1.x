(function () {
  'use strict';

  angular
    .module('app.customer')
    .controller('customerDialogController', customerDialogController);

  /** @ngInject */
  function customerDialogController($mdDialog, $rootScope, editData, event, callback, $parent, CustomerService, $mdToast, $state, AuthService, hostUrlDevelopment, errors, statusChange) {

    angular.element('html body').bind('keypress', function (e) {
      if (e.keyCode == 13) {
        return false;
      }
    });
    var vm = this;

    vm.error = errors;

    vm.createMemberForm = {};
    vm.createMemberForm.userRoleSet = [];
    vm.createMemberForm.isActive = true;

    vm.editMember = true;

    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    vm.switch = true;
    vm.memberRoledisabled = false;
    vm.roleSubmitButton = false;
    vm.submitButton = false;
    vm.statusChange = statusChange;

    vm.roleSet = [{
      disp: 'Project Engineer',
      val: 'project_engineer'
    }, {
      disp: 'Release Coordinator',
      val: 'release_coordinator'
    }, {
      disp: 'Project Manager',
      val: 'project_manager'
    }, {
      disp: 'Read Only',
      val: 'read_only'
    }];

    vm.Reset = resetFunction;
    vm.addRoleChipsFunction = addRoleChipsFunction;
    vm.submit = addNewMemberFunction;
    vm.customerAdmin = customerAdmin;
    vm.optionFunction = optionFunction;
    vm.disableSlider = disableSlider;
    vm.changeMemberStatus = changeMemberStatus;
    vm.check = check;

    vm.addChip = addChip;

    vm.data = {
      group1: 'No'
    };

    function customerAdmin() {
      vm.roleSubmitButton = true;
      if (vm.memberRoledisabled == false) {
        vm.submitButton = false;
        vm.memberRoledisabled = true;
        vm.createMemberForm.userRoleSet = ['customer_admin'];
      }
      vm.EnableAllowForTaskApproval = false;
      vm.EnableAllowForCommentsCardTask = false;
    }

    function optionFunction() {
      vm.roleSubmitButton = false;
      vm.memberRoledisabled = false;
      vm.createMemberForm.userRoleSet = [];
    }

    function disableSlider(chip) {
      if (chip && chip === 'read_only') {
        vm.createMemberForm.allowForTaskApproval = false;
        vm.createMemberForm.allowForCommentsCardTask = false;
      }
      if (vm.createMemberForm && vm.createMemberForm.userRoleSet.length > 0) {
        for (var i = 0; i < vm.createMemberForm.userRoleSet.length; i++) {
          if (angular.equals(vm.createMemberForm.userRoleSet[i], 'read_only')) {
            vm.EnableAllowForTaskApproval = true;
            vm.EnableAllowForCommentsCardTask = true;
          } else {
            vm.EnableAllowForTaskApproval = false;
            vm.EnableAllowForCommentsCardTask = false;
          }
        }
      } else {
        vm.EnableAllowForTaskApproval = false;
        vm.EnableAllowForCommentsCardTask = false;
      }
    }


    function addChip(chip) {
      //console.log(chip);
      var flag = null;
      vm.submitButton = false;

      angular.forEach(vm.roleSet, function (value) {
        if (value.val == chip) {
          flag = value.val;
          vm.submitButton = true;
        }
      });

      return flag;
    }


    function resetFunction() {
      vm.createMemberForm.userName = '';
      vm.createMemberForm.userEmail = '';
      vm.createMemberForm.firstName = '';
      vm.createMemberForm.lastName = '';
      vm.createMemberForm.allowForTaskApproval = false;
      vm.createMemberForm.allowForCommentsCardTask = false;
      vm.EnableAllowForTaskApproval = false;
      vm.EnableAllowForCommentsCardTask = false;
      vm.selectRole = '';
      vm.createMemberForm.userRoleSet = [];
      vm.createMemberForm.isActive = true;
    }

    function addRoleChipsFunction(role) {
      vm.submitButton = false;
      vm.roleSubmitButton = true;
      var length = vm.createMemberForm.userRoleSet.length;
      var dataPush = false;
      if (vm.createMemberForm.userRoleSet.length === 0) {
        vm.createMemberForm.userRoleSet.push(vm.selectRole);
        vm.selectRole = '';
      }
      else if (length < 4) {
        angular.forEach(vm.createMemberForm.userRoleSet, function (val, key) {
          if (val === vm.selectRole) {
            dataPush = true;
          }
        });
        if (dataPush === false) {
          vm.createMemberForm.userRoleSet.push(vm.selectRole);
        }
        vm.selectRole = '';
      }
      if (vm.createMemberForm && vm.createMemberForm.userRoleSet.length > 0) {
        for (var i = 0; i < vm.createMemberForm.userRoleSet.length; i++) {
          if (angular.equals(vm.createMemberForm.userRoleSet[i], 'read_only')) {
            vm.EnableAllowForTaskApproval = true;
            vm.EnableAllowForCommentsCardTask = true;
            if (role === 'read_only') {
              vm.createMemberForm.allowForTaskApproval = false;
              vm.createMemberForm.allowForCommentsCardTask = false;
            }
          }
        }
      } else {
        vm.EnableAllowForTaskApproval = false;
        vm.EnableAllowForCommentsCardTask = false;
      }
    }

    if (editData === '') {
      vm.title = 'Add Member';
    } else {
      vm.title = 'Edit Member';
      vm.editMember = false;
      vm.createMemberForm = angular.copy(editData) || {};
      angular.forEach(vm.createMemberForm.userRoleSet, function (value, key) {
        if (value == 'customer_admin') {
          vm.data = {
            group1: 'Yes'
          };
          vm.memberRoledisabled = true;
          vm.submitButton = false;
          vm.roleSubmitButton = true;
        }
        else {
          vm.data = {
            group1: 'No'
          };
          vm.memberRoledisabled = false;
          vm.submitButton = false;
          vm.roleSubmitButton = true;
        }
      });
      if (vm.createMemberForm && vm.createMemberForm.userRoleSet.length > 0) {
        for (var i = 0; i < vm.createMemberForm.userRoleSet.length; i++) {
          if (angular.equals(vm.createMemberForm.userRoleSet[i], 'read_only')) {
            vm.EnableAllowForTaskApproval = true;
            vm.EnableAllowForCommentsCardTask = true;
          }
        }
      } else {
        vm.EnableAllowForTaskApproval = false;
        vm.EnableAllowForCommentsCardTask = false;
      }
    }

    var params;
    // Data
    vm.hide = function () {
      $mdDialog.hide();
    };
    vm.cancel = function () {
      $mdDialog.cancel();
    };

    function addNewMemberFunction() {

      //For Progress Loader
      vm.progress = true;

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
      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      if (vm.editMember == false) {
        var data = {
          customerId: vm.createMemberForm.userId,
          userRoleSet: vm.createMemberForm.userRoleSet,
          firstName: vm.createMemberForm.firstName,
          lastName: vm.createMemberForm.lastName,
          userEmail: vm.createMemberForm.userEmail,
          userName: vm.createMemberForm.userName,
          allowForTaskApproval: vm.createMemberForm.allowForTaskApproval,
          allowForCommentsCardTask: vm.createMemberForm.allowForCommentsCardTask,
          isActive: vm.createMemberForm.isActive
        };
        vm.submitButton = true;
        addNewMemberCall('POST', hostUrlDevelopment.test.updatemember, params, data, header, 'Successfully Updated', 'update');
      }
      else {
        vm.submitButton = true;
        addNewMemberCall('POST', hostUrlDevelopment.test.createCustomer, params, vm.createMemberForm, header, 'Successfully Created');
      }
    }

    function addNewMemberCall(method, url, params, data, header, toast, update) {
      CustomerService.addNewMember(method, url, params, data, header)
        .then(function (response) {

          //For Progress Loader
          vm.progress = false;

          switch (response.code) {
            case 0:

              //MixPanel start
              if (window.tokenMixPanel) {
                mixpanel.identify(response.data.userId);

                var fullNameForMPanel = data.firstName + ' ' + data.lastName;
                mixpanel.people.set({
                  "name": fullNameForMPanel,
                  "first name": data.firstName,
                  "last name": data.lastName,
                  "email": response.data.userEmail,
                  "role": response.data.userRoleSet,
                  "status": "not active"
                });
              }
              //MixPanel end

              if (update === 'update') {
                $mdToast.show($mdToast.simple().textContent(toast).position('top right'));
                $mdDialog.hide(true);
                if (vm.sessionData.userId == response.data.userId) {
                  if (response.data.auth == false) {
                    $mdToast.show($mdToast.simple().textContent("Role has been updated successfully. Please login to continue.").position('top right'));
                    AuthService.userLogout('customerData');
                    //$state.go('app.landing');
                    $state.go('app.login', {channelName: 'aws'});
                  }
                }
              }
              else {
                $mdToast.show($mdToast.simple().textContent(toast).position('top right'));
                $mdDialog.hide(true);
              }
              break;
            case 2:
              // console.log(response.message);
              break;
            case 4:
              vm.submitButton = false;
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              //console.log(response.message);
              break;
            case 4006:
              //console.log(response.message);
              break;
            case 9:
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            default:
            //console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function changeMemberStatus(ev, flag) {
      if (vm.title === 'Edit Member') {
        if (flag) {
          var confirm = $mdDialog.confirm()
            .title('Are you sure you want to activate this user?')
            .ariaLabel('change Member Status')
            .targetEvent(ev)
            .ok('OK')
            .cancel('CANCEL');
          $mdDialog.show(confirm).then(function () {
            vm.createMemberForm.isActive = flag;
            vm.statusChange = false;
            openAddMemberDialog(ev, vm.createMemberForm);
          }, function () {
            vm.createMemberForm.isActive = false;
            openAddMemberDialog(ev, vm.createMemberForm);
          });
        } else {
          var confirm = $mdDialog.confirm()
            .title('Are you sure you want to deactivate this user?')
            .ariaLabel('change Member Status')
            .textContent('Note: Deactivating the user will not remove the history of their activities, nor unassign them from existing Tasks/Cards.')
            .targetEvent(ev)
            .ok('OK')
            .cancel('CANCEL');
          $mdDialog.show(confirm).then(function () {
            vm.createMemberForm.isActive = flag;
            vm.statusChange = false;
            openAddMemberDialog(ev, vm.createMemberForm);
          }, function () {
            vm.createMemberForm.isActive = true;
            openAddMemberDialog(ev, vm.createMemberForm);
          });
        }
      }
    }

    function openAddMemberDialog(ev, updatedMemberDetail) {
      $mdDialog.show({
        controller: 'customerDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/setting/dialogs/customer-dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          event: ev,
          editData: updatedMemberDetail || '',
          $parent: vm,
          callback: null,
          statusChange: vm.statusChange
        }
      }).then(function (data) {
        $rootScope.$broadcast("render-setting", "some data");
      });
    }

    function check(form) {
      if (form.$invalid || form.$pristine || !vm.roleSubmitButton || vm.submitButton) {
        if (!vm.statusChange) {
          return false;
        }
        return true;
      }
      return false;
    }
  }
})();
