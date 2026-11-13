import { WorkflowDescriptor } from "./WorkflowDescriptor.js";

/**
 * WorkflowRegistry cataloging workflows with freezing capabilities.
 */
export class WorkflowRegistry {
  private readonly catalog = new Map<string, WorkflowDescriptor>();
  private isFrozen: boolean = false;

  public register(descriptor: WorkflowDescriptor): void {
    if (this.isFrozen) {
      throw new Error("WorkflowRegistry is frozen and cannot accept further workflows");
    }
    this.catalog.set(descriptor.metadata.id, descriptor);
  }

  public get(id: string): WorkflowDescriptor | undefined {
    return this.catalog.get(id);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
