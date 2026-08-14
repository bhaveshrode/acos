import { FormField } from "./FormField.js";

/**
 * FieldValidator evaluating individual form fields using registered validation rules.
 */
export class FieldValidator {
  public static validate(field: FormField): string | undefined {
    for (const validator of field.validators) {
      if (typeof validator === "function") {
        const error = validator(field.value);
        if (error) return error;
      }
    }
    return undefined;
  }
}
