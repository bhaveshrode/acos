import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface ReceivablePeriodProps {
  value: string;
}

/**
 * Value Object representing a reporting period (e.g. "2027-Q1", "2027-07").
 */
export class ReceivablePeriod extends ValueObject<ReceivablePeriodProps> {
  private constructor(props: ReceivablePeriodProps) {
    super(props);
  }

  /**
   * Creates a ReceivablePeriod.
   */
  public static create(value: string): Result<ReceivablePeriod> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Receivable period cannot be empty."));
    }
    return Result.ok(new ReceivablePeriod({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
