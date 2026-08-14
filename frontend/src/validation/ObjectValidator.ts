import { ValidationSchema } from "./ValidationSchema.js";
import { FieldValidator } from "./FieldValidator.js";

/**
 * ObjectValidator checking nested properties across object graphs.
 */
export class ObjectValidator {
  public async validateObject(
    target: Record<string, any>,
    schema: ValidationSchema,
    context?: any
  ): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};
    for (const prop of schema.getProperties()) {
      const value = target[prop];
      const error = await FieldValidator.validateField(value, schema.getRules(prop), context);
      if (error) {
        errors[prop] = error;
      }
    }
    return errors;
  }
}
