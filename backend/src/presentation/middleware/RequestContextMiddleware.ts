import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";
import { ControllerContext } from "../controllers/ControllerContext.js";

/**
 * RequestContextMiddleware mapping incoming request parameters to a ControllerContext.
 */
export class RequestContextMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const correlationId = context.state.correlationId || "corr-default";
    const requestId = context.state.requestId || "req-default";

    context.state.controllerContext = new ControllerContext({
      currentUser: context.state.currentUser,
      organizationId: context.req.headers?.["x-organization-id"],
      correlationId,
      requestId,
      ipAddress: context.req.ip
    });

    await next();
  }
}
