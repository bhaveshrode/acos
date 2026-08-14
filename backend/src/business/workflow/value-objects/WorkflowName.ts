import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WorkflowNameProps {
  value: string;
}

/**
 * Value Object representing a validated Workflow Template or process name.
 */
export class WorkflowName extends ValueObject<WorkflowNameProps> {
  private constructor(props: WorkflowNameProps) {
    super(props);
  }

  /**
   * Creates a WorkflowName.
   */
  public static create(value: string): Result<WorkflowName> {
    if (!value || value.trim().length < 3 || value.trim().length > 100) {
      return Result.fail(
        ResultError.validation("Workflow name must be between 3 and 100 characters.")
      );
    }
    return Result.ok(new WorkflowName({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
