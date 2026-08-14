import { ValidationError } from "./ValidationContext.js";

/**
 * ValidationErrorFormatter translating error arrays to standard HTTP response shapes.
 */
export class ValidationErrorFormatter {
  public static format(errors: ValidationError[]): any {
    return {
      error: "Validation Failed",
      details: errors.map((e) => ({ field: e.field, message: e.message }))
    };
  }
}
