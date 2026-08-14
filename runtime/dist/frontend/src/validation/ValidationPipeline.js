"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPipeline = void 0;
const ValidationResult_js_1 = require("./ValidationResult.js");
const ValidationDecision_js_1 = require("./ValidationDecision.js");
/**
 * ValidationPipeline coordinating rule validations execution.
 */
class ValidationPipeline {
    objectValidator;
    constructor(objectValidator) {
        this.objectValidator = objectValidator;
    }
    async execute(target, schema, context) {
        const errors = await this.objectValidator.validateObject(target, schema, context);
        if (Object.keys(errors).length > 0) {
            return ValidationResult_js_1.ValidationResult.failure(errors);
        }
        return ValidationResult_js_1.ValidationResult.success();
    }
    async executeDecision(target, schema, context) {
        const errors = await this.objectValidator.validateObject(target, schema, context);
        const failedRules = [];
        for (const [prop, error] of Object.entries(errors)) {
            failedRules.push(`${prop}: ${error}`);
        }
        return new ValidationDecision_js_1.ValidationDecision(failedRules.length === 0, failedRules, {
            timestamp: Date.now()
        });
    }
}
exports.ValidationPipeline = ValidationPipeline;
