"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormDescriptor = void 0;
/**
 * FormDescriptor encapsulating form metadata, class mappings, and fields definitions.
 */
class FormDescriptor {
    metadata;
    formClass;
    fieldsList;
    constructor(metadata, formClass, fieldsList = []) {
        this.metadata = metadata;
        this.formClass = formClass;
        this.fieldsList = fieldsList;
        Object.freeze(this.fieldsList);
        Object.freeze(this);
    }
}
exports.FormDescriptor = FormDescriptor;
