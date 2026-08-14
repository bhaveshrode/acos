import { ValidationSchema } from "./ValidationSchema.js";
import { ValidationContext } from "./ValidationContext.js";

/**
 * RequestValidator executing validation checks pipelines on raw dictionaries.
 */
export class RequestValidator {
  /**
   * Validates target payload data against a schema.
   */
  public validate(data: any, schema: ValidationSchema): ValidationContext {
    const context = new ValidationContext();
    for (const field of Object.keys(schema.fields)) {
      const value = data?.[field];
      const schemaField = schema.fields[field];
      for (const rule of schemaField.rules) {
        const error = rule.validate(value, data);
        if (error) {
          context.addError(field, error);
        }
      }
    }
    return context;
  }
}
