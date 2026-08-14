import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface SettlementTimeProps {
  value: Date;
}

/**
 * Value Object representing a settlement timestamp.
 */
export class SettlementTime extends ValueObject<SettlementTimeProps> {
  private constructor(props: SettlementTimeProps) {
    super(props);
  }

  /**
   * Creates a SettlementTime.
   */
  public static create(value: Date): Result<SettlementTime> {
    if (!value || isNaN(value.getTime())) {
      return Result.fail(ResultError.validation("Settlement time must be a valid date."));
    }
    return Result.ok(new SettlementTime({ value }));
  }

  public get value(): Date {
    return this.props.value;
  }
}
