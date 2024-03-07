(function () {
    'use strict';
    angular
      .module('app.core')
      .factory('AdvancedSearchSection', function (AdvancedSearchChip) {
        class AdvancedSearchSection {
          constructor ({displayName, id, records}) {
            this.displayName = displayName;
            this.id = id;
            this._availableRecords = {};
            this.records = records.map((rawRecord) => {
              this._availableRecords[rawRecord.id] = rawRecord.id;
              return AdvancedSearchChip.createChip(rawRecord, this)
            });
          }
          isRecordAvailable(recordId) { return !!this._availableRecords[recordId] }
          closeAllRecords() {this.records.forEach((record) => record.close());}
          getRecords() {return _.cloneDeep(this.records);}
          getId() {return this.id;}
          importRecord(rawChip) {
            let record = _.find(this.records, {id: rawChip.id});
            Object.assign(record, rawChip);
            return record;
          }
          addRecord({displayName, id, type}) {this.records.push(AdvancedSearchChip.createChip({displayName, id, type}, this));}
          isDirty() {return this.records.some((record) => {
            if(record.type === 'boolean') {
              return record.value !== null;
            }
            if((record.id === 'createDate' || record.id === 'modifiedDate') && record.value) {
              return record.value.date !== undefined;
            }
            return !record.isEmpty()
          })}
          isAnyRecordOpen() {return this.records.some((record) => record.isOpen())}
          closeAllRecords() {this.records.forEach((record) => record.close());}
          clean() {
            this.records.forEach((record) => {
              record.clean();
              record.hide();
          })}
        }
        return AdvancedSearchSection;
      });
  }
)();
