import { ApplicationException } from "./ApplicationException.js";

/**
 * Exception representing request parameter validation check failures.
 */
export class ValidationException extends ApplicationException {
  public readonly errors: string[];

  constructor(errors: string[] | string) {
    const errorList = Array.isArray(errors) ? errors : [errors];
    super(`Validation check failed: ${errorList.join(", ")}`);
    this.errors = errorList;
  }
}
