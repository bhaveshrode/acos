import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CreditReasonProps {
  value: string;
}

/**
 * Value Object representing the business reason why a customer credit was created.
 */
export class CreditReason extends ValueObject<CreditReasonProps> {
  private constructor(props: CreditReasonProps) {
    super(props);
  }

  /**
   * Creates a CreditReason.
   */
  public static create(value: string): Result<CreditReason> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Credit reason cannot be empty."));
    }
    return Result.ok(new CreditReason({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
