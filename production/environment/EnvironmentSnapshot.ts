import { EnvironmentProfile } from "./EnvironmentProfile.js";

/**
 * EnvironmentSnapshot representing configuration variables mapping.
 */
export class EnvironmentSnapshot {
  constructor(
    public readonly profile: EnvironmentProfile,
    public readonly variables: Record<string, string>,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this.variables);
    Object.freeze(this);
  }
}
