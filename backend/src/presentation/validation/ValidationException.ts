import { ValidationError } from "./ValidationContext.js";

/**
 * ValidationException thrown when schema check constraints fail.
 */
export class ValidationException extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super("Validation Failed");
    this.name = "ValidationException";
  }
}
