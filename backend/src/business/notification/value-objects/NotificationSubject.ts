import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface NotificationSubjectProps {
  value: string;
}

/**
 * Value Object representing a validated notification subject line.
 */
export class NotificationSubject extends ValueObject<NotificationSubjectProps> {
  private constructor(props: NotificationSubjectProps) {
    super(props);
  }

  /**
   * Creates a NotificationSubject.
   */
  public static create(value: string): Result<NotificationSubject> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Notification subject cannot be empty."));
    }
    const clean = value.trim();
    if (clean.length > 200) {
      return Result.fail(ResultError.validation("Notification subject cannot exceed 200 characters."));
    }
    return Result.ok(new NotificationSubject({ value: clean }));
  }

  public get value(): string {
    return this.props.value;
  }
}
