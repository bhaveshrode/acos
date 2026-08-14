"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormValidator = void 0;
const ValidationResult_js_1 = require("./ValidationResult.js");
const FieldValidator_js_1 = require("./FieldValidator.js");
/**
 * FormValidator checking entire collections of form fields.
 */
class FormValidator {
    async validate(form) {
        const errors = {};
        for (const field of form.getFields()) {
            const error = FieldValidator_js_1.FieldValidator.validate(field);
            if (error) {
                field.error = error;
                errors[field.name] = error;
            }
            else {
                field.error = undefined;
            }
        }
        if (Object.keys(errors).length > 0) {
            return ValidationResult_js_1.ValidationResult.failure(errors);
        }
        return ValidationResult_js_1.ValidationResult.success();
    }
}
exports.FormValidator = FormValidator;
