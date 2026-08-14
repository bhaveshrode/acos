import { ObjectUtils } from "../utils/ObjectUtils.js";

/**
 * Base exception class for all unrecoverable system and programmatic errors in ACOS.
 * Extends the native Error class and adds structured error codes, contexts, and nesting support.
 */
export abstract class BaseException extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  /**
   * Creates a new BaseException.
   * @param message Text description of the error.
   * @param code Unique uppercase code categorization.
   * @param context Optional debugging context variables.
   * @param cause Optional inner error that caused this exception.
   */
  protected constructor(
    message: string,
    code: string,
    context?: Record<string, any>,
    cause?: Error
  ) {
    // Pass message and cause to Error constructor (cause is supported natively in ES2022+)
    super(message, cause ? { cause } : undefined);
    
    // Ensure proper prototype chain inheritance for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = code ? code.trim().toUpperCase() : "BASE_EXCEPTION";
    this.name = this.constructor.name;

    if (context) {
      this.context = ObjectUtils.deepFreeze({ ...context });
    }

    // Capture stack trace (supported in Node.js runtime environments)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
