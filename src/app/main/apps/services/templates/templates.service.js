(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('TemplatesService', TemplatesService);


  /** @ngInject */
  function TemplatesService(CustomerService, hostUrlDevelopment, AuthService, defaultTemplateService, $q, features) {

    var templatesCache = {};

    /**
     * Returns all available templates for the current user
     * @returns {[{},{}]} an array of templates
     */
    function getTemplates(pageName) {
      if (templatesCache[pageName]) {
        return Promise.resolve(angular.copy(templatesCache[pageName]));
      }
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.getfusetemplates,
        {tabName: pageName, type: features.tableTemplate}, '')
        .then((res) => {
          if (res.code === 0) {
            templatesCache[pageName] = res;
          }
          return angular.copy(res);
        }, (res) => $q.reject(res));
    }

    /**
     *
     * @param template {object} with properties
     * - templateName. Possible names: 'hierarchical', 'flat'
     * - sharedWithUsers
     * - templateData
     * - visibility
     * @returns {*}
     */
    function createNewTemplate(template) {
      const data = {
        templateId: null,
        tabName: template.pageName,
        templateData: template.gridState,
        templateName: template.name,
        sharedWithUsers: template.isShared,
        visibility: template.visibility,
        default: template.default,
        designData: template.designData
      };

      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.createtemplate, {type: features.tableTemplate},
        data)
        .then((res) => {
          if (res.code === 0) {
            invalidateCache(template.pageName);
          }
          if (res.code === 0 && template.default) {
            defaultTemplateService.setDefaultTemplateToLocalStorage(template.pageName, res);
          }
          return res;
        })
    }

    function updateTemplate(template) {
      const data = {
        templateId: template.templateId,
        tabName: template.pageName,
        templateData: template.gridState,
        templateName: template.name,
        sharedWithUsers: template.isShared,
        visibility: template.visibility,
        default: template.default,
        designData: template.designData
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.updatetemplate, {type: features.tableTemplate}, data)
        .then((res) => {
          if (res.code === 0) {
            invalidateCache(template.pageName);
          }
          if (res.code === 0 && template.default) {
            defaultTemplateService.setDefaultTemplateToLocalStorage(template.pageName, res);
          }
          return res;
        })
    }

    /**
     * Create a function which use different urls to get data using 'templateId' and 'tabName'
     * @param url {string} - the url, which should be used to send requests
     * @returns {function(*=, *=): *}
     */
    function newPostRequest(url) {
      return (templateId) => {
        return CustomerService.addNewMember('POST', hostUrlDevelopment.test[url],
          {templateId: templateId || null, type: features.tableTemplate}, '');
      }
    }

    /**
     * Returns the template by its ID
     * @type {function(*=, *=): *}
     */
    const getTemplateById = newPostRequest('getfusetemplatebyid');
    /**
     * Removes the template by its ID
     * @type {function(*=, *=): *}
     */
    const removeTemplateById = newPostRequest('removefusetemplatebyid');

    function removeTemplate(templateId, pageType) {
      return removeTemplateById(templateId)
        .then((res) => {
          if (res.code === 0) {
            invalidateCache(pageType);
          }
          return res;
        })
    }

    /**
     * @param options - {object} with properties:
     *    templateId - {string} the id of template to be used to generate a report
     *    objectId - {string} the id of the object, whose bom we want to download
     *    type - {string} the type of report needed, e.x. 'pdf'
     *    targetQuantity - {number} target quantity for calculating flat view
     *    userActionStory - [{}{}{}] stack of user actions in the table
     * @returns {*}
     */
    function generateReport(options) {
      const params = {
        templateId: options.templateId || null,
        objectId: options.objectId || null,
        type: options.type || 'pdf',
        targetQty: options.targetQuantity
      };
      const data = {
        userActionStory: options.userActionStory,
        expandedRows: options.expandedRows
      };
      return CustomerService.addNewMember('POST', hostUrlDevelopment.test.generatereport, params, data, null, 'arraybuffer')
    }

    function invalidateCache(pageType) {
      if (pageType) {
        templatesCache[pageType] = null;
      } else {
        templatesCache = {};
      }
    }

    return {
      getTemplates: getTemplates,
      createNewTemplate: createNewTemplate,
      getTemplateById: getTemplateById,
      removeTemplate: removeTemplate,
      updateTemplate: updateTemplate,
      generateReport: generateReport,
      invalidateCache: invalidateCache
    }
  }
})();
