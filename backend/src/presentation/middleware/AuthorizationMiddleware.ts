import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * AuthorizationMiddleware asserting access privileges based on context roles.
 */
export class AuthorizationMiddleware implements IMiddleware {
  constructor(private readonly requiredRole: string) {}

  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const user = context.state.currentUser;
    if (!user || user.role !== this.requiredRole) {
      throw new Error("Forbidden access");
    }
    await next();
  }
}
