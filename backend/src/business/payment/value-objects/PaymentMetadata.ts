import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";

export interface PaymentMetadataProps {
  metadata: Record<string, string>;
}

/**
 * Value Object wrapping dictionary parameters representing gateway payload metadata.
 */
export class PaymentMetadata extends ValueObject<PaymentMetadataProps> {
  private constructor(props: PaymentMetadataProps) {
    super(props);
  }

  /**
   * Creates a PaymentMetadata.
   */
  public static create(metadata: Record<string, string> = {}): Result<PaymentMetadata> {
    return Result.ok(new PaymentMetadata({ metadata }));
  }

  public get value(): Record<string, string> {
    return this.props.metadata;
  }
}
