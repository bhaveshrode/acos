import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * HealthCheckMiddleware intercepting and resolving ready liveness pings.
 */
export class HealthCheckMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    if (context.req.url === "/health" || context.req.url === "/ready") {
      context.res.status = 200;
      context.res.body = { status: "Healthy" };
      return;
    }
    await next();
  }
}
