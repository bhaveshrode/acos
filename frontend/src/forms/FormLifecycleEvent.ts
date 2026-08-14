/**
 * FormLifecycleType enumerating form events categories.
 */
export type FormLifecycleType =
  | "initializing"
  | "validationStarted"
  | "validationCompleted"
  | "submitted"
  | "dirty"
  | "destroyed";

/**
 * FormLifecycleEvent capturing detailed form state updates timestamps.
 */
export class FormLifecycleEvent {
  constructor(
    public readonly formId: string,
    public readonly type: FormLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {
    Object.freeze(this);
  }
}
