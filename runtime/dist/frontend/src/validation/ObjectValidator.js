"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectValidator = void 0;
const FieldValidator_js_1 = require("./FieldValidator.js");
/**
 * ObjectValidator checking nested properties across object graphs.
 */
class ObjectValidator {
    async validateObject(target, schema, context) {
        const errors = {};
        for (const prop of schema.getProperties()) {
            const value = target[prop];
            const error = await FieldValidator_js_1.FieldValidator.validateField(value, schema.getRules(prop), context);
            if (error) {
                errors[prop] = error;
            }
        }
        return errors;
    }
}
exports.ObjectValidator = ObjectValidator;
