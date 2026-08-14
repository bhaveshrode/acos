import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface InvoicePeriodProps {
  startDate: Date;
  endDate: Date;
}

/**
 * Value Object representing a billing period date range.
 */
export class InvoicePeriod extends ValueObject<InvoicePeriodProps> {
  private constructor(props: InvoicePeriodProps) {
    super(props);
  }

  /**
   * Creates an InvoicePeriod.
   */
  public static create(startDate: Date, endDate: Date): Result<InvoicePeriod> {
    if (!startDate || isNaN(startDate.getTime())) {
      return Result.fail(ResultError.validation("Start date must be a valid Date."));
    }
    if (!endDate || isNaN(endDate.getTime())) {
      return Result.fail(ResultError.validation("End date must be a valid Date."));
    }
    if (startDate > endDate) {
      return Result.fail(
        ResultError.validation("Billing period start date cannot precede end date.")
      );
    }
    return Result.ok(new InvoicePeriod({ startDate, endDate }));
  }

  public get startDate(): Date { return this.props.startDate; }
  public get endDate(): Date { return this.props.endDate; }
}
