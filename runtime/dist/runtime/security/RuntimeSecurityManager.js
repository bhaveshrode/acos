import { ExecutionBoundary } from "./ExecutionBoundary.js";
/**
 * RuntimeSecurityManager safeguarding runtime boundaries.
 */
export class RuntimeSecurityManager {
    registry;
    boundary = new ExecutionBoundary();
    constructor(registry) {
        this.registry = registry;
    }
    executeCall(callerSubsystem, targetSubsystem, action) {
        if (!this.registry.canCall(callerSubsystem, targetSubsystem)) {
            throw new Error(`Security violation: Subsystem '${callerSubsystem}' is not authorized to call target subsystem '${targetSubsystem}'`);
        }
        return this.boundary.executeIsolated(action);
    }
}
