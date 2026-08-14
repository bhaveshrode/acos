import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when a critical domain model invariant or state constraint is violated.
 * Indicates an invalid domain transition or corrupted state.
 */
export class DomainException extends BaseException {
  /**
   * Creates a DomainException.
   * @param message Text description of the error.
   * @param context Optional debugging context variables.
   * @param cause Optional inner error.
   */
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super(message, "DOMAIN_ERROR", context, cause);
  }
}
