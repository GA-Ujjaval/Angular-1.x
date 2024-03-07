(function () {
  'use strict';

  angular
    .module('app.objects')
    .controller('EditTableController', EditTableController);

  /** @ngInject */
  function EditTableController($state, objectPageEnum, pageType, whereIsRevisionFrom, $mdDialog, hostUrlDevelopment, params,
                               CustomerService, errors, $mdToast, AuthService, fuseUtils, attributesUtils, MainTablesService,
                               AttributesService, $stateParams) {

    var attributesBasic,
      attributesManufacturer,
      attributesSupplier,
      attributesAdditional,
      attributesInventory,
      attributesContacts,
      attributesCost,
      attributesObjectHistory;

    var vm = this;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');
    vm.objectPageEnum = objectPageEnum;
    vm.pageType = pageType;
    vm.whereIsRevisionFrom = whereIsRevisionFrom;

    if (isSourcingObjectPage() && isManufacturerType()) {
      vm.basicInfo = attributesUtils.getManufacturerBasicAttributes();
    } else if (isSourcingPartsPage() && isManufacturerType()) {
      vm.basicInfo = attributesUtils.getManufacturerPartsBasicAttributes();
    } else if (isSourcingObjectPage() && isSupplierType()) {
      vm.basicInfo = attributesUtils.getSupplierBasicAttributes();
    } else if (isSourcingPartsPage() && isSupplierType()) {
      vm.basicInfo = attributesUtils.getSupplierPartsBasicAttributes();
    } else if (isWhereUsedPage()) {
      vm.basicInfo = attributesUtils.getWhereUsedBasicAttributes();
    } else if (isCompareHierarchical()) {
      vm.basicInfo = attributesUtils.getBOMBasicAttributes();
    }
    if (isRevisionsPage()) {
      vm.basicInfo = attributesUtils.getRevisionBasicAttributes();
    } else {
      vm.basicInfo = [
        {name: 'Sl.No', value: 'parentIndex', displayed: false, objectList: true},
        {name: 'Part Number', value: 'objectNumber', displayed: true, basicAttribute: true},
        {name: 'Revision', value: 'revision', displayed: true, basicAttribute: true},
        {name: 'Status', value: 'status', displayed: true, basicAttribute: true},
        {name: 'Category', value: 'categoryName', displayed: true, basicAttribute: true},
        {name: 'Part Name', value: 'objectName', displayed: true, basicAttribute: true},
        {name: 'Description', value: 'description', displayed: true, basicAttribute: true, bom: true},
        {name: 'Unit of Measure', value: 'uom', displayed: true, basicAttribute: true},
        {name: 'Procurement Type', value: 'procurementType', displayed: false},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Notes', value: 'notes', displayed: false},
        {name: 'Quantity', value: 'quantity', displayed: false},
        {name: 'Ref. Des.', value: 'refDocs', displayed: false},
        {name: 'Cost', value: 'fuseCost', displayed: true, basicAttribute: true},
        {name: 'Cost Type', value: 'costType', displayed: false},
        {name: 'BOM', value: 'hasBOM', displayed: false}
      ];
    }

    if (isCompareHierarchical()) {
      vm.basicInfo = _.map(vm.basicInfo, function (attr) {
        attr.displayed = (attr.name == 'Part Number' ||
          attr.name == 'Revision' ||
          attr.name == 'Quantity' ||
          attr.name == 'Ref. Des.' ||
          attr.name == 'BOM');
        return attr;
      });
    }

    vm.basicInfoBOM = attributesUtils.getBOMBasicAttributes();

    vm.inventory = [
      {
        name: 'Quantity On Hand',
        value: 'qtyOnHand',
        displayed: false,
        defaultValue: '',
        tooltipDirection: "top",
        tooltipText: "Usable Quantity of objects available (obtained from Object's Inventory section)",
        bom: true,
        objectList: true,
        basicAttribute: true
      },
      {
        name: 'Quantity On Order',
        value: 'qtyOnOrder',
        displayed: false,
        defaultValue: '',
        tooltipDirection: "top",
        tooltipText: "Quantity of objects on order (obtained from Object's Inventory section)",
        basicAttribute: true
      },
      {
        name: 'Total Available Quantity',
        value: 'qtyTotal',
        displayed: false,
        defaultValue: 0,
        tooltipDirection: "top",
        tooltipText: "'Quantity on Hand' + 'Quantity on Order' (0, when not available OR when both quantities are non numeric characters)",
        basicAttribute: true
      }
    ];

    if (pageType === objectPageEnum.flatPage) {
      vm.inventory = _.map(vm.inventory, function (attr) {
        attr.displayed = true;
        return attr;
      });
    }

    vm.mfrParts = attributesUtils.getManufacturerPartsAttributes(pageType);

    vm.suppParts = attributesUtils.getSupplierPartsAttributes(pageType);

    vm.contacts = [
      {name: 'Name', value: 'contactsName', displayed: false},
      {name: 'Title', value: 'contactsTitle', displayed: false},
      {name: 'Email', value: 'contactsEmail', displayed: false},
      {name: 'Contact Phone Number', value: 'contactsNumber', displayed: false},
      {name: 'Contact Address', value: 'contactsAddress', displayed: false}
    ];

    vm.cost = attributesUtils.getSupplierManufacturerPartsCostAttributes();

    vm.objectHistory = attributesUtils.getObjectHistoryAttributes(pageType);

    //Methods
    vm.closeDialog = closeDialog;
    vm.applyChanges = applyChanges;
    vm.setAllAttributesSelections = setAllAttributesSelections;
    vm.isBillOfMaterialPage = isBillOfMaterialPage;
    vm.filerAdditionalAttributes = filerAdditionalAttributes;
    vm.isRevisionsPage = isRevisionsPage;
    vm.isSourcingPage = isSourcingPage;
    vm.isSourcingPartsPage = isSourcingPartsPage;
    vm.isSourcingObjectPage = isSourcingObjectPage;
    vm.showHideAttributes = showHideAttributes;
    vm.showInventoryAttr = showInventoryAttr;
    vm.showManufacturerAttr = showManufacturerAttr;

    function showHideAttributes(item) {

      if (vm.isBillOfMaterialPage()) {
        return false;
      }

      if (item.basicAttribute) {

        if (vm.pageType === vm.objectPageEnum.documentsPage && item.removeFromDocSection === true) {
          return false;
        } else {
          if (vm.pageType === vm.objectPageEnum.documentsSearchPage && item.removeFromDocSection === true) {
            return false;
          }
          return true;
        }
      } else {
        return false;
      }
    }

    function isSourcingPage() {
      return ((objectPageEnum.manufacturerPage === pageType)
        || (objectPageEnum.supplierPage === pageType)
        || (objectPageEnum.supplierPartsPage === pageType)
        || (objectPageEnum.mfrPartsManufacturePage === pageType)
        || (objectPageEnum.suppPartsSupplierPage === pageType)
        || (objectPageEnum.mfrPartsSupplierPage === pageType)
        || (objectPageEnum.suppPartsManufacturerPage === pageType)
        || (objectPageEnum.searchMfrPage === pageType)
        || (objectPageEnum.searchSuppPage === pageType)
        || (objectPageEnum.searchMfrPartsPage === pageType)
        || (objectPageEnum.searchSuppPartsPage === pageType)
        || (objectPageEnum.manufacturerPartsPage === pageType));
    }

    function isSourcingPartsPage() {
      return ((objectPageEnum.supplierPartsPage === pageType)
        || (objectPageEnum.mfrPartsManufacturePage === pageType)
        || (objectPageEnum.suppPartsSupplierPage === pageType)
        || (objectPageEnum.suppPartsManufacturerPage === pageType)
        || (objectPageEnum.mfrPartsSupplierPage === pageType)
        || (objectPageEnum.searchMfrPartsPage === pageType)
        || (objectPageEnum.searchSuppPartsPage === pageType)
        || (objectPageEnum.manufacturerPartsPage === pageType));
    }

    function isSourcingObjectPage() {
      return ((objectPageEnum.manufacturerPage === pageType)
        || (objectPageEnum.supplierPage === pageType)
        || (objectPageEnum.searchMfrPage === pageType)
        || (objectPageEnum.searchSuppPage === pageType));
    }

    function isManufacturerType() {
      return ((objectPageEnum.manufacturerPage === pageType)
        || (objectPageEnum.mfrPartsManufacturePage === pageType)
        || (objectPageEnum.mfrPartsSupplierPage === pageType)
        || (objectPageEnum.searchMfrPage === pageType)
        || (objectPageEnum.searchMfrPartsPage === pageType)
        || (objectPageEnum.manufacturerPartsPage === pageType));
    }

    function isSupplierType() {
      return ((objectPageEnum.supplierPage === pageType)
        || (objectPageEnum.supplierPartsPage === pageType)
        || (objectPageEnum.suppPartsManufacturerPage === pageType)
        || (objectPageEnum.searchSuppPage === pageType)
        || (objectPageEnum.searchSuppPartsPage === pageType)
        || (objectPageEnum.suppPartsSupplierPage === pageType));
    }

    function isWhereUsedPage() {
      return ((objectPageEnum.whereUsedPage === pageType)
        || (objectPageEnum.whereUsedMfrPage === pageType)
        || (objectPageEnum.whereUsedSuppPage === pageType));
    }

    function isRevisionsPage() {
      return ((objectPageEnum.revisionProductPage === pageType)
        || (objectPageEnum.revisionDocumentPage === pageType)
        || (objectPageEnum.revisionPartPage === pageType));
    }

    function isCompareHierarchical() {
      return (objectPageEnum.hierarchicalCompare === pageType);
    }

    function isBillOfMaterialPage() {
      return ((objectPageEnum.sourcingPage === pageType)
        || (objectPageEnum.flatPage === pageType)
        || (objectPageEnum.heirarchicalPage === pageType));
    }

    /**
     * @returns {string, null} which means the parameter for getattributeslist request
     */
    function getAttributesType() {
      var partType = $stateParams.id ? $stateParams.id.split('-')[0] : null;
      var parts = 'parts';
      var products = 'products';
      var documents = 'documents';
      var boards = 'boards';
      var sourcing = 'sourcing';
      var sourcingObject = 'sourcingObject';

      if (pageType === objectPageEnum.partsPage || pageType === objectPageEnum.partsSearchPage) {
        return parts;            // for parts page. both in search and left navigation bar
      } else if (pageType === objectPageEnum.productsPage || pageType === objectPageEnum.productsSearchPage) {
        return products;         // for products page. both in search and left navigation bar
      } else if (pageType === objectPageEnum.documentsPage || pageType === objectPageEnum.documentsSearchPage) {
        return documents;        // for documents page. both in search and left navigation bar
      } else if (pageType === objectPageEnum.heirarchicalPage || pageType === objectPageEnum.flatPage) {
        return parts;            // for bom tab
      } else if (isRevisionsPage() || pageType === objectPageEnum.configurationPage) {
        return partType          // for revisions and configurations tabs
      } else if (pageType === objectPageEnum.searchMfrPage || pageType === objectPageEnum.manufacturerPage
        || pageType === objectPageEnum.supplierPage || pageType === objectPageEnum.searchSuppPage) {
        return sourcing;         // for manufactures and suppliers
      } else if (pageType === objectPageEnum.searchMfrPartsPage || pageType === objectPageEnum.manufacturerPartsPage
        || pageType === objectPageEnum.supplierPartsPage || pageType === objectPageEnum.searchSuppPartsPage
        || pageType === objectPageEnum.suppPartsManufacturerPage || pageType === objectPageEnum.mfrPartsSupplierPage) {
        return sourcingObject;  //for manufacture parts and supplier parts
      } else {
        return null;            //where-used page
      }
    }

    function getAttributesList(attrType) {
      vm.progressAttr = true;

      AttributesService.getAttributesList(attrType)
        .then(function (response) {
          switch (response.code) {
            case 0:
              var allAttributes = response.data;
              var allAdditionalInfo = allAttributes.map(function (attr) {
                attr.name = attr.attribute;
                attr.displayed = false;
                return attr;
              });
              if (isWhereUsedPage() || isBillOfMaterialPage() || isCompareHierarchical()) {
                vm.currentObjectType = null;
              } else if (isRevisionsPage()) {
                vm.currentObjectType = whereIsRevisionFrom;
              } else if (pageType === objectPageEnum.partsPage || pageType === objectPageEnum.partsSearchPage) {
                vm.currentObjectType = 'parts';
              } else if (pageType === objectPageEnum.documentsPage) {
                vm.currentObjectType = 'documents';
              } else if (isSourcingPartsPage()) {
                if (isManufacturerType()) {
                  vm.sourceType = 'manufacturerpart';
                } else if (isSupplierType()) {
                  vm.sourceType = 'supplierpart';
                }
                vm.currentObjectType = 'sourcingObject';
              } else if (isSourcingPage() && !isSourcingPartsPage()) {
                if (isManufacturerType()) {
                  vm.sourceType = 'manufacturer';
                } else if (isSupplierType()) {
                  vm.sourceType = 'supplier';
                }
                vm.currentObjectType = 'sourcing';
              } else {
                vm.currentObjectType = 'products';
              }

              vm.additionalInfo = allAdditionalInfo;

              if (attributesAdditional && attributesAdditional != 'undefined') {
                attributesAdditional = angular.fromJson(attributesAdditional);
                if (attributesAdditional && attributesAdditional.length && attributesAdditional[0] && attributesAdditional[0].name) {

                  var attr = _.remove(attributesAdditional, function (value) {
                    if (_.find(allAdditionalInfo, function (val) {
                      return value.attribute == val.attribute
                    }) != undefined) {
                      return value;
                    }
                  });

                  _.remove(allAdditionalInfo, function (value) {
                    if (_.find(attr, function (val) {
                      return value.attribute == val.attribute
                    }) != undefined) {
                      return value;
                    }
                  });
                  vm.additionalInfo = _.unionBy(allAdditionalInfo, attr, 'attribute');
                }
              }

              vm.progressAttr = false;
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          console.log(vm.error.erCatch);
        });
    }

    function applyChanges() {
      if (isBillOfMaterialPage()) {
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasicBOM", pageType), angular.toJson(vm.basicInfoBOM));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventoryBOM", pageType), angular.toJson(vm.inventory));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesAdditionalBOM", pageType), angular.toJson(vm.additionalInfo));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesManufacturerBOM", pageType), angular.toJson(vm.mfrParts));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesSupplierBOM", pageType), angular.toJson(vm.suppParts));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesObjectHistoryBOM", pageType), angular.toJson(vm.objectHistory));
      } else if (isSourcingPage()) {
        if (isSourcingObjectPage()) {
          localStorage.setItem(fuseUtils.buildAttributeName("attributesContacts", pageType), angular.toJson(vm.contacts || []));
        } else {
          localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", pageType), angular.toJson(vm.inventory || []));
          localStorage.setItem(fuseUtils.buildAttributeName("attributesCost", pageType), angular.toJson(vm.cost || []));
        }
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", pageType), angular.toJson(vm.basicInfo || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesAdditional", pageType), angular.toJson(vm.additionalInfo || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesObjectHistory", pageType), angular.toJson(vm.objectHistory || []));
      } else {
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", pageType), angular.toJson(vm.basicInfo || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", pageType), angular.toJson(vm.inventory || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesAdditional", pageType), angular.toJson(vm.additionalInfo || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesManufacturer", pageType), angular.toJson(vm.mfrParts || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesSupplier", pageType), angular.toJson(vm.suppParts || []));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesObjectHistory", pageType), angular.toJson(vm.objectHistory || []));
      }
      $mdDialog.hide();
    }

    function setAllAttributesSelections(value) {
      if (isBillOfMaterialPage()) {
        vm.basicInfoBOM.forEach(function (attr) {
          attr.displayed = value;
        });
      } else {
        vm.basicInfo.forEach(function (attr) {
          attr.displayed = value;
        });
        vm.contacts.forEach(function (attr) {
          attr.displayed = value;
        });
        vm.cost.forEach(function (attr) {
          attr.displayed = value;
        });
      }
      if (vm.additionalInfo) {
        vm.additionalInfo.forEach(function (attr) {
          if (!vm.currentObjectType || (vm.currentObjectType && vm.currentObjectType == attr.objectType)) {
            attr.displayed = value;
          }
        });
      }
      vm.inventory.forEach(function (attr) {
        attr.displayed = value;
      });
      vm.mfrParts.forEach(function (attr) {
        attr.displayed = value;
      });
      vm.suppParts.forEach(function (attr) {
        attr.displayed = value;
      });
      vm.objectHistory.forEach(function (attr) {
        attr.displayed = value;
      });
    }

    function closeDialog() {
      $mdDialog.cancel();
    }

    function initializeModalDialog() {

      attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", pageType));
      attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", pageType));
      attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", pageType));
      attributesContacts = localStorage.getItem(fuseUtils.buildAttributeName("attributesContacts", pageType));
      attributesCost = localStorage.getItem(fuseUtils.buildAttributeName("attributesCost", pageType));
      attributesManufacturer = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturer", pageType));
      attributesSupplier = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplier", pageType));
      attributesObjectHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", pageType));

      if (isBillOfMaterialPage()) {
        initBOM();
      } else if (isSourcingPage()) {
        initSourcing();
      } else if (isWhereUsedPage()) {
        initWhereUsed();
      } else if (isRevisionsPage() || pageType === objectPageEnum.configurationPage) {
        initRevision();
      } else {
        initOther();
      }

      getAttributesList(getAttributesType());
    }

    function initBOM() {
      attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasicBOM", pageType));
      attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventoryBOM", pageType));
      attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditionalBOM", pageType));
      attributesManufacturer = localStorage.getItem(fuseUtils.buildAttributeName("attributesManufacturerBOM", pageType));
      attributesSupplier = localStorage.getItem(fuseUtils.buildAttributeName("attributesSupplierBOM", pageType));
      attributesObjectHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistoryBOM", pageType));

      if (attributesBasic && attributesBasic != 'undefined') {
        attributesBasic = angular.fromJson(attributesBasic);
        if (attributesBasic && attributesBasic.length && attributesBasic[0] && attributesBasic[0].name && _.find(attributesBasic, {value: 'hasAttachments'})) {

          var basicInfoBOM = params.isConfigEnabled ? attributesBasic : _.filter(attributesBasic, function (col) {
            return col.value !== 'configurationsForDropdown'
          });
          basicInfoBOM = pageType !== objectPageEnum.heirarchicalPage ? _.filter(basicInfoBOM, function (col) {
            return col.value !== 'level'
          }) : basicInfoBOM;
          vm.basicInfoBOM = basicInfoBOM;
        }
      }

      if (initAttributes(attributesInventory)) {
        vm.inventory = initAttributes(attributesInventory);
      }

      if (initAttributes(attributesInventory)) {
        vm.inventory = initAttributes(attributesInventory);
      }

      if (initAttributes(attributesManufacturer)) {
        vm.mfrParts = initAttributes(attributesManufacturer);
        if (!_.find(vm.mfrParts, {value: "mfrNotes"})) {
          vm.mfrParts = attributesUtils.getManufacturerPartsAttributes(pageType);
        }
      }

      if (initAttributes(attributesSupplier)) {
        vm.suppParts = initAttributes(attributesSupplier);
        if (!_.find(vm.suppParts, {value: "suppNotes"})) {
          vm.suppParts = attributesUtils.getSupplierPartsAttributes(pageType);
        }
      }

      if (initAttributes(attributesObjectHistory)) vm.objectHistory = initAttributes(attributesObjectHistory);

    }

    function initSourcing() {
      if (initAttributes(attributesBasic) && (_.find(initAttributes(attributesBasic), {name: 'Packaging'}) || isSourcingObjectPage())
        && (_.find(initAttributes(attributesBasic), {name: 'Website'}) || isSourcingPartsPage())) {
        vm.basicInfo = initAttributes(attributesBasic);
      } else {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", pageType));
      }
      if (initAttributes(attributesContacts) && angular.fromJson(attributesContacts)[0].value == 'contactsName') {
        vm.contacts = initAttributes(attributesContacts);
      } else {
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesContacts", pageType));
      }
      if (initAttributes(attributesCost)) vm.cost = initAttributes(attributesCost);
      if (initAttributes(attributesInventory)) vm.inventory = initAttributes(attributesInventory);
      if (initAttributes(attributesObjectHistory)) vm.objectHistory = initAttributes(attributesObjectHistory);
    }

    function initWhereUsed() {
      if (initAttributes(attributesBasic)) {
        vm.basicInfo = initAttributes(attributesBasic);
        vm.basicInfo = (params.isConfigEnabled) ? vm.basicInfo : _.filter(vm.basicInfo, function (col) {
          return col.name !== 'Configuration'
        });
      }
      if (initAttributes(attributesInventory)) vm.inventory = initAttributes(attributesInventory);
      if (initAttributes(attributesManufacturer)) vm.mfrParts = initAttributes(attributesManufacturer);
      if (initAttributes(attributesSupplier)) vm.suppParts = initAttributes(attributesSupplier);
    }

    function initAttributes(attr) {
      if (attr && attr != 'undefined') {
        attr = angular.fromJson(attr);
        if (attr && attr.length && attr[0] && attr[0].name) {
          return attr;
        }
      }
    }

    function initOther() {
      if (attributesBasic && attributesBasic != 'undefined' &&
        (_.find(angular.fromJson(attributesBasic), {value: 'hasBOM'}) != undefined) || pageType === objectPageEnum.documentsPage || pageType === objectPageEnum.documentsSearchPage) {
        attributesBasic = angular.fromJson(attributesBasic);
        if (attributesBasic && attributesBasic.length && attributesBasic[0] && attributesBasic[0].name) {
          vm.basicInfo = (params.isConfigEnabled) ? attributesBasic : _.filter(attributesBasic, function (col) {
            return col.value !== 'configurationsForDropdown'
          });
        }
      }

      if (attributesInventory && attributesInventory != 'undefined') {
        attributesInventory = angular.fromJson(attributesInventory);
        if (attributesInventory && attributesInventory.length && attributesInventory[0] && attributesInventory[0].name
          && attributesInventory[0].objectList === true) {
          vm.inventory = attributesInventory;
        } else {
          localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventory", pageType));
          attributesInventory = vm.inventory;
          localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", pageType), angular.toJson(attributesInventory));
        }
      }

      if (initAttributes(attributesManufacturer)) {
        vm.mfrParts = initAttributes(attributesManufacturer);
        if (!_.find(vm.mfrParts, {value: 'mfrIsApproved'}) ||
          (!_.find(vm.mfrParts, {value: "mfrNotes"}) && (pageType === objectPageEnum.partsSearchPage || pageType === objectPageEnum.productsSearchPage))) {

          vm.mfrParts = attributesUtils.getManufacturerPartsAttributes(pageType);
        }
      }

      if (initAttributes(attributesSupplier)) {
        vm.suppParts = initAttributes(attributesSupplier);
        if (!_.find(vm.suppParts, {value: 'suppIsApproved'}) ||
          (!_.find(vm.suppParts, {value: "suppNotes"}) && (pageType === objectPageEnum.partsSearchPage || pageType === objectPageEnum.productsSearchPage))) {

          vm.suppParts = attributesUtils.getSupplierPartsAttributes(pageType);
        }
      }

      if (initAttributes(attributesObjectHistory)) vm.objectHistory = initAttributes(attributesObjectHistory);
    }

    function initRevision() {
      attributesBasic = angular.fromJson(attributesBasic);
      if (attributesBasic && attributesBasic.length && attributesBasic[0] && attributesBasic[0].name) {
        vm.basicInfo = (params.isConfigEnabled) ? attributesBasic : _.filter(attributesBasic, function (col) {
          return col.value !== 'configurationsForDropdown'
        });
      }
      if (initAttributes(attributesInventory)) vm.inventory = initAttributes(attributesInventory);
      if (initAttributes(attributesManufacturer)) vm.mfrParts = initAttributes(attributesManufacturer);
      if (initAttributes(attributesSupplier)) vm.suppParts = initAttributes(attributesSupplier);
      if (initAttributes(attributesObjectHistory)) vm.objectHistory = initAttributes(attributesObjectHistory);
    }

    initializeModalDialog();

    function showInventoryAttr() {
      return ((vm.pageType != vm.objectPageEnum.documentsPage)
        && (vm.pageType != vm.objectPageEnum.documentsSearchPage)
        && !vm.isSourcingObjectPage()
        && (vm.whereIsRevisionFrom !== 'documents'));
    }

    function showManufacturerAttr() {
      return ((vm.pageType != vm.objectPageEnum.documentsPage)
        && (vm.pageType != vm.objectPageEnum.documentsSearchPage)
        && !vm.isSourcingPage()
        && (vm.whereIsRevisionFrom !== 'documents'));
    }

    function filerAdditionalAttributes(attr) {
      if (!vm.currentObjectType && attr.attributeType != 'Richtext' && attr.attributeType != 'richText') {
        return true;
      }
      if (vm.sourceType && attr.sourceTypeList && attr.sourceTypeList.length && attr.attributeType != 'Richtext'
        && attr.attributeType != 'richText') {
        if (_.find(attr.sourceTypeList, function (val) {
          return val == vm.sourceType;
        }) != undefined) {
          return (vm.currentObjectType == attr.objectType)
        } else {
          return (vm.currentObjectType == attr.objectType && attr.isAllCategory == 'true');
        }
      }
      return (vm.currentObjectType == attr.objectType && attr.attributeType != 'Richtext'
        && attr.attributeType != 'richText')
    }
  }
})();
