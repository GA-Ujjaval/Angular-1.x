(function () {
  angular
    .module('app.core')
    .directive('mfPrintTable', function (TemplatesService, templatesProcessingService, $mdToast, objectPageEnum) {

      function link(scope) {
        var vm = scope;
        vm.getTemplates = getTemplates;
        vm.downloadReport = downloadReport;
        vm.checkFilteredTemplates = checkFilteredTemplates;
        vm.isNothingMatched = false;
        vm.templateSearchText = '';
        vm.progress = false;

        vm.$on('$destroy', function () {
          TemplatesService.invalidateCache()
        });
        vm.$on('$mdMenuClose', function () {
          setTimeout(function () {
            vm.templates.length = 0;
            vm.$digest();
          });
        });

        /**
         * Filteres tempaltes by their names and switchs on and off
         * message about not found templates
         * @param searchText - text, entered by user
         */
        function checkFilteredTemplates(searchText) {
          if (!vm.templates) return;
          vm.isNothingMatched = vm.templates.filter(function (template) {
            return template.fullName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
          }).length === 0;
        }

        /**
         * Downloads report generated with mentioned template
         * @param templateId - {string} the id of template to be used for generating a report
         */
        function downloadReport(templateId) {
          var options = {
            templateId: templateId,
            objectId: vm.objectId,
            targetQuantity: vm.targetQuantity,
            userActionStory: angular.copy(vm.userActionsRegistry.getStory(vm.pageType)),
            expandedRows: vm.pageType === objectPageEnum.heirarchicalPage ? getExpandedRows(vm.gridApi.grid.rows)
              : undefined
          };

          TemplatesService.generateReport(options)
            .then(function (res) {
              if (res.status === -1) {
                $mdToast.show($mdToast.simple().textContent('Something went wrong, please, try later')
                  .position('top right'));
              } else {
                printBlob(res)
              }
            })
        }

        var ROW_EXPANDED = 'expanded';
        var ROW_COLLAPSED = 'collapsed';

        function getExpandedRows(gridRows) {
          return gridRows
            .filter(isRowExpanded)
            .map(function (gridRow) {
              return gridRow.entity.parentIndex
            });
        }

        function isRowExpanded(gridRow) {
          var treeNode = gridRow.treeNode;
          return (treeNode.state === ROW_EXPANDED) ||
            (treeNode.parentRow === null) ||
            (treeNode.state === ROW_COLLAPSED && treeNode.parentRow && treeNode.parentRow.treeNode.state === ROW_EXPANDED)
        }

        function printBlob(res) {
          var blob = new Blob([res], {type: 'application/pdf'});
          var newWin = window.open(window.URL.createObjectURL(blob), vm.objectId);
          newWin.print();
        }

        /**
         * function fills the dropdown with templates from server
         */
        function getTemplates() {
          vm.progress = true;

          TemplatesService.getTemplates(vm.pageType)
            .then(
              function (res) {
                $mdToast.show($mdToast.simple()
                  .textContent('NOTE: "Print" prints objects from level 1 to the expanded level of hierarchy. To print the entire hierarchy, expand all levels of hierarchy and then click "print".')
                  .position('top right')
                  .toastClass('md-multiline-toast-theme'));
                vm.templates = _.filter(res.data, function (template) {
                  return template.visibility === 'VDP';
                });
                vm.templates.forEach(function (template) {
                  template.fullName = template.isDefault ? template.templateName + ' (default)' : template.templateName;
                });

                // download table if there are no available templates
                if (vm.templates && vm.templates.length === 0) {
                  vm.downloadTable('pdf', 'print', vm.gridApi.grid, vm.gridOptions, vm.downloadDescription)
                }

                setAppliedTemplateMark(vm.templates, templatesProcessingService.getAppliedTempalteId(vm.pageType));
                vm.progress = false;
              }, function (err) {
                console.info('err', err)
              })
        }

        /**
         * Turns on the checkbox near the applied template
         * @param templates - {array} the array of templates to be used
         * @param templateId - {string} the id of template to be used
         */
        function setAppliedTemplateMark(templates, templateId) {
          templates.forEach(function (template) {
            template.applied = false;
          });
          var template = _.find(templates, {templateId: templateId});
          template && (template.applied = true);
        }
      }

      return {
        templateUrl: 'app/core/directives/mf-print-table/mf-print-table-directive.html',
        restrict: 'E',
        link: link,
        /**
         * @param downloadTable - {function} the function to download table
         * @param downloadDescription - {string} the string to describe needed download. ('flat' or 'hierarchical')
         */
        scope: {
          gridApi: '=',
          gridOptions: '=',
          downloadDescription: '=',
          downloadTable: '=',
          pageType: '=',
          objectId: '=',
          targetQuantity: '=',
          userActionsRegistry: '='
        }
      }
    });
})();
