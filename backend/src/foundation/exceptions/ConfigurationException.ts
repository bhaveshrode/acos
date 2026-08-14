import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when mandatory application setup parameters, environmental keys,
 * or runtime configuration configurations are missing or invalid.
 */
export class ConfigurationException extends BaseException {
  /**
   * Creates a ConfigurationException.
   * @param message Text description of the error.
   * @param context Optional debugging context variables.
   * @param cause Optional inner error.
   */
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super(message, "CONFIGURATION_ERROR", context, cause);
  }
}
