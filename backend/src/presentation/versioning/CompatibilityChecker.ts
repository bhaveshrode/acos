import { ApiVersion } from "./ApiVersion.js";
import { VersionPolicy } from "./VersionPolicy.js";

/**
 * CompatibilityChecker checking requested version targets against supported options flags.
 */
export class CompatibilityChecker {
  constructor(private readonly policy: VersionPolicy) {}

  /**
   * Evaluates version compatibility metrics.
   */
  public check(version: ApiVersion): { isCompatible: boolean; isDeprecated: boolean } {
    const isSupported = this.policy.isSupported(version);
    const isDeprecated = this.policy.isDeprecated(version);

    return {
      isCompatible: isSupported || isDeprecated,
      isDeprecated
    };
  }
}
