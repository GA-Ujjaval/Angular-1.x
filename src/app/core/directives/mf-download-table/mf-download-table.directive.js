(function () {
  angular
    .module('app.core')
    .directive('mfDownloadTable', function (TemplatesService, templatesProcessingService, $mdToast, $mdMenu, objectPageEnum) {

      function link(scope) {
        var vm = scope;
        var optionsClosingHandler = new OptionsClosingHandler();
        vm.getTemplates = getTemplates;
        vm.downloadReport = downloadReport;
        vm.checkFilteredTemplates = checkFilteredTemplates;
        vm.closeNotUsedMenuOptions = denyFrequentCallsDecorator(optionsClosingHandler.closeNotUsedMenuOptions);
        vm.stopHover = optionsClosingHandler.stopHover;
        vm.toggleTemplateOptionChosen = optionsClosingHandler.toggleTemplateOptionChosen;
        vm.downloadAsIsOptionChosen = denyFrequentCallsDecorator(optionsClosingHandler.downloadAsIsOptionChosen);
        vm.isNothingMatched = false;
        vm.templateSearchText = '';
        vm.progress = false;


        vm.$on('$destroy', function () {
          TemplatesService.invalidateCache()
        });
        vm.$on('$mdMenuClose', function () {
          setTimeout(function () {
            if (vm.templates) {
              vm.templates.length = 0;
            }
            vm.$digest();
          });
          optionsClosingHandler.clearDownloadAsIs();
        });

        function denyFrequentCallsDecorator(func) {
          return function () {
            var now = new Date();
            var timeGap = now - (func.lastRun || now);
            func.lastRun = now;
            if ((timeGap > 350) || timeGap === 0) {
              func.apply(this, arguments);
            }
          }
        }

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
         * Downloads generated report
         * @param templateId - {string} the id of template to use for generating a report
         * @param type - {string} the type of report needed e.x. 'pdf'
         */
        function downloadReport(templateId, type) {
          const options = {
            templateId: templateId,
            objectId: vm.objectId,
            type: type, targetQuantity: vm.targetQuantity,
            userActionStory: angular.copy(vm.userActionsRegistry.getStory(vm.pageType)),
            expandedRows: vm.pageType === objectPageEnum.heirarchicalPage ? getExpandedRows(vm.gridApi.grid.rows) : undefined
          };
          vm.$emit('loading started');
          TemplatesService.generateReport(options)
            .then(function (res) {
              vm.$emit('loading done');
              if (res.status === -1) {
                $mdToast.show($mdToast.simple().textContent('Something went wrong, please, try later').position('top right'));
              } else {
                downloadBlob(res, type)
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

        function downloadBlob(res, type) {
          var contentType = type === 'pdf' ? 'application/pdf' : 'text/csv;charset=UTF-8';
          var blob = new Blob([res], {type: contentType});
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = vm.objectId + (type === 'pdf' ? '.pdf' : '.csv');
          document.body.appendChild(link);
          link.click();
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
                  .textContent('NOTE: "Download" downloads objects from level 1 to the expanded level of hierarchy.' +
                    ' To download the entire hierarchy, expand all levels of hierarchy and then click "download".')
                  .position('top right')
                  .toastClass('md-multiline-toast-theme'));
                vm.templates = _.filter(res.data, function (template) {
                  return template.visibility === 'VDP';
                });
                vm.templates.forEach(function (template) {
                  template.fullName = template.isDefault ? template.templateName + ' (default)' : template.templateName;
                });
                setAppliedTemplateMark(vm.templates, templatesProcessingService.getAppliedTempalteId(vm.pageType));
                vm.progress = false;
              }, function (err) {
                console.info('err', err)
              })
        }

        /**
         * Turns on the checkbox near applied template, to show, that it is applied
         * @param templates - {array} array of templates
         * @param templateId - {string} the id of template to be turned on
         */
        function setAppliedTemplateMark(templates, templateId) {
          templates.forEach(function (template) {
            template.applied = false;
          });
          var template = _.find(templates, {templateId: templateId});
          template && (template.applied = true);
        }

        function OptionsClosingHandler() {
          var isDownloadAsIsChosen = false;

          this.downloadAsIsOptionChosen = downloadAsIsOptionChosen;
          this.stopHover = stopHover;
          this.toggleTemplateOptionChosen = toggleTemplateOptionChosen;
          this.closeNotUsedMenuOptions = closeNotUsedMenuOptions;
          this.clearDownloadAsIs = clearDownloadAsIs;

          function clearDownloadAsIs() {
            isDownloadAsIsChosen = false;
          }

          function downloadAsIsOptionChosen() {
            var newValue = !isDownloadAsIsChosen;
            isDownloadAsIsChosen = newValue;

            if (newValue === false) {
              $mdMenu.hide()
            }

            vm.templates
              .filter(function (template) {
                return template.isOptionChosen
              })
              .forEach(closeChosenOption);
          }

          function closeChosenOption(template) {
            template.isOptionChosen = false;
            $mdMenu.hide()
          }

          function stopHover(event) {
            event.stopImmediatePropagation();
          }

          function toggleTemplateOptionChosen(template) {
            template.isOptionChosen = !template.isOptionChosen;
          }

          function closeNotUsedMenuOptions(clickedTemplate) {

            if (isDownloadAsIsChosen) {
              $mdMenu.hide();
              isDownloadAsIsChosen = false;
            }
            if (!clickedTemplate.isOptionChosen) {
              $mdMenu.hide();
              return;
            }

            var openedTemplates = vm.templates.filter(function (template) {
              return template.isOptionChosen
            });
            if (openedTemplates.length > 1) {
              openedTemplates
                .filter(function (template) {
                  return template.templateId !== clickedTemplate.templateId
                })
                .forEach(closeChosenOption)
            }
          }
        }

      }

      return {
        templateUrl: 'app/core/directives/mf-download-table/mf-download-table-directive.html',
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
