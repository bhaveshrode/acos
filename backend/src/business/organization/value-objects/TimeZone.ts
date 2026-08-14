import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TimeZoneProps {
  value: string;
}

/**
 * Value Object representing a validated geographical timezone (e.g. UTC, Europe/London).
 */
export class TimeZone extends ValueObject<TimeZoneProps> {
  private constructor(props: TimeZoneProps) {
    super(props);
  }

  /**
   * Creates and validates a TimeZone.
   */
  public static create(value: string): Result<TimeZone> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("TimeZone cannot be empty."));
    }
    const trimmed = value.trim();

    try {
      // Use built-in JavaScript engine check
      Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    } catch (e) {
      const validFallbacks = ["UTC", "GMT", "EST", "PST", "MST", "CST"];
      if (!validFallbacks.includes(trimmed.toUpperCase())) {
        return Result.fail(ResultError.validation(`Invalid timezone identifier: '${value}'`));
      }
    }

    return Result.ok(new TimeZone({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
