/**
 * Directive is responsible for templates icon and templates functionality for table.
 * Provides ability to create, save, apply and delete templates.
 * E.x. used in BOM, both in flat and hierarchical views.
 */

(function () {
  angular
    .module('app.objects')
    .directive('mfTemplatesDropdown', function (TemplatesService, templatesProcessingService, hostUrlDevelopment,
                                                attributesUtils, uiGridConstants, fuseUtils, objectPageEnum,
                                                AttributesService, sourcingUtils, AuthService, $window, $mdToast,
                                                $mdDialog, $mdMenu) {

      function link(scope) {
        var sessionData = AuthService.getSessionData('customerData');

        var vm = scope;
        var optionsClosingHandler = new OptionsClosingHandler();

        vm.getTemplates = getTemplates;
        vm.openSettingsPopup = openSettingsPopup;
        vm.applyTemplate = applyTemplate;
        vm.removeTemplate = removeTemplate;
        vm.isCA = isUserRole('customer_admin');
        vm.isRO = isUserRole('read_only');
        vm.isUserEmpoweredToDelete = isUserEmpoweredToDelete;
        vm.checkFilteredTemplates = checkFilteredTemplates;

        vm.closeNotUsedMenuOptions = denyFrequentCallsDecorator(optionsClosingHandler.closeNotUsedMenuOptions);
        vm.stopHover = optionsClosingHandler.stopHover;
        vm.toggleTemplateOptionChosen = optionsClosingHandler.toggleTemplateOptionChosen;
        vm.downloadAsIsOptionChosen = denyFrequentCallsDecorator(optionsClosingHandler.downloadAsIsOptionChosen);

        vm.isNothingMatched = false;
        vm.templateSearchText = '';

        /**
         * watches the creating of api (needed because api is created asynchronously after the gridOptions)
         */
        vm.$watch('gridApi', function (newVal, oldVal) {
          if (newVal) {
            vm.gridApi.colResizable.on.columnSizeChanged(vm, function () {
              templatesProcessingService.setAppliedTemplateId(vm.pageType);
            });

            vm.gridApi.colMovable.on.columnPositionChanged(scope, function () {
              templatesProcessingService.setAppliedTemplateId(vm.pageType);
            });
          }
        });

        vm.$on('$destroy', function () {
          TemplatesService.invalidateCache()
        });
        vm.$on('$mdMenuClose', function () {
          setTimeout(function () {
            vm.templates && (vm.templates.length = 0);
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
         * Checks whether the user is the creator of the template or not
         * @param creatorId - {string} the ID of the template"s creator
         * @returns {boolean}
         */
        function isUserEmpoweredToDelete(creatorId) {
          return sessionData.userId === creatorId;
        }

        /**
         * This function returns function which checks, whether the user has
         * @param userRoleName - the role to be checked
         * @returns {function(): *}
         */
        function isUserRole(userRoleName) {
          return function () {
            return sessionData.userRoleSet.some(function (role) {
              return role === userRoleName
            })
          }
        }

        /**
         * function fill the dropdown with templates from server
         */
        function getTemplates() {
          vm.progress = true;

          TemplatesService.getTemplates(vm.pageType)
            .then(
              function (res) {
                vm.templates = res.data;
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
         * opens popup to create new template
         * @param event - {mouse click}
         * @param gridApi - {object} the api of the grid where the directive is used
         */
        function openSettingsPopup(event, gridApi, description, templateId) {
          getTableState(gridApi)
            .then(function (tableState) {
              var settings = {
                controller: 'CreateTemplateController',
                controllerAs: 'vm',
                templateUrl: 'app/core/directives/mf-templates-dropdown/create-template-template.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                targetEvent: event || null,
                locals: {
                  params: {
                    pageName: vm.pageType,
                    gridState: tableState,
                    description: description,
                    templateId: templateId
                  }
                }
              };

              openDialog(settings, function () {
                vm.templates.length = 0;
              }, null);

            });
        }

        var sectionMatcher = {
          attrBasicBOM: 'basic',
          attrInventoryBOM: 'inventory',
          attrObjectHistoryBOM: 'object history',
          mfrParts: 'manufacturer parts',
          suppParts: 'supplier parts',
          costAttribute: 'cost',
          defaultHierarchical: 'default',
          attrAdditionalBOM: 'additional'
        };

        /**
         * Returns the state of the table with matched sections
         * @param gridApi
         */
        function getTableState(gridApi) {
          var state = gridApi.saveState.save();
          return templatesProcessingService.getAllBomAttributes(vm.pageType)
            .then(function (attributes) {
              state.columns.forEach(function (column) {
                column.section = sectionMatcher.additional;
                angular.forEach(attributes, function (attributes, key) {
                  attributes.forEach(function (attribute) {
                    if (attribute.value === column.name || attribute.field === column.name) {
                      column.section = sectionMatcher[key];
                      column.name = attribute.attributeId || column.name;
                    }
                  });
                })
              });

              return state;
            });
        }

        /**
         * opens the dialog passed
         */
        function openDialog(settings, onResolve, onReject) {
          $mdDialog.show(settings).then(onResolve, onReject)
        }

        /**
         * applies template to the current table
         * @param templateId - {string} the id of the template to be applied to the table
         */
        function applyTemplate(templateId) {
          var promises = [];
          promises.push(templatesProcessingService.getAllBomAttributes(vm.pageType));
          promises.push(TemplatesService.getTemplateById(templateId));

          Promise.all(promises)
            .then(function (responses) {
              if (responses[1].code) {
                $mdToast.show($mdToast.simple().textContent(responses[1].message || responses[1].data).position('top right'));
                return;
              }
              var sections = responses[0];
              var gridState = responses[1].data.templateData;

              templatesProcessingService.matchDisplayedAttributes(gridState.columns, sections);

              vm.gridOptions.columnDefs = vm.buildTableColumns(sections);

              saveTableState(vm.pageType);
              templatesProcessingService.setBomAttributesToLocalstorage(sections, vm.pageType, vm.isConfigEnabled);
              setTableViewportHeight(vm.pageType);
              templatesProcessingService.setAppliedTemplateId(vm.pageType, templateId);
              setAppliedTemplateMark(vm.templates, templateId);

              vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);

              // this delay needed to work around ui grid bug
              // (without it, restoration works incorrectly for templates with same columns set, but different columns orders)
              setTimeout(function () {
                vm.gridApi.saveState.restore(vm, gridState);
              });
            }, function () {
            });
        }

        /**
         * Sets the 'applied' flag to the applied flag and removes this flag from all other templates
         * @param templates - {object} an array of templates. every with property 'applied'
         * @param templateId - [string] the id of the template, which is applied
         */
        function setAppliedTemplateMark(templates, templateId) {
          templates.forEach(function (template) {
            template.applied = false;
          });
          var template = _.find(templates, {templateId: templateId});
          template && (template.applied = true);
        }

        /**
         * sets the header's height
         * @param pageType
         */
        function setTableViewportHeight(pageType) {
          var index = 0;
          var tableDescription = null;
          if (pageType === objectPageEnum.heirarchicalPage) {
            index = 1;
          } else if (pageType === objectPageEnum.flatPage) {
            index = 4;
            tableDescription = objectPageEnum.flatPage;
          } else {
            console.error('Choose other table');
            return;
          }

          fuseUtils.setProperHeaderViewportHeight(vm.gridOptions.columnDefs, index, tableDescription, vm.gridApi);
        }

        /**
         * Saves table state to localstorage
         * @param pageType - {string} the type of the table to save
         * @param description - the description of the table to be saved
         */
        function saveTableState(pageType, description) {
          var description = description || null;
          if (pageType === objectPageEnum.heirarchicalPage) {
            description = 'gridState';
          } else if (pageType === objectPageEnum.flatPage) {
            description = 'gridFlatViewState';
          } else {
            console.error('Choose other table');
            return;
          }

          saveState(description);
        }

        function saveState(description) {
          setTimeout(function () {
            var state = vm.gridApi.saveState.save();

            $window.localStorage.setItem(description, angular.toJson(state));
          })
        }

        /**
         * Opens little popup to check whether the user sure or not
         * @param message
         * @returns {promise}
         */
        function openConfirmationPopup(message) {
          var confirm = $mdDialog.confirm()
            .title(message)
            .ariaLabel('mf templates')
            .ok('Yes')
            .cancel('No');
          return $mdDialog.show(confirm);
        }

        /**
         * removes template
         * @param templateId - {string}
         */
        function removeTemplate(templateId, pageType) {

          openConfirmationPopup('Are you sure you would like to delete this template?')
            .then(function () {
              return TemplatesService.removeTemplate(templateId, pageType);
            })

            .then(function (res) {
              handleResCode(res);

              if (res.code !== 0) {
                return;
              }

              vm.templates.length = 0;
              vm.templates = _.filter(vm.templates, function (templ) {
                return templ.templateId !== templateId;
              })
            })
        }

        /**
         * Shows the toast if everything is ok and loggs out the user if a private policy violation takes place
         * @param res - {object}
         */
        function handleResCode(res) {
          $mdToast.show($mdToast.simple().textContent(res.message || res.data).position('top right'));
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

      }

      /**
       * @param gridApi - {object} the reference to the gridApi, f.e. vm.hierarchicalUiGrid
       * @param gridOptions - {object} grid options, f.e. vm.hierarchicalGridOptions
       * @param pageType - {string} the type of the page, where the directive is used
       * @param buildTableColumns - {function} the function, which is used to build table columns
       */
      return {
        templateUrl: 'app/core/directives/mf-templates-dropdown/mf-templates-dropdown.html',
        link: link,
        restrict: 'E',
        scope: {
          gridApi: '=',
          gridOptions: '=',
          pageType: '=',
          buildTableColumns: '=',
          isConfigEnabled: '='
        }
      }
    });
})();
