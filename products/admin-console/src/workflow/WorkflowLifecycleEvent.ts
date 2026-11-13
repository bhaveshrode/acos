/**
 * WorkflowLifecycleType enumerating workflow transition statuses.
 */
export type WorkflowLifecycleType =
  | "initialized"
  | "execution"
  | "suspension"
  | "completion"
  | "cancellation"
  | "failure";

/**
 * WorkflowLifecycleEvent capturing runtime execution history details.
 */
export class WorkflowLifecycleEvent {
  constructor(
    public readonly workflowId: string,
    public readonly type: WorkflowLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
