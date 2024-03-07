(function () {
  'use strict';

  angular
    .module('app.objects')
    .directive('linkAttribute', linkAttribute);

  function linkAttribute() {

    function link(scope) {
      scope.openLinkFunction = openLinkFunction;
      scope.$watch('url', function (newVal, oldVal) {
        scope.url = openLinkFunction(newVal);
      })
    }

    function openLinkFunction(url) {
      if (!url) {
        return;
      }
      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
      }
      return url;
    }

    return {
      restrict: 'E',
      template: '<div class="ui-grid-cell-contents dots-in-the-end content-wrapper">\n' +
      '  <a ng-href="{{url}}" target="_blank" rel="nofollow noreferrer noopener">{{url | removeProtocol}}</a>\n' +
      '</div>',
      scope: {
        url: '='
      },
      link: link
    }
  }
})();
