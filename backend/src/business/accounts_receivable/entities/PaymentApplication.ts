import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";

export interface PaymentApplicationProps {
  settlementId: SettlementId;
  invoiceId: InvoiceId;
  appliedAmount: Money;
  appliedAt: Date;
  /** The applied money was customer credit the settlement left behind. */
  fundedByCredit?: boolean;
}

/**
 * Child Entity representing the application of settled funds to a specific invoice.
 */
export class PaymentApplication extends Entity<UniqueEntityID> {
  private props: PaymentApplicationProps;

  constructor(id: UniqueEntityID, props: PaymentApplicationProps) {
    super(id);
    this.props = props;
  }

  public get settlementId(): SettlementId { return this.props.settlementId; }
  public get invoiceId(): InvoiceId { return this.props.invoiceId; }
  public get appliedAmount(): Money { return this.props.appliedAmount; }
  public get appliedAt(): Date { return this.props.appliedAt; }
  public get fundedByCredit(): boolean { return this.props.fundedByCredit ?? false; }

  /**
   * Returns part of the applied money, so a refund of its settlement knows how
   * much of this application still stands. Restores at most what is applied and
   * returns any excess it could not absorb.
   */
  public reverse(amount: Money): Money {
    if (amount.currency !== this.props.appliedAmount.currency) {
      throw new Error("Currency mismatch in payment application reversal.");
    }

    const current = this.props.appliedAmount.amount;
    if (amount.amount >= current) {
      this.props.appliedAmount = Money.create(0, this.props.appliedAmount.currency).value;
      return Money.create(amount.amount - current, amount.currency).value;
    }
    this.props.appliedAmount = Money.create(current - amount.amount, this.props.appliedAmount.currency).value;
    return Money.create(0, amount.currency).value;
  }
}
