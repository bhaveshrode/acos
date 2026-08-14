import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * CompressionMiddleware marking encoding outputs compression format settings.
 */
export class CompressionMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    context.res.headers = {
      ...context.res.headers,
      "Content-Encoding": "gzip"
    };
    await next();
  }
}
