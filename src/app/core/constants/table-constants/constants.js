(function () {
  angular
    .module('constants')
    .constant('rowStates', {
      expanded: 'expanded',
      collapsed: 'collapsed'
    })
    .constant('selectedValMatcher', {
      objectNumber: 'Part Number',
      configName: 'Configuration',
      revision: 'Revision',
      objectName: 'Part Name',
      description: 'Description',
      uom: 'Unit of Measure',
      procurementType: 'Procurement Type',
      projectNames: 'Project Name',
      tags: 'Tags',
      fuseCost: 'Cost',
      hasBOM: 'BOM',
      hasWhereUsed: 'Where-used',
      categoryId: 'Category',
      status: 'Status',
      qtyOnHand: 'Quantity On Hand',
      qtyOnOrder: 'Quantity On Order',
      qtyTotal: 'Total Available Quantity'
    })

    .constant('selectedValNameMatcher', {
      'Part Number': 'objectNumber',
      'Configuration': 'configName',
      'Revision': 'revision',
      'Part Name': 'objectName',
      'Description': 'description',
      'Unit of Measure': 'uom',
      'Procurement Type': 'procurementType',
      'Project Name': 'projectNames',
      'Tags': 'tags',
      'Cost': 'fuseCost',
      'BOM': 'hasBOM',
      'Where-used': 'hasWhereUsed',
      'Category': 'categoryId',
      'Status': 'status',
      'Quantity On Hand': 'qtyOnHand',
      'Quantity On Order': 'qtyOnOrder',
      'Total Available Quantity': 'qtyTotal',
    })
})();
