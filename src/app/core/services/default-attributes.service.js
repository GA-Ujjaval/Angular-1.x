(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('attributesUtils', attributesUtils);

  /** @ngInject */
  function attributesUtils(objectPageEnum) {


    var service = {
      getBasicProductPageAttributes: getBasicProductPageAttributes,
      getEditColumn: getEditColumn,
      getBasicPartsPageAttributes: getBasicPartsPageAttributes,
      getBasicDocumentsPageAttributes: getBasicDocumentsPageAttributes,
      getBasicSourcingManufacturerPageAttributes: getBasicSourcingManufacturerPageAttributes,
      getBasicSourcingSupplierPageAttributes: getBasicSourcingSupplierPageAttributes,
      getManufacturerBasicAttributes: getManufacturerBasicAttributes,
      getSupplierBasicAttributes: getSupplierBasicAttributes,
      getManufacturerPartsBasicAttributes: getManufacturerPartsBasicAttributes,
      getSupplierPartsBasicAttributes: getSupplierPartsBasicAttributes,
      getSupplierManufacturerPartsCostAttributes: getSupplierManufacturerPartsCostAttributes,
      getDefaultGridOptionsSourcing: getDefaultGridOptionsSourcing,
      getWhereUsedBasicAttributes: getWhereUsedBasicAttributes,
      getManufacturerPartsAttributes: getManufacturerPartsAttributes,
      getSupplierPartsAttributes: getSupplierPartsAttributes,
      getBOMBasicAttributes: getBOMBasicAttributes,
      getDefaultPartAndProductsAttributes: getDefaultPartAndProductsAttributes,
      getDefaultDocumentsAttributes: getDefaultDocumentsAttributes,
      getDefaultPartsProductsInventoryAttributes: getDefaultPartsProductsInventoryAttributes,
      getObjectHistoryAttributes: getObjectHistoryAttributes,
      getRevisionBasicAttributes: getRevisionBasicAttributes,
      getConfigurationBasicAttributes: getConfigurationBasicAttributes,
      getClipboardAttributes: getClipboardAttributes,
      getBomClipboardAttributes: getBomClipboardAttributes,
      getBomInventory: getBomInventory,
      getDefaultHierarchicalColumnDefs: getDefaultHierarchicalColumnDefs,
      getAdvancedNumberingAttributes: getAdvancedNumberingAttributes,
      getAttachmentCompare: getAttachmentCompare,
      getClipboardCardAttributes: getClipboardCardAttributes
    };

    return service;

    //////////

    /**
     * below attributes are common attributes
     * @returns {[*,*,*,*,*,*,*,*,*,*,*,*]}
     */
    function getDefaultPartAndProductsAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false, basicAttribute: true},
        {name: 'Part Number', value: 'objectNumber', displayed: true, basicAttribute: true, objectList: true},
        {name: 'Configuration', value: 'configurationsForDropdown', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true, basicAttribute: true},
        {name: 'Status', value: 'status', displayed: true, basicAttribute: true},
        {name: 'Category', value: 'categoryName', displayed: true, basicAttribute: true},
        {name: 'Part Name', value: 'objectName', displayed: true, basicAttribute: true},
        {name: 'Description', value: 'description', displayed: true, basicAttribute: true, bom: true},
        {name: 'Unit of Measure', value: 'uom', displayed: true, basicAttribute: true},
        {name: 'Procurement Type', value: 'procurementType', displayed: false, basicAttribute: true},
        {name: 'Project Name', value: 'projectNames', displayed: false, basicAttribute: true},
        {name: 'Tags', value: 'tags', displayed: false, basicAttribute: true},
        {name: 'Cost', value: 'fuseCost', displayed: true, basicAttribute: true},
        {name: 'Cost Type', value: 'costType', displayed: false},
        {name: 'BOM', value: 'hasBOM', displayed: false},
        {name: 'Latest', value: 'isLatest', displayed: false},
        {name: 'Associated Cards', value: 'associatedCardsList', displayed: true},
        {name: 'Where-used', value: 'isUsedAnywhere', displayed: false}
      ];
    }

    /**
     * Read and return default product table attribtes.
     * @returns {[*,*,*,*,*,*]}
     */
    function getBasicProductPageAttributes() {

      var attributes = [
        {
          resizable: true,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/product-table-icon-cell.html',
          headerCellTemplate: '',
          // type: 'string', //string, number, date and etc
          field: 'objectId',
          displayName: '',
          enableFiltering: false,
          enableSorting: false,
          visible: true,
          enableColumnMenu: false,
          width: 40
        }
      ];

      return attributes;

    }

    /**
     * Read part table basics attributes
     * @returns {[*,*,*,*,*,*]}
     */
    function getBasicPartsPageAttributes() {

      var attributes = [
        {
          resizable: true,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/part-table-icon-cell.html',
          headerCellTemplate: '',
          // type: 'string', //string, number, date and etc
          field: 'objectId',
          displayName: '',
          enableFiltering: false,
          enableSorting: false,
          visible: true,
          enableColumnMenu: false,
          width: 40
        }
      ];

      return attributes;
    }

    /**
     * Read documents table basics attributes
     * @returns {[*,*,*,*,*,*]}
     */
    function getBasicDocumentsPageAttributes() {

      var attributes = [
        {
          resizable: true,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/documents-table-icon.html',
          headerCellTemplate: '',
          // type: 'string', //string, number, date and etc
          field: 'objectId',
          displayName: '',
          enableFiltering: false,
          enableSorting: false,
          visible: true,
          enableColumnMenu: false,
          width: 40
        }
      ];

      return attributes;
    }

    /**
     * Read sourcing table basics attributes
     * @returns {[*,*,*,*,*,*]}
     */
    function getBasicSourcingManufacturerPageAttributes() {

      var attributes = [
        {
          resizable: true,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/sourcing-manufacturer-table-icon.html',
          headerCellTemplate: '',
          // type: 'string', //string, number, date and etc
          field: 'manufacturerId',
          displayName: '',
          enableFiltering: false,
          enableSorting: false,
          visible: true,
          enableColumnMenu: false,
          width: 40
        }
      ];

      return attributes;
    }

    function getBasicSourcingSupplierPageAttributes() {

      var attributes = [
        {
          resizable: true,
          cellTemplate: 'app/main/apps/objects/module-templates/cell/sourcing-supplier-table-icon.html',
          headerCellTemplate: '',
          // type: 'string', //string, number, date and etc
          field: 'supplierId',
          displayName: '',
          enableFiltering: false,
          enableSorting: false,
          visible: true,
          enableColumnMenu: false,
          width: 40
        }
      ];

      return attributes;
    }

    /**
     * Read and return edit column.
     * @returns {[*,*,*,*,*,*]}
     */
    function getEditColumn() {

      return {
        enableSorting: false,
        enableFiltering: false,
        //enableFiltering: false,
        pinnedLeft: false,
        resizable: true,
        cellTemplate: 'app/main/apps/objects/module-templates/cell/edit-cell.html',
        field: 'edit',
        displayName: '',
        width: 80,
        visible: true,
        enableHiding: false,
        enableColumnMenu: true,
        enableColumnMoving: false,
        enableCellEdit: false
      };

    }

    /**
     * return default list of attributes
     * @returns {array}
     */

    function getManufacturerBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Manufacturer Name', value: 'name', displayed: true},
        {name: 'Manufacturer Code', value: 'code', displayed: true},
        {name: 'Approved', value: 'approved', displayed: true},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Contact Number', value: 'contactNumber', displayed: true},
        {name: 'Website', value: 'website', displayed: true},
        {name: 'Address', value: 'address', displayed: true},
        {name: 'Tags', value: 'tags', displayed: false}
      ];
    }

    function getManufacturerPartsBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Manufacturer Part Number', value: 'objectNumber', displayed: true},
        {name: 'Manufacturer Name', value: 'objectName', displayed: true},
        {name: 'Available', value: 'isAvailable', displayed: true},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Packaging', value: 'packaging', displayed: true},
        {name: 'Lead Time', value: 'leadTime', displayed: true},
        {name: 'Tags', value: 'tags', displayed: false}
      ];
    }

    function getSupplierBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Supplier Name', value: 'name', displayed: true},
        {name: 'Supplier Code', value: 'code', displayed: true},
        {name: 'Approved', value: 'approved', displayed: true},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Contact Number', value: 'contactNumber', displayed: true},
        {name: 'Website', value: 'website', displayed: true},
        {name: 'Address', value: 'address', displayed: true},
        {name: 'Tags', value: 'tags', displayed: false}
      ];
    }

    function getSupplierPartsBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Supplier Part Number', value: 'objectNumber', displayed: true},
        {name: 'Supplier Name', value: 'objectName', displayed: true},
        {name: 'Available', value: 'isAvailable', displayed: true},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Packaging', value: 'packaging', displayed: true},
        {name: 'Lead Time', value: 'leadTime', displayed: true},
        {name: 'Tags', value: 'tags', displayed: false}
      ];
    }

    function getSupplierManufacturerPartsCostAttributes() {
      return [
        {name: 'MOQ', value: 'orderQuantity', displayed: true},
        {name: 'Currency', value: 'currency', displayed: true},
        {name: 'Cost', value: 'cost', displayed: true}
      ];
    }

    function getWhereUsedBasicAttributes() {
      return [
        {name: 'Part Number', value: 'objectNumber', displayed: true, basicAttribute: true, objectList: true},
        {name: 'Configuration', value: 'configName', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true, basicAttribute: true},
        {name: 'Status', value: 'status', displayed: true, basicAttribute: true},
        {name: 'Category', value: 'categoryName', displayed: true, basicAttribute: true},
        {name: 'Part Name', value: 'objectName', displayed: true, basicAttribute: true},
        {name: 'Description', value: 'description', displayed: true, basicAttribute: true, bom: true},
        {name: 'Unit of Measure', value: 'uom', displayed: true, basicAttribute: true},
        {name: 'Procurement Type', value: 'procurementType', displayed: false},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Ref. Des.', value: 'refDocs', displayed: false},
        {name: 'Cost', value: 'fuseCost', displayed: true, basicAttribute: true},
        {name: 'Latest', value: 'isLatest', displayed: false, basicAttribute: true},
        {name: 'Associated Cards', value: 'associatedCardsList', displayed: true},
        {name: 'Where-used', value: 'isUsedAnywhere', displayed: false}
      ];
    }

    function getManufacturerPartsAttributes(type) {
      var columns = [
        {name: 'Manufacturer Part Number', value: 'mfrObjectNumber', displayed: false},
        {name: 'Manufacturer Name', value: 'mfrObjectName', displayed: false},
        {name: 'Manufacturer Code', value: 'mfrCode', displayed: false},
        {name: 'Manufacturer Part Description', value: 'mfrDescription', displayed: false},
        {name: 'Manufacturer Part Available', value: 'mfrIsAvailable', displayed: false},
        {name: 'Manufacturer Part Packaging', value: 'mfrPackaging', displayed: false},
        {name: 'Manufacturer Part Lead Time', value: 'mfrLeadTime', displayed: false},
        {name: 'Manufacturer Part MOQ', value: 'mfrMoq', displayed: false},
        {name: 'Manufacturer Part Currency', value: 'mfrCurrency', displayed: false},
        {name: 'Manufacturer Part Cost', value: 'mfrCost', displayed: false},
        {name: 'Manufacturer Approved', value: 'mfrIsApproved', displayed: false}
      ];

      if (type === objectPageEnum.heirarchicalPage ||
        type === objectPageEnum.flatPage ||
        type === objectPageEnum.sourcingPage ||

        type === objectPageEnum.partsSearchPage ||
        type === objectPageEnum.productsSearchPage) {
        columns.push({name: 'Manufacturer Notes', value: 'mfrNotes', displayed: false});
      }
      return columns;
    }

    function getSupplierPartsAttributes(type) {
      var columns = [
        {name: 'Supplier Part Number', value: 'suppObjectNumber', displayed: false},
        {name: 'Supplier Name', value: 'suppObjectName', displayed: false},
        {name: 'Supplier Code', value: 'suppCode', displayed: false},
        {name: 'Supplier Part Description', value: 'suppDescription', displayed: false},
        {name: 'Supplier Part Available', value: 'suppIsAvailable', displayed: false},
        {name: 'Supplier Part Packaging', value: 'suppPackaging', displayed: false},
        {name: 'Supplier Part Lead Time', value: 'suppLeadTime', displayed: false},
        {name: 'Supplier Part MOQ', value: 'suppMoq', displayed: false},
        {name: 'Supplier Part Currency', value: 'suppCurrency', displayed: false},
        {name: 'Supplier Part Cost', value: 'suppCost', displayed: false},
        {name: 'Supplier Approved', value: 'suppIsApproved', displayed: false}
      ];

      if (type === objectPageEnum.heirarchicalPage ||
        type === objectPageEnum.flatPage ||
        type === objectPageEnum.sourcingPage ||

        type === objectPageEnum.partsSearchPage ||
        type === objectPageEnum.productsSearchPage) {
        columns.push({name: 'Supplier Notes', value: 'suppNotes', displayed: false});
      }
      return columns;
    }

    function getBOMBasicAttributes() {
      return [
        {name: 'Sl.No', value: 'parentIndex', displayed: true},
        {name: 'Level', value: 'level', displayed: true},
        {name: 'Thumbnail', value: 'thumbnailPath', displayed: false},
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Part Number', value: 'objectNumber', displayed: true},
        {name: 'Configurations', value: 'configurationsForDropdown', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true},
        {name: 'Status', value: 'status', displayed: true},
        {name: 'Category', value: 'categoryName', displayed: true},
        {name: 'Part Name', value: 'objectName', displayed: true},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Unit of Measure', value: 'uom', displayed: false},
        {name: 'Procurement Type', value: 'procurementType', displayed: false},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Notes', value: 'notes', displayed: false},
        {name: 'Location', value: 'bomPackage', displayed: false},
        {name: 'Quantity', value: 'quantity', displayed: true},
        {name: 'Ref. Des.', value: 'refDocs', displayed: true},
        {name: 'Cost', value: 'fuseCost', displayed: true},
        {name: 'Cost Type', value: 'costType', displayed: false},
        {name: 'Extended Cost', value: 'extendedCost', displayed: false},
        {name: 'BOM', value: 'hasBOM', displayed: false},
        {name: 'Latest', value: 'isLatest', displayed: false},
        {name: 'Associated Cards', value: 'associatedCardsList', displayed: true},
        {name: 'Compare code', value: 'modification', displayed: false},
        {name: 'Total Required Quantity', value: 'requiredQty', displayed: true},
        {name: 'Total Cost', value: 'totalCost', displayed: true},
        {name: 'Shortage', value: 'shortage', displayed: true}
      ];
    }

    function getRevisionBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Part Number', value: 'objectNumber', displayed: true},
        {name: 'Configuration', value: 'configurationsForDropdown', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true},
        {name: 'Status', value: 'status', displayed: true},
        {name: 'Category', value: 'categoryName', displayed: true},
        {name: 'Part Name', value: 'objectName', displayed: false},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Unit of Measure', value: 'uom', displayed: false},
        {name: 'Procurement Type', value: 'procurementType', displayed: false},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Cost', value: 'fuseCost', displayed: false},
        {name: 'Cost Type', value: 'costType', displayed: false},
        {name: 'BOM', value: 'hasBOM', displayed: true},
        {name: 'Associated Cards', value: 'associatedCardsList', displayed: true}
      ];
    }

    /**
     * return default grid options for Sourcing page
     * @returns {object}
     */

    function getDefaultGridOptionsSourcing() {
      return {
        exporterFieldCallback: function (grid, row, col, value) {
          if (col.name === 'associatedCardsList') {
            value = !_.isEmpty(value);
          }
          return value;
        },
        initialized: false,
        showTreeExpandNoChildren: false,
        showTreeRowHeader: false,
        data: [],
        enableColumnReordering: true,
        enableColumnResizing: true,
        enableSorting: true,
        enableFiltering: true,
        exporterPdfDefaultStyle: {
          fontSize: 9
        },
        exporterPdfTableStyle: {
          margin: [30, 30, 0, 30]
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'LETTER',
        rowHeight: 30,
        // 0 - disable , 1 - enable , 2 - enable when needed
        enableHorizontalScrollbar: 1,
        enableVerticalScrollbar: 2,
        //  in v3.0.+, use paginationPageSizes, paginationPageSize no more "pagingOptions" attributes.
        paginationPageSize: 100,
        paginationPageSizes: [
          {label: '25', value: 25},
          {label: '50', value: 50},
          {label: '75', value: 75},
          {label: '100', value: 100},
          {label: 'All', value: 3}
        ],
        paginationTemplate: "<div class=\"ui-grid-pager-panel\" ui-grid-pager ng-show=\"grid.options.enablePaginationControls\"><div class=\"ui-grid-pager-container\"><div class=\"ui-grid-pager-control\"><button type=\"button\" ng-click=\"paginationApi.seek(1)\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle\"><div class=\"first-bar\"></div></div></button> <button type=\"button\" ng-click=\"paginationApi.previousPage()\" ng-disabled=\"cantPageBackward()\"><div class=\"first-triangle prev-triangle\"></div></button> <input type=\"number\" ng-model=\"grid.options.paginationCurrentPage\" min=\"1\" max=\"{{ paginationApi.getTotalPages() }}\" required> <span class=\"ui-grid-pager-max-pages-number\" ng-show=\"paginationApi.getTotalPages() > 0\">/ {{ paginationApi.getTotalPages() }}</span> <button type=\"button\" ng-click=\"paginationApi.nextPage()\" ng-disabled=\"cantPageForward()\"><div class=\"last-triangle next-triangle\"></div></button> <button type=\"button\" ng-click=\"paginationApi.seek(paginationApi.getTotalPages())\" ng-disabled=\"cantPageToLast()\"><div class=\"last-triangle\"><div class=\"last-bar\"></div></div></button></div><div class=\"ui-grid-pager-row-count-picker\">" +

        "<select ng-model=\"grid.options.paginationPageSize\"" +

        "ng-options=\"o.value as o.label for o in grid.options.paginationPageSizes\">" +

        "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>"
      };
    }

    /**
     * below attributes are common attributes
     * @returns {[*,*,*,*,*,*,*,*,*,*,*,*]}
     */
    function getDefaultDocumentsAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false, basicAttribute: true, documents: true},
        {
          name: 'Part Number',
          value: 'objectNumber',
          displayed: true,
          basicAttribute: true,
          objectList: true,
          documents: true
        },
        {name: 'Configuration', value: 'configurationsForDropdown', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true, basicAttribute: true},
        {name: 'Status', value: 'status', displayed: true, basicAttribute: true},
        {name: 'Category', value: 'categoryName', displayed: true, basicAttribute: true},
        {name: 'Part Name', value: 'objectName', displayed: true, basicAttribute: true},
        {name: 'Description', value: 'description', displayed: true, basicAttribute: true, bom: true},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Latest', value: 'isLatest', displayed: false},
        {name: 'Associated Cards', value: 'associatedCardsList', displayed: true},
        {name: 'Where-used', value: 'isUsedAnywhere', displayed: false}
      ];
    }

    /**
     * below attributes are common attributes
     * @returns {[*,*,*,*,*,*,*,*,*,*,*,*]}
     */
    function getDefaultPartsProductsInventoryAttributes() {
      return [
        {
          name: 'Quantity On Hand',
          value: 'qtyOnHand',
          displayed: true,
          defaultValue: '',
          tooltipDirection: "top",
          tooltipText: "Usable Quantity of objects available (obtained from Object's Inventory section)",
          objectList: true
        },
        {
          name: 'Quantity On Order',
          value: 'qtyOnOrder',
          displayed: true,
          defaultValue: '',
          tooltipDirection: "top",
          tooltipText: "Quantity of objects on order (obtained from Object's Inventory section)"
        },
        {
          name: 'Total Available Quantity',
          value: 'qtyTotal',
          displayed: true,
          defaultValue: 0,
          tooltipDirection: "top",
          tooltipText: "'Quantity on Hand' + 'Quantity on Order' (0, when not available)"
        }
      ];
    }

    /**
     * below attributes are common attributes
     * @returns {[*,*,*,*,*]}
     */
    function getObjectHistoryAttributes(type) {
      var columns = [];

      if (type === objectPageEnum.manufacturerPage ||
        type === objectPageEnum.manufacturerPartsPage ||
        type === objectPageEnum.supplierPage ||
        type === objectPageEnum.supplierPartsPage ||

        type === objectPageEnum.searchMfrPage ||
        type === objectPageEnum.searchMfrPartsPage ||
        type === objectPageEnum.searchSuppPage ||
        type === objectPageEnum.searchSuppPartsPage ||

        type === objectPageEnum.mfrPartsManufacturePage ||
        type === objectPageEnum.suppPartsSupplierPage ||
        type === objectPageEnum.suppPartsManufacturerPage ||
        type === objectPageEnum.mfrPartsSupplierPage
      ) {
        columns = [
          {name: 'Created By', value: 'createdBy', displayed: false},
          {name: 'Created Date', value: 'createDate', displayed: false},
          {name: 'Modified By', value: 'modifiedBy', displayed: false},
          {name: 'Modified Date', value: 'modifiedDate', displayed: false}
        ];
      } else {
        columns = [
          {name: 'Created By', value: 'createdBy', displayed: false},
          {name: 'Created Date', value: 'createDate', displayed: false},
          {name: 'Modified By', value: 'modifiedBy', displayed: false},
          {name: 'Modified Date', value: 'modifiedDate', displayed: false},
          {name: 'Revision Notes', value: 'revisionNotes', displayed: false}
        ];

      }
      return columns;
    }

    function getConfigurationBasicAttributes() {
      return [
        {name: 'Attachments', value: 'hasAttachments', displayed: false},
        {name: 'Part Number', value: 'objectNumber', displayed: true},
        {name: 'Configuration', value: 'configurationsForDropdown', displayed: true},
        {name: 'Revision', value: 'revision', displayed: true},
        {name: 'Status', value: 'status', displayed: true},
        {name: 'Category', value: 'categoryName', displayed: true},
        {name: 'Part Name', value: 'objectName', displayed: false},
        {name: 'Description', value: 'description', displayed: true},
        {name: 'Unit of Measure', value: 'uom', displayed: false},
        {name: 'Procurement Type', value: 'procurementType', displayed: false},
        {name: 'Project Name', value: 'projectNames', displayed: false},
        {name: 'Tags', value: 'tags', displayed: false},
        {name: 'Cost', value: 'fuseCost', displayed: false},
        {name: 'Cost Type', value: 'costType', displayed: false},
        {name: 'BOM', value: 'hasBOM', displayed: true}
      ];
    }

    function getClipboardAttributes() {
      return [
        {name: 'Basket', value: 'deletion'},
        {name: 'Type', value: 'objectType'},
        {name: 'Part Number', value: 'objectNumber'},
        {name: 'Configuration', value: 'configName'},
        {name: 'Revision', value: 'revision'},
        {name: 'Status', value: 'status'},
        {name: 'Part Name', value: 'objectName'}
      ]
    }

    function getClipboardCardAttributes() {
      return [
        {name: 'Basket', value: 'deletion'},
        {name: 'Type', value: 'objectType'},
        {name: 'Part Number', value: 'objectNumber'},
        {name: 'Configuration', value: 'configName'},
        {name: 'Revision', value: 'revision'},
        {name: 'Status', value: 'status'},
        {name: 'Part Name', value: 'objectName'},
        {name: 'Card Status', value: 'cardStatus'},
        {name: 'Associated Cards', value: 'cardName'}
      ];
    }

    function getBomClipboardAttributes() {
      return [
        {name: 'Basket', value: 'deletion'},
        {name: 'Type', value: 'objectType'},
        {name: 'Part Number', value: 'objectNumber'},
        {name: 'Configuration', value: 'configName'},
        {name: 'Revision', value: 'revision'},
        {name: 'Status', value: 'status'},
        {name: 'Quantity', value: 'quantity'},
        {name: 'Part Name', value: 'objectName'}
      ]
    }

    function getBomInventory() {
      return [{
        name: 'Quantity On Hand',
        value: 'qtyOnHand',
        displayed: false,
        defaultValue: '',
        tooltipDirection: "top",
        tooltipText: "Usable Quantity of objects available (obtained from Object's Inventory section)"
      },
        {
          name: 'Quantity On Order',
          value: 'qtyOnOrder',
          displayed: false,
          defaultValue: '',
          tooltipDirection: "top",
          tooltipText: "Quantity of objects on order (obtained from Object's Inventory section)"
        },
        {
          name: 'Total Available Quantity',
          value: 'qtyTotal',
          displayed: false,
          defaultValue: 0,
          tooltipDirection: "top",
          tooltipText: "'Quantity on Hand' + 'Quantity on Order' (0, when not available OR when both quantities are non numeric characters)"
        }
      ]
    }

    function getAttachmentCompare() {
      return [
        {name: 'Name', value: 'name'},
        {name: 'Type', value: 'type'},
        {name: 'Upload Date', value: 'uploadDate'},
        {name: 'Uploaded By', value: 'uploadBy'},
        {name: 'File Size', value: 'fileSize'},
      ];
    }

    function getDefaultHierarchicalColumnDefs() {
      return [{
        enableSorting: true,
        enableFiltering: false,
        resizable: false,
        pinnedLeft: true,
        cellTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/column-templates/tree-sourcing-row-header.html',
        field: 'objectId',
        displayName: '',
        visible: true,
        width: 45,
        minWidth: 45,
        enableHiding: false,
        enableColumnMenu: false,
        enableColumnMoving: false,
        enableCellEdit: false,
        headerCellTemplate: '<mf-expand-collapse-tree\n' +
        '                      grid-options="grid.appScope.vm.hierarchicalGridOptions"\n max-level="grid.appScope.vm.maxLevel" object-id="grid.appScope.vm.id"' +
        '                      grid-api="grid.appScope.vm.hierarchicalUiGrid" \n></mf-expand-collapse-tree>'
      },
        {
          enableSorting: true,
          enableFiltering: false,
          resizable: true,
          pinnedLeft: true,
          cellTemplate: 'app/main/apps/objects/parts/tabs/bill-of-materials/cell-templates/edit-button-hierarchical.html',
          field: 'bomId',
          displayName: '',
          width: 80,
          visible: true,
          enableHiding: false,
          enableColumnMenu: true,
          enableColumnMoving: false,
          enableCellEdit: false
        }
      ]
    }

    function getAdvancedNumberingAttributes(){
      return [
        {name: 'Categories', value: 'categoryName'},
        {name: 'Number Scheme', value: 'scheme'},
        {name: 'Prefix', value: 'prefix'},
        {name: 'Starting Number', value: 'startingNumber'},
        {name: 'Suffix', value: 'suffix'},
        {name: 'Increment By', value: 'increment'},
        {name: 'Running Number', value: 'runningNumber'},
        {name: 'Test Next Numbers', value: 'testNextNumbers'}
      ]
    }

  }
}());
