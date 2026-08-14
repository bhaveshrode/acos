import { AuthorizationRequirement } from "./AuthorizationRequirement.js";

/**
 * AuthorizationDecision capturing allow/deny flags, failed requirements lists, redirect paths, and timestamps.
 */
export class AuthorizationDecision {
  private constructor(
    public readonly allowed: boolean,
    public readonly status: "Allowed" | "Denied" | "Redirect" | "Forbidden",
    public readonly policyName: string,
    public readonly failedRequirements: ReadonlyArray<AuthorizationRequirement> = [],
    public readonly redirectPath?: string,
    public readonly reason?: string,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.failedRequirements);
    Object.freeze(this);
  }

  public static allow(policyName: string): AuthorizationDecision {
    return new AuthorizationDecision(true, "Allowed", policyName);
  }

  public static deny(
    policyName: string,
    failed: AuthorizationRequirement[],
    reason?: string
  ): AuthorizationDecision {
    return new AuthorizationDecision(false, "Denied", policyName, failed, undefined, reason);
  }

  public static redirect(
    policyName: string,
    path: string,
    reason?: string
  ): AuthorizationDecision {
    return new AuthorizationDecision(false, "Redirect", policyName, [], path, reason);
  }

  public static forbidden(policyName: string, reason?: string): AuthorizationDecision {
    return new AuthorizationDecision(false, "Forbidden", policyName, [], undefined, reason);
  }
}
