import { RuntimeLifecycleManager } from "../bootstrap/RuntimeLifecycleManager.js";
import { SubsystemLifecycle } from "./SubsystemLifecycle.js";

/**
 * DrainManager draining connections and loops gracefully.
 */
export class DrainManager {
  constructor(private readonly manager: RuntimeLifecycleManager) {}

  public async drain(subsystem: string): Promise<boolean> {
    this.manager.setState(subsystem, SubsystemLifecycle.DRAINING);
    
    // Simulate connection draining latency
    await new Promise((resolve) => setTimeout(resolve, 5));

    this.manager.setState(subsystem, SubsystemLifecycle.STOPPED);
    return true;
  }
}
