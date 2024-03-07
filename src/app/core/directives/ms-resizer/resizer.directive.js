angular.module('app.core').directive('resizer', function($document) {

  return function($scope, $element, $attrs) {

    $scope.mouseDown = false;

    $element.on('mousedown', function(event) {
      event.preventDefault();

      $scope.pageX = event.pageX - 65;
      $scope.leftWidth = $('#' + $attrs.resizerLeft).width();
      $scope.rightWidth = $('#' + $attrs.resizerRight).width();

      $document.on('mousemove', mouseMove);
      $document.on('mouseup', mouseUp);
    });

    function mouseMove(event) {

      var x =  $scope.pageX - (event.pageX - 65);

      $element.css({
        left: event.pageX - 65 + 'px'
      });

      $('#' + $attrs.resizerLeft).css({
        width: $scope.leftWidth - x + 'px'
      });
      $('#' + $attrs.resizerRight).css({
        width: $scope.rightWidth + x + 'px'
      });

    }

    function mouseUp() {
      $document.unbind('mousemove', mouseMove);
      $document.unbind('mouseup', mouseUp);
    }
  };
});
