import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface DueDateProps {
  value: Date;
}

/**
 * Value Object representing a validated invoice deadline.
 */
export class DueDate extends ValueObject<DueDateProps> {
  private constructor(props: DueDateProps) {
    super(props);
  }

  /**
   * Creates a DueDate.
   */
  public static create(value: Date): Result<DueDate> {
    if (!value || isNaN(value.getTime())) {
      return Result.fail(ResultError.validation("Due date must be a valid Date object."));
    }
    return Result.ok(new DueDate({ value }));
  }

  public get value(): Date {
    return this.props.value;
  }
}
