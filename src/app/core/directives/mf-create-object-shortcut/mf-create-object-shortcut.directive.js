(function () {
  angular
    .module('app.core')
    .directive('mfCreateObjectShortcut', function (TemplatesService, $mdDialog, $document, AuthService, $rootScope,
                                                   GlobalSettingsService) {

      function link(scope) {
        var vm = scope;
        scope.vm = scope;
        vm.rootScope = $rootScope;

        $rootScope.$watch('advancedNumberSettings', (value) => {
          vm.advancedNumberSettings = value;
        });

        vm.createObject = createObject;
        vm.isRO = isUserRole('read_only');

        var sessionData = AuthService.getSessionData('customerData');

        /**
         * This function returns function which checks, whether the user has
         * @param userRoleName
         * @returns {function(): *}
         */
        function isUserRole(userRoleName) {
          return function () {
            var isRole;
            sessionData.userRoleSet.forEach(function (role) {
              if (role === userRoleName) {
                isRole = true;
              }
            });
            return isRole;
          }
        }

        vm.sourcingTypes = {
          MANUFACTURER: 'manufacturer',
          MANUFACTURER_PART: 'manufacturerpart',
          SUPPLIER: 'supplier',
          SUPPLIER_PART: 'supplierpart'
        };

        var controllers = {
          CREATE_PART: 'CreatePartsController',
          CREATE_PRODUCT: 'CreateProductsController',
          CREATE_DOCUMENT: 'CreateDocumentsController',
          CREATE_MANUFACTURER: 'CreateManufacturerController',
          CREATE_MANUFACTURER_PART: 'CreateManufacturerpartController'
        };

        var templatesPaths = {
          CREATE_PART: 'app/main/apps/objects/part/dialogs/create-part-dialog.html',
          CREATE_PRODUCT: 'app/main/apps/objects/products/dialogs/create-product-dialog.html',
          CREATE_DOCUMENT: 'app/main/apps/objects/documents/dialogs/create-document-dialog.html',
          CREATE_MANUFACTURER: 'app/main/apps/objects/sourcing/tabs/manufactures/dialog/create-manufacturer-dialog.html',
          CREATE_MANUFACTURER_PART: 'app/main/apps/objects/sourcing/tabs/manufactureparts/dialog/create-manufacturerparts-dialog.html'
        };

        var controllerSet = {
          CREATE_PART: {controller: controllers.CREATE_PART, template: templatesPaths.CREATE_PART},
          CREATE_PRODUCT: {controller: controllers.CREATE_PRODUCT, template: templatesPaths.CREATE_PRODUCT},
          CREATE_DOCUMENT: {controller: controllers.CREATE_DOCUMENT, template: templatesPaths.CREATE_DOCUMENT},
          CREATE_MANUFACTURER: {
            controller: controllers.CREATE_MANUFACTURER,
            template: templatesPaths.CREATE_MANUFACTURER
          },
          CREATE_MANUFACTURER_PART: {
            controller: controllers.CREATE_MANUFACTURER_PART,
            template: templatesPaths.CREATE_MANUFACTURER_PART
          }
        };


        vm.controllerSet = controllerSet;

        /**
         * Function opens a popup to create a new object in the system
         * @param event - {object} mouse click event
         * @param controller - {object} with properties:
         *  - controller : name of the controller to be used
         *  - template : template for the controller to be used
         * @param options - {object} with properies:
         *  - type : the type of creating sourcing object. can be one of vm.sourcingTypes values
         */
        function createObject(event, controller, options) {
          $mdDialog.show({
            controller: controller.controller,
            controllerAs: 'vm',
            templateUrl: controller.template,
            parent: angular.element($document.find('#content-container')),
            targetEvent: event,
            clickOutsideToClose: true,
            locals: {
              type: options && options.type,
              configure: '',
              object: '',
              sourcingObject: '',
              sourceObject: '',
              advancedNumbering: vm.advancedNumberSettings
            }
          })
        }
      }

      return {
        templateUrl: 'app/core/directives/mf-create-object-shortcut/mf-create-object-shortcut.html',
        restrict: 'E',
        link: link,
        scope: {}
      }
    });
})();
