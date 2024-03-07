(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('RevisionNotesController', RevisionNotesController);

  /** @ngInject */
  function RevisionNotesController($scope, $state, $mdDialog, hostUrlDevelopment, CustomerService, errors, $mdToast,
    AuthService, fuseObjectId, minormajorIncrement, minormajor, incrementOnly, products, editReleasedBom, MainTablesService) {

    var vm = this;
    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = true;
    vm.isEnable = true;
    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');
    //For Service Call Header
    var header = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };
    //console.log("Seeeion : " +JSON.stringify(minormajor));
    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    var data;
    vm.whereusedData = true;

    vm.minormajor;
    vm.minormajorIncrement = minormajorIncrement;
    vm.products = products;
    vm.selectedAll = false;
    vm.status = true;
    vm.whereSet = [];
    vm.whereUsed = [];
    vm.editReleasedBom = editReleasedBom;

    init();

    if (incrementOnly === 'incrementOnly') {
      vm.minorsmajors = false;
      vm.minormajor = 'Major';
      vm.minormajorValue = vm.minormajorIncrement.revision;
    } else {
      if (minormajor) {
        vm.minormajor = 'Major';
        vm.minormajorValue = vm.minormajorIncrement.revision;
      } else {
        vm.minormajor = 'Minor';
        vm.minormajorValue = vm.minormajorIncrement.minorRevision;
      }
    }

    vm.createRevisionNotesFunction = createRevisionNotesFunction;
    vm.closeDialog = closeDialog;
    vm.checkAll = checkAll;
    vm.singleSelect = singleSelect;

    function init() {
      //For Progress Loader
      MainTablesService.getAllFuseObjectsWhereusedCheck(fuseObjectId, vm.products)
        .then(function (response) {
          switch (response.code) {
            case 0:

              vm.whereUsedList = [];
              angular.forEach(response.data, function (value, key) {
                angular.forEach(vm.products.whereUsedSet, function (val, keys) {
                  if (value.objectId === val) {
                    vm.whereUsedList.push(value);
                  }
                });
              });
              vm.whereUsed = vm.whereUsedList;
              if (vm.whereUsed && vm.whereUsed.length !== 0) {
                vm.progress = false;
              } else if (vm.whereUsed.length === 0) {
                vm.progress = false;
              }
              vm.DataSelect = clck();
              vm.whereusedData = false;
              break;
            case 4006:
              vm.progress = false;
              console.log(response.message);
              break;
            default:
              vm.progress = false;
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          console.log(response.message);
        });
    }


    function checkAll(allData) {
      vm.selectedBox;
      if (vm.selectedAll) {
        vm.selectedAll = true;
        vm.selectedBox = false;
        vm.whereSet = [];
      } else {
        vm.selectedAll = false;
        vm.selectedBox = true;
        let checkStatus = _.some(allData, value => ((value.status == 'Released' || value.status == 'Obsolete') && vm.editReleasedBom));
        angular.forEach(allData, function (value) {
          if (value.status == 'InDevelopment' || vm.editReleasedBom) {
            if (checkStatus) {
              checkStatus = false;
              $mdDialog.show({
                template: '<md-dialog>' +
                  '<md-dialog-content>' +
                  '<h2 class="md-title ng-binding">WARNING: Some objects on list are ' + value.status + ', are you sure want to update?</h2>' +
                  '</md-dialog-content>' +
                  '<md-dialog-actions>' +
                  '<md-button ng-click="vm.closeDialog(true)" class="md-primary">' +
                  'No' +
                  '</md-button>' +
                  '<md-button ng-click="vm.closeDialog()" class="md-primary">Yes</md-button>' +
                  '</md-dialog-actions>' +
                  '</md-dialog>',
                multiple: true,
                controller: function ($mdDialog) {
                  var vm = this;
                  vm.closeDialog = function (flag) {
                    if (flag) {
                      $mdDialog.cancel();
                    } else {
                      $mdDialog.hide();
                    }
                  }
                },
                controllerAs: 'vm',
                skipHide: true
              }).then(function () {
                vm.whereSet.push(value.objectId);
              }, function () {
                vm.selectedAll = false;
                angular.forEach(vm.whereUsed, function (whereused) {
                  whereused.Selected = false;
                });
                vm.whereSet = [];
              });
            } else {
              vm.whereSet.push(value.objectId);
            }
          }
        });
      }
      angular.forEach(vm.whereUsed, function (whereused) {
        if ((whereused.status == 'Released' || whereused.status == 'Obsolete') && !vm.editReleasedBom) {
          whereused.Selected = false;
        } else {
          whereused.Selected = vm.selectedBox;
        }
      });
    }

    function clck() {
      var counter = 0;
      angular.forEach(vm.whereUsed, function (whereused) {
        if ((whereused.status != 'Released' && whereused.status != 'Obsolete') || vm.editReleasedBom) {
          counter++;
        }
      });
      return counter;
    }

    function singleSelect(item) {
      var value = item.objectId;

      if ((item.status == 'Released' || item.status == 'Obsolete') && vm.editReleasedBom && !item.Selected) {

        $mdDialog.show({
          template: '<md-dialog>' +
            '<md-dialog-content>' +
            '<h2 class="md-title ng-binding">WARNING: Object is ' + item.status + ', are you sure want to update?</h2>' +
            '</md-dialog-content>' +
            '<md-dialog-actions>' +
            '<md-button ng-click="vm.closeDialog(true)" class="md-primary">' +
            'No' +
            '</md-button>' +
            '<md-button ng-click="vm.closeDialog()" class="md-primary">Yes</md-button>' +
            '</md-dialog-actions>' +
            '</md-dialog>',
          multiple: true,
          controller: function ($mdDialog) {
            var vm = this;
            vm.closeDialog = function (flag) {
              if (flag) {
                $mdDialog.cancel();
              } else {
                $mdDialog.hide();
              }
            }
          },
          controllerAs: 'vm',
          skipHide: true
        }).then(function () {
          confirmUpdating(value);
        }, function () {
          item.Selected = false;
        });

      } else {
        confirmUpdating(value);
      }
    }

    function confirmUpdating(value) {
      if (vm.whereSet.indexOf(value) > -1) {
        vm.whereSet.splice(vm.whereSet.indexOf(value), 1);
      } else if (vm.whereSet.indexOf(value) == -1) {
        vm.whereSet.push(value);
      }

      vm.selectedAll = (vm.whereSet.length == vm.DataSelect);
    }

    function createRevisionNotesFunction() {
      //For Progress Loader
      vm.progress = true;
      vm.whereusedData = true;

      var header = {
        authId: vm.sessionData.authId,
        channel_name: vm.sessionData.channel_name,
        proxy: vm.sessionData.proxy
      };

      if (incrementOnly === 'incrementOnly') {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            fuseObjectId: fuseObjectId,
            revisionNotes: vm.revisionNotes
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            fuseObjectId: fuseObjectId,
            revisionNotes: vm.revisionNotes
          }
        }
        data = {
          isMajor: vm.minormajorIncrement.isMajor,
          minorRevision: vm.minormajorIncrement.minorRevision,
          revision: vm.minormajorValue,
          tempSystemRevision: vm.minormajorIncrement.tempSystemRevision,
          tempSystemMinorRevision: vm.minormajorIncrement.tempSystemMinorRevision,
          whereUsed: vm.whereSet
        }
      } else {
        if (vm.sessionData.proxy == true) {
          params = {
            customerId: vm.sessionData.customerAdminId,
            fuseObjectId: fuseObjectId,
            revisionNotes: vm.revisionNotes
          }
        } else {
          params = {
            customerId: vm.sessionData.userId,
            fuseObjectId: fuseObjectId,
            revisionNotes: vm.revisionNotes
          }
        }

        if (minormajor) {
          vm.minormajor = 'Major';
          data = {
            isMajor: vm.minormajorIncrement.isMajor,
            minorRevision: vm.minormajorIncrement.minorRevision,
            revision: vm.minormajorValue,
            tempSystemRevision: vm.minormajorIncrement.tempSystemRevision,
            tempSystemMinorRevision: vm.minormajorIncrement.tempSystemMinorRevision,
            whereUsed: vm.whereSet
          }

        } else {
          vm.minormajor = 'Minor';
          data = {
            isMajor: vm.minormajorIncrement.isMajor,
            minorRevision: vm.minormajorValue,
            revision: vm.minormajorIncrement.revision,
            tempSystemRevision: vm.minormajorIncrement.tempSystemRevision,
            tempSystemMinorRevision: vm.minormajorIncrement.tempSystemMinorRevision,
            whereUsed: vm.whereSet
          }
        }
      }

      CustomerService.addNewMember('POST', hostUrlDevelopment.test.incrementrevision, params, data, header)
        .then(function (response) {
          switch (response.code) {
            case 0:
              $mdToast.show($mdToast.simple()
                .textContent(response.data.customObjectId + ' ' + 'Increment Revision Operation Successfully Performed !!')
                .position('top right'));
              $mdDialog.hide();

              if (response.data.objectType === 'parts') {
                $state.go('app.objects.part.parts.basicInfo', {
                  'id': response.data.objectId
                });
              } else {
                if (response.data.objectType === 'documents') {
                  $state.go('app.objects.documents.details.basicInfo', {
                    'id': response.data.objectId
                  });
                } else {
                  $state.go('app.objects.products.details.basicInfo', {
                    'id': response.data.objectId
                  });
                }
              }
              //For Progress Loader
              vm.progress = false;
              vm.whereusedData = true;
              break;
            case 4006:
              //For Progress Loader
              vm.progress = false;
              vm.whereusedData = false;
              console.log(response.message);
              break;
            case 17:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 1006:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
              break;
            case 4266:
              vm.whereusedData = false;
              //For Progress Loader
              vm.progress = false;

              console.log(response.message);
              $mdToast.show($mdToast.simple().textContent(response.message).action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
            case 4004:
              vm.whereusedData = false;
              //For Progress Loader
              vm.progress = false;

              console.log(response.message);
              break;
            case 11:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          //For Progress Loader
          vm.progress = false;
          console.log('catch');
        });
    }

    /**
     * Close dialog
     */
    function closeDialog() {
      $mdDialog.hide();
    }

    vm.parseStrings = function (str1, str2) {
      var startStringSecond = str1.substring(str1.indexOf("-"), str1.indexOf("]") + 1) + " ";
      var startStringFirst = str1.substring(0, str1.indexOf("-")) + " ";
      var startString = startStringFirst + startStringSecond;
      var middleString = "\xa0\xa0\xa0" + "[" + str2 + "]" + "\xa0\xa0\xa0";
      var endString = " " + str1.substring(str1.indexOf("]") + 1);
      return startString + middleString + endString;
    };
    vm.parseChip = function (chip) {
      return vm.parseStrings(chip.displayObjectId || chip, changeItemsIDQuerySearchStatus(chip.displayObjectId || chip));
    };

  }
})();
