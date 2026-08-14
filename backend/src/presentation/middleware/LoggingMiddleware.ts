import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * LoggingMiddleware tracing request execution duration metrics.
 */
export class LoggingMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    context.state.executionDuration = duration;
  }
}
