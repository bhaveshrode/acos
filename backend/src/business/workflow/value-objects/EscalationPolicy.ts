import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface EscalationPolicyProps {
  level1ThresholdSeconds: number;
  level2ThresholdSeconds: number;
  level3ThresholdSeconds: number;
}

/**
 * Value Object managing thresholds for task escalation tiers.
 * Validates that limits are positive and ascending (Level 1 < Level 2 < Level 3).
 */
export class EscalationPolicy extends ValueObject<EscalationPolicyProps> {
  private constructor(props: EscalationPolicyProps) {
    super(props);
  }

  /**
   * Creates an EscalationPolicy.
   */
  public static create(
    level1: number,
    level2: number,
    level3: number
  ): Result<EscalationPolicy> {
    if (level1 <= 0 || level2 <= 0 || level3 <= 0) {
      return Result.fail(ResultError.validation("Escalation thresholds must be positive."));
    }
    if (level1 >= level2 || level2 >= level3) {
      return Result.fail(
        ResultError.validation(
          "Escalation thresholds must follow ascending order: Level 1 < Level 2 < Level 3."
        )
      );
    }
    return Result.ok(
      new EscalationPolicy({
        level1ThresholdSeconds: level1,
        level2ThresholdSeconds: level2,
        level3ThresholdSeconds: level3
      })
    );
  }

  public get level1(): number { return this.props.level1ThresholdSeconds; }
  public get level2(): number { return this.props.level2ThresholdSeconds; }
  public get level3(): number { return this.props.level3ThresholdSeconds; }
}
