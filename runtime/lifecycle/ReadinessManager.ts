import { RuntimeLifecycleManager } from "../bootstrap/RuntimeLifecycleManager.js";
import { SubsystemLifecycle } from "./SubsystemLifecycle.js";

/**
 * ReadinessManager asserting subsystems ready status.
 */
export class ReadinessManager {
  constructor(private readonly manager: RuntimeLifecycleManager) {}

  public isReady(subsystem: string): boolean {
    return this.manager.getState(subsystem) === SubsystemLifecycle.READY;
  }

  public allReady(subsystems: string[]): boolean {
    return subsystems.every((sub) => this.isReady(sub));
  }
}
