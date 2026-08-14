"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationDecision = void 0;
/**
 * ValidationDecision capturing execution diagnostics and failed rules collections.
 */
class ValidationDecision {
    isValid;
    failedRules;
    metadata;
    constructor(isValid, failedRules = [], metadata = {}) {
        this.isValid = isValid;
        this.failedRules = failedRules;
        this.metadata = metadata;
        Object.freeze(this.failedRules);
        Object.freeze(this.metadata);
        Object.freeze(this);
    }
}
exports.ValidationDecision = ValidationDecision;
