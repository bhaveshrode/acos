/**
 * SystemDependencies constants for ACOS workspaces.
 */
export class SystemDependencies {
  public static getSubsystemsMap(): Record<string, string[]> {
    return {
      "backend": [],
      "operations": [],
      "integrations": ["backend"],
      "developer": ["backend"],
      "intelligence": ["backend"],
      "compliance": ["backend"],
      "platform": ["backend", "developer", "intelligence"],
      "frontend": ["backend"]
    };
  }
}
