"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValidator = void 0;
/**
 * FieldValidator evaluating rules lists sequentially on property values.
 */
class FieldValidator {
    static async validateField(value, rules, context) {
        for (const rule of rules) {
            const error = await rule.validate(value, context);
            if (error)
                return error;
        }
        return undefined;
    }
}
exports.FieldValidator = FieldValidator;
