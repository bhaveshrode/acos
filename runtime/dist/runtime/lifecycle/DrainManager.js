import { SubsystemLifecycle } from "./SubsystemLifecycle.js";
/**
 * DrainManager draining connections and loops gracefully.
 */
export class DrainManager {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    async drain(subsystem) {
        this.manager.setState(subsystem, SubsystemLifecycle.DRAINING);
        // Simulate connection draining latency
        await new Promise((resolve) => setTimeout(resolve, 5));
        this.manager.setState(subsystem, SubsystemLifecycle.STOPPED);
        return true;
    }
}
