import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * CorsMiddleware applying Cross-Origin Resource Sharing settings parameters.
 */
export class CorsMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    context.res.headers = {
      ...context.res.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    };
    await next();
  }
}
