import { RouteContext } from "./RouteContext.js";
import { GuardResult } from "./GuardResult.js";

/**
 * IRouteGuard contract interface for pre-navigation evaluation.
 */
export interface IRouteGuard {
  canActivate(context: RouteContext): Promise<GuardResult>;
}
