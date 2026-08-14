import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Quantity } from "../value-objects/Quantity.js";
import { UnitPrice } from "../value-objects/UnitPrice.js";
import { TaxRate } from "../value-objects/TaxRate.js";
import { Money } from "../value-objects/Money.js";

export interface InvoiceLineProps {
  description: string;
  quantity: Quantity;
  unitPrice: UnitPrice;
  taxRate: TaxRate;
}

/**
 * Child Entity representing an itemized billable item on an invoice.
 */
export class InvoiceLine extends Entity<UniqueEntityID> {
  private props: InvoiceLineProps;

  constructor(id: UniqueEntityID, props: InvoiceLineProps) {
    super(id);
    this.props = props;
  }

  public get description(): string { return this.props.description; }
  public get quantity(): Quantity { return this.props.quantity; }
  public get unitPrice(): UnitPrice { return this.props.unitPrice; }
  public get taxRate(): TaxRate { return this.props.taxRate; }

  /**
   * Calculates subtotal before taxes (Quantity * UnitPrice).
   */
  public get subtotal(): Money {
    const rawAmount = this.quantity.value * this.unitPrice.amount;
    return Money.create(rawAmount, this.unitPrice.currency).value;
  }

  /**
   * Calculates tax amount applied to this line (subtotal * taxRate / 100).
   */
  public get taxAmount(): Money {
    const rawTax = this.subtotal.amount * (this.taxRate.value / 100);
    return Money.create(rawTax, this.unitPrice.currency).value;
  }

  /**
   * Calculates line total (subtotal + taxAmount).
   */
  public get total(): Money {
    return this.subtotal.add(this.taxAmount).value;
  }

  /**
   * Replaces details.
   */
  public updateLine(
    description: string,
    quantity: Quantity,
    unitPrice: UnitPrice,
    taxRate: TaxRate
  ): void {
    this.props.description = description;
    this.props.quantity = quantity;
    this.props.unitPrice = unitPrice;
    this.props.taxRate = taxRate;
  }
}
