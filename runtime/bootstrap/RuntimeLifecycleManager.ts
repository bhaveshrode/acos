import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";

/**
 * RuntimeLifecycleManager tracking subsystem lifecycles.
 */
export class RuntimeLifecycleManager {
  private readonly states = new Map<string, SubsystemLifecycle>();

  public setState(subsystem: string, state: SubsystemLifecycle): void {
    this.states.set(subsystem.toLowerCase(), state);
  }

  public getState(subsystem: string): SubsystemLifecycle {
    return this.states.get(subsystem.toLowerCase()) ?? SubsystemLifecycle.UNINITIALIZED;
  }

  public getStatesSnapshot(): Record<string, SubsystemLifecycle> {
    const snapshot: Record<string, SubsystemLifecycle> = {};
    for (const [key, val] of this.states.entries()) {
      snapshot[key] = val;
    }
    return snapshot;
  }
}
