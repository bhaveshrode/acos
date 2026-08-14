/**
 * PilotLimits capping merchant sizes.
 */
export class PilotLimits {
  constructor(
    public readonly maxMerchants: number,
    public readonly maxPaymentAmount: number,
    public readonly allowedIntegrations: string[]
  ) {
    Object.freeze(this.allowedIntegrations);
    Object.freeze(this);
  }
}
