import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WorkflowReferenceProps {
  value: string;
}

/**
 * Value Object representing a validated workflow business reference (e.g. WRK-2027-000001).
 */
export class WorkflowReference extends ValueObject<WorkflowReferenceProps> {
  private constructor(props: WorkflowReferenceProps) {
    super(props);
  }

  /**
   * Creates a WorkflowReference.
   */
  public static create(value: string): Result<WorkflowReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Workflow reference cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("WRK-")) {
      return Result.fail(
        ResultError.validation(`Invalid workflow reference: '${value}'. Must start with 'WRK-'.`)
      );
    }
    return Result.ok(new WorkflowReference({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
