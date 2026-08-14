import { Result } from "../../result/Result.js";

export interface PayoutRequest {
  amount: number;
  currency: string;
  destinationAccount: string;
  referenceId: string;
}

export interface PayoutResult {
  settlementId: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
  transferredAt: Date;
}

/**
 * Interface representing external bank settlement and merchant payout capabilities (e.g. SWIFT, ACH, Wise).
 */
export interface ISettlementProvider {
  /**
   * Triggers a payout settlement execution.
   */
  payout(request: PayoutRequest): Promise<Result<PayoutResult>>;

  /**
   * Verifies the status of a specific settlement transaction.
   */
  verifySettlementStatus(settlementId: string): Promise<Result<PayoutResult>>;
}
