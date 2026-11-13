/**
 * ValidationLifecycleType capturing pipeline status steps.
 */
export type ValidationLifecycleType = "started" | "completed" | "failed" | "cleared";

/**
 * ValidationEvent containing details of validation runs.
 */
export class ValidationEvent {
  constructor(
    public readonly targetId: string,
    public readonly type: ValidationLifecycleType,
    public readonly timestamp: number = Date.now(),
    public readonly errorsCount: number = 0
  ) {
    Object.freeze(this);
  }
}
