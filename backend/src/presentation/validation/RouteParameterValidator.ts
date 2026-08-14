import { RequestValidator } from "./RequestValidator.js";
import { ValidationSchema } from "./ValidationSchema.js";
import { ValidationException } from "./ValidationException.js";

/**
 * RouteParameterValidator enforcing constraints on URI path variables.
 */
export class RouteParameterValidator {
  constructor(private readonly validator: RequestValidator) {}

  public validate(params: any, schema: ValidationSchema): void {
    const context = this.validator.validate(params, schema);
    if (!context.isValid()) {
      throw new ValidationException(context.getErrors());
    }
  }
}
