import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface InvoiceNumberProps {
  value: string;
}

/**
 * Value Object representing a validated commercial invoice number (e.g. INV-2027-000001).
 */
export class InvoiceNumber extends ValueObject<InvoiceNumberProps> {
  private constructor(props: InvoiceNumberProps) {
    super(props);
  }

  /**
   * Creates an InvoiceNumber.
   */
  public static create(value: string): Result<InvoiceNumber> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Invoice number cannot be empty."));
    }
    const trimmed = value.trim().toUpperCase();
    if (!trimmed.startsWith("INV-")) {
      return Result.fail(
        ResultError.validation(`Invalid invoice number format: '${value}'. Must start with 'INV-'.`)
      );
    }
    return Result.ok(new InvoiceNumber({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
