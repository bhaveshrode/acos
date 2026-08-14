import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * ExceptionHandlingMiddleware catching and converting application errors to uniform responses.
 */
export class ExceptionHandlingMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (err: any) {
      context.res.status = 500;
      context.res.body = { error: err.message || "Internal Server Error" };
    }
  }
}
