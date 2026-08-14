import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface NotificationBodyProps {
  value: string;
}

/**
 * Value Object representing the body content of a notification message.
 */
export class NotificationBody extends ValueObject<NotificationBodyProps> {
  private constructor(props: NotificationBodyProps) {
    super(props);
  }

  /**
   * Creates a NotificationBody.
   */
  public static create(value: string): Result<NotificationBody> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Notification body cannot be empty."));
    }
    return Result.ok(new NotificationBody({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
