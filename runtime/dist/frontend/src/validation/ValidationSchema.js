"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationSchema = void 0;
/**
 * ValidationSchema grouping validation rules per property path.
 */
class ValidationSchema {
    rulesMap = new Map();
    addRule(property, rule) {
        if (!this.rulesMap.has(property)) {
            this.rulesMap.set(property, []);
        }
        this.rulesMap.get(property).push(rule);
    }
    getRules(property) {
        return this.rulesMap.get(property) || [];
    }
    getProperties() {
        return Array.from(this.rulesMap.keys());
    }
}
exports.ValidationSchema = ValidationSchema;
