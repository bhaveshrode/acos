"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationResult = void 0;
/**
 * ValidationResult modeling validation outcomes.
 */
class ValidationResult {
    isValid;
    errors;
    warnings;
    constructor(isValid, errors = {}, warnings = {}) {
        this.isValid = isValid;
        this.errors = errors;
        this.warnings = warnings;
        Object.freeze(this.errors);
        Object.freeze(this.warnings);
        Object.freeze(this);
    }
    static success() {
        return new ValidationResult(true);
    }
    static failure(errors, warnings = {}) {
        return new ValidationResult(false, errors, warnings);
    }
}
exports.ValidationResult = ValidationResult;
