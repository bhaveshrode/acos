import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WorkflowDeadlineProps {
  value: Date;
}

/**
 * Value Object representing the process overall deadline limit.
 */
export class WorkflowDeadline extends ValueObject<WorkflowDeadlineProps> {
  private constructor(props: WorkflowDeadlineProps) {
    super(props);
  }

  /**
   * Creates a WorkflowDeadline.
   */
  public static create(value: Date): Result<WorkflowDeadline> {
    if (!value || isNaN(value.getTime())) {
      return Result.fail(
        ResultError.validation("Workflow deadline must be a valid Date object.")
      );
    }
    return Result.ok(new WorkflowDeadline({ value }));
  }

  public get value(): Date {
    return this.props.value;
  }
}
