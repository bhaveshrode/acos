import { PilotLimits } from "./PilotLimits.js";

/**
 * PilotManager managing active cohort restrictions.
 */
export class PilotManager {
  private readonly merchantsList: string[] = [];

  constructor(public readonly limits: PilotLimits) {}

  public onboardMerchant(merchantId: string): void {
    if (this.merchantsList.length >= this.limits.maxMerchants) {
      throw new Error(`Pilot onboarding blocked: Cohort size limit reached (${this.limits.maxMerchants})`);
    }
    this.merchantsList.push(merchantId);
  }

  public isTransactionAllowed(amount: number): boolean {
    return amount <= this.limits.maxPaymentAmount;
  }

  public getMerchants(): readonly string[] {
    return Object.freeze([...this.merchantsList]);
  }

  public clear(): void {
    this.merchantsList.length = 0;
  }
}
