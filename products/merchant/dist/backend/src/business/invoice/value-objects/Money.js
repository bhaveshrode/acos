import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
/**
 * Value Object representing a currency amount.
 * Enforces matching currency invariants on mathematical addition/subtraction.
 */
export class Money extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a Money value object.
     */
    static create(amount, currency) {
        if (isNaN(amount)) {
            return Result.fail(ResultError.validation("Amount must be a valid number."));
        }
        const cleanCurrency = currency.trim().toUpperCase();
        if (cleanCurrency.length < 3 || cleanCurrency.length > 6) {
            return Result.fail(ResultError.validation(`Invalid currency code: '${currency}'.`));
        }
        // Rounding to 2 decimal places to bypass decimal precision math problems
        const roundedAmount = Math.round(amount * 100) / 100;
        return Result.ok(new Money({ amount: roundedAmount, currency: cleanCurrency }));
    }
    /**
     * Creates a zero Money amount for the given currency.
     */
    static zero(currency) {
        return new Money({ amount: 0, currency: currency.toUpperCase() });
    }
    get amount() { return this.props.amount; }
    get currency() { return this.props.currency; }
    /**
     * Adds two Money amounts, verifying currencies match.
     */
    add(other) {
        if (this.currency !== other.currency) {
            return Result.fail(ResultError.conflict(`Currency mismatch: Cannot add ${other.currency} to ${this.currency}.`));
        }
        return Money.create(this.amount + other.amount, this.currency);
    }
    /**
     * Subtracts two Money amounts, verifying currencies match.
     */
    subtract(other) {
        if (this.currency !== other.currency) {
            return Result.fail(ResultError.conflict(`Currency mismatch: Cannot subtract ${other.currency} from ${this.currency}.`));
        }
        return Money.create(this.amount - other.amount, this.currency);
    }
    /**
     * Multiplies money by a numeric scalar multiplier.
     */
    multiply(multiplier) {
        return Money.create(this.amount * multiplier, this.currency).value;
    }
}
