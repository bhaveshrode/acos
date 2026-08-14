/**
 * Base class representing failures that occur at the Application pipeline layer.
 */
export class ApplicationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
