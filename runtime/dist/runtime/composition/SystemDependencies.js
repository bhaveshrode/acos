/**
 * SystemDependencies constants for ACOS workspaces.
 */
export class SystemDependencies {
    static getSubsystemsMap() {
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
