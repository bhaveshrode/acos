/**
 * FactoryValidator tracing circular dependencies and missing items.
 */
export class FactoryValidator {
  public validate(graph: Map<string, string[]>): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const checkCircular = (node: string): boolean => {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      const dependencies = graph.get(node) || [];
      for (const dep of dependencies) {
        if (!graph.has(dep)) {
          errors.push(`Missing dependency: ${dep} required by ${node}`);
        } else if (checkCircular(dep)) {
          return true;
        }
      }

      stack.delete(node);
      return false;
    };

    for (const key of graph.keys()) {
      if (checkCircular(key)) {
        errors.push(`Circular dependency detected starting from ${key}`);
      }
    }

    return errors;
  }
}
