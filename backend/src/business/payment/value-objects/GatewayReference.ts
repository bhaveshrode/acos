import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface GatewayReferenceProps {
  value: string;
}

/**
 * Value Object representing a payment provider or gateway reference ID.
 */
export class GatewayReference extends ValueObject<GatewayReferenceProps> {
  private constructor(props: GatewayReferenceProps) {
    super(props);
  }

  /**
   * Creates a GatewayReference.
   */
  public static create(value: string): Result<GatewayReference> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Gateway reference cannot be empty."));
    }
    return Result.ok(new GatewayReference({ value: value.trim() }));
  }

  public get value(): string {
    return this.props.value;
  }
}
