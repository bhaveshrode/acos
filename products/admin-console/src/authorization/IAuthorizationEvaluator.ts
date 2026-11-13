import { AuthorizationContext } from "./AuthorizationContext.js";
import { CompiledPolicy } from "./CompiledPolicy.js";
import { AuthorizationDecision } from "./AuthorizationDecision.js";

/**
 * IAuthorizationEvaluator contract interface for policy checks.
 */
export interface IAuthorizationEvaluator {
  evaluate(context: AuthorizationContext, policy: CompiledPolicy): Promise<AuthorizationDecision>;
}
