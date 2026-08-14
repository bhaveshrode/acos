/**
 * LifecycleCoordinator managing transitions.
 */
export class LifecycleCoordinator {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    transitionTo(subsystem, state) {
        this.manager.setState(subsystem, state);
    }
    getStatus(subsystem) {
        return this.manager.getState(subsystem);
    }
}
