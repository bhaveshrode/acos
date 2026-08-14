import { SubsystemLifecycle } from "./SubsystemLifecycle.js";
/**
 * ReadinessManager asserting subsystems ready status.
 */
export class ReadinessManager {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    isReady(subsystem) {
        return this.manager.getState(subsystem) === SubsystemLifecycle.READY;
    }
    allReady(subsystems) {
        return subsystems.every((sub) => this.isReady(sub));
    }
}
