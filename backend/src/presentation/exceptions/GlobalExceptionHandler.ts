import { ExceptionContext } from "./ExceptionContext.js";
import { ExceptionMapper } from "./ExceptionMapper.js";
import { ErrorResponseBuilder } from "./ErrorResponseBuilder.js";

/**
 * GlobalExceptionHandler intercepting thrown errors across the API layer, producing HTTP statuses and payload shapes.
 */
export class GlobalExceptionHandler {
  constructor(
    private readonly mapper: typeof ExceptionMapper,
    private readonly responseBuilder: ErrorResponseBuilder
  ) {}

  /**
   * Catches errors, maps it to HttpException, and prints the formatted payload response.
   */
  public handle(error: Error, context: ExceptionContext): { statusCode: number; payload: any } {
    const httpExc = this.mapper.map(error);
    const payload = this.responseBuilder.build(httpExc, context);
    return {
      statusCode: httpExc.statusCode,
      payload
    };
  }
}
