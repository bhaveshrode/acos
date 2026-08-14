import { RequestValidator } from "./RequestValidator.js";
import { ValidationSchema } from "./ValidationSchema.js";
import { ValidationException } from "./ValidationException.js";

/**
 * BodyValidator enforcing validation constraints on HTTP request bodies.
 */
export class BodyValidator {
  constructor(private readonly validator: RequestValidator) {}

  public validate(body: any, schema: ValidationSchema): void {
    const context = this.validator.validate(body, schema);
    if (!context.isValid()) {
      throw new ValidationException(context.getErrors());
    }
  }
}
