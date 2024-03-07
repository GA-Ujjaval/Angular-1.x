(function () {
  angular
    .module('app.core')
    .directive('mfShareableLinkMenu', function ($location, $mdDialog, reportRequestService, blobService, $mdToast, errors, $stateParams) {

      const type = {
        clipboard: 'clipboard',
        backend: 'backend'
      };
      const shareOptions = [
        {
          text: 'Copy Shareable URL to Clipboard',
          tooltip: 'Copy Sharable URL to Clipboard',
          type: type.clipboard,
          isBom: null
        },
        {
          text: 'Download Attachment Report',
          tooltip: 'Download report containing all attachments of this part, and links to download them',
          type: type.backend,
          fileName: 'Attachment Report',
          isBom: false
        },
        {
          text: 'Download a report of links to attachments of all BOM parts',
          tooltip: 'Download report containing all attachments of this part and all the BOM parts, and links to download them',
          type: type.backend,
          fileName: 'BOM Attachment Report',
          isBom: true
        }
      ];

      function link(scope) {
        scope.vm = scope;
        const vm = scope;
        vm.getShareableLink = getShareableLink;
        vm.shareOptions = shareOptions;
        vm.executeOption = executeOption;
      }

      function executeOption(vm, option) {
        if (option.type === type.clipboard) {
          getShareableLink();
        } else {
          downloadReport(vm, $stateParams.id, option);
        }
      }

      function downloadReport(scope, objectId, option) {
        scope.$emit('attachmentReportDownloadStarted');
        reportRequestService.getAttachmentReport({objectId, bomFlag: option.isBom})
          .then((binData) => {
            blobService.download(binData, 'pdf', `${option.fileName} ${objectId}`);
          })
          .catch((message = errors.downloadFailed) => {
            $mdToast.show($mdToast.simple().textContent(message).action('x')
              .toastClass("md-error-toast-theme").position('top right').hideDelay(0));
          })
          .finally(() => {
            scope.$emit('attachmentReportDownloadEnded');
          });
      }

      function getShareableLink() {
        var aux = document.createElement("input");
        aux.setAttribute('value', $location.absUrl());
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        $mdDialog.show(
          $mdDialog.alert({
            template: '<md-dialog md-theme="default" class="_md md-default-theme md-transition-in">' +
            '<md-dialog-content class="md-dialog-content">' +
            '<h2 class="md-title ng-binding text-copy-clipboard">URL copied to clipboard</h2>' +
            '</md-dialog-content>' +
            '<md-dialog-actions style="padding-left: 65px;">' +
            '<button class="md-primary md-confirm-button md-button md-ink-ripple md-default-theme  button-copy-clipboard" type="button" ng-click="dialog.hide()" ">' +
            '<span class="ng-binding ng-scope">OK</span>' +
            '</button>' +
            '</md-dialog-actions>' +
            '</md-dialog>',
            parent: angular.element(document.querySelector('#attachments')),
            clickOutsideToClose: true
          }));
      }

      return {
        link,
        restrict: 'E',
        templateUrl: 'app/core/directives/mf-shareable-link-menu/mf-shareable-link-menu.html',
        scope: {
          isDocument: '='
        }
      }
    })
})();
