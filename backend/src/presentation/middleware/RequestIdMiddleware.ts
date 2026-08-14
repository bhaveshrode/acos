import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * RequestIdMiddleware injecting request tracing identifiers.
 */
export class RequestIdMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const headerVal = context.req.headers?.["x-request-id"];
    context.state.requestId = headerVal || `req-${Math.random().toString(36).substring(2, 9)}`;
    await next();
  }
}
