/**
 * Infrastructure snapshot model for the Payment aggregate.
 */
export interface PaymentSnapshot {
  id: string;
  organizationId: string;
  customerId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  methodType: string;
  methodDetails: string;
  transactionHash: string | null;
  gatewayReference: string | null;
  walletAddress: string | null;
  metadata: Record<string, string>;
  confirmations: number;
  exchangeRate: number | null;
  allocations: Array<{
    id: string;
    invoiceId: string;
    amount: number;
    currency: string;
    status: string;
  }>;
  attempts: Array<{
    id: string;
    timestamp: Date;
    status: string;
    gatewayResponse: string | null;
    errorCode: string | null;
  }>;
  refundRequests: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    reason: string;
    requestedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
