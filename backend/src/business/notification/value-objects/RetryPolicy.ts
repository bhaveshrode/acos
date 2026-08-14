import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface RetryPolicyProps {
  maxRetries: number;
  retryIntervalSeconds: number;
}

/**
 * Value Object defining retry limits and intervals for failed notification dispatches.
 */
export class RetryPolicy extends ValueObject<RetryPolicyProps> {
  private constructor(props: RetryPolicyProps) {
    super(props);
  }

  /**
   * Creates a RetryPolicy.
   */
  public static create(maxRetries: number, retryIntervalSeconds: number): Result<RetryPolicy> {
    if (isNaN(maxRetries) || !Number.isInteger(maxRetries) || maxRetries < 0) {
      return Result.fail(ResultError.validation("Max retries must be a non-negative integer."));
    }
    if (isNaN(retryIntervalSeconds) || retryIntervalSeconds < 0) {
      return Result.fail(ResultError.validation("Retry interval seconds must be non-negative."));
    }
    return Result.ok(new RetryPolicy({ maxRetries, retryIntervalSeconds }));
  }

  public get maxRetries(): number { return this.props.maxRetries; }
  public get retryIntervalSeconds(): number { return this.props.retryIntervalSeconds; }
}
