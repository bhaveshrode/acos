import { RequestValidator } from "./RequestValidator.js";
import { ValidationSchema } from "./ValidationSchema.js";
import { ValidationException } from "./ValidationException.js";

/**
 * HeaderValidator enforcing validation constraints on HTTP headers.
 */
export class HeaderValidator {
  constructor(private readonly validator: RequestValidator) {}

  public validate(headers: any, schema: ValidationSchema): void {
    const context = this.validator.validate(headers, schema);
    if (!context.isValid()) {
      throw new ValidationException(context.getErrors());
    }
  }
}
