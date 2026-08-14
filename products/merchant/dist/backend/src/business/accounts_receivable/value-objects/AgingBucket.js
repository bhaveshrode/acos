import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object grouping unpaid balance amounts by their aging category.
 */
export class AgingBucket extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates an AgingBucket.
     */
    static create(category, amount) {
        if (!category) {
            return Result.fail(ResultError.validation("Aging category must be provided."));
        }
        if (amount.amount < 0) {
            return Result.fail(ResultError.validation("Aging bucket amount cannot be negative."));
        }
        return Result.ok(new AgingBucket({ category, amount }));
    }
    get category() { return this.props.category; }
    get amount() { return this.props.amount; }
}
