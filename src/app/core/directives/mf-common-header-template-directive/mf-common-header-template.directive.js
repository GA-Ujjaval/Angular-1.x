(function () {
  angular
    .module('app.core')
    .directive('mfCommonHeaderTemplate', function () {

      var outerScope;

      function link(scope) {
        scope.handleClick = handleClick;
        outerScope = scope;
      }

      function handleClick(event, col) {
        if (col.sort.direction === outerScope.asc) {
          col.sort.direction = null;
        } else if (col.sort.direction === outerScope.desc) {
          col.sort.direction = outerScope.asc;
        } else {
          col.sort.direction = outerScope.desc;
        }
      }

      return {
        template:'<div class="header-cell-wrapper"><div class="ui-grid-cell-contents"><span style="float:right; margin-right: 10px;" ui-grid-one-bind-id-grid="col.uid + \'-sortdir-text\'" ui-grid-visible="col.sort.direction" aria-label="Sort Ascending" class="" id="1538147413562-uiGrid-00VD-sortdir-text"><i ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }" title="" aria-hidden="true" class="ui-grid-icon-up-dir" style=""></i> <sub ui-grid-visible="isSortPriorityVisible()" class="ui-grid-sort-priority-number ui-grid-invisible">1</sub></span>' +
        '<md-tooltip class="md-tooltip" ng-if="!isTooltipNeeded" md-direction="{{options.tooltipDir || \'top\'}}">' +
        '{{options.tooltipText || col.displayName}}' +
        '</md-tooltip><div class="custom-ui-grid-header">' +
        '{{col.displayName}} <span class="{{customStyle}}">{{customText}}</span>' +
        '</div><div role="button" tabindex="0" ui-grid-one-bind-id-grid="col.uid + \'-menu-button\'" class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus &amp;&amp; !col.isRowHeader  &amp;&amp; col.colDef.enableColumnMenu !== false" ng-click="toggleMenu($event); handleClick($event, col);" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}" ui-grid-one-bind-aria-label="i18n.headerCell.aria.columnMenuButtonLabel" aria-haspopup="true" id="1537884881301-uiGrid-000J-menu-button" aria-label="Column Menu"><i class="ui-grid-icon-angle-down" aria-hidden="true">&nbsp;</i></div></div>' +
        '<div ui-grid-filter=""><!----><div class="ui-grid-filter-container" ng-style="col.extraStyle" ng-repeat="colFilter in col.filters" ng-class="{\'ui-grid-filter-cancel-button-hidden\' : colFilter.disableCancelFilterButton === true }"><!----><div ng-if="colFilter.type !== \'select\'"><input type="text" class="ui-grid-filter-input ui-grid-filter-input-0" ng-model="colFilter.term" ng-attr-placeholder="{{colFilter.placeholder || \'\'}}" aria-label="Filter for column" placeholder="" aria-invalid="false"><!----><div role="button" class="ui-grid-filter-button ng-hide" ng-click="removeFilter(colFilter, $index)" ng-if="!colFilter.disableCancelFilterButton" ng-disabled="colFilter.term === undefined || colFilter.term === null || colFilter.term === \'\'" ng-show="colFilter.term !== undefined &amp;&amp; colFilter.term !== null &amp;&amp; colFilter.term !== \'\'" aria-hidden="true" aria-disabled="true" disabled="disabled"><i class="ui-grid-icon-cancel" ui-grid-one-bind-aria-label="aria.removeFilter" aria-label="Remove Filter">&nbsp;</i></div><!----></div><!----><!----></div><!----></div></div>',
        link: link,
        restrict: 'E',
        scope: {
          col: '=',
          grid: '=',
          i18n: '=',
          toggleMenu: '=',
          isLastCol: '=',
          isSortPriorityVisible: '=',
          asc: '=',
          desc: '=',
          options: '=',
          customText: '=',
          customStyle: '=',
          isTooltipNeeded: '='
        }
      }
    });
})();
