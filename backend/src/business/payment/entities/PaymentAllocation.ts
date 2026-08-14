import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Money } from "../../invoice/value-objects/Money.js";
import { AllocationStatus } from "../enums/AllocationStatus.js";

export interface PaymentAllocationProps {
  invoiceId: InvoiceId;
  allocatedAmount: Money;
  status: AllocationStatus;
}

/**
 * Child Entity tracking allocation of payment value to a specific Invoice.
 */
export class PaymentAllocation extends Entity<UniqueEntityID> {
  private props: PaymentAllocationProps;

  constructor(id: UniqueEntityID, props: PaymentAllocationProps) {
    super(id);
    this.props = props;
  }

  public get invoiceId(): InvoiceId { return this.props.invoiceId; }
  public get allocatedAmount(): Money { return this.props.allocatedAmount; }
  public get status(): AllocationStatus { return this.props.status; }

  /**
   * Sets the status of the allocation to ALLOCATED.
   */
  public allocate(): void {
    this.props.status = AllocationStatus.ALLOCATED;
  }

  /**
   * Releases or voids the allocation.
   */
  public release(): void {
    this.props.status = AllocationStatus.RELEASED;
  }
}
