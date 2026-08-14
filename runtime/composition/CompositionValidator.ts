import { SubsystemRegistry } from "./SubsystemRegistry.js";
import { DependencyGraph } from "./DependencyGraph.js";

/**
 * CompositionValidator validating composition graphs.
 */
export class CompositionValidator {
  constructor(private readonly registry: SubsystemRegistry) {}

  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const list = this.registry.list();

    // 1. Verify all dependencies exist in registry
    for (const desc of list) {
      for (const dep of desc.dependencies) {
        if (!this.registry.get(dep)) {
          errors.push(`Subsystem '${desc.name}' depends on unregistered subsystem '${dep}'`);
        }
      }
    }

    // 2. Verify cycle-free topological sort
    if (errors.length === 0) {
      try {
        const graph = new DependencyGraph(this.registry);
        graph.getBootOrder();
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
