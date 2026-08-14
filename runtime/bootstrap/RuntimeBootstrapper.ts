import { DependencyGraph } from "../composition/DependencyGraph.js";
import { RuntimeLifecycleManager } from "./RuntimeLifecycleManager.js";
import { SubsystemLifecycle } from "../lifecycle/SubsystemLifecycle.js";

/**
 * RuntimeBootstrapper orchestrating topological startup phases.
 */
export class RuntimeBootstrapper {
  constructor(
    private readonly graph: DependencyGraph,
    private readonly lifecycle: RuntimeLifecycleManager
  ) {}

  public async boot(progressCb?: (sub: string) => void): Promise<string[]> {
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
