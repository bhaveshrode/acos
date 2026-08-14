import { ErrorResponse, ErrorDetails } from "./ErrorResponse.js";

/**
 * ErrorResponseBuilder formatting failure responses.
 */
export class ErrorResponseBuilder {
  public build(
    message: string,
    code: string,
    details?: any,
    metadata?: Record<string, any>
  ): ErrorResponse {
    const error: ErrorDetails = { message, code, details };
    return new ErrorResponse(error, metadata);
  }
}
