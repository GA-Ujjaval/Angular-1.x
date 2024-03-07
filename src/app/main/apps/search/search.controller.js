(function () {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchController', SearchController)
    .filter('startFrom', function () {
      return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
      };
    });

  /** @ngInject */
  function SearchController($window, $scope, $filter, objectPageEnum, fuseUtils, hostUrlDevelopment, BoardService, $mdMenu,
                            CustomerService, errors, $mdToast, AuthService, DialogService, GlobalSettingsService,
                            $mdDialog, $document, $timeout, introService, $state, filterFilter, uiGridTreeBaseService,
                            attributesUtils, sourcingUtils, $rootScope, fuseType, uiGridPinningConstants, uiGridGridMenuService, pageTitleService) {
    var vm = this;
    vm.fuseUtils = fuseUtils;
    vm.objectPageEnum = objectPageEnum;
    vm.sourcingUtils = sourcingUtils;

    // private variables declration


    $scope.BeforeChangeEvent = function (targetElement) {

      $timeout(function () {

        angular.element(".introjs-button").css({
          'display': 'inline-block'
        });

        angular.element(".introjs-helperLayer").css({
          'background-color': 'rgb(32,138,190)'
        });

        angular.element('.introjs-skipbutton').hide();

      });

    };

    $scope.IntroOptions = {
      steps: introService.getIntroObj("search"),
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<strong>NEXT!</strong>',
      prevLabel: '<span style="color:green">Previous</span>'
    };

    // Data
    vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
    vm.count = {
      productCount: 0,
      partCount: 0,
      manufacturerCount: 0,
      manufacturerPartCount: 0,
      supplierCount: 0,
      supplierPartCount: 0,
      documentCount: 0,
      taskCount: 0,
      cardCount: 0
    };
    vm.defualtValue = 'affected';
    vm.resolutionCardItemsName = 'cr';
    vm.modificationCardItemsName = 'co';

    var manufacturerId = 'grid-manufacturers',
      supplierId = 'grid-suppliers',
      manufacturerPartsId = 'grid-manufacturerParts',
      documentsId = 'grid-documents-search-page',
      productsId = 'grid-products-search-page',
      partsId = 'grid-parts-search-page',
      supplierPartsId = 'grid-supplierParts';

    vm.objectPageEnum = objectPageEnum;
    vm.manufacturerId = 'grid-manufacturers';
    vm.supplierId = 'grid-suppliers';
    vm.manufacturerPartsId = 'grid-manufacturerParts';
    vm.documentsId = 'grid-documents-search-page';
    vm.productsId = 'grid-products-search-page';
    vm.partsId = 'grid-parts-search-page';
    vm.supplierPartsId = 'grid-supplierParts';
    vm.restoreState = restoreState;

    vm.linkTarget = '_self';

    $rootScope.$watch('linkTarget', linkTarget => {
      vm.linkTarget = linkTarget ? '_blank' : '_self';
    });

    vm.heightMax = document.body.scrollHeight;

    //For Error ----------------------------------------------------------------------------------------------------
    vm.error = errors;

    //For Progress Loader-------------------------------------------------------------------------------------------
    vm.progress = false;

    //For Session---------------------------------------------------------------------------------------------------
    vm.sessionData = {};
    vm.sessionData = AuthService.getSessionData('customerData');

    //For Global Variable-------------------------------------------------------------------------------------------
    var params;
    vm.products = [];
    vm.cards = [];
    vm.tasks = [];
    var headers = {
      authId: vm.sessionData.authId,
      channel_name: vm.sessionData.channel_name,
      proxy: vm.sessionData.proxy
    };

    //For Variables-------------------------------------------------------------------------------------------------
    vm.searchTypes = {
      all: true,
      product: false,
      part: false,
      document: false,
      task: false,
      manufacture: false,
      manufacturerPart: false,
      supplier: false,
      supplierPart: false
    };
    vm.isLatest = true;
    vm.currencySetting = '$';
    vm.searchTab = 'Products';

    //For Methods---------------------------------------------------------------------------------------------------
    vm.changesearchtext = changesearchtext;
    vm.clearSearch = clearSearch;
    vm.searchOptionValue = searchOptionValue;
    vm.openCardDialog = DialogService.openCardDialog;
    vm.openTaskDialog = openTaskDialog;
    vm.editTable = editTable;
    vm.printTable = printTable;
    vm.getAdditionalAttributes = getAdditionalAttributes;
    vm.initAttributes = initAttributes;
    vm.onChangeLatest = onChangeLatest;
    vm.toggleSourcingGridRow = toggleSourcingGridRow;
    vm.tabSearch = tabSearch;
    vm.getBoards = getBoards;
    vm.openCard = openCard;

    proxyDetails();

    function getDefaultPartAndProductsAttributes() {
      return attributesUtils.getDefaultPartAndProductsAttributes();
    }

    function buildAttributesByType(type) {

      var attr = {};
      switch (type) {
        case vm.objectPageEnum.partsSearchPage:
          attr.attributesBasicPartsSearchPage = fuseUtils.buildAttributeName("attributesBasic", vm.objectPageEnum.partsSearchPage);
          attr.attributesSourcingPartsSearchPage = fuseUtils.buildAttributeName("attributesSourcing", vm.objectPageEnum.partsSearchPage);
          attr.attributesAdditionalPartsSearchPage = fuseUtils.buildAttributeName("attributesAdditional", vm.objectPageEnum.partsSearchPage);
          attr.attributesMfrPartsSearchPage = fuseUtils.buildAttributeName("attributesManufacturer", vm.objectPageEnum.partsSearchPage);
          attr.attributesSuppPartsSearchPage = fuseUtils.buildAttributeName("attributesSupplier", vm.objectPageEnum.partsSearchPage);
          attr.attributesObjectHistoryPartsSearchPage = fuseUtils.buildAttributeName("attributesObjectHistory", vm.objectPageEnum.partsSearchPage);
          break;
        case vm.objectPageEnum.productsSearchPage:
          attr.attributesBasicProductsSearchPage = fuseUtils.buildAttributeName("attributesBasic", vm.objectPageEnum.productsSearchPage);
          attr.attributesSourcingProductsSearchPage = fuseUtils.buildAttributeName("attributesSourcing", vm.objectPageEnum.productsSearchPage);
          attr.attributesAdditionalProductsSearchPage = fuseUtils.buildAttributeName("attributesAdditional", vm.objectPageEnum.productsSearchPage);
          attr.attributesMfrProductsSearchPage = fuseUtils.buildAttributeName("attributesManufacturer", vm.objectPageEnum.productsSearchPage);
          attr.attributesSuppProductsSearchPage = fuseUtils.buildAttributeName("attributesSupplier", vm.objectPageEnum.productsSearchPage);
          attr.attributesObjectHistoryProductsSearchPage = fuseUtils.buildAttributeName("attributesObjectHistory", vm.objectPageEnum.productsSearchPage);
          break;
        case vm.objectPageEnum.documentsSearchPage:
          attr.attributesBasicDocumentsSearchPage = fuseUtils.buildAttributeName("attributesBasic", vm.objectPageEnum.documentsSearchPage);
          attr.attributesAdditionalDocumentsSearchPage = fuseUtils.buildAttributeName("attributesAdditional", vm.objectPageEnum.documentsSearchPage);
          attr.attributesObjectHistoryDocumentsSearchPage = fuseUtils.buildAttributeName("attributesObjectHistory", vm.objectPageEnum.documentsSearchPage);
          break;
      }

      return attr;

    }

    vm.buildMfrTable = buildMfrTable;

    function buildMfrTable(grid) {
      if (grid) {
        vm.manufaturersTableOptions.initialized = false;
        showClearButton(grid);
        return;
      }
      vm.manufaturersTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
      vm.manufaturersTableOptions.columnDefs = buildTableColumns(objectPageEnum.searchMfrPage);
      vm.manufaturersTableOptions.exporterSuppressColumns = ['manufacturerId'];
      vm.manufaturersTableOptions.exporterCsvFilename = 'manufacturerslist-search.csv';
      vm.manufaturersTableOptions.onRegisterApi = function (gridApi) {

        // Keep a reference to the gridApi.
        vm.manufaturersTableUiGrid = gridApi;
        setGridData(vm.products);
        restoreState(vm.manufaturersTableUiGrid, vm.manufacturerId, vm.objectPageEnum.searchMfrPage);

        // Setup events so we're notified when grid state changes.
        vm.manufaturersTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.searchMfrPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.searchMfrPage);
          }
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelManufacturers = $('#grid-manufacturers .ui-grid-top-panel').height();
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.core.on.sortChanged($scope, function () {
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.manufaturersTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.manufaturersTableUiGrid.grid.columns, function (val) {
              if (val.field === colDef.field) {
                gridCol = val;
              }
            });
            if(gridCol) {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
              $timeout(function () {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
              }, 0);
            }
          }
          saveState(vm.manufaturersTableUiGrid, manufacturerId, objectPageEnum.searchMfrPage);
        });
        vm.manufaturersTableUiGrid.core.on.scrollBegin($scope, function () {
        });
        vm.manufaturersTableUiGrid.core.on.scrollEnd($scope, function () {
        });

        vm.manufaturersTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.manufaturersTableOptions.data.length > 0) && !vm.manufaturersTableOptions.initialized) {
            $timeout(function () {
              vm.manufaturersTableOptions.initialized = true;
            });
          }
          const viewports = $('.ui-grid-header-viewport');
          viewports.each((index) => {
            viewports[index].style.height = 70 + 'px';
            viewports[index].childNodes[0].style.height = 70 + 'px';
          });
          vm.manufaturersTableUiGrid.core.handleWindowResize();
          showClearButton(vm.manufaturersTableUiGrid);
          vm.heightTopPanelManufacturers = $('#grid-manufacturers .ui-grid-top-panel').height();
        });

      };
    }

    vm.buildSuppTable = buildSuppTable;

    function buildSuppTable(grid) {
      if (grid) {
        vm.supplierTableOptions.initialized = false;
        showClearButton(grid);
        return;
      }
      vm.supplierTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
      vm.supplierTableOptions.columnDefs = buildTableColumns(objectPageEnum.searchSuppPage);
      vm.supplierTableOptions.exporterSuppressColumns = ['supplierId'];
      vm.supplierTableOptions.exporterCsvFilename = 'supplierslist-search.csv';
      vm.supplierTableOptions.exporterOlderExcelCompatibility = true;
      vm.supplierTableOptions.onRegisterApi = function (gridApi) {
        // Keep a reference to the gridApi.
        vm.supplierTableUiGrid = gridApi;
        setGridData(vm.products);
        restoreState(vm.supplierTableUiGrid, vm.supplierId, vm.objectPageEnum.searchSuppPage);

        // Setup events so we're notified when grid state changes.
        vm.supplierTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.searchSuppPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.searchSuppPage);
          }
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelSupplier = $('#grid-suppliers .ui-grid-top-panel').height();
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.core.on.sortChanged($scope, function () {
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.supplierTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.supplierTableUiGrid.grid.columns, function (val) {
              if (val.field === colDef.field) {
                gridCol = val;
              }
            });
            if(gridCol) {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
              $timeout(function () {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
              }, 0);
            }
          }
          saveState(vm.supplierTableUiGrid, supplierId, objectPageEnum.searchSuppPage);
        });
        vm.supplierTableUiGrid.core.on.scrollBegin($scope, function () {
        });
        vm.supplierTableUiGrid.core.on.scrollEnd($scope, function () {
        });

        vm.supplierTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.supplierTableOptions.data.length > 0) && !vm.supplierTableOptions.initialized) {
            $timeout(function () {
              vm.supplierTableOptions.initialized = true;
            });
          }
          const viewports = $('.ui-grid-header-viewport');
          viewports.each((index) => {
            viewports[index].style.height = 70 + 'px';
            viewports[index].childNodes[0].style.height = 70 + 'px';
          });
          vm.supplierTableUiGrid.core.handleWindowResize();
          showClearButton(vm.supplierTableUiGrid);
          vm.heightTopPanelSupplier = $('#grid-suppliers .ui-grid-top-panel').height();
        });

      };
    }

    vm.buildMfrPartTable = buildMfrPartTable;

    function buildMfrPartTable(grid) {
      if (grid) {
        vm.manufacturerPartsTableOptions.initialized = false;
        showClearButton(grid);
        return;
      }
      vm.manufacturerPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
      vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.searchMfrPartsPage);
      vm.manufacturerPartsTableOptions.exporterSuppressColumns = ['manufacturerId'];
      vm.manufacturerPartsTableOptions.exporterCsvFilename = 'manufacturer partslist-search.csv';
      vm.manufacturerPartsTableOptions.exporterOlderExcelCompatibility = true;
      vm.manufacturerPartsTableOptions.onRegisterApi = function (gridApi) {

        // Keep a reference to the gridApi.
        vm.manufacturerPartsTableUiGrid = gridApi;
        setGridData(vm.products);
        restoreState(vm.manufacturerPartsTableUiGrid, vm.manufacturerPartsId, vm.objectPageEnum.searchMfrPartsPage);

        // Setup events so we're notified when grid state changes.
        vm.manufacturerPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.searchMfrPartsPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.searchMfrPartsPage);
          }
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelManufacturerParts = $('#grid-manufacturerParts .ui-grid-top-panel').height();
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.core.on.sortChanged($scope, function () {
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.manufacturerPartsTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.manufacturerPartsTableUiGrid.grid.columns, function (val) {
              if (val.field === colDef.field) {
                gridCol = val;
              }
            });
            if(gridCol) {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
              $timeout(function () {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
              }, 0);
            }
          }
          saveState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, objectPageEnum.searchMfrPartsPage);
        });
        vm.manufacturerPartsTableUiGrid.core.on.scrollBegin($scope, function () {
        });
        vm.manufacturerPartsTableUiGrid.core.on.scrollEnd($scope, function () {
        });

        vm.manufacturerPartsTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.manufacturerPartsTableOptions.data.length > 0) && !vm.manufacturerPartsTableOptions.initialized) {
            $timeout(function () {
              vm.manufacturerPartsTableOptions.initialized = true;
            });
          }
          const viewports = $('.ui-grid-header-viewport');
          viewports.each((index) => {
            viewports[index].style.height = 70 + 'px';
            viewports[index].childNodes[0].style.height = 70 + 'px';
          });
          vm.manufacturerPartsTableUiGrid.core.handleWindowResize();
          showClearButton(vm.manufacturerPartsTableUiGrid);
          vm.heightTopPanelManufacturerParts = $('#grid-manufacturerParts .ui-grid-top-panel').height();
        });

      };
    }

    vm.buildSuppPartTable = buildSuppPartTable;

    function buildSuppPartTable(grid) {
      if (grid) {
        vm.supplierPartsTableOptions.initialized = false;
        showClearButton(grid);
        return;
      }
      vm.supplierPartsTableOptions = attributesUtils.getDefaultGridOptionsSourcing();
      vm.supplierPartsTableOptions.columnDefs = buildTableColumns(objectPageEnum.searchSuppPartsPage);
      vm.supplierPartsTableOptions.exporterSuppressColumns = ['supplierId'];
      vm.supplierPartsTableOptions.exporterCsvFilename = 'supplier partslist-search.csv';
      vm.supplierPartsTableOptions.exporterOlderExcelCompatibility = true;
      vm.supplierPartsTableOptions.onRegisterApi = function (gridApi) {

        // Keep a reference to the gridApi.
        vm.supplierPartsTableUiGrid = gridApi;
        setGridData(vm.products);
        restoreState(vm.supplierPartsTableUiGrid, vm.supplierPartsId, vm.objectPageEnum.searchSuppPartsPage);

        // Setup events so we're notified when grid state changes.
        vm.supplierPartsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
          if (!rowsNumber)
            return;

          if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
            fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.searchSuppPartsPage);
          } else {
            fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.searchSuppPartsPage);
          }
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
          vm.heightTopPanelSupplierParts = $('#grid-supplierParts .ui-grid-top-panel').height();
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.core.on.filterChanged($scope, function () {
          $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.core.on.sortChanged($scope, function () {
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
          if (vm.supplierPartsTableOptions.initialized) {
            let gridCol;
            _.forEach(vm.supplierPartsTableUiGrid.grid.columns, function (val) {
              if (val.field === colDef.field) {
                gridCol = val;
              }
            });
            if(gridCol) {
              uiGridGridMenuService.toggleColumnVisibility(gridCol);
              $timeout(function () {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
              }, 0);
            }
          }
          saveState(vm.supplierPartsTableUiGrid, supplierPartsId, objectPageEnum.searchSuppPartsPage);
        });
        vm.supplierPartsTableUiGrid.core.on.scrollBegin($scope, function () {
        });
        vm.supplierPartsTableUiGrid.core.on.scrollEnd($scope, function () {
        });

        vm.supplierPartsTableUiGrid.core.on.rowsRendered($scope, function () {
          if ((vm.supplierPartsTableOptions.data.length > 0) && !vm.supplierPartsTableOptions.initialized) {
            $timeout(function () {
              vm.supplierPartsTableOptions.initialized = true;
            });
          }
          const viewports = $('.ui-grid-header-viewport');
          viewports.each((index) => {
            viewports[index].style.height = 70 + 'px';
            viewports[index].childNodes[0].style.height = 70 + 'px';
          });
          vm.supplierPartsTableUiGrid.core.handleWindowResize();
          vm.heightTopPanelSupplierParts = $('#grid-supplierParts .ui-grid-top-panel').height();
        });

      };
    }



    function initDocumentSearchAttributes(type) {
      var attr = buildAttributesByType(type);

      var attributesBasic = localStorage.getItem(attr.attributesBasicDocumentsSearchPage),
        attributesAdditional = localStorage.getItem(attr.attributesAdditionalDocumentsSearchPage),
        attributesObjectHistory = localStorage.getItem(attr.attributesObjectHistoryDocumentsSearchPage);

      if (attributesBasic && (attributesBasic.indexOf('associatedCardsList') !== -1) && (attributesBasic.indexOf('isUsedAnywhere') !== -1) &&
        (attributesBasic.indexOf('isLatest') !== -1)) {
        vm.attrDocumentsSearchPageBasic = angular.fromJson(attributesBasic);
      } else {
        vm.attrDocumentsSearchPageBasic = attributesUtils.getDefaultDocumentsAttributes();
        localStorage.removeItem(attr.attributesBasicDocumentsSearchPage);
        localStorage.setItem(attr.attributesBasicDocumentsSearchPage, angular.toJson(vm.attrDocumentsSearchPageBasic));
      }

      if (attributesAdditional) {
        vm.attrDocumentsSearchPageAdditional = angular.fromJson(attributesAdditional);
      }

      if (attributesObjectHistory) {
        vm.attrDocumentsSearchPageObjectHistory = angular.fromJson(attributesObjectHistory);
      }

    }


    function initProductSearchAttributes(type) {
      var attr = buildAttributesByType(type);

      var attributesBasic = localStorage.getItem(attr.attributesBasicProductsSearchPage),
        attributesManufacturer = localStorage.getItem(attr.attributesMfrProductsSearchPage),
        attributesSupplier = localStorage.getItem(attr.attributesSuppProductsSearchPage),
        attributesAdditional = localStorage.getItem(attr.attributesAdditionalProductsSearchPage),
        attributesObjectHistory = localStorage.getItem(attr.attributesObjectHistoryProductsSearchPage);

      if (attributesBasic && (attributesBasic.indexOf('associatedCardsList') !== -1) && (attributesBasic.indexOf('isUsedAnywhere') !== -1) &&
        (attributesBasic.indexOf('isLatest') !== -1)) {
        vm.attrProductsSearchBasic = angular.fromJson(attributesBasic);
      } else {
        vm.attrProductsSearchBasic = getDefaultPartAndProductsAttributes();
        localStorage.removeItem(attr.attributesBasicProductsSearchPage);
        localStorage.setItem(attr.attributesBasicProductsSearchPage, angular.toJson(vm.attrProductsSearchBasic));
      }

      if (localStorage.getItem(attr.attributesSourcingProductsSearchPage)) {
        localStorage.removeItem(attr.attributesSourcingProductsSearchPage);
      }

      if (attributesManufacturer) {
        vm.attrProductsSearchPageMfr = angular.fromJson(attributesManufacturer);
      }
      if (attributesSupplier) {
        vm.attrProductsSearchPageSupp = angular.fromJson(attributesSupplier);
      }

      if (attributesAdditional) {
        vm.attrProductsSearchAdditional = angular.fromJson(attributesAdditional);
      }

      if (attributesObjectHistory) {
        vm.attrProductsSearchObjectHistory = angular.fromJson(attributesObjectHistory);
      }

    }


    function initPartsSearchAttributes(type) {
      var attr = buildAttributesByType(type);

      var attributesBasic = localStorage.getItem(attr.attributesBasicPartsSearchPage),
        attributesManufacturer = localStorage.getItem(attr.attributesMfrPartsSearchPage),
        attributesSupplier = localStorage.getItem(attr.attributesSuppPartsSearchPage),
        attributesAdditional = localStorage.getItem(attr.attributesAdditionalPartsSearchPage),
        attributesObjectHistory = localStorage.getItem(attr.attributesObjectHistoryPartsSearchPage);

      if (attributesBasic && (attributesBasic.indexOf('associatedCardsList') !== -1) && (attributesBasic.indexOf('isUsedAnywhere') !== -1) &&
        (attributesBasic.indexOf('isLatest') !== -1)) {
        vm.attrPartsSearchPageBasic = angular.fromJson(attributesBasic);
      } else {
        vm.attrPartsSearchPageBasic = getDefaultPartAndProductsAttributes();
        localStorage.removeItem(attr.attributesBasicPartsSearchPage);
        localStorage.setItem(attr.attributesBasicPartsSearchPage, angular.toJson(vm.attrPartsSearchPageBasic));
      }

      if (localStorage.getItem(attr.attributesSourcingPartsSearchPage)) {
        localStorage.removeItem(attr.attributesSourcingPartsSearchPage);
      }

      if (attributesManufacturer) {
        vm.attrPartsSearchPageMfr = angular.fromJson(attributesManufacturer);
      }
      if (attributesSupplier) {
        vm.attrPartsSearchPageSupp = angular.fromJson(attributesSupplier);
      }

      if (attributesAdditional) {
        vm.attrPartsSearchPageAdditional = angular.fromJson(attributesAdditional);
      }

      if (attributesObjectHistory) {
        vm.attrPartsSearchPageObjectHistory = angular.fromJson(attributesObjectHistory);
      }

    }

    function initAttributes() {
      initDocumentSearchAttributes(vm.objectPageEnum.documentsSearchPage);
      initProductSearchAttributes(vm.objectPageEnum.productsSearchPage);
      initPartsSearchAttributes(vm.objectPageEnum.partsSearchPage);
    }

    function extendPart(value) {

      if (!_.isEmpty(value.sourceObjectResponses)) {
        value = _.merge(value, value.sourceObjectResponses);
      }
      if (!_.isEmpty(value.sourcingObjectResponses)) {
        value = _.merge(value, value.sourcingObjectResponses);
      }
      value.isUsedAnywhere = value.hasWhereUsed ? 'Yes' : 'No';
      value.configurationsForDropdown = value.configName;
      value.associatedCardsList = value.associatedCardList;
      value.tags = value.tags.join(', ');
      value.projectNames = value.projectNames.join(', ');
      value.configurationsForDropdown = value.configName;

      if (value.fuseCost != null && value.fuseCost != undefined && value.fuseCost != "") {
        value.fuseCost = vm.currencySetting + ' ' + value.fuseCost;
      } else {
        value.fuseCost = "";
      }

      if (value.fuseObjectNumberSetting) {
        if (value.fuseObjectNumberSetting.enableMinorRev) {
          value.revision = value.revision + '.' + value.minorRevision;
        }
      }

      value.additionalInfoList.forEach(function (additionalInfoItem) {
        value[additionalInfoItem.attributeKey] = additionalInfoItem.attributeValue;
      });

      if (value.costDetail && value.costDetail.costSetting == 'A') {
        value.costType = 'Rollup';
      } else {
        value.costType = 'Manual';
      }

      if (value.hasBOM) {
        value.hasBOM = 'Yes';
      } else {
        value.hasBOM = 'No';
      }

      if (value.contactList && value.contactList[0]) {
        value.contactsName = value.contactList[0].name;
        value.contactsTitle = value.contactList[0].title;
        value.contactsEmail = value.contactList[0].email;
        value.contactsNumber = value.contactList[0].contactNumber;
        value.contactsAddress = value.contactList[0].address;
      }

      sourcingUtils.extendSourcingData(value);

      if (!_.isEmpty(value.costDetail) && (value.objectType == 'manufacturerPart' || value.objectType == 'supplierPart')) {
        value.cost = value.costDetail[0].cost;
        value.currency = value.costDetail[0].currency;
        value.orderQuantity = value.costDetail[0].moq;
      }

      if (value.website && !/^https?:\/\//i.test(value.website)) {
        value.website = 'http://' + value.website;
      }
      if (value.sourcingObjectHistory && (value.objectType === 'manufacturer' || value.objectType === 'supplier')) {
        var creator = _.find(vm.allUsers, {userId: value.sourcingObjectHistory.createdBy});
        var editor = _.find(vm.allUsers, {userId: value.sourcingObjectHistory.modifiedBy});
        value.createdBy = creator.firstName + " " + creator.lastName;
        value.modifiedBy = editor.firstName + " " + editor.lastName;
        value.modifiedDate = $filter('date')(value.sourcingObjectHistory.modifiedDate, "medium");
        value.createDate = $filter('date')(value.sourcingObjectHistory.createDate, "medium");
        value.revisionNotes = value.sourcingObjectHistory.revisionNotes;
      }
      if (value.sourceObjectHistory && (value.objectType === 'manufacturerPart' || value.objectType === 'supplierPart')) {
        var creator = _.find(vm.allUsers, {userId: value.sourceObjectHistory.createdBy});
        var editor = _.find(vm.allUsers, {userId: value.sourceObjectHistory.modifiedBy});
        value.createdBy = creator.firstName + " " + creator.lastName;
        value.modifiedBy = editor.firstName + " " + editor.lastName;
        value.modifiedDate = $filter('date')(value.sourceObjectHistory.modifiedDate, "medium");
        value.createDate = $filter('date')(value.sourceObjectHistory.createDate, "medium");
        value.revisionNotes = value.sourceObjectHistory.revisionNotes;
      }
      if (value.fuseObjectHistory && (value.objectType === 'parts' || value.objectType === 'products' || value.objectType === 'documents')) {
        var creator = _.find(vm.allUsers, {userId: value.fuseObjectHistory.createdBy});
        var editor = _.find(vm.allUsers, {userId: value.fuseObjectHistory.modifiedBy});
        value.createdBy = creator ? (creator.firstName + " " + creator.lastName) : '';
        value.modifiedBy = editor ? (editor.firstName + " " + editor.lastName) : '';
        value.createDate = $filter('date')(value.fuseObjectHistory.createDate, "medium");
        value.modifiedDate = $filter('date')(value.fuseObjectHistory.modifiedDate, "medium");
        value.revisionNotes = value.fuseObjectHistory.revisionNotes;
      }


      return value;
    }

    function getAdditionalAttributes() {
      vm.progress = true;
      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId
        };
      } else {
        params = {};
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.getallfuseobject, params, '', headers)
        .then(function (response) {
          switch (response.code) {
            case 0:
              //if (!params.fuseObjectType) {
              vm.bomparts = response.data;
              //}
              vm.progress = false;
              break;
            case 4006:
              //For Progress Loader
              vm.progress = false;
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function editTable(ev, flag) {
      $mdDialog.show({
        controller: 'EditTableController',
        controllerAs: 'vm',
        templateUrl: 'app/main/apps/objects/parts/tabs/bill-of-materials/dialogs/edittable.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          User: vm.user,
          pageType: flag,
          whereIsRevisionFrom: '',
          params: {
            isConfigEnabled: vm.configurationSettings
          }
        }
      }).then(function () {
        if (objectPageEnum.searchMfrPage == flag) {
          vm.manufaturersTableOptions.initialized = false;
          vm.manufaturersTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufaturersTableUiGrid, manufacturerId, flag);
        } else if (objectPageEnum.searchSuppPage == flag) {
          vm.supplierTableOptions.initialized = false;
          vm.supplierTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierTableUiGrid, supplierId, flag);
        } else if (objectPageEnum.searchMfrPartsPage == flag) {
          vm.manufacturerPartsTableOptions.initialized = false;
          vm.manufacturerPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.manufacturerPartsTableUiGrid, manufacturerPartsId, flag);
        } else if (objectPageEnum.searchSuppPartsPage == flag) {
          vm.supplierPartsTableOptions.initialized = false;
          vm.supplierPartsTableOptions.columnDefs = buildTableColumns(flag);
          restoreState(vm.supplierPartsTableUiGrid, supplierPartsId, flag);
        } else {
          vm.progress = true;
          initAttributes();
          if (flag === objectPageEnum.productsSearchPage) {
            vm.productTableOptions.initialized = false;
            vm.productTableOptions.columnDefs = buildProductTableColumns();
            restoreState(vm.productTableUiGrid, productsId, objectPageEnum.productsSearchPage);
          } else if (flag === objectPageEnum.partsSearchPage) {
            vm.partTableOptions.initialized = false;
            vm.partTableOptions.columnDefs = buildPartTableColumns();
            restoreState(vm.partTableUiGrid, partsId, objectPageEnum.partsSearchPage);
          } else if (flag === objectPageEnum.documentsSearchPage) {
            vm.documentsTableOptions.initialized = false;
            vm.documentsTableOptions.columnDefs = buildDocumentTableColumns();
            vm.documentsTableOptions.exporterFieldCallback = function (grid, row, col, value) {
              if (col.name === 'associatedCardsList') {
                value = !_.isEmpty(value);
              }
              return value;
            };
            restoreState(vm.documentsTableUiGrid, documentsId, objectPageEnum.documentsSearchPage);
          }

          $timeout(function () {
            vm.progress = false;
          }, 1000);
        }
      }, function () {
      });
    }

    function printTable(body, head, txt) {
      var bodyToPrint = document.getElementById(body);
      var headToPrint = document.getElementById(head);
      var newWin = window.open("");
      var now = new Date();
      var dateformat = moment(now).format('MMMM Do YYYY, h:mm:ss A');
      newWin.document.write('<html><head><title>' + txt + '</title>' + '<style>@page { size: auto;  margin: 0mm; }</style>' +
        '</head><body>' + '<div style="padding: 5px;">' + dateformat + '<span style="left: 50%; position: absolute;">' + txt + '</span>' + '</div>' + '<table style="text-align: left;">' + headToPrint.outerHTML + bodyToPrint.outerHTML + '</table>' + '</body></html>');
      newWin.print();
      newWin.close();
    }

    function openTaskDialog(ev, task, boardid, cardlistid, newTask) {

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          taskId: task
        };
      } else {
        params = {
          taskId: task
        };
      }

      CustomerService.addNewMember('GET', hostUrlDevelopment.test.gettaskbytaskid, params, '', headers)
        .then(function (response) {
          //For Progress Loader
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.task = response.data;
              if (vm.sessionData.proxy === true) {
                params = {
                  customerId: vm.sessionData.customerAdminId,
                  boardId: boardid,
                  listId: cardlistid,
                  cardId: response.data.cardId
                };
              } else {
                params = {
                  boardId: boardid,
                  listId: cardlistid,
                  cardId: response.data.cardId
                };
              }
              CustomerService.addNewMember('GET', hostUrlDevelopment.test.getcardbycardid, params, '', headers)
                .then(function (response) {
                  //For Progress Loader
                  vm.progress = false;
                  switch (response.code) {
                    case 0:
                      vm.idChangeItems = [];
                      angular.forEach(response.data.changeItemList, function (value, key) {
                        vm.idChangeItems.push(value.id);
                      });

                      vm.card = {
                        "id": response.data.cardId,
                        "name": response.data.cardTitle,
                        "description": response.data.cardDescription,
                        "idAttachmentCover": '',
                        "idMembers": response.data.membersIdList,
                        "idLabels": response.data.cardPriority,
                        "cardTypeId": '',
                        "idChangeItems": vm.idChangeItems,
                        "attachments": response.data.attachmentsList,
                        "subscribed": response.data.subscribed,
                        "checklists": '',
                        "checkItems": response.data.checkItems,
                        "checkItemsChecked": '',
                        "comments": response.data.comments,
                        "activities": response.data.activities,
                        "due": response.data.cardCreationDate,
                        "companySeqId": response.data.companySeqId,
                        "resolutionTasksTab": '',
                        "modificationsTab": '',
                        "whereUsedTab": '',
                        "modifications": '',
                        "resolutionTasks": '',
                        "whereUsed": ''
                      };

                      vm.modalInstance = $mdDialog.show({
                        controller: 'TaskDialogController',
                        controllerAs: 'vm',
                        preserveScope: true,
                        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
                        parent: angular.element($document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                          Task: vm.task,
                          Tasks: vm.tasks,
                          ChangeItems: vm.changeItems,
                          Card: vm.card,
                          event: ev,
                          $parent: vm,
                          newTask: newTask,
                          callback: newTask ? vm.addTaskCallback : vm.updateTaskCallback,
                          Members: vm.members,
                          isConfigEnable: vm.configurationSettings,
                          isTemplate: false
                        }
                      });
                      break;
                    case 403:
                      vm.modalInstance = $mdDialog.show({
                        controller: 'TaskDialogController',
                        controllerAs: 'vm',
                        preserveScope: true,
                        templateUrl: 'app/main/apps/todo/dialogs/task/task-dialog.html',
                        parent: angular.element($document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                          Task: vm.task,
                          Tasks: vm.tasks,
                          ChangeItems: vm.changeItems,
                          Card: vm.card,
                          event: ev,
                          $parent: vm,
                          newTask: newTask,
                          callback: newTask ? vm.addTaskCallback : vm.updateTaskCallback,
                          Members: vm.members,
                          isConfigEnable: vm.configurationSettings,
                          isTemplate: false
                        }
                      });
                      break;
                  }
                })
                .catch(function (response) {
                  vm.progress = false;
                  $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
                });
              break;
            case 4006:
              console.log(response.message);
              break;
            default:
              console.log(response.message);
          }
        })
        .catch(function (response) {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    /**
     * bind grid data from server response
     */
    function bindGridData() {
      if (vm.searchTypes.all) {
        if (vm.productTableOptions) {
          vm.productTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'products'}) || [];
          vm.productTableOptions.exporterFieldCallback = function (grid, row, col, value) {
            if (col.name === 'associatedCardsList') {
              value = !_.isEmpty(value);
            }
            return value;
          };
          vm.productTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.productTableOptions.data);
          vm.productTableUiGrid.core.handleWindowResize();
          fuseUtils.handleAllOptionForPagination(vm.productTableOptions, objectPageEnum.productsSearchPage);
        }
        if (vm.partTableOptions) {
          vm.partTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'parts'}) || [];
          vm.partTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.partTableOptions.data);
          vm.partTableUiGrid.core.handleWindowResize();
          fuseUtils.handleAllOptionForPagination(vm.partTableOptions, objectPageEnum.partsSearchPage);
        }
        if (vm.documentsTableOptions) {
          vm.documentsTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'documents'}) || [];
          vm.documentsTableUiGrid.core.handleWindowResize();
          fuseUtils.handleAllOptionForPagination(vm.documentsTableOptions, objectPageEnum.documentsSearchPage);
        }
      } else {
        if (vm.searchTypes.product) {
          if (vm.productTableOptions) {
            vm.productTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'products'});
            vm.productTableUiGrid.core.handleWindowResize();
            vm.productTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.productTableOptions.data);
            fuseUtils.handleAllOptionForPagination(vm.productTableOptions, objectPageEnum.productsSearchPage);
          }
        } else if (vm.searchTypes.part) {
          if (vm.partTableOptions) {
            vm.partTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'parts'});
            vm.partTableOptions.data = vm.sourcingUtils.applyFlattenOnSourcing(vm.partTableOptions.data);
            vm.partTableUiGrid.core.handleWindowResize();
            fuseUtils.handleAllOptionForPagination(vm.partTableOptions, objectPageEnum.partsSearchPage);
          }
        } else if (vm.searchTypes.document) {
          if (vm.documentsTableOptions) {
            vm.documentsTableOptions.data = filterFilter(vm.productsLatest, {objectType: 'documents'}) || [];
            vm.documentsTableUiGrid.core.handleWindowResize();
            fuseUtils.handleAllOptionForPagination(vm.documentsTableOptions, objectPageEnum.documentsSearchPage);
          }
        }
      }
    }

    // Data
    function getdatabysearch() {
      //For Progress Loader
      vm.progress = true;
      var type = [];
      if (vm.searchTypes.all) {
        type.push('all');
      } else {
        if (vm.searchTypes.product) {
          type.push('product');
        }
        if (vm.searchTypes.part) {
          type.push('part');
        }
        if (vm.searchTypes.document) {
          type.push('document');
        }
        if (vm.searchTypes.manufacture) {
          type.push('manufacture');
        }
        if (vm.searchTypes.manufacturerPart) {
          type.push('manufacturerPart');
        }
        if (vm.searchTypes.supplier) {
          type.push('supplier');
        }
        if (vm.searchTypes.supplierPart) {
          type.push('supplierPart');
        }
        if (vm.searchTypes.task) {
          type.push('task');
        }
        if (vm.searchTypes.card) {
          type.push('card');
        }
      }

      if (vm.sessionData.proxy === true) {
        params = {
          customerId: vm.sessionData.customerAdminId,
          keyword: vm.keyword,
          searchType: type.join(',')
        };
      } else {
        params = {
          keyword: vm.keyword,
          searchType: type.join(',')
        };
      }

      let promises = [];

      promises.push(CustomerService.addNewMember('GET', hostUrlDevelopment.test.getusers, {customerId: vm.sessionData.proxy === true ? vm.sessionData.customerAdminId : vm.sessionData.userId}, '', headers));
      promises.push(CustomerService.addNewMember('POST', hostUrlDevelopment.test.search, params, {}, headers));

      Promise.all(promises)
        .then(function (responses) {
          getallUsers(responses[0]);
          handleGetDataBySearch(responses[1]);
        })
        .catch(function () {
          vm.progress = false;
          $mdToast.show($mdToast.simple().textContent(vm.error.erCatch).position('top right'));
        });
    }

    function handleGetDataBySearch(response) {
      switch (response.code) {
        case 0:
          vm.count = response.count;
          if (vm.count.totalCount === 0) {
            $mdToast.show($mdToast.simple().textContent('There are no search results found.').action('x').toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          } else {
            vm.count = response.count;
            vm.products = response.data;
            vm.cards = _.filter(vm.products, (product) => {
              return product.objectType === fuseType.card;
            });
            vm.tasks = _.filter(vm.products, (product) => {
              return product.objectType === fuseType.task;
            });
            vm.products = _.map(vm.products, function (val) {
              return extendPart(val);
            });
            vm.products = _.uniqBy(vm.products, 'objectId');
            const evt = window.document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);
          }

          if (vm.isLatest) {
            vm.productsLatest = _.filter(vm.products, ['isLatest', 'true']);
            vm.count.documentCount = 0;
            vm.count.partCount = 0;
            vm.count.productCount = 0;
            vm.count.manufacturerCount = 0;
            vm.count.manufacturerPartCount = 0;
            vm.count.supplierCount = 0;
            vm.count.supplierPartCount = 0;
            angular.forEach(vm.productsLatest, function (item) {
              if (item.objectType === 'documents') {
                vm.count.documentCount++;
              } else if (item.objectType === 'parts') {
                vm.count.partCount++;
              } else if (item.objectType === 'products') {
                vm.count.productCount++;
              }
            });
            setGridData(vm.products);
          } else {
            vm.productsLatest = angular.copy(vm.products);
            setGridData(vm.products);
          }

          /**
           * Bind grid data
           */
          bindGridData();

          //For Progress Loader
          vm.progress = false;
          break;
        case 4006:
          console.log(response.message);
          break;
        default:
          console.log(response.message);
      }
    }

    vm.callAllTabs = callAllTabs;

    function callAllTabs() {
      $timeout(() => {
        $rootScope.enableProducts ? buildProductTable(vm.productTableUiGrid) : buildPartTable(vm.partTableUiGrid);
        $rootScope.enableProducts ? tabSearch('Products') : tabSearch('Parts');
      });
    }

    function setGridData(arr) {
      vm.count.manufacturerCount = 0;
      vm.count.supplierCount = 0;
      vm.count.supplierPartCount = 0;
      vm.count.manufacturerPartCount = 0;
      if (vm.manufaturersTableOptions) {
        vm.manufaturersTableOptions.data = [];
      }
      if (vm.supplierTableOptions) {
        vm.supplierTableOptions.data = [];
      }
      if (vm.manufacturerPartsTableOptions) {
        vm.manufacturerPartsTableOptions.data = [];
      }
      if (vm.supplierPartsTableOptions) {
        vm.supplierPartsTableOptions.data = [];
      }
      angular.forEach(arr, function (item) {
        if (item.objectType === 'manufacturer') {
          if (vm.manufaturersTableOptions) {
            vm.manufaturersTableOptions.data.push(item);
            vm.count.manufacturerCount++;
            fuseUtils.handleAllOptionForPagination(vm.manufaturersTableOptions, objectPageEnum.searchMfrPage);
          } else {
            vm.count.manufacturerCount++;
          }
        } else if (item.objectType === 'manufacturerPart') {
          if (vm.manufacturerPartsTableOptions) {
            vm.manufacturerPartsTableOptions.data.push(item);
            vm.count.manufacturerPartCount++;
            fuseUtils.handleAllOptionForPagination(vm.manufacturerPartsTableOptions, objectPageEnum.searchMfrPartsPage);
          } else {
            vm.count.manufacturerPartCount++;
          }
        } else if (item.objectType === 'supplier') {
          if (vm.supplierTableOptions) {
            vm.supplierTableOptions.data.push(item);
            vm.count.supplierCount++;
            fuseUtils.handleAllOptionForPagination(vm.supplierTableOptions, objectPageEnum.searchSuppPage);
          } else {
            vm.count.supplierCount++;
          }
        } else if (item.objectType === 'supplierPart') {
          if (vm.supplierPartsTableOptions) {
            vm.supplierPartsTableOptions.data.push(item);
            vm.count.supplierPartCount++;
            fuseUtils.handleAllOptionForPagination(vm.supplierPartsTableOptions, objectPageEnum.searchSuppPartsPage);
          } else {
            vm.count.supplierPartCount++;
          }
        }
      });
    }

    function onChangeLatest() {

      vm.count.documentCount = 0;
      vm.count.partCount = 0;
      vm.count.productCount = 0;
      vm.count.manufacturerCount = 0;
      vm.count.manufacturerPartCount = 0;
      vm.count.supplierCount = 0;
      vm.count.supplierPartCount = 0;
      vm.count.documentCount = 0;
      vm.count.partCount = 0;
      vm.count.productCount = 0;

      if (vm.isLatest) {
        vm.productsLatest = _.filter(vm.products, ['isLatest', 'true']);
      } else {
        vm.productsLatest = angular.copy(vm.products);
      }
      angular.forEach(vm.productsLatest, function (item) {
        if (item.objectType === 'documents') {
          vm.count.documentCount++;
        } else if (item.objectType === 'parts') {
          vm.count.partCount++;
        } else if (item.objectType === 'products') {
          vm.count.productCount++;
        }
      });

      setGridData(vm.products);
      bindGridData();
    }

    vm.dtOptions = {
      dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
      pagingType: 'simple',
      lengthMenu: [10, 20, 30, 50, 100],
      pageLength: 20,
      scrollY: 'auto',
      responsive: false,
      oLanguage: {
        sSearch: 'Filter : '
      }
    };

    function callAllTabsInSearchOption() {
      callAllTabs();
      return !vm.searchTypes.all;
    }

    function searchOptionValue(type) {
      if (type === 'all') {
        vm.searchTypes.all = vm.searchTypes.all === true ? true : callAllTabsInSearchOption();
      } else {
        vm.searchTypes.all = false;
      }
      if (vm.searchTypes.all) {
        vm.searchTypes.product = false;
        vm.searchTypes.part = false;
        vm.searchTypes.document = false;
        vm.searchTypes.task = false;
        vm.searchTypes.card = false;
      }
    }

    function changesearchtext(e) {
      if (!angular.isUndefined(e)) {
        if (e.keyCode === 13) {
          if (vm.keyword != '') {
            getdatabysearch();
          }
        }
      }
    }

    function clearSearch() {
      vm.keyword = '';
      vm.products = [];
      vm.productsLatest = [];
      if (vm.manufaturersTableOptions) {
        vm.manufaturersTableOptions.data = [];
      }
      if (vm.manufacturerPartsTableOptions) {
        vm.manufacturerPartsTableOptions.data = [];
      }
      if (vm.supplierTableOptions) {
        vm.supplierTableOptions.data = [];
      }
      if (vm.supplierPartsTableOptions) {
        vm.supplierPartsTableOptions.data = [];
      }
      if (vm.productTableOptions) {
        vm.productTableOptions.data = [];
      }
      if (vm.partTableOptions) {
        vm.partTableOptions.data = [];
      }
      if (vm.documentsTableOptions) {
        vm.documentsTableOptions.data = [];
      }

      vm.count.cardCount = 0;
      vm.count.taskCount = 0;
      vm.count.partCount = 0;
      vm.count.productCount = 0;
      vm.count.manufacturerCount = 0;
      vm.count.manufacturerPartCount = 0;
      vm.count.supplierCount = 0;
      vm.count.supplierPartCount = 0;
      vm.count.documentCount = 0;
    }

    $scope.currentPage = 0;
    $scope.pageSize = 20;
    $scope.startIndex = 0;
    $scope.endIndex = $scope.pageSize;

    // paging varialbles for tasks
    $scope.currentPageForTasks = 0;
    $scope.pageSizeForTasks = 20;
    $scope.startIndexForTasks = 0;
    $scope.endIndexForTasks = $scope.pageSizeForTasks;

    $scope.numberOfPages = function () {
      vm.card = [];
      angular.forEach(vm.products, function (value, key) {
        if (value.type == 'card') {
          vm.card.push(value);
        }
      });
      return Math.ceil(vm.card.length / $scope.pageSize);
    };

    vm.countFunction = countFunction;
    vm.countFunctionForTasks = countFunctionForTasks;
    vm.countprevous = countprevous;
    vm.countprevousFortasks = countprevousFortasks;

    function countFunction() {
      $scope.currentPage = $scope.currentPage + 1;
      $scope.startIndex = $scope.endIndex;
      $scope.endIndex = $scope.endIndex + $scope.pageSize;
      if ($scope.endIndex > vm.count.cardCount) {
        $scope.endIndex = vm.count.cardCount;
      }
    }

    function countFunctionForTasks() {
      $scope.currentPageForTasks = $scope.currentPageForTasks + 1;
      $scope.startIndexForTasks = $scope.endIndexForTasks;
      $scope.endIndexForTasks = $scope.endIndexForTasks + $scope.pageSizeForTasks;
      if ($scope.endIndexForTasks > vm.count.taskCount) {
        $scope.endIndexForTasks = vm.count.taskCount;
      }

    }

    function countprevous() {
      $scope.currentPage = $scope.currentPage - 1;
      $scope.endIndex = $scope.startIndex;
      $scope.startIndex = $scope.startIndex - $scope.pageSize;
    }

    function countprevousFortasks() {
      $scope.currentPageForTasks = $scope.currentPageForTasks - 1;
      $scope.endIndexForTasks = $scope.startIndexForTasks;
      $scope.startIndexForTasks = $scope.startIndexForTasks - $scope.pageSizeForTasks;
    }

    function buildMfrSuppAttributes(arr, mfr, supp) {
      if (mfr) {
        angular.forEach((mfr || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-cell.html';
            if (o.value === 'mfrObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-number-with-button-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'mfrObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/mfr-object-name.html';
            }
            //colDef.field = 'mfrList[0].' + o.value;
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }

      if (supp) {
        angular.forEach((supp || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-cell.html';
            if (o.value === 'suppObjectNumber') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-number-with-button-cell.html';
              colDef.headerCellTemplate = sourcingUtils.getSourcingHeaderTemplate();
            }
            if (o.value === 'suppObjectName') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/supp-object-name.html';
            }
            //colDef.field = 'suppList[0].' + o.value;
            colDef.name = o.value;
            arr.push(colDef);
          }
        });
      }
      arr.forEach(function (col) {
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      return arr;
    }

    function buildProductTableColumns() {

      if (localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsSearchPage)) &&
        angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsSearchPage)))[0].objectList) {
        vm.attrProductsSearchInventory = angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsSearchPage)));
      } else {
        vm.attrProductsSearchInventory = attributesUtils.getDefaultPartsProductsInventoryAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsSearchPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.productsSearchPage), angular.toJson(vm.attrProductsSearchInventory));
      }

      var arr = [];
      arr = angular.copy(attributesUtils.getBasicProductPageAttributes());

      if (vm.attrProductsSearchBasic) {

        angular.forEach((vm.attrProductsSearchBasic || []), function (o, i) {

          if (o.displayed) {

            var colDef = fuseUtils.parseAttributes(o);

            if (o.value === 'totalCost') {
              colDef.visible = false;
            }

            if (o.value === 'shortage') {
              colDef.visible = false;
            }
            if (o.value === 'fuseCost') {
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            }

            if (o.value === 'requiredQty') {
              colDef.visible = false;
            }

            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }

            if (o.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings)
                return;

              colDef.enableCellEdit = false;
            }

            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            arr.push(colDef);

          }

        });

      }

      if (vm.attrProductsSearchInventory) {
        angular.forEach((vm.attrProductsSearchInventory || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            colDef.type = 'number';
            arr.push(colDef);
          }
        });
      }

      if (vm.attrProductsSearchAdditional) {
        angular.forEach((vm.attrProductsSearchAdditional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            }

            arr.push(colDef);
          }
        });
      }

      if (vm.attrProductsSearchObjectHistory) {
        angular.forEach((vm.attrProductsSearchObjectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return buildMfrSuppAttributes(arr, vm.attrProductsSearchPageMfr, vm.attrProductsSearchPageSupp);
    }

    /**
     * construct part table list
     * @returns {Array}
     */
    function buildPartTableColumns() {
      if (localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsSearchPage)) &&
        angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsSearchPage)))[0].objectList) {
        vm.attrPartsSearchPageInventory = angular.fromJson(localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsSearchPage)));
      } else {
        vm.attrPartsSearchPageInventory = attributesUtils.getDefaultPartsProductsInventoryAttributes();
        localStorage.removeItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsSearchPage));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesInventory", objectPageEnum.partsSearchPage), angular.toJson(vm.attrPartsSearchPageInventory));
      }

      var arr = [];
      arr = angular.copy(attributesUtils.getBasicPartsPageAttributes());

      if (vm.attrPartsSearchPageBasic) {
        angular.forEach((vm.attrPartsSearchPageBasic || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value === 'totalCost') {
              colDef.visible = false;
            }
            if (o.value === 'shortage') {
              colDef.visible = false;
            }
            if (o.value === 'requiredQty') {
              colDef.visible = false;
            }
            if (o.value === 'fuseCost') {
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            }
            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            if (o.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings)
                return;

              colDef.enableCellEdit = false;
            }
            arr.push(colDef);
          }
        });
      }

      if (vm.attrPartsSearchPageInventory) {
        angular.forEach((vm.attrPartsSearchPageInventory || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
            colDef.type = 'number';
            arr.push(colDef);
          }
        });
      }

      if (vm.attrPartsSearchPageAdditional) {
        angular.forEach((vm.attrPartsSearchPageAdditional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            }

            arr.push(colDef);
          }
        });
      }

      if (vm.attrPartsSearchPageObjectHistory) {
        angular.forEach((vm.attrPartsSearchPageObjectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return buildMfrSuppAttributes(arr, vm.attrPartsSearchPageMfr, vm.attrPartsSearchPageSupp);
    }

    function buildDocumentTableColumns() {
      var arr = [];
      arr = angular.copy(attributesUtils.getBasicDocumentsPageAttributes());

      if (vm.attrDocumentsSearchPageBasic) {
        angular.forEach((vm.attrDocumentsSearchPageBasic || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value == 'totalCost') {
              colDef.visible = false;
            }
            if (o.value == 'shortage') {
              colDef.visible = false;
            }
            if (o.value == 'requiredQty') {
              colDef.visible = false;
            }
            if (o.value === 'isLatest') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/is-latest-cell-template.html';
            }
            if (o.value === 'configurationsForDropdown') {
              if (!vm.configurationSettings)
                return;

              colDef.enableCellEdit = false;
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            arr.push(colDef);
          }
        });
      }

      if (vm.attrDocumentsSearchPageAdditional) {
        angular.forEach((vm.attrDocumentsSearchPageAdditional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            }

            arr.push(colDef);
          }
        });
      }

      if (vm.attrDocumentsSearchPageObjectHistory) {
        angular.forEach((vm.attrDocumentsSearchPageObjectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    initAttributes();

    /**
     * table configurations
     * @type {{
     *  initialized: boolean,
     *  columnDefs: *,
     *  showTreeExpandNoChildren: boolean, showTreeRowHeader: boolean, data: Array,
     *  enableColumnReordering: boolean, enableColumnResizing: boolean, enableSorting: boolean,
     *  enableFiltering: boolean, exporterPdfDefaultStyle: {fontSize: number},
     *  exporterPdfTableStyle: {margin: [*]}, exporterPdfOrientation: string,
     *  exporterPdfPageSize: string, rowHeight: number, enableHorizontalScrollbar: number,
     *  paginationPageSize: number, paginationPageSizes: [*],
     *  onRegisterApi: ProductsController.productTableOptions.onRegisterApi
     * }}
     */

    vm.buildProductTable = buildProductTable;

    function buildProductTable(grid) {
      if (grid) {
        vm.productTableOptions.initialized = false;
        restoreState(grid, vm.productsId, vm.objectPageEnum.productsSearchPage);
        return;
      }
      vm.productTableOptions = {
        initialized: false,
        columnDefs: buildProductTableColumns(),
        showTreeExpandNoChildren: false,
        showTreeRowHeader: false,
        data: [],
        enableColumnReordering: true,
        enableColumnResizing: true,
        enableSorting: true,
        enableFiltering: true,
        exporterCsvFilename: 'productslist-search.csv',
        exporterOlderExcelCompatibility: true,
        exporterPdfDefaultStyle: {
          fontSize: 9
        },
        exporterPdfTableStyle: {
          margin: [30, 30, 0, 30]
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'LETTER',
        rowHeight: 30,
        minRowsToShow: 12,
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

          "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
        exporterSuppressColumns: ['bomId', 'objectId'],
        //enableFiltering: true,
        onRegisterApi: function (gridApi) {

          // Keep a reference to the gridApi.
          vm.productTableUiGrid = gridApi;
          restoreState(vm.productTableUiGrid, productsId, objectPageEnum.productsSearchPage);

          // Setup events so we're notified when grid state changes.

          vm.productTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
            if (!rowsNumber)
              return;

            if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
              fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.productsSearchPage);
            } else {
              fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.productsSearchPage);
            }
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
            vm.heightTopPanelProducts = $('#grid-products-search-page .ui-grid-top-panel').height();
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.core.on.filterChanged($scope, function () {
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.core.on.sortChanged($scope, function () {
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });
          vm.productTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
            if (vm.productTableOptions.initialized) {
              let gridCol;
              _.forEach(gridApi.grid.columns, function (val) {
                if (val.field === colDef.field) {
                  gridCol = val;
                }
              });
              if(gridCol) {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
                $timeout(function () {
                  uiGridGridMenuService.toggleColumnVisibility(gridCol);
                }, 0);
              }
            }
            saveState(gridApi, productsId, objectPageEnum.productsSearchPage);
          });

          vm.productTableUiGrid.core.on.renderingComplete($scope, function () {
            //code to execute
          });

          vm.productTableUiGrid.core.on.scrollBegin($scope, function () {
          });

          vm.productTableUiGrid.core.on.scrollEnd($scope, function () {
          });

          vm.productTableUiGrid.core.on.rowsRendered($scope, function () {
            if ((vm.productTableOptions.data.length > 0) && !vm.productTableOptions.initialized) {
              $timeout(() => {
                vm.productTableOptions.initialized = true;
              });
            }
            const viewports = $('.ui-grid-header-viewport');
            viewports.each((index) => {
              viewports[index].style.height = 70 + 'px';
              viewports[index].childNodes[0].style.height = 70 + 'px';
            });
            bindGridData();
            showClearButton(vm.productTableUiGrid);
            vm.productTableUiGrid.core.handleWindowResize();
            vm.heightTopPanelProducts = $('#grid-products-search-page .ui-grid-top-panel').height();
          });

        }
      };
    }

    vm.buildPartTable = buildPartTable;

    function buildPartTable(grid) {
      if (grid) {
        vm.partTableOptions.initialized = false;
        restoreState(grid, vm.partsId, vm.objectPageEnum.partsSearchPage);
        return;
      }
      vm.partTableOptions = {
        exporterFieldCallback: function (grid, row, col, value) {
          if (col.name === 'associatedCardsList') {
            value = value ? value.length !== 0 : '';
          }
          return value;
        },
        initialized: false,
        columnDefs: buildPartTableColumns(),
        showTreeExpandNoChildren: false,
        showTreeRowHeader: false,
        data: [],
        enableColumnReordering: true,
        enableColumnResizing: true,
        enableSorting: true,
        enableFiltering: true,
        exporterCsvFilename: 'partslist-search.csv',
        exporterOlderExcelCompatibility: true,
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
        minRowsToShow: 12,
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

          "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
        //enableFiltering: true,
        exporterSuppressColumns: ['bomId', 'objectId'],
        onRegisterApi: function (gridApi) {

          // Keep a reference to the gridApi.
          vm.partTableUiGrid = gridApi;
          restoreState(vm.partTableUiGrid, partsId, objectPageEnum.partsSearchPage);

          // Setup events so we're notified when grid state changes.
          vm.partTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
            if (!rowsNumber)
              return;

            if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
              fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.partsSearchPage);
            } else {
              fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.partsSearchPage);
            }
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });
          vm.partTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });

          vm.partTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
            vm.heightTopPanelParts = $('#grid-parts-search-page  .ui-grid-top-panel').height();
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });

          vm.partTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });

          vm.partTableUiGrid.core.on.filterChanged($scope, function () {
            $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });

          vm.partTableUiGrid.core.on.sortChanged($scope, function () {
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });
          vm.partTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
            if (vm.partTableOptions.initialized) {
              let gridCol;
              _.forEach(gridApi.grid.columns, function (val) {
                if (val.field === colDef.field) {
                  gridCol = val;
                }
              });
              if(gridCol) {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
                $timeout(function () {
                  uiGridGridMenuService.toggleColumnVisibility(gridCol);
                }, 0);
              }
            }
            saveState(gridApi, partsId, objectPageEnum.partsSearchPage);
          });

          vm.partTableUiGrid.core.on.renderingComplete($scope, function () {
            //code to execute
          });

          vm.partTableUiGrid.core.on.scrollBegin($scope, function () {
          });
          vm.partTableUiGrid.core.on.scrollEnd($scope, function () {
          });

          vm.partTableUiGrid.core.on.rowsRendered($scope, function () {
            if ((vm.partTableOptions.data.length > 0) && !vm.partTableOptions.initialized) {
              $timeout(function () {
                vm.partTableOptions.initialized = true;
              });
            }
            const viewports = $('.ui-grid-header-viewport');
            viewports.each((index) => {
              viewports[index].style.height = 70 + 'px';
              viewports[index].childNodes[0].style.height = 70 + 'px';
            });
            bindGridData();
            showClearButton(vm.partTableUiGrid);
            vm.partTableUiGrid.core.handleWindowResize();
            vm.heightTopPanelParts = $('#grid-parts-search-page .ui-grid-top-panel').height();
          });

        }
      };
    }



    $scope.$watch(() => {
      if (vm.searchTab === 'Products') {
        const gridElem = document.getElementById(vm.productsId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 250}px`;
        }
      }
      if (vm.searchTab === 'Parts') {
        const gridElem = document.getElementById(vm.partsId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 250}px`;
        }
      }
      if (vm.searchTab === 'Documents') {
        const gridElem = document.getElementById(vm.documentsId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 250}px`;
        }
      }
      if (vm.searchTab === 'Manufacturers') {
        const gridElem = document.getElementById(vm.manufacturerId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 274}px`;
        }
      }
      if (vm.searchTab === 'Manufacturer Parts') {
        const gridElem = document.getElementById(vm.manufacturerPartsId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 274}px`;
        }
      }
      if (vm.searchTab === 'Suppliers') {
        const gridElem = document.getElementById(vm.supplierId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 274}px`;
        }
      }
      if (vm.searchTab === 'Supplier Parts') {
        const gridElem = document.getElementById(vm.supplierPartsId);
        if (gridElem) {
          gridElem.style.height = `${document.documentElement.clientHeight - gridElem.offsetTop - 274}px`;
        }
      }
    });

    vm.buildDocumentsTable = buildDocumentsTable;

    function buildDocumentsTable(grid) {
      if (grid) {
        vm.documentsTableOptions.initialized = false;
        restoreState(grid, vm.documentsId, vm.objectPageEnum.documentsSearchPage);
        return;
      }
      vm.documentsTableOptions = {
        initialized: false,
        columnDefs: buildDocumentTableColumns(),
        showTreeExpandNoChildren: false,
        showTreeRowHeader: false,
        data: [],
        enableColumnReordering: true,
        enableColumnResizing: true,
        enableSorting: true,
        enableFiltering: true,
        exporterCsvFilename: 'documentslist-search.csv',
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
        minRowsToShow: 12,
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

          "</select><span class=\"ui-grid-pager-row-count-label\">&nbsp;{{sizesLabel}}</span></div></div><div class=\"ui-grid-pager-count-container\"><div class=\"ui-grid-pager-count\"><span ng-show=\"grid.options.totalItems > 0\">{{1 + paginationApi.getFirstRowIndex()}} - {{1 + paginationApi.getLastRowIndex()}} {{paginationOf}} {{grid.options.totalItems}} {{totalItemsLabel}}</span></div></div></div>",
        exporterSuppressColumns: ['bomId', 'objectId'],
        //enableFiltering: true,
        onRegisterApi: function (gridApi) {

          // Keep a reference to the gridApi.
          vm.documentsTableUiGrid = gridApi;
          restoreState(vm.documentsTableUiGrid, vm.documentsId, vm.objectPageEnum.documentsSearchPage);

          // Setup events so we're notified when grid state changes.
          vm.documentsTableUiGrid.pagination.on.paginationChanged($scope, function (pageNumber, rowsNumber) {
            if (!rowsNumber)
              return;

            if (rowsNumber !== 25 && rowsNumber !== 50 && rowsNumber !== 75 && rowsNumber !== 100) {
              fuseUtils.setIsAllPaginationPageSize(true, objectPageEnum.documentsSearchPage);
            } else {
              fuseUtils.setIsAllPaginationPageSize(false, objectPageEnum.documentsSearchPage);
            }
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });
          vm.documentsTableUiGrid.colMovable.on.columnPositionChanged($scope, function () {
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });

          vm.documentsTableUiGrid.colResizable.on.columnSizeChanged($scope, function () {
            vm.heightTopPanelDocuments = $('#grid-documents-search-page .ui-grid-top-panel').height();
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });

          vm.documentsTableUiGrid.core.on.columnVisibilityChanged($scope, function () {
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });
          vm.documentsTableUiGrid.core.on.filterChanged($scope, function () {
            $('.ui-grid-icon-cancel').addClass('ui-grid-cancel-margin');
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });
          vm.documentsTableUiGrid.core.on.sortChanged($scope, function () {
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });
          vm.documentsTableUiGrid.pinning.on.columnPinned($scope, function (colDef) {
            if (vm.documentsTableOptions.initialized) {
              let gridCol;
              _.forEach(gridApi.grid.columns, function (val) {
                if (val.field === colDef.field) {
                  gridCol = val;
                }
              });
              if(gridCol) {
                uiGridGridMenuService.toggleColumnVisibility(gridCol);
                $timeout(function () {
                  uiGridGridMenuService.toggleColumnVisibility(gridCol);
                }, 0);
              }
            }
            saveState(gridApi, documentsId, objectPageEnum.documentsSearchPage);
          });

          vm.documentsTableUiGrid.core.on.renderingComplete($scope, function () {
            //code to execute
          });

          vm.documentsTableUiGrid.core.on.scrollBegin($scope, function () {
          });
          vm.documentsTableUiGrid.core.on.scrollEnd($scope, function () {
          });

          vm.documentsTableUiGrid.core.on.rowsRendered($scope, function () {

            if ((vm.documentsTableOptions.data.length > 0) && !vm.documentsTableOptions.initialized) {
              $timeout(function () {
                vm.documentsTableOptions.initialized = true;
              });
            }
            const viewports = $('.ui-grid-header-viewport');
            viewports.each((index) => {
              viewports[index].style.height = 70 + 'px';
              viewports[index].childNodes[0].style.height = 70 + 'px';
            });
            bindGridData();
            showClearButton(vm.documentsTableUiGrid);
            vm.documentsTableUiGrid.core.handleWindowResize();
            vm.heightTopPanelDocuments = $('#grid-documents-search-page  .ui-grid-top-panel').height();
          });
        }
      };
    }




    vm.clearFilters = clearFilters;

    function clearFilters(gridInstance, id, type) {
      gridInstance.grid.clearAllFilters();
      gridInstance.grid.resetColumnSorting(gridInstance.grid.getColumnSorting());
      _.forEach(gridInstance.grid.columns, function (column) {
        if (column.isPinnedLeft() || column.isPinnedRight()) {
          gridInstance.pinning.pinColumn(column, uiGridPinningConstants.container.NONE);
        }
      });
      saveState(gridInstance, id, type);
    }


    function showClearButton(gridApi) {
      vm.clearSearchButton = false;
      vm.clearSearchButton = fuseUtils.buttonForClear(gridApi, vm.clearSearchButton);
    }

    function getAttributes(type) {
      var obj = {};
      var attributesBasic = localStorage.getItem(fuseUtils.buildAttributeName("attributesBasic", type)),
        attributesAdditional = localStorage.getItem(fuseUtils.buildAttributeName("attributesAdditional", type)),
        attributesContacts = localStorage.getItem(fuseUtils.buildAttributeName("attributesContacts", type)),
        attributesInventory = localStorage.getItem(fuseUtils.buildAttributeName("attributesInventory", type)),
        attributesCost = localStorage.getItem(fuseUtils.buildAttributeName("attributesCost", type)),
        attributesObjectHistory = localStorage.getItem(fuseUtils.buildAttributeName("attributesObjectHistory", type));

      if (attributesBasic && attributesBasic != 'undefined' &&
        (_.find(angular.fromJson(attributesBasic), {name: "Website"}) || type == objectPageEnum.searchMfrPartsPage || type == objectPageEnum.searchSuppPartsPage)) {
        obj.basicInfo = angular.fromJson(attributesBasic);
      } else {
        if (type == objectPageEnum.searchMfrPage) {
          obj.basicInfo = attributesUtils.getManufacturerBasicAttributes();
        } else if (type == objectPageEnum.searchSuppPage) {
          obj.basicInfo = attributesUtils.getSupplierBasicAttributes();
        } else if (type == objectPageEnum.searchMfrPartsPage) {
          obj.basicInfo = attributesUtils.getManufacturerPartsBasicAttributes();
        } else if (type == objectPageEnum.searchSuppPartsPage) {
          obj.basicInfo = attributesUtils.getSupplierPartsBasicAttributes();
        }

        localStorage.removeItem(fuseUtils.buildAttributeName("attributesBasic", type));
        localStorage.setItem(fuseUtils.buildAttributeName("attributesBasic", type), JSON.stringify(obj.basicInfo));
      }
      if (attributesContacts && attributesContacts != 'undefined') {
        obj.contacts = angular.fromJson(attributesContacts);
      }
      if (attributesInventory && attributesInventory != 'undefined') {
        obj.inventory = angular.fromJson(attributesInventory);
      }
      if (attributesCost && attributesCost != 'undefined') {
        obj.cost = angular.fromJson(attributesCost);
      } else {
        obj.cost = attributesUtils.getSupplierManufacturerPartsCostAttributes();
      }
      if (attributesAdditional && attributesAdditional != 'undefined') {
        obj.additional = angular.fromJson(attributesAdditional);
      }
      if (attributesObjectHistory) {
        obj.objectHistory = angular.fromJson(attributesObjectHistory);
      }
      return obj;
    }

    function setHeaderHeight(grid, row, col, rowRenderIndex, colRenderIndex) {
      var isColumnHigh = grid.columns.some(function (col) {
        return col.displayName.length > 24;
      });

      return isColumnHigh ? 'cell-height-70' : 'cell-height-50';
    }

    function buildTableColumns(type) {
      var attributes = getAttributes(type);
      var arr = [];
      if (type === objectPageEnum.searchMfrPage || type === objectPageEnum.searchMfrPartsPage) {
        arr = angular.copy(attributesUtils.getBasicSourcingManufacturerPageAttributes());
      } else {
        arr = angular.copy(attributesUtils.getBasicSourcingSupplierPageAttributes());
      }

      if (attributes.basicInfo) {
        angular.forEach((attributes.basicInfo || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o);
            if (o.value === 'objectName' || o.value === 'name') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/object-name-cell.html';
            }
            if (o.value === 'associatedCardsList') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/associated-cards-cell-template.html';
              colDef.headerCellTemplate = '<div class="associated-cards-header-container"><md-tooltip class="md-tooltip">Associated Cards</md-tooltip><i class="icon s16 icon-trello associated-cards-icon" aria-label="Boards"><!----><!----></i></div>';
            }
            if (o.value === 'leadTime') {
              colDef.sortingAlgorithm = fuseUtils.sortLeadTime;
            }
            arr.push(colDef);
          }
        });
      }

      if (attributes.additional) {
        angular.forEach((attributes.additional || []), function (o, i) {
          if (o.displayed) {
            var colDef = fuseUtils.parseAttributes(o, true);
            if (o.attributeType === 'Link') {
              colDef.cellTemplate = 'app/main/apps/objects/module-templates/cell/link-attribute-template.html';
            }

            arr.push(colDef);
          }
        });
      }

      if (type == objectPageEnum.searchMfrPage || type == objectPageEnum.searchSuppPage) {
        if (attributes.contacts && attributes.contacts[0].value == 'contactsName') {
          angular.forEach((attributes.contacts || []), function (o, i) {
            if (o.displayed) {
              arr.push(fuseUtils.parseAttributes(o));
            }
          });
        } else {
          localStorage.removeItem(fuseUtils.buildAttributeName("attributesContacts", type));
        }
      } else {
        if (attributes.inventory) {
          angular.forEach((attributes.inventory || []), function (o, i) {
            if (o.displayed) {
              let colDef = fuseUtils.parseAttributes(o);
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              arr.push(colDef);
            }
          });
        }
        if (attributes.cost) {
          angular.forEach((attributes.cost || []), function (o, i) {
            if (o.displayed) {
              let colDef = fuseUtils.parseAttributes(o);
              colDef.sortingAlgorithm = fuseUtils.alphanumericSort;
              arr.push(colDef);
            }
          });
        }
      }
      if (attributes.objectHistory) {
        angular.forEach((attributes.objectHistory || []), function (o, i) {
          if (o.displayed) {
            arr.push(fuseUtils.parseAttributes(o));
          }
        });
      }

      arr.forEach(function (col, ind, columns) {
        // col.headerCellClass = setHeaderHeight;
        if (!col.headerCellTemplate && col.displayName) {
          col.headerCellTemplate = fuseUtils.getCommonHeaderTemplate();
        }
      });

      setTemplateForAttachmentsColumn(arr);

      return arr;
    }

    function saveState(grid, id, type) {
      var state = grid.saveState.save();
      $window.localStorage.setItem(fuseUtils.buildAttributeName(id, type), angular.toJson(state));
    }

    /**
     * Restore Grid state
     */
    function restoreState(grid, id, type) {
      if (!grid) {
        return;
      }

      $timeout(function () {
        var state = $window.localStorage.getItem(fuseUtils.buildAttributeName(id, type));
        state = state ? angular.fromJson(state) : null;
        if (type === objectPageEnum.productsSearchPage) {
          fuseUtils.moveColumnToFirstPosition(grid, $scope, 'associatedCardsList');
        } else if (type === objectPageEnum.partsSearchPage) {
          fuseUtils.moveColumnToFirstPosition(grid, $scope, 'associatedCardsList');
        } else if (type === objectPageEnum.documentsSearchPage) {
          fuseUtils.moveColumnToFirstPosition(grid, $scope, 'associatedCardsList');
        }
        if (!state) {
          return;
        }
        showClearButton(grid);
        var pageSize = state.pagination.paginationPageSize;
        if (pageSize !== 25 && pageSize !== 50 && pageSize !== 75 && pageSize !== 100) {
          fuseUtils.setIsAllPaginationPageSize(true, type);
          state.pagination.paginationPageSize = 100;
        }
        if (state) grid.saveState.restore($scope, state);
      });
    }

    function proxyDetails() {
      let endWatch = $rootScope.$watch('currencySetting', value  => {
        if (value !== undefined) {
          vm.currencySetting = $rootScope.currencySetting;
          vm.configurationSettings = $rootScope.configurationSettings;
          if ($rootScope.enableProducts) {
            buildProductTable();
          } else {
            buildPartTable();
          }
          endWatch();
        }
      });
    }

    function getallUsers(response) {
          vm.progress = false;
          switch (response.code) {
            case 0:
              vm.allUsers = response.data.Members;
              break;
            case 4006:
              break;
            default:
          }
    }

    function toggleSourcingGridRow(row) {
      if (vm.searchTab == 'Products') {
        uiGridTreeBaseService.toggleRowTreeState(vm.productTableUiGrid.grid, row);
      } else {
        uiGridTreeBaseService.toggleRowTreeState(vm.partTableUiGrid.grid, row);
      }
    }

    function tabSearch(val) {
      vm.searchTab = val;
    }

    function setTemplateForAttachmentsColumn(arr) {
      var attachmentsColumn = _.find(arr, {field: 'hasAttachments'});
      if (!attachmentsColumn)
        return;

      attachmentsColumn.headerCellTemplate = '<div class="attachments-cell custom-column-header-container"><md-icon md-font-icon="icon-attachment" class="gly-rotate-45"></md-icon><md-tooltip class="md-tooltip">Attachments</md-tooltip></div>';
    }

    vm.cardDialogResponses = [];

    function getBoards(row) {
      var cardIds = row.entity.associatedCardsList;
      var promises = [];
      if (cardIds[0] === 'no access') {
        showOkPopup('Can not display card name because you do not have access to this board');
        return;
      }

      row.entity.cardsInfo = [];
      cardIds.forEach(function (cardId) {
        promises.push(BoardService.getBoardBycardId(cardId))
      });

      Promise.all(promises)
        .then(function (res) {
          row.entity.cardsDownloaded = true;
          res.forEach(function (r, i) {
            if (r.code !== 0) {
              cardIds[i] = '-1';
              return;
            }
            vm.cardDialogResponses.push(r);
            row.entity.cardsInfo.push(r.data);
          });
          cardIds = _.filter(cardIds, function (id) {
            return id !== '-1'
          });
          if (cardIds.length === 0) {
            cardIds[0] = 'no access';
            showOkPopup('Can not display card name because you do not have access to this board');
            return;
          }
          cardIds.forEach(function (card, i) {
            row.entity.cardsInfo[i].chosenCard = getCard(card, row.entity.cardsInfo[i]);
          });
          $scope.$digest();
        }, function () {
        })
    }

    function showOkPopup(message) {
      $mdMenu.hide();
      $mdDialog.show({
        clickOutsideToClose: true,
        preserveScope: false,
        template: '<div class="show-ok-popup-text">' + message + '</div><div><md-button class="show-ok-popup-button" ng-click="close()">Ok</md-button></div>',
        controller: function DialogController($scope, $mdDialog) {
          $scope.close = function () {
            $mdDialog.hide();
          }
        }
      }).then(function () {
      }, function () {
      });
    }

    function getCard(cardId, board) {
      var neededCard = _.find(board.cards, {id: cardId});
      return neededCard
    }

    function openCard(event, cardId, changePath, Tasks, Tags, standardView, affected) {
      var response = _.find(vm.cardDialogResponses, function (res) {
        return cardId === res.data.chosenCard.id;
      });
      DialogService.openCardDialog(event, cardId, changePath, Tasks, Tags, standardView, affected, response);
    }

    $scope.$on('SendUp', function () {
      $timeout(() => {
        $state.go('app.search.search', {}, {
          notify: false,
          reload: false
        });
        pageTitleService.setPageTitle('Search');
      }, 50);
    });

  }
})();
