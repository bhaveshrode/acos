import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { CreditSource } from "../enums/CreditSource.js";
import { CreditReason } from "../value-objects/CreditReason.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface CustomerCreditProps {
  source: CreditSource;
  amount: Money;
  remainingBalance: Money;
  reason: CreditReason;
  createdAt: Date;
}

/**
 * Child Entity representing an unapplied credit balance belonging to the customer.
 */
export class CustomerCredit extends Entity<UniqueEntityID> {
  private props: CustomerCreditProps;

  constructor(id: UniqueEntityID, props: CustomerCreditProps) {
    super(id);
    this.props = props;
  }

  public get source(): CreditSource { return this.props.source; }
  public get amount(): Money { return this.props.amount; }
  public get remainingBalance(): Money { return this.props.remainingBalance; }
  public get reason(): CreditReason { return this.props.reason; }
  public get createdAt(): Date { return this.props.createdAt; }

  /**
   * Consumes credit. Returns the excess amount of request that wasn't covered by this credit.
   */
  public consume(amount: Money): Money {
    if (amount.currency !== this.props.remainingBalance.currency) {
      throw new Error("Currency mismatch in credit consumption.");
    }

    const current = this.props.remainingBalance.amount;
    if (amount.amount >= current) {
      this.props.remainingBalance = Money.create(0, this.props.remainingBalance.currency).value;
      return Money.create(amount.amount - current, amount.currency).value;
    } else {
      this.props.remainingBalance = Money.create(current - amount.amount, this.props.remainingBalance.currency).value;
      return Money.create(0, amount.currency).value;
    }
  }

  /**
   * Checks if this credit is fully applied/consumed.
   */
  public get isFullyConsumed(): boolean {
    return this.props.remainingBalance.amount === 0;
  }
}
