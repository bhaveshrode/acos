import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { AgingCategory } from "../enums/AgingCategory.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface AgingBucketProps {
  category: AgingCategory;
  amount: Money;
}

/**
 * Value Object grouping unpaid balance amounts by their aging category.
 */
export class AgingBucket extends ValueObject<AgingBucketProps> {
  private constructor(props: AgingBucketProps) {
    super(props);
  }

  /**
   * Creates an AgingBucket.
   */
  public static create(category: AgingCategory, amount: Money): Result<AgingBucket> {
    if (!category) {
      return Result.fail(ResultError.validation("Aging category must be provided."));
    }
    if (amount.amount < 0) {
      return Result.fail(ResultError.validation("Aging bucket amount cannot be negative."));
    }
    return Result.ok(new AgingBucket({ category, amount }));
  }

  public get category(): AgingCategory { return this.props.category; }
  public get amount(): Money { return this.props.amount; }
}
