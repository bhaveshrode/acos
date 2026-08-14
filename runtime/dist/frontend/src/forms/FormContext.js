"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormContext = void 0;
/**
 * FormContext carrying current input values, active validation errors, and submission status.
 */
class FormContext {
    metadata;
    fieldsValues;
    errors;
    isSubmitting;
    timestamp;
    constructor(metadata, fieldsValues = {}, errors = {}, isSubmitting = false, timestamp = Date.now()) {
        this.metadata = metadata;
        this.fieldsValues = fieldsValues;
        this.errors = errors;
        this.isSubmitting = isSubmitting;
        this.timestamp = timestamp;
        Object.freeze(this.fieldsValues);
        Object.freeze(this.errors);
        Object.freeze(this);
    }
}
exports.FormContext = FormContext;
