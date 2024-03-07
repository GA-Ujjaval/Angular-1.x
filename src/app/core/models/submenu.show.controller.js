(function () {
    'use strict';

    angular
      .module('app.core')
      .factory('ShowController', function ($mdMenu) {

        class ShowController {
          constructor (vm) {
            vm.$on('$mdMenuClose', () => {this.resetShown()});
            this._vm = vm;
            this.debouncedShowElement = _.debounce(this.showElement, 100);
          }
          showElement(elem) {
            if(elem.isShown) {
              return;
            }
            const isAnyElementOpen = this._vm.presets.some(({isShown}) => isShown);
            if(isAnyElementOpen) {
              this.resetShown();
              $mdMenu.hide()
            }
            elem.isShown = true;
          }
          resetShown() {
            this._vm.presets.forEach((item) => item.isShown = false);
          }
        }

        return ShowController;
      });
  }
)();
