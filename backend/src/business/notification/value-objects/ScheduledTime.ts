import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface ScheduledTimeProps {
  value: Date;
}

/**
 * Value Object representing a scheduled notification delivery timestamp.
 */
export class ScheduledTime extends ValueObject<ScheduledTimeProps> {
  private constructor(props: ScheduledTimeProps) {
    super(props);
  }

  /**
   * Creates a ScheduledTime.
   */
  public static create(value: Date): Result<ScheduledTime> {
    if (!value || isNaN(value.getTime())) {
      return Result.fail(ResultError.validation("Scheduled time must be a valid date."));
    }
    return Result.ok(new ScheduledTime({ value }));
  }

  public get value(): Date {
    return this.props.value;
  }
}
