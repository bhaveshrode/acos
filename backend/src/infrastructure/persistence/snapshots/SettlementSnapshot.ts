/**
 * Infrastructure snapshot model for the Settlement aggregate.
 */
export interface SettlementSnapshot {
  id: string;
  organizationId: string;
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  confirmationThreshold: number;
  confirmations: Array<{
    id: string;
    source: string;
    count: number;
    timestamp: Date;
  }>;
  treasuryReceipts: Array<{
    id: string;
    wallet: string;
    amount: number;
    currency: string;
    timestamp: Date;
    treasuryReference: string;
  }>;
  notes: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  }>;
  blockNumber: number | null;
  transactionHash: string | null;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
