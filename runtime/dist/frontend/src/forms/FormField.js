"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormField = void 0;
/**
 * FormField tracking dirty checks, values, types, and error states.
 */
class FormField {
    name;
    value;
    type;
    validators;
    isDirty = false;
    error;
    constructor(name, value, type = "text", validators = []) {
        this.name = name;
        this.value = value;
        this.type = type;
        this.validators = validators;
    }
    setValue(val) {
        this.value = val;
        this.isDirty = true;
    }
}
exports.FormField = FormField;
