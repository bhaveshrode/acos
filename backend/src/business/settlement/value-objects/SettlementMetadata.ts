import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";

export interface SettlementMetadataProps {
  metadata: Record<string, string>;
}

/**
 * Value Object wrapping dictionary parameters representing gateway or chain metadata.
 */
export class SettlementMetadata extends ValueObject<SettlementMetadataProps> {
  private constructor(props: SettlementMetadataProps) {
    super(props);
  }

  /**
   * Creates a SettlementMetadata.
   */
  public static create(metadata: Record<string, string> = {}): Result<SettlementMetadata> {
    return Result.ok(new SettlementMetadata({ metadata }));
  }

  public get value(): Record<string, string> {
    return this.props.metadata;
  }
}
