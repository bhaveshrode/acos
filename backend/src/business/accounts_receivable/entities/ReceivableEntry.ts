import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface ReceivableEntryProps {
  invoiceId: InvoiceId;
  originalAmount: Money;
  remainingBalance: Money;
  dueDate: Date;
}

/**
 * Child Entity representing an individual invoice obligation and its unpaid balance.
 */
export class ReceivableEntry extends Entity<UniqueEntityID> {
  private props: ReceivableEntryProps;

  constructor(id: UniqueEntityID, props: ReceivableEntryProps) {
    super(id);
    this.props = props;
  }

  public get invoiceId(): InvoiceId { return this.props.invoiceId; }
  public get originalAmount(): Money { return this.props.originalAmount; }
  public get remainingBalance(): Money { return this.props.remainingBalance; }
  public get dueDate(): Date { return this.props.dueDate; }

  /**
   * Applies a payment or credit to reduce the remaining balance.
   * Returns any excess amount that was not absorbed.
   */
  public applyPayment(amount: Money): Money {
    if (amount.currency !== this.props.remainingBalance.currency) {
      throw new Error("Currency mismatch in payment application.");
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
   * Forgives or writes off a remaining balance.
   */
  public writeOff(amount: Money): Money {
    if (amount.currency !== this.props.remainingBalance.currency) {
      throw new Error("Currency mismatch in write-off.");
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
   * Checks if this entry is fully paid.
   */
  public get isPaid(): boolean {
    return this.props.remainingBalance.amount === 0;
  }
}
