import { AuthorizationContext } from "./AuthorizationContext.js";
import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * IAuthorizationHandler contract interface for async requirement evaluations.
 */
export interface IAuthorizationHandler {
  canHandle(requirement: AuthorizationRequirement): boolean;
  evaluate(context: AuthorizationContext, requirement: AuthorizationRequirement): Promise<boolean>;
}
