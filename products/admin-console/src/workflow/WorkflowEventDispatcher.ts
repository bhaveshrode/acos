import { WorkflowLifecycleEvent } from "./WorkflowLifecycleEvent.js";

/**
 * WorkflowEventDispatcher distributing events to workflow observers.
 */
export class WorkflowEventDispatcher {
  private readonly listeners = new Set<(event: WorkflowLifecycleEvent) => void>();

  public dispatch(event: WorkflowLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: WorkflowLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
