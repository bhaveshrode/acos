/**
 * Infrastructure snapshot model for the Accounts Receivable aggregate.
 */
export interface ReceivableSnapshot {
  id: string;
  organizationId: string;
  customerId: string;
  status: string;
  collectionStatus: string;
  entries: Array<{
    id: string;
    invoiceId: string;
    originalAmount: number;
    remainingBalance: number;
    currency: string;
    dueDate: Date;
  }>;
  paymentApplications: Array<{
    id: string;
    settlementId: string;
    invoiceId: string;
    appliedAmount: number;
    currency: string;
    appliedAt: Date;
  }>;
  customerCredits: Array<{
    id: string;
    source: string;
    amount: number;
    remainingBalance: number;
    currency: string;
    reason: string;
    createdAt: Date;
  }>;
  collectionActions: Array<{
    id: string;
    actionType: string;
    notes: string;
    performedBy: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
