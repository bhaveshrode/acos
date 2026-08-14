import { CapabilityRegistry } from "./CapabilityRegistry.js";
import { ExecutionBoundary } from "./ExecutionBoundary.js";

/**
 * RuntimeSecurityManager safeguarding runtime boundaries.
 */
export class RuntimeSecurityManager {
  private readonly boundary = new ExecutionBoundary();

  constructor(private readonly registry: CapabilityRegistry) {}

  public executeCall<T>(
    callerSubsystem: string,
    targetSubsystem: string,
    action: () => T
  ): T {
    if (!this.registry.canCall(callerSubsystem, targetSubsystem)) {
      throw new Error(
        `Security violation: Subsystem '${callerSubsystem}' is not authorized to call target subsystem '${targetSubsystem}'`
      );
    }

    return this.boundary.executeIsolated(action);
  }
}
