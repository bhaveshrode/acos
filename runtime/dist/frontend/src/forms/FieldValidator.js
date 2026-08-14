"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValidator = void 0;
/**
 * FieldValidator evaluating individual form fields using registered validation rules.
 */
class FieldValidator {
    static validate(field) {
        for (const validator of field.validators) {
            if (typeof validator === "function") {
                const error = validator(field.value);
                if (error)
                    return error;
            }
        }
        return undefined;
    }
}
exports.FieldValidator = FieldValidator;
