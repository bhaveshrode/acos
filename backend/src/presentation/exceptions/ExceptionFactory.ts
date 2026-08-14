import { ErrorResponseBuilder } from "./ErrorResponseBuilder.js";
import { GlobalExceptionHandler } from "./GlobalExceptionHandler.js";
import { ExceptionMapper } from "./ExceptionMapper.js";

/**
 * ExceptionFactory building response builders and GlobalExceptionHandlers.
 */
export class ExceptionFactory {
  public static createResponseBuilder(): ErrorResponseBuilder {
    return new ErrorResponseBuilder();
  }

  public static createGlobalHandler(responseBuilder: ErrorResponseBuilder): GlobalExceptionHandler {
    return new GlobalExceptionHandler(ExceptionMapper, responseBuilder);
  }
}
