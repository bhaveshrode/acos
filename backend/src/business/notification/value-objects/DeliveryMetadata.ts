import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";

export interface DeliveryMetadataProps {
  metadata: Record<string, string>;
}

/**
 * Value Object wrapping dictionary parameters representing provider-specific gateway response metadata.
 */
export class DeliveryMetadata extends ValueObject<DeliveryMetadataProps> {
  private constructor(props: DeliveryMetadataProps) {
    super(props);
  }

  /**
   * Creates a DeliveryMetadata.
   */
  public static create(metadata: Record<string, string> = {}): Result<DeliveryMetadata> {
    return Result.ok(new DeliveryMetadata({ metadata }));
  }

  public get value(): Record<string, string> {
    return this.props.metadata;
  }
}
