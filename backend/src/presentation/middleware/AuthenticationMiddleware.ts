import { IMiddleware } from "./IMiddleware.js";
import { MiddlewareContext } from "./MiddlewareContext.js";

/**
 * AuthenticationMiddleware extracting JWT tokens and user identities from authorization headers.
 */
export class AuthenticationMiddleware implements IMiddleware {
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const authHeader = context.req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Simulates verification parsing
      context.state.currentUser = { id: "user-123", role: "admin" };
    }
    await next();
  }
}
