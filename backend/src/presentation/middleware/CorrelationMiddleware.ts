import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * CorrelationMiddleware driving correlationId injection or propagation headers.
 */
export class CorrelationMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const headerVal = context.req.headers?.["x-correlation-id"];
    context.state.correlationId = headerVal || `corr-${Math.random().toString(36).substring(2, 9)}`;
    await next();
  }
}
