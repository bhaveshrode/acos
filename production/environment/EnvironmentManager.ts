import { EnvironmentProfile } from "./EnvironmentProfile.js";
import { EnvironmentSnapshot } from "./EnvironmentSnapshot.js";

/**
 * EnvironmentManager validating and detecting config drifts.
 */
export class EnvironmentManager {
  private lastSnapshot?: EnvironmentSnapshot;

  public validate(profile: EnvironmentProfile, variables: Record<string, string>): void {
    const requiredKeys = ["DATABASE_URL", "CACHE_URL", "MESSAGE_BROKER_URL"];
    if (profile === EnvironmentProfile.PRODUCTION) {
      requiredKeys.push("STRIPE_SECRET_KEY", "JWT_SECRET");
    }

    for (const key of requiredKeys) {
      if (!variables[key] || variables[key].trim() === "") {
        throw new Error(`Environment validation failed: Missing required variable '${key}'`);
      }
    }
  }

  public captureSnapshot(profile: EnvironmentProfile, variables: Record<string, string>): EnvironmentSnapshot {
    this.validate(profile, variables);
    const snap = new EnvironmentSnapshot(profile, { ...variables });
    this.lastSnapshot = snap;
    return snap;
  }

  public detectDrift(currentVariables: Record<string, string>): string[] {
    if (!this.lastSnapshot) return [];
    const drifts: string[] = [];

    // Verify all keys from the last snapshot match current variables
    for (const [key, val] of Object.entries(this.lastSnapshot.variables)) {
      if (currentVariables[key] !== val) {
        drifts.push(`Variable '${key}' drifted: expected '${val}', got '${currentVariables[key] ?? "undefined"}'`);
      }
    }

    return drifts;
  }
}
