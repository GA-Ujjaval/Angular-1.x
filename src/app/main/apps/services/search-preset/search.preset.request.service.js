(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('searchPresetRequestService', searchPresetRequestService);

  function searchPresetRequestService(fuseUtils, hostUrlDevelopment, CustomerService, $q, features, searchPresetService,
                                      $mdDialog) {


    const service = {
      createSearchPreset,
      getSearchPresetsList,
      deleteSearchPreset,
      updateSearchPreset,
      getDefaultSearchPreset
    };

    function getDefaultSearchPreset({objectType, tabName}) {
      const params = {
        type: features.searchPreset,
        objectType,
        tabName: tabName
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.getdefaulttemplate, params)
        .then(function (res) {
          if (res.code === 0) {
            searchPresetService.processNewDefaultPreset(tabName, res.data);
            return res.data
          } else {
            return $q.reject(res.message);
          }
        });
    }

    function createSearchPreset({name, objectType, presetData, isDefault, tabName, isShared} = {}) {
      const body = {
        templateName: name,
        templateId: null,
        type: features.searchPreset,
        objectType,
        tabName: tabName,
        templateData: {
          searchPreset: presetData
        },
        isDefault,
        sharedWithUsers: isShared
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.createtemplate, '', body)
        .then(function (res) {
          if (res.code === 0) {
            return res.data
          } else {
            return $q.reject(res.message);
          }
        });
    }

    function getSearchPresetsList(objectType, tabName) {
      const params = {
        tabName,
        objectType,
        type: features.searchPreset,
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.getfusetemplates, params, '')
        .then(function (res) {
          if (res.code === 0) {
            return res.data;
          } else {
            return $q.reject();
          }
        });
    }

    function deleteSearchPreset(templateId) {
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.removefusetemplatebyid, {templateId})
    }

    function updateSearchPreset(preset, tabName, objectType) {
      const data = {
        templateId: preset.templateId,
        tabName: tabName,
        templateData: preset.gridState,
        templateName: preset.name,
        sharedWithUsers: preset.isShared,
        visibility: preset.visibility,
        default: preset.isDefault,
        designData: preset.designData,
        type: features.searchPreset,
        objectType: objectType,
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.updatetemplate, '', data)
        .then((res) => {
          if (res.code === 0) {
            return res.data;
          }
          return $q.reject(res.message);
        })
    }

    return service;
  }
})();
