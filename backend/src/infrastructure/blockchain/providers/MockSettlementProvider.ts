import { ISettlementProvider, PayoutRequest, PayoutResult } from "../../../foundation/contracts/payment/ISettlementProvider.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Mock settlement provider simulating ACH/SWIFT payouts.
 */
export class MockSettlementProvider implements ISettlementProvider {
  public async payout(request: PayoutRequest): Promise<Result<PayoutResult>> {
    const settlementId = "tx_" + Math.random().toString(36).substring(2, 10);
    return Result.ok({
      settlementId,
      status: "COMPLETED",
      transferredAt: new Date()
    });
  }

  public async verifySettlementStatus(settlementId: string): Promise<Result<PayoutResult>> {
    return Result.ok({
      settlementId,
      status: "COMPLETED",
      transferredAt: new Date()
    });
  }
}
