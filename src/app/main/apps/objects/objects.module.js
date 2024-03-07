(function () {
  'use strict';

  angular
    .module('app.objects', [
      'constants',
      'flow',
      'ui.grid.treeView',
      'ui.grid',
      'ui.grid.moveColumns',
      'ui.grid.resizeColumns',
      'ui.grid.saveState',
      'ui.grid.pinning',
      'ui.grid.exporter',
      'ui.grid.pagination',
      'ui.grid.edit',
      'ui.grid.autoResize',
      'ui.grid.selection',
      'ui.grid.cellNav'
    ])
    .constant('objectPageEnum', {
      partsPage: "parts",
      documentsPage: "documents",
      productsPage: "products",
      sourcingPage: "sourcing",
      heirarchicalPage: "heirarchical",
      flatPage: "flat",
      whereUsedPage: "whereUsed",
      revisionsPage: "revisions",
      revisionDocumentPage: 'revisionDocumentPage',
      revisionPartPage: 'revisionPartPage',
      revisionProductPage: 'revisionProductPage',
      configurationPage: 'configurationPage',
      hierarchicalCompare: 'hierarchicalCompare',
      flatCompare: 'flatCompare',
      manufacturerPage: "manufacturer",
      supplierPage: "supplier",
      manufacturerPartsPage: "manufacturerParts",
      supplierPartsPage: "supplierParts",
      mfrPartsManufacturePage: "manufacturerPartsMfr",
      mfrPartsSupplierPage: "manufacturerPartsSupp",
      suppPartsSupplierPage: "supplierPartsSupp",
      suppPartsManufacturerPage: "supplierPartsMfr",
      whereUsedMfrPage: "whereUsedMfr",
      whereUsedSuppPage: "whereUsedSupp",
      searchMfrPage: "searchMfr",
      searchSuppPage: "searchSupp",
      searchMfrPartsPage: "searchMfrParts",
      searchSuppPartsPage: "searchSuppParts",
      productsSearchPage: "productsSearch",
      documentsSearchPage: "documentsSearch",
      partsSearchPage: "partsSearch"
    })
    .config(config);

  /** @ngInject */
  function config($stateProvider, pageTitles, $httpProvider) {
    $httpProvider.interceptors.push('RequestInterceptor');
    $httpProvider.interceptors.push('ResponseInterceptor');
    $stateProvider
      .state('app.objects', {
        abstract: true,
        url: '/objects'
      })
      .state('app.objects.products', {
        url: '/products',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products': {
            templateUrl: 'app/main/apps/objects/products/products.html',
            controller: 'ProductsController as vm'
          }
        },
        bodyClass: 'e-commerce',
        authenticate: true,
        authenticateUsers: true,
        pageTitle: pageTitles.productsPage
      })
      .state('app.objects.products.details', {
        url: '/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          id: null,
          revisionFlag: false,
          attachmentsFlag: false,
          targetPageIndex: 0
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.object', {
        url: '/object?pn&rev&mrev',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.object': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.object': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.object': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.object': {
            templateUrl: 'app/main/apps/objects/object/object.html',
            controller: 'ObjectsController as vm'
          }
        },
        params: {
          pn: '',
          rev: '',
          mrev: ''
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.bom', {
        url: '/bom',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.bom': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.bom': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.bom': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.bom': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        resolve: {
          Tasks: function (BoardService) {
            return BoardService;
            //return msApi.resolve('todo.tasks@get');
          }
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.comments', {
        url: '/comments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.comments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.comments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.comments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.comments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'COMMENTS'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.timeline', {
        url: '/timeline',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.timeline': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.timeline': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.timeline': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.timeline': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'TIMELINE'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.whereUsed', {
        url: '/whereUsed',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.whereUsed': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.whereUsed': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.whereUsed': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.whereUsed': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'WHERE_USED'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.additionalInfo', {
        url: '/additionalInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.additionalInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.additionalInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.additionalInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.additionalInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ADDITIONAL_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.sourcing', {
        url: '/sourcing',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.sourcing': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.sourcing': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.sourcing': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.sourcing': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'SOURCING'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.attachments', {
        url: '/attachments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.attachments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.attachments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.attachments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.attachments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ATTACHMENT'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.revisions', {
        url: '/revisions',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.revisions': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.revisions': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.revisions': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.revisions': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'REVISION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.configurations', {
        url: '/configurations',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.configurations': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.configurations': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.configurations': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.configurations': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'CONFIGURATION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.details.basicInfo', {
        url: '/basicInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.details.basicInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.details.basicInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.details.basicInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.details.basicInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'BASIC_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part', {
        url: '/part',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part': {
            templateUrl: 'app/main/apps/objects/part/part.html',
            controller: 'PartController as vm'
          }
        },
        bodyClass: 'part',
        pageTitle: pageTitles.partsPage,
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts', {
        url: '/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          id: null,
          revisionFlag: false,
          attachmentsFlag: false,
          targetPageIndex: 0
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true,
        pageTitle: pageTitles.dontChangeTitle
      })
      //for revisions-page
      .state('app.objects.compare', {
        url: '/compare-revisions',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.compare': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.compare': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.compare': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.compare': {
            templateUrl: 'app/main/apps/objects/compare-revisions/compare.html',
            controller: 'CompareController as vm'
          }
        },
        resolve: {
          Tasks: function (BoardService) {
            return BoardService.getTaskData();
            //return msApi.resolve('todo.tasks@get');
          }
        },
        params: {
          idsForCompare: null,
          targetPageIndex: 0
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.compare.attachment', {
        url: '/attachment',
        views: {
          'content@app.objects.compare.attachment': {
            templateUrl: 'app/main/apps/objects/compare-revisions/tabs/attachment-compare/attachment-compare.html',
            controller: 'AttachmentCompareController as vm'
          }
        },
        params: {
          idsForCompare: null,
          targetPageIndex: 0
        },
        data: {
          selectedTab: 1
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.compareConfigurations', {
        url: '/compare-configurations',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.compareConfigurations': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.compareConfigurations': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.compareConfigurations': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.compareConfigurations': {
            templateUrl: 'app/main/apps/objects/compare-configurations/compare-configurations.html',
            controller: 'CompareConfigurationsController as vm'
          }
        },
        resolve: {
          Tasks: function (BoardService) {
            return BoardService.getTaskData();
            //return msApi.resolve('todo.tasks@get');
          }
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.bom', {
        url: '/bom',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.bom': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.bom': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.bom': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.bom': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        resolve: {
          Tasks: function (BoardService) {
            return BoardService;
            //return msApi.resolve('todo.tasks@get');
          }
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.comments', {
        url: '/comments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.comments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.comments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.comments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.comments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'COMMENTS'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.timeline', {
        url: '/timeline',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.timeline': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.timeline': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.timeline': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.timeline': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'TIMELINE'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.whereUsed', {
        url: '/whereUsed',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.whereUsed': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.whereUsed': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.whereUsed': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.whereUsed': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'WHERE_USED'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.additionalInfo', {
        url: '/additionalInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.additionalInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.additionalInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.additionalInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.additionalInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ADDITIONAL_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.sourcing', {
        url: '/sourcing',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.sourcing': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.sourcing': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.sourcing': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.sourcing': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'SOURCING'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.attachments', {
        url: '/attachments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.attachments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.attachments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.attachments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.attachments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ATTACHMENT'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.revisions', {
        url: '/revisions',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.revisions': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.revisions': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.revisions': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.revisions': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'REVISION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.configurations', {
        url: '/configurations',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.configurations': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.configurations': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.configurations': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.configurations': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'CONFIGURATION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.parts.basicInfo', {
        url: '/basicInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.parts.basicInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.parts.basicInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.parts.basicInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.parts.basicInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'BASIC_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents', {
        url: '/documents',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents': {
            templateUrl: 'app/main/apps/objects/documents/documents.html',
            controller: 'DocumentsController as vm'
          }
        },
        bodyClass: 'e-commerce',
        authenticate: true,
        authenticateUsers: true,
        pageTitle: pageTitles.documentsPage
      })
      .state('app.objects.documents.details', {
        url: '/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          id: null,
          revisionFlag: false,
          attachmentsFlag: false,
          targetPageIndex: 0
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.bom', {
        url: '/bom',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.bom': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.bom': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.bom': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.bom': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        resolve: {
          Tasks: function (BoardService) {
            return BoardService;
            //return msApi.resolve('todo.tasks@get');
          }
        },
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.comments', {
        url: '/comments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.comments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.comments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.comments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.comments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'COMMENTS'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.timeline', {
        url: '/timeline',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.timeline': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.timeline': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.timeline': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.timeline': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'TIMELINE'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.whereUsed', {
        url: '/whereUsed',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.whereUsed': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.whereUsed': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.whereUsed': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.whereUsed': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'WHERE_USED'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.additionalInfo', {
        url: '/additionalInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.additionalInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.additionalInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.additionalInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.additionalInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ADDITIONAL_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.sourcing', {
        url: '/sourcing',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.sourcing': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.sourcing': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.sourcing': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.sourcing': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'SOURCING'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.attachments', {
        url: '/attachments',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.attachments': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.attachments': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.attachments': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.attachments': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'ATTACHMENT'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.revisions', {
        url: '/revisions',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.revisions': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.revisions': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.revisions': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.revisions': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'REVISION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.configurations', {
        url: '/configurations',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.configurations': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.configurations': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.configurations': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.configurations': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'CONFIGURATION'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.details.basicInfo', {
        url: '/basicInfo',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.details.basicInfo': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.details.basicInfo': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.details.basicInfo': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.details.basicInfo': {
            templateUrl: 'app/main/apps/objects/parts/parts.html',
            controller: 'PartsController as vm'
          }
        },
        params: {
          tabName: 'BASIC_INFO'
        },
        pageTitle: 'dont change title',
        bodyClass: 'parts',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.products.import', {
        url: 'import/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.products.import': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.products.import': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.products.import': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.products.import': {
            templateUrl: 'app/main/apps/objects/import/import.html',
            controller: 'importController as vm'
          }
        },
        params: {
          obj: null
        },
        bodyClass: 'import',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.import', {
        url: 'import/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.import': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.import': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.import': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.import': {
            templateUrl: 'app/main/apps/objects/import/import.html',
            controller: 'importController as vm'
          }
        },
        params: {
          obj: null
        },
        bodyClass: 'import',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.part.importbomh', {
        url: 'importbomh/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.part.importbomh': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.part.importbomh': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.part.importbomh': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.part.importbomh': {
            templateUrl: 'app/main/apps/objects/importbomh/importbomh.html',
            controller: 'importbomhController as vm'
          }
        },
        bodyClass: 'importbomh',
        authenticate: true,
        authenticateUsers: true
      })
      .state('app.objects.documents.import', {
        url: 'import/:id',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app.objects.documents.import': {
            templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app.objects.documents.import': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          },
          'quickPanel@app.objects.documents.import': {
            templateUrl: 'app/quick-panel/quick-panel.html',
            controller: 'QuickPanelController as vm'
          },
          'content@app.objects.documents.import': {
            templateUrl: 'app/main/apps/objects/import/import.html',
            controller: 'importController as vm'
          }
        },
        bodyClass: 'import',
        authenticate: true,
        authenticateUsers: true
      }).state('app.objects.sourcing', {
      url: '/sourcing',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/vertical-navigation.html',
          controller: 'MainController as vm'
        },
        'toolbar@app.objects.sourcing': {
          templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
          controller: 'ToolbarController as vm'
        },
        'navigation@app.objects.sourcing': {
          templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
          controller: 'NavigationController as vm'
        },
        'quickPanel@app.objects.sourcing': {
          templateUrl: 'app/quick-panel/quick-panel.html',
          controller: 'QuickPanelController as vm'
        },
        'content@app.objects.sourcing': {
          templateUrl: 'app/main/apps/objects/sourcing/sourcing.html',
          controller: 'SourcingController as vm'
        }
      },
      bodyClass: 'e-commerce',
      authenticate: true,
      authenticateUsers: true,
      pageTitle: pageTitles.sourcingPage
    }).state('app.objects.sourcing.sourcingdetails', {
      url: '/sourcepart/:id',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/vertical-navigation.html',
          controller: 'MainController as vm'
        },
        'toolbar@app.objects.sourcing.sourcingdetails': {
          templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
          controller: 'ToolbarController as vm'
        },
        'navigation@app.objects.sourcing.sourcingdetails': {
          templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
          controller: 'NavigationController as vm'
        },
        'quickPanel@app.objects.sourcing.sourcingdetails': {
          templateUrl: 'app/quick-panel/quick-panel.html',
          controller: 'QuickPanelController as vm'
        },
        'content@app.objects.sourcing.sourcingdetails': {
          templateUrl: 'app/main/apps/objects/sourcing/sourcingdetails/sourcing-details.html',
          controller: 'SourcingDetailsController as vm'
        }
      },
      params: {
        id: null,
        revisionFlag: false,
        attachmentsFlag: false
      },
      bodyClass: 'parts',
      authenticate: true,
      authenticateUsers: true,
      pageTitle: pageTitles.dontChangeTitle
    }).state('app.objects.sourcing.sourcemfgsuppdetails', {
      url: '/:sourceType/:id',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/vertical-navigation.html',
          controller: 'MainController as vm'
        },
        'toolbar@app.objects.sourcing.sourcemfgsuppdetails': {
          templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
          controller: 'ToolbarController as vm'
        },
        'navigation@app.objects.sourcing.sourcemfgsuppdetails': {
          templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
          controller: 'NavigationController as vm'
        },
        'quickPanel@app.objects.sourcing.sourcemfgsuppdetails': {
          templateUrl: 'app/quick-panel/quick-panel.html',
          controller: 'QuickPanelController as vm'
        },
        'content@app.objects.sourcing.sourcemfgsuppdetails': {
          templateUrl: 'app/main/apps/objects/sourcing/sourcemfrsuppdetails/sourcemfrsupp-details.html',
          controller: 'SourcmfrsuppDetailsController as vm'
        }
      },
      params: {
        attachmentsFlag: false
      },
      bodyClass: '',
      authenticate: true,
      authenticateUsers: true,
      pageTitle: pageTitles.dontChangeTitle
    }).state('app.objects.sourcing.sourcingimport', {
      url: 'import/:id',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/vertical-navigation.html',
          controller: 'MainController as vm'
        },
        'toolbar@app.objects.sourcing.sourcingimport': {
          templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
          controller: 'ToolbarController as vm'
        },
        'navigation@app.objects.sourcing.sourcingimport': {
          templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
          controller: 'NavigationController as vm'
        },
        'quickPanel@app.objects.sourcing.sourcingimport': {
          templateUrl: 'app/quick-panel/quick-panel.html',
          controller: 'QuickPanelController as vm'
        },
        'content@app.objects.sourcing.sourcingimport': {
          templateUrl: 'app/main/apps/objects/sourcing/import/sourcingimport/sourcing-import.html',
          controller: 'sourcingimportController as vm'
        }
      },
      bodyClass: 'sourcingimport',
      authenticate: true,
      authenticateUsers: true
    }).state('app.objects.sourcing.sourceimport', {
      url: 'imports/:id',
      views: {
        'main@': {
          templateUrl: 'app/core/layouts/vertical-navigation.html',
          controller: 'MainController as vm'
        },
        'toolbar@app.objects.sourcing.sourceimport': {
          templateUrl: 'app/toolbar/layouts/content-with-toolbar-customer/toolbar.html',
          controller: 'ToolbarController as vm'
        },
        'navigation@app.objects.sourcing.sourceimport': {
          templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
          controller: 'NavigationController as vm'
        },
        'quickPanel@app.objects.sourcing.sourceimport': {
          templateUrl: 'app/quick-panel/quick-panel.html',
          controller: 'QuickPanelController as vm'
        },
        'content@app.objects.sourcing.sourceimport': {
          templateUrl: 'app/main/apps/objects/sourcing/import/sourceimport/source-import.html',
          controller: 'sourceimportController as vm'
        }
      },
      bodyClass: 'sourceimport',
      authenticate: true,
      authenticateUsers: true
    });
  }


})();
