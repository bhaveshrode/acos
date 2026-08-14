import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface AssignmentReferenceProps {
  value: string;
}

/**
 * Value Object representing a task assignee reference (user, role, or department ID).
 */
export class AssignmentReference extends ValueObject<AssignmentReferenceProps> {
  private constructor(props: AssignmentReferenceProps) {
    super(props);
  }

  /**
   * Creates an AssignmentReference.
   */
  public static create(value: string): Result<AssignmentReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Assignment reference cannot be empty."));
    }
    return Result.ok(new AssignmentReference({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
