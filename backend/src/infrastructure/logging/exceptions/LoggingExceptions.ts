/**
 * Base logging exception.
 */
export class LoggingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoggingException";
  }
}

/**
 * Thrown when a diagnostic sink fails to connect or initialize.
 */
export class SinkInitializationException extends LoggingException {
  constructor(sinkName: string, details: string) {
    super(`Failed to initialize logging sink '${sinkName}': ${details}`);
    this.name = "SinkInitializationException";
  }
}
