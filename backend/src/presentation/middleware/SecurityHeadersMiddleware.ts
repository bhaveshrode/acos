import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * SecurityHeadersMiddleware injecting standard anti-exploit security options.
 */
export class SecurityHeadersMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    context.res.headers = {
      ...context.res.headers,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    };
    await next();
  }
}
