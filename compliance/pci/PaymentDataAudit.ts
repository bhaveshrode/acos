/**
 * PaymentDataAudit documenting PCI actions.
 */
export class PaymentDataAudit {
  constructor(
    public readonly paymentId: string,
    public readonly action: "STRIP_CVV" | "MASK_PAN" | "PASSTHROUGH",
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
