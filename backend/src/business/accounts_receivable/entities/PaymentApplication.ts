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
}
