import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Priority } from "../enums/Priority.js";

export interface NotificationPriorityProps {
  value: Priority;
}

/**
 * Value Object representing a validated notification priority level.
 */
export class NotificationPriority extends ValueObject<NotificationPriorityProps> {
  private constructor(props: NotificationPriorityProps) {
    super(props);
  }

  /**
   * Creates a NotificationPriority.
   */
  public static create(value: Priority): Result<NotificationPriority> {
    if (!value) {
      return Result.fail(ResultError.validation("Notification priority must be specified."));
    }
    return Result.ok(new NotificationPriority({ value }));
  }

  public get value(): Priority {
    return this.props.value;
  }
}
