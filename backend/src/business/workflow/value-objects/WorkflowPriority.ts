import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export type WorkflowPriorityType = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface WorkflowPriorityProps {
  value: WorkflowPriorityType;
}

/**
 * Value Object representing a validated workflow priority scale.
 */
export class WorkflowPriority extends ValueObject<WorkflowPriorityProps> {
  private constructor(props: WorkflowPriorityProps) {
    super(props);
  }

  /**
   * Creates a WorkflowPriority.
   */
  public static create(value: WorkflowPriorityType = "NORMAL"): Result<WorkflowPriority> {
    const valid = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
    const upper = value.toUpperCase();
    if (!valid.includes(upper)) {
      return Result.fail(ResultError.validation(`Invalid workflow priority: '${value}'.`));
    }
    return Result.ok(new WorkflowPriority({ value: upper as WorkflowPriorityType }));
  }

  public get value(): WorkflowPriorityType {
    return this.props.value;
  }
}
