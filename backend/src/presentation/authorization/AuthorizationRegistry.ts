import { AuthorizationPolicy } from "./AuthorizationPolicy.js";

/**
 * AuthorizationRegistry catalog mapping names to registered AuthorizationPolicy definitions.
 */
export class AuthorizationRegistry {
  private static policies = new Map<string, AuthorizationPolicy>();

  /**
   * Registers an AuthorizationPolicy.
   */
  public static register(policy: AuthorizationPolicy): void {
    this.policies.set(policy.name, policy);
  }

  /**
   * Resolves a policy by name.
   */
  public static getPolicy(name: string): AuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.policies.clear();
  }
}
