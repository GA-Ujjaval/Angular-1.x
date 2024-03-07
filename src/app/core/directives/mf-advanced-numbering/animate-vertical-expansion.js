(function () {
  angular
    .module('app.core')
    .directive('mfAnimateVerticalExpansion',
      function ($animate) {

        var parameter = 'mfAnimateVerticalExpansion';
        var start = 'start';
        var close = 'close';

        function link(scope, element, attribute) {

          $animate.on('enter', element[0], function (element, phase) {
            var container = document.getElementById(attribute[parameter]);
            console.log(container);
            // container.style.height = container.scrollHeight + 10 + 'px'
            if (phase === start) {
              container.style.height = container.scrollHeight + 'px';
            }
            if (phase === close) {
              setTimeout(function () {
                container.style.height = null;
              })
            }
          })
        }

        return {
          link: link,
          restrict: 'A'
        };

      })
})();
