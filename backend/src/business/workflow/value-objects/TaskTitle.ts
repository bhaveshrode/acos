import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TaskTitleProps {
  value: string;
}

/**
 * Value Object representing a validated task title.
 */
export class TaskTitle extends ValueObject<TaskTitleProps> {
  private constructor(props: TaskTitleProps) {
    super(props);
  }

  /**
   * Creates a TaskTitle.
   */
  public static create(value: string): Result<TaskTitle> {
    if (!value || value.trim() === "" || value.trim().length > 150) {
      return Result.fail(
        ResultError.validation("Task title cannot be empty and must not exceed 150 characters.")
      );
    }
    return Result.ok(new TaskTitle({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
