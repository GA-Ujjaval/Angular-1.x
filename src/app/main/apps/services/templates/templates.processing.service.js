(function () {
  'use strict';

  angular
    .module('app.objects')
    .factory('templatesProcessingService', templatesProcessingService);


  /** @ngInject */
  function templatesProcessingService(AttributesService, attributesUtils, $window, fuseUtils) {


    const service = {
      setAppliedTemplateId: setAppliedTemplateId,
      getAppliedTempalteId: getAppliedTempalteId,
      matchDisplayedAttributes: matchDisplayedAttributes,
      getAllBomAttributes: getAllBomAttributes,
      setBomAttributesToLocalstorage: setBomAttributesToLocalstorage
    };

    /**
     *  Saves the id of applied template for particular table for particular user to localstorage
     * @param pageName - {string}
     * @param templateId - {string}
     */
    function setAppliedTemplateId(pageName, templateId) {
      templateId = templateId || null;
      $window.localStorage.setItem(fuseUtils.buildAttributeName('applied_template', pageName), templateId);
    }

    /**
     *  Returns applied template id for current table for current user from localstorage
     * @param pageName - {string} the name of the page to get data for
     * @returns {string | null}
     */
    function getAppliedTempalteId(pageName) {
      return $window.localStorage.getItem(fuseUtils.buildAttributeName('applied_template', pageName));
    }

    /**
     * Works as procedure, so not returns new object,
     * but changes it's allAttributes parameter!!!
     * @param columnsFromServer - [{}] the array of columns with structure like we have when do gridApi.saveState.save()
     * @param allAttributes - {object} with sections of attributes to match with columnsFromServer
     */
    function matchDisplayedAttributes(columnsFromServer, allAttributes) {
      const sectionKeys = Object.keys(allAttributes);
      _.forEach(columnsFromServer, (column) => {
        _.forEach(sectionKeys, (sectionKey) => {
          const idProp = sectionKey === 'attrAdditionalBOM' ? 'attributeId' : 'value';
          let neededAttribute = _.find(allAttributes[sectionKey], {[idProp]: column.name});
          if (neededAttribute && column.visible) {
            neededAttribute.displayed = true;
          }
        });
      });
    }

    /**
     * Returns the set of all possible BOM attributes
     * @param pageType - {string} the type of the page to get attributes for ('flat' or 'hierarchical')
     * @param dontNeedAdditional - {boolean}
     * @returns
     * {
     *  attrBasicBOM,
     *  attrInventoryBOM,
     *  attrObjectHistoryBOM,
     *  mfrParts,
     *  suppParts,
     *  costAttribute,
     *  attrAdditionalBOM (?)
     * }
     */
    function getAllBomAttributes(pageType, dontNeedAdditional) {

      const sections = {
        attrBasicBOM: attributesUtils.getBOMBasicAttributes(),
        attrInventoryBOM: attributesUtils.getBomInventory(),
        attrObjectHistoryBOM: attributesUtils.getObjectHistoryAttributes(pageType),
        mfrParts: attributesUtils.getManufacturerPartsAttributes(pageType),
        suppParts: attributesUtils.getSupplierPartsAttributes(pageType),
        costAttribute: attributesUtils.getSupplierManufacturerPartsCostAttributes(),
        defaultHierarchical: attributesUtils.getDefaultHierarchicalColumnDefs()
      };
      if (dontNeedAdditional) {
        return sections
      }
      return new Promise(function (resolve, reject) {
        AttributesService.getAttributesList('parts')
          .then(function (res) {
            sections.attrAdditionalBOM = res.data;
            angular.forEach(sections, function (value) {
              value.forEach(function (attribute) {
                attribute.displayed = false;
                if (!attribute.name) {
                  attribute.value = attribute.attribute;
                  attribute.name = attribute.attribute;
                }
              })
            });
            resolve(sections);
          });
      });
    }

    /**
     * Puts passed attributes to localStorage
     * @param sections - {object} sections of attributes
     * @param pageType - {string}
     * @param isConfigEnabled - {boolean}
     */
    function setBomAttributesToLocalstorage(sections, pageType, isConfigEnabled) {
      const attributes = [
        {localStorageName: 'attributesBasicBOM', sectionName: 'attrBasicBOM'},
        {localStorageName: 'attributesInventoryBOM', sectionName: 'attrInventoryBOM'},
        {localStorageName: 'attributesAdditionalBOM', sectionName: 'attrAdditionalBOM'},
        {localStorageName: 'attributesManufacturerBOM', sectionName: 'mfrParts'},
        {localStorageName: 'attributesSupplierBOM', sectionName: 'suppParts'},
        {localStorageName: 'attributesObjectHistoryBOM', sectionName: 'attrObjectHistoryBOM'}
      ];
      attributes.forEach(function (attribute) {
        $window.localStorage.removeItem(fuseUtils.buildAttributeName(attribute.localStorageName, pageType));
      });
      if (!isConfigEnabled) {
        sections.attrBasicBOM = _.filter(sections.attrBasicBOM, function (attribute) {
          return attribute.value !== 'configurationsForDropdown'
        });
      }
      attributes.forEach(function (attribute) {
        $window.localStorage.setItem(fuseUtils.buildAttributeName(attribute.localStorageName, pageType), angular.toJson(sections[attribute.sectionName]));
      });
    }

    return service;

  }
})();
