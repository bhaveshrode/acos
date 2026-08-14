/**
 * DependencyGraph sorting subsystems topologically.
 */
export class DependencyGraph {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    getBootOrder() {
        const list = this.registry.list();
        const visited = new Set();
        const temp = new Set();
        const order = [];
        const visit = (node) => {
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
