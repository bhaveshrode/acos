import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface TaxIdentifierProps {
  value: string;
  type: "VAT" | "GST" | "TIN" | "BUSINESS_REGISTRATION";
}

/**
 * Value Object representing a tax identifier profile registration (GST/VAT/TIN).
 */
export class TaxIdentifier extends ValueObject<TaxIdentifierProps> {
  private constructor(props: TaxIdentifierProps) {
    super(props);
  }

  /**
   * Creates a TaxIdentifier.
   */
  public static create(
    value: string,
    type: "VAT" | "GST" | "TIN" | "BUSINESS_REGISTRATION" = "VAT"
  ): Result<TaxIdentifier> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Tax identifier value cannot be empty."));
    }
    return Result.ok(new TaxIdentifier({ value: value.trim().toUpperCase(), type }));
  }

  public get value(): string { return this.props.value; }
  public get type(): string { return this.props.type; }
}
