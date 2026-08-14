import { RuntimeLifecycleManager } from "../bootstrap/RuntimeLifecycleManager.js";
import { SubsystemLifecycle } from "./SubsystemLifecycle.js";

/**
 * LifecycleCoordinator managing transitions.
 */
export class LifecycleCoordinator {
  constructor(private readonly manager: RuntimeLifecycleManager) {}

  public transitionTo(subsystem: string, state: SubsystemLifecycle): void {
    this.manager.setState(subsystem, state);
  }

  public getStatus(subsystem: string): SubsystemLifecycle {
    return this.manager.getState(subsystem);
  }
}
