import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when third-party software, databases, network connections,
 * or host system systems fail in an unrecoverable manner.
 */
export class InfrastructureException extends BaseException {
  /**
   * Creates an InfrastructureException.
   * @param message Text description of the error.
   * @param context Optional debugging context variables.
   * @param cause Optional inner error.
   */
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super(message, "INFRASTRUCTURE_ERROR", context, cause);
  }
}
