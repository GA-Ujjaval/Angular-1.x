(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('CreateTemplateController', CreateTemplateController);


  function CreateTemplateController($mdDialog, params, $mdToast, TemplatesService, AuthService, $rootScope, templatesProcessingService) {

    var vm = this;

    vm.closeDialog = closeDialog;
    vm.hideDialog = hideDialog;
    vm.createNewTemplate = createNewTemplate;
    vm.isCA = isCA;
    vm.editTemplate = editTemplate;

    vm.operationType = params.description;
    vm.progress = false;

    vm.operationHandler = {};
    vm.operationHandler.creation = createNewTemplate;

    var parametersSetter = {};
    parametersSetter.creation = setDefaultTemplateParameters;
    parametersSetter.updating = setExistingTemplateParameters;

    /**
     * The object, which will be sent to server as new template's parameters
     * @type {{pageName: {string}, gridState: {object} }}
     */
    vm.newTemplateSettings = {
      pageName: params.pageName,
      gridState: params.gridState,
      designData: {}
    };

    /**
     * the parameters to be ask from user
     * @type {{}}
     */
    vm.parameters = {};
    vm.parameters.templateScope = [
      {text: 'Only me', value: 'local'},
      {text: 'All users', value: 'global'},
      {text: 'All users AND Set as Default', value: 'defaultGlobal'}
    ];
    vm.parameters.templateVisibility = [
      {text: 'View only', value: 'V'},
      {text: 'View + Download + Print', value: 'VDP'}
    ];
    vm.parameters.designData = {};
    vm.parameters.designData.layout = [
      {text: 'Landscape', value: 'landscape'},
      {text: 'Portrait', value: 'portrait'}
    ];
    vm.parameters.designData.paperSize = [
      {text: 'A4', value: 'A4'},
      {text: 'A3', value: 'A3'},
      {text: 'A2', value: 'A2'},
      {text: 'A1', value: 'A1'}
    ];


    setTemplateParameters();

    function setTemplateParameters() {
      parametersSetter[params.description]();
    }

    function setDefaultTemplateParameters() {
      vm.newTemplateSettings.visibility = vm.parameters.templateVisibility[0].value;
      vm.newTemplateSettings.isShared = vm.parameters.templateScope[0].value;
      vm.newTemplateSettings.designData.paperSize = vm.parameters.designData.paperSize[0].value;
      vm.newTemplateSettings.designData.layout = vm.parameters.designData.layout[0].value;
    }

    function setExistingTemplateParameters() {
      TemplatesService.getTemplateById(params.templateId)
        .then(function (res) {
          handleResCode(res);
          if (res.code !== 0) {
            return
          }

          var template = res.data;

          vm.newTemplateSettings.visibility = template.visibility === 'V' ? vm.parameters.templateVisibility[0].value : vm.parameters.templateVisibility[1].value;
          if (template.sharedWithUsers && template.default) {
            vm.newTemplateSettings.isShared = vm.parameters.templateScope[2].value
          } else if (template.sharedWithUsers) {
            vm.newTemplateSettings.isShared = vm.parameters.templateScope[1].value
          } else {
            vm.newTemplateSettings.isShared = vm.parameters.templateScope[0].value
          }

          vm.newTemplateSettings.visibility = template.visibility;
          vm.newTemplateSettings.name = template.templateName;

          if (template.designData) {
            vm.newTemplateSettings.designData.paperSize = template.designData.paperSize;
            vm.newTemplateSettings.designData.layout = template.designData.layout;
          } else {
            vm.newTemplateSettings.designData.paperSize = vm.parameters.designData.paperSize[0].value;
            vm.newTemplateSettings.designData.layout = vm.parameters.designData.layout[0].value;
          }

        })
    }

    function createNewTemplate() {
      vm.newTemplateSettings.default = vm.newTemplateSettings.isShared === 'defaultGlobal';
      vm.newTemplateSettings.isShared = vm.newTemplateSettings.isShared !== 'local';
      vm.newTemplateSettings.templateId = params.templateId;
      TemplatesService.createNewTemplate(vm.newTemplateSettings)
        .then(function (res) {
          handleResCode(res);
          if (res.code === 0) {
            hideDialog();
            templatesProcessingService.setAppliedTemplateId(params.pageName, res.data.templateId);
            $mdToast.show($mdToast.simple().textContent('Template is successfully created').position('top right'));
          } else {
            closeDialog();
          }
        }, function () {
        });
    }

    function editTemplate() {
      vm.newTemplateSettings.default = vm.newTemplateSettings.isShared === 'defaultGlobal';
      vm.newTemplateSettings.isShared = vm.newTemplateSettings.isShared !== 'local';
      vm.newTemplateSettings.templateId = params.templateId;
      TemplatesService.updateTemplate(vm.newTemplateSettings)
        .then(function (res) {
          handleResCode(res);
          if (res.code === 0) {
            hideDialog();
            $mdToast.show($mdToast.simple().textContent('Template is successfully edited').position('top right'));
          } else {
            closeDialog();
          }
        }, function () {
        });
    }

    function closeDialog() {
      $mdDialog.cancel();
    }

    function hideDialog() {
      $mdDialog.hide();
    }

    function handleResCode(res) {
      if (res.code === 4266) {
        $mdToast.show(
          $mdToast
            .simple()
            .textContent(res.message || res.data)
            .action('x')
            .toastClass("md-error-toast-theme")
            .position('top right')
            .hideDelay(0));
      } else if (res.code !== 0) {
        $mdToast.show($mdToast.simple().textContent(res.message || res.data).position('top right'));
      } else {
        return;
      }
    }

    function isCA() {
      var sessionData = AuthService.getSessionData('customerData');
      var isCa = false;
      sessionData.userRoleSet &&
      sessionData.userRoleSet.forEach(function (role) {
        if (role === 'customer_admin') {
          isCa = true;
        }
      });
      return isCa;
    }

  }
})();
