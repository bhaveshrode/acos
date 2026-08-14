import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { OutstandingBalance } from "./OutstandingBalance.js";
import { CreditAmount } from "./CreditAmount.js";

export interface AccountBalanceProps {
  outstandingBalance: OutstandingBalance;
  creditBalance: CreditAmount;
  currency: string;
}

/**
 * Value Object summarizing a customer's total financial position.
 */
export class AccountBalance extends ValueObject<AccountBalanceProps> {
  private constructor(props: AccountBalanceProps) {
    super(props);
  }

  /**
   * Creates an AccountBalance.
   */
  public static create(
    outstandingBalance: OutstandingBalance,
    creditBalance: CreditAmount,
    currency: string
  ): Result<AccountBalance> {
    if (!currency || currency.trim() === "") {
      return Result.fail(ResultError.validation("Currency must be specified."));
    }
    if (outstandingBalance.currency !== currency || creditBalance.currency !== currency) {
      return Result.fail(ResultError.conflict("Currency mismatch in AccountBalance properties."));
    }
    return Result.ok(new AccountBalance({ outstandingBalance, creditBalance, currency }));
  }

  public get outstandingBalance(): OutstandingBalance { return this.props.outstandingBalance; }
  public get creditBalance(): CreditAmount { return this.props.creditBalance; }
  public get currency(): string { return this.props.currency; }

  /**
   * Returns the net balance (Outstanding - Credit).
   */
  public get netBalanceAmount(): number {
    return this.props.outstandingBalance.amount - this.props.creditBalance.amount;
  }
}
