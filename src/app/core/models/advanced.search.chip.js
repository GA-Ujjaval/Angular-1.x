(function () {
    'use strict';
    angular
      .module('app.core')
      .factory('AdvancedSearchChip', function ($mdToast) {
        class AdvancedSearchChip {
          static createChip(chipData, section) {
            if(chipData.type === 'text') return new TextChip(chipData, section);
            if(chipData.type === 'boolean') return new BooleanChip(chipData, section);
            if(chipData.type === 'dropDown') return new DropDownChip(chipData, section);
            throw new Error('Invalid chip type');
          }
          constructor ({value = null, type = null, displayName, id}, section) {
            this.displayName = displayName;
            this.id = id;
            this.value = value;
            this.type = type;
            this.areDetailsShown = false;
            this.isRecordShown = false;
            this.section = section;
          }
          isEmpty() {return _.isEmpty(this.value) || _.isBoolean(this.value);}
          isOpen() {return this.areDetailsShown;}
          open() {this.areDetailsShown = true;}
          close() {this.areDetailsShown = false;}
          hide() {this.isRecordShown = false;}
          clean() {this.value = null}
          show() {this.isRecordShown = true;}
          isShown() {return this.isRecordShown;}
          toggle() {this.isShown() ? this.hide() : this.show();}
          getExport() {
            return {type: this.type, value: this.value, id: this.id, sectionId: this.section.getId()}
          };
          getRequestData() {
            return this.getExport();
          }
          import({value}) {this.value = value};
        }

        class BooleanChip extends AdvancedSearchChip{
          /**
           * @param options {object} with properties: value {string}, text {string}
           */
          constructor({value = null, type = 'boolean', displayName, id, options}, section) {
            super({value, type, displayName, id}, section);
            this.options = options;
          }
          getRequestData() {
            return {type: 'dropDown', value: this.value, id: this.id, sectionId: this.section.getId()}
          }
        }

        class DropDownChip extends AdvancedSearchChip{
          constructor({ value = [], type = 'dropDown', displayName, id, options = [],
                        searchCondition = '', searchPlaceholder = '', getOptions},
                      section) {
            super({value, type, displayName, id}, section);
            this.value = value;
            this.searchCondition = searchCondition;
            this.searchPlaceholder = searchPlaceholder;
            this.loadingOptions = false;
            this.options = options;
            if(this.options.length === 0 && !getOptions) {
              throw new Error ('getOptions parameter is required when options are not provided')
            }
            this._getOptions = getOptions;
          }
          getOptions() {
            if(this.options.length > 0) {
              return;
            }
            this.loadingOptions = true;
            this._getOptions()
              .then(
                (options) => this.options = options,
                (error) =>$mdToast.show($mdToast.simple().textContent('Failed to load. Please, try later')
                  .toastClass("md-error-toast-theme").position('top right').hideDelay(4000)))
              .finally(() => this.loadingOptions = false
              )
          }
          close() {
            this.areDetailsShown = false;
            this.searchCondition = '';
          }
          show() {
            this.isRecordShown = true;
            this.getOptions();
          }
          getViewValue() {
            if(this.__lastCalledFor && _.isEqual(this.__lastCalledFor.selectVal, this.value)) {
              return this.__lastCalledFor.viewVal;
            }
            if(this.options.length === 0){
              return '';
            }
            return (this.__lastCalledFor = {
              selectVal: this.value,
              viewVal: (this.value || []).map((value) => _.find(this.options, {value}).text).join(', '),
            }).viewVal;
          }
        }

        class TextChip extends AdvancedSearchChip{
          constructor(...args) {
            super(...args);
          }
        }

        return AdvancedSearchChip;
      });
  }
)();
