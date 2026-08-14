import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when lower-level structural type validations or guard checks fail.
 * Represents programming mistakes rather than soft user-input validation errors.
 */
export class ValidationException extends BaseException {
  /**
   * Creates a ValidationException.
   * @param message Text description of the error.
   * @param context Optional debugging context variables.
   * @param cause Optional inner error.
   */
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super(message, "VALIDATION_ERROR", context, cause);
  }
}
