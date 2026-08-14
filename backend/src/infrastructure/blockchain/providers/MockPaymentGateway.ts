import { IPaymentGateway, ChargeRequest, ChargeResult } from "../../../foundation/contracts/payment/IPaymentGateway.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Mock payment gateway simulating Stripe/Circle payment charges.
 */
export class MockPaymentGateway implements IPaymentGateway {
  public async charge(request: ChargeRequest): Promise<Result<ChargeResult>> {
    const transactionId = "ch_" + Math.random().toString(36).substring(2, 10);
    return Result.ok({
      transactionId,
      status: "SUCCESS",
      amountCharged: request.amount
    });
  }

  public async refund(transactionId: string, amount?: number): Promise<Result<void>> {
    return Result.ok();
  }

  public async getTransactionStatus(transactionId: string): Promise<Result<ChargeResult>> {
    return Result.ok({
      transactionId,
      status: "SUCCESS",
      amountCharged: 100.0
    });
  }
}
