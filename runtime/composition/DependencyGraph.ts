import { SubsystemRegistry } from "./SubsystemRegistry.js";

/**
 * DependencyGraph sorting subsystems topologically.
 */
export class DependencyGraph {
  constructor(private readonly registry: SubsystemRegistry) {}

  public getBootOrder(): string[] {
    const list = this.registry.list();
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (node: string) => {
      const lowerNode = node.toLowerCase();
      if (temp.has(lowerNode)) {
        throw new Error(`Circular dependency detected in subsystem graph: ${node}`);
      }
      if (!visited.has(lowerNode)) {
        temp.add(lowerNode);
        const desc = this.registry.get(lowerNode);
        if (desc) {
          for (const dep of desc.dependencies) {
            visit(dep);
          }
        }
        temp.delete(lowerNode);
        visited.add(lowerNode);
        order.push(lowerNode);
      }
    };

    for (const desc of list) {
      visit(desc.name);
    }

    return order;
  }
}
