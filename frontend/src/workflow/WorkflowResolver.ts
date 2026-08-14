import { WorkflowRegistry } from "./WorkflowRegistry.js";
import { WorkflowDescriptor } from "./WorkflowDescriptor.js";

/**
 * WorkflowResolver resolving registered descriptors by identifier.
 */
export class WorkflowResolver {
  constructor(private readonly registry: WorkflowRegistry) {}

  public resolve(id: string): WorkflowDescriptor {
    const descriptor = this.registry.get(id);
    if (!descriptor) {
      throw new Error(`Workflow with identifier ${id} is not registered`);
    }
    return descriptor;
  }
}
