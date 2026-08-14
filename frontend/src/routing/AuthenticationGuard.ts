import { IRouteGuard } from "./IRouteGuard.js";
import { RouteContext } from "./RouteContext.js";
import { GuardResult } from "./GuardResult.js";

/**
 * AuthenticationGuard enforcing authentication constraints checks and returning redirects on fail.
 */
export class AuthenticationGuard implements IRouteGuard {
  constructor(
    private readonly isAuthenticated: () => boolean,
    private readonly loginRedirectUrl: string = "/login"
  ) {}

  public async canActivate(context: RouteContext): Promise<GuardResult> {
    return this.isAuthenticated()
      ? GuardResult.allow()
      : GuardResult.redirect(this.loginRedirectUrl, "User is unauthenticated");
  }
}
