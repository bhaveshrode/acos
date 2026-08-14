import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";
/**
 * RuntimeLifecycleManager tracking subsystem lifecycles.
 */
export class RuntimeLifecycleManager {
    states = new Map();
    setState(subsystem, state) {
        this.states.set(subsystem.toLowerCase(), state);
    }
    getState(subsystem) {
        return this.states.get(subsystem.toLowerCase()) ?? SubsystemLifecycle.UNINITIALIZED;
    }
    getStatesSnapshot() {
        const snapshot = {};
        for (const [key, val] of this.states.entries()) {
            snapshot[key] = val;
        }
        return snapshot;
    }
}
