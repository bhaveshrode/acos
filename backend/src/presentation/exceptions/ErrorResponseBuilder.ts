import { ExceptionContext } from "./ExceptionContext.js";
import { HttpException } from "./HttpException.js";

/**
 * ErrorResponseBuilder constructing standardized error envelopes.
 */
export class ErrorResponseBuilder {
  /**
   * Translates HttpException and context details into standard JSON error objects.
   */
  public build(error: HttpException, context: ExceptionContext): any {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.errorCode,
        statusCode: error.statusCode,
        timestamp: context.props.timestamp.toISOString(),
        correlationId: context.props.correlationId,
        requestId: context.props.requestId,
        path: context.props.path,
        details: error.details
      }
    };
  }
}
