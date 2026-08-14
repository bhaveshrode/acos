import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface CollectionPriorityProps {
  value: string;
}

/**
 * Value Object representing a collection action priority level.
 */
export class CollectionPriority extends ValueObject<CollectionPriorityProps> {
  public static readonly LOW = "LOW";
  public static readonly MEDIUM = "MEDIUM";
  public static readonly HIGH = "HIGH";
  public static readonly CRITICAL = "CRITICAL";

  private constructor(props: CollectionPriorityProps) {
    super(props);
  }

  /**
   * Creates a CollectionPriority.
   */
  public static create(value: string): Result<CollectionPriority> {
    const formatted = value.toUpperCase().trim();
    const valid = [
      CollectionPriority.LOW,
      CollectionPriority.MEDIUM,
      CollectionPriority.HIGH,
      CollectionPriority.CRITICAL
    ];
    if (!valid.includes(formatted)) {
      return Result.fail(ResultError.validation(`Invalid collection priority: ${value}.`));
    }
    return Result.ok(new CollectionPriority({ value: formatted }));
  }

  public get value(): string {
    return this.props.value;
  }
}
