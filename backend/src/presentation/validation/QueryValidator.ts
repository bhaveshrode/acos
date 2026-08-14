import { RequestValidator } from "./RequestValidator.js";
import { ValidationSchema } from "./ValidationSchema.js";
import { ValidationException } from "./ValidationException.js";

/**
 * QueryValidator enforcing validation constraints on query string inputs.
 */
export class QueryValidator {
  constructor(private readonly validator: RequestValidator) {}

  public validate(query: any, schema: ValidationSchema): void {
    const context = this.validator.validate(query, schema);
    if (!context.isValid()) {
      throw new ValidationException(context.getErrors());
    }
  }
}
