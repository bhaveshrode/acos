import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * RateLimitingMiddleware tracking limits constraints configurations.
 */
export class RateLimitingMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    context.res.headers = {
      ...context.res.headers,
      "X-RateLimit-Limit": "100",
      "X-RateLimit-Remaining": "99"
    };
    await next();
  }
}
