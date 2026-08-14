import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";
/**
 * RuntimeBootstrapper orchestrating topological startup phases.
 */
export class RuntimeBootstrapper {
    graph;
    lifecycle;
    constructor(graph, lifecycle) {
        this.graph = graph;
        this.lifecycle = lifecycle;
    }
    async boot(progressCb) {
        const bootOrder = this.graph.getBootOrder();
        for (const sub of bootOrder) {
            this.lifecycle.setState(sub, SubsystemLifecycle.INITIALIZING);
            // Simulate startup work latency
            await new Promise((resolve) => setTimeout(resolve, 10));
            if (progressCb) {
                progressCb(sub);
            }
            this.lifecycle.setState(sub, SubsystemLifecycle.READY);
        }
        return bootOrder;
    }
}
