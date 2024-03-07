(function () {
  angular
    .module('constants', [])
    .constant('pageTitles', {
      tabNames: {
        BASIC_INFO_TAB_INDEX: '',
        ADDITIONAL_INFO_TAB_INDEX: 'Additional',
        CONFIGURATION_TAB_INDEX: 'Configuration',
        REVISION_TAB_INDEX: 'Revisions',
        ATTACHMENT_TAB_INDEX: 'Attachments',
        SOURCING_TAB_INDEX: "Sourcing",
        BOM_TAB_INDEX: 'BOM',
        WHERE_USED_TAB_INDEX: 'Where Used',
        TIMELINE_TAB_INDEX: 'Timeline',
        COMMENTS_TAB_INDEX: 'Comments'
      },
      tabNamesForManufacturer: [
        '',
        'Additional',
        'Attachments',
        'Contacts',
        'Manufacturer parts',
        'Timeline',
        'Comments'
      ],
      tabNamesForSupplier: [
        '',
        'Additional',
        'Attachments',
        'Contacts',
        'Supplier parts',
        'Timeline',
        'Comments'
      ],
      tabNamesForMPN: [
        '',
        'Additional',
        'Attachments',
        'Supplier parts',
        'Where Used',
        'Timeline',
        'Comments'
      ],
      tabNamesForSPN: [
        '',
        'Additional',
        'Attachments',
        'Manufacturer parts',
        'Where Used',
        'Timeline',
        'Comments'
      ],
      partsPage: 'Parts List',
      documentsPage: 'Documents List',
      productsPage: 'Products List',
      sourcingPage: 'Sourcing',
      settingsPage: 'Settings',
      toDoPage: 'Tasks',
      boardsListPage: 'Boards',
      dashboardPage: 'Dashboard',
      searchPage: 'Search',
      individualPart: '',
      individualBoard: 'Board',
      individualManufacturerPartNumber: 'Part Number',
      dontChangeTitle: 'dont change title',
      bom: 'BOM'
    })

    .constant('errors', {
      wrongThumbnailType: 'Please, choose an image',
      require: 'Please enter a value for this field.',
      url: 'Please enter a valid url',
      email: 'Please enter a valid email',
      number: 'Please enter a valid number.',
      text: 'Please enter a valid text',
      minValue: 'Please enter a positive number.',
      maxLength: 'max length',
      er4008: 'Logging out! This user just logged in from another location/browser/system.',
      er403: 'Missing request header for Method',
      erCatch: 'Internal Server Error',
      default: 'Something went wrong. Please, refresh the page',
      noAvailableCurrency: 'Error',
      downloadFailed: 'Download failed. Please, try later'
    })

    .constant('fuseType', {
      parts: 'parts',
      products: 'products',
      documents: 'documents',
      custom: 'custom',
      supplier: 'supplier',
      manufacturer: 'manufacturer',
      supplierPart: 'supplierPart',
      manufacturerPart: 'manufacturerPart',
      card: 'card',
      task: 'task'
    })
    .constant('helperData', {
      gridHeightOffset: 150,
      // used in front end to identify rollup cost
      rollupCostId: 'R',
      // used in back end to identify rollup cost
      backendRollupCostId: 'A'
    })
    .constant('availableCurrencies', [
      {abbreviation: 'USD', sign: '$'},
      {abbreviation: 'CAD', sign: '$'},
      {abbreviation: 'EUR', sign: '\u20AC'},
      {abbreviation: 'GBR', sign: '\u00A3'},
      {abbreviation: 'INR', sign: '\u20B9'},
      {abbreviation: 'RMB', sign: '\u00A5'},
      {abbreviation: 'AUD', sign: 'AUD'},
      {abbreviation: 'JAP', sign: '\u00A5'},
      {abbreviation: 'KRW', sign: '\u20A9'},
      {abbreviation: 'MXN', sign: 'MXN'},
      {abbreviation: 'PHP', sign: '\u20B1'},
      {abbreviation: 'NZD', sign: 'NZD'},
      {abbreviation: 'TWD', sign: 'NT$'},
      {abbreviation: 'THB', sign: '\u0E3F'},
      {abbreviation: 'CHF', sign: 'CHF'},
      {abbreviation: 'SGD', sign: 'SGD'},
      {abbreviation: 'NOK', sign: 'kr'},
      {abbreviation: 'EGP', sign: 'EGP'},
      {abbreviation: 'DKK', sign: 'kr'},
      {abbreviation: 'BRL', sign: 'R$'},
      {abbreviation: 'VND', sign: '\u20AB'},
      {abbreviation: 'ZAR', sign: 'R'},
      {abbreviation: 'ILS', sign: '\u20AA'},
      {abbreviation: 'SEK', sign: 'kr'}
    ])

    .constant('flatRowsStage', {
      rollup: 'rollup',
      preRollup: 'preRollup'
    })

    .constant('features', {
      searchPreset: 'searchPreset',
      tableTemplate: 'bom'
    })

    .constant('columns', {
      manufacturerPartNumber: {
        id: 'manufacturerPartNumber',
        name: 'Manufacturer Part Number'
      },
      manufacturerPartDescription: {
        id: 'manufacturerPartDescription',
        name: 'Manufacturer Part Description'
      },
      manufacturerPartLeadTime: {
        id: 'manufacturerPartLeadTime',
        name: 'Manufacturer Part Lead Time'
      },
      manufacturerPartCost: {
        id: 'manufacturerPartCost',
        name: 'Manufacturer Part Cost'
      },
      manufacturerName: {
        id: 'manufacturerName',
        name: 'Manufacturer Name'
      },
      manufacturerPartAvailable: {
        id: 'manufacturerPartAvailable',
        name: 'Manufacturer part Available'
      },
      manufacturerPartMOQ: {
        id: 'manufacturerPartMOQ',
        name: 'Manufacturer Part MOQ'
      },
      manufacturerApproved: {
        id: 'manufacturerApproved',
        name: 'Manufacturer Approved'
      },
      manufacturerCode: {
        id: 'manufacturerCode',
        name: 'ManufacturerCode'
      },
      manufacturerPartPackaging: {
        id: 'manufacturerPartPackaging',
        name: 'Manufacturer Part Packaging'
      }
    })
})();
