import { Result } from "../../result/Result.js";

export interface ChargeRequest {
  amount: number;
  currency: string;
  referenceId: string;
  description?: string;
}

export interface ChargeResult {
  transactionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amountCharged: number;
  rawDetails?: Record<string, any>;
}

/**
 * Interface representing standard card/fiat payment gateway processing capabilities (e.g., Stripe, Circle, PayPal).
 */
export interface IPaymentGateway {
  /**
   * Initiates a payment charge transaction.
   */
  charge(request: ChargeRequest): Promise<Result<ChargeResult>>;

  /**
   * Refund an existing transaction.
   * @param transactionId ID of the transaction to refund.
   * @param amount Optional partial refund amount. If omitted, performs a full refund.
   */
  refund(transactionId: string, amount?: number): Promise<Result<void>>;

  /**
   * Retrieves the current status details of a specific transaction.
   */
  getTransactionStatus(transactionId: string): Promise<Result<ChargeResult>>;
}
