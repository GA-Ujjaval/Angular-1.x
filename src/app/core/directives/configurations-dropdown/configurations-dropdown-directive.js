(function () {
  angular
    .module('app.core')
    .directive('configurationsDropdown', function (BomService, $mdDialog, $rootScope) {

      function link(scope) {
        const vm = scope;
        scope.vm = scope;
        scope.getConfigurationsList = getConfigurationsList;
        scope.changeConfiguration = changeConfiguration;
        scope.getIdOfConfig = getIdOfConfig;

        scope.$watch('rowEntity.configArray', function (newVal, oldVal) {
          if (!newVal) {
            vm.rowEntity.configArray = getInitialDropdownValue(vm.rowEntity);
          }
        });
      }

      function getInitialDropdownValue(row) {
        return [{
          configName: row.configurationsForDropdown,
          objectId: row.configurationsForDropdown
        }];
      }

      function getIdOfConfig(configurations, configName) {
        return _.find(configurations, {configName}).objectId;
      }

      function getConfigurationsList(id, rowEntity) {
        if (rowEntity.configArray.length > 1) {
          return;
        }

        BomService.getFuseObjectConfigurationsById(id)
          .then(function (response) {
            rowEntity.configArray = getProperConfigurations(response.data);
            matchCurrentConfiguration(rowEntity, id);
          })
      }

      function getProperConfigurations(wrongStructuredData) {
        var wso = wrongStructuredData;
        var rightObject = {};
        wso.forEach(function (arrayItem) {
          for (var key in arrayItem) {
            if (key.indexOf('part') || key.indexOf('product')) {
              rightObject[key] = arrayItem[key];
            }
          }
        });
        return _.map(rightObject, function (value, key) {
          return value;
        });
      }

      function matchCurrentConfiguration(rowEntity, clickedConfigId) {
        angular.forEach(rowEntity.configArray, function (value, key, object) {
          if (key === clickedConfigId) {
            rowEntity.configArray[key].current = true;
          }
        })
      }

      function changeConfiguration(newConfigurationId, row, id) {
        showPopup()
          .then(function (res) {
            $rootScope.$broadcast('progress: true');
            return BomService.changeConfiguration(newConfigurationId, row, id);
          }, function (err) {
            return Promise.resolve((err || {code: 1}))
          })
          .then(function (res) {
            if (res && res.code === 0) {
              $rootScope.$broadcast('configuration is changed');
            }
          }, function (err) {
          });
      }

      function showPopup() {
        var confirm = $mdDialog.confirm()
          .title('Do you want to change the configuration?')
          .ariaLabel('Change config')
          .ok('Yes')
          .cancel('No');
        return $mdDialog.show(confirm);
      }

      return {
        templateUrl: 'app/core/directives/configurations-dropdown/configurations-dropdown.html',
        link: link,
        restrict: 'E',
        /**
         * id - the id of a fuse object
         * mainId - the id of the object, we are looking details for
         */
        scope: {
          id: '=',
          mainId: '=',
          hasConfig: '=',
          rowEntity: '='
        }
      }
    });
})();
