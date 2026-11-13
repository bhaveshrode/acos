/**
 * Infrastructure snapshot model for the AccountsReceivable aggregate.
 */
export interface AccountsReceivableSnapshot {
  id: string;
  organizationId: string;
  customerId: string;
  status: string;
  collectionStatus: string;
  entries: Array<{
    id: string;
    invoiceId: string;
    originalAmount: number;
    remainingAmount: number;
    currency: string;
    dueDate: Date;
  }>;
  paymentApplications: Array<{
    id: string;
    settlementId: string;
    invoiceId: string;
    amount: number;
    currency: string;
    appliedAt: Date;
  }>;
  customerCredits: Array<{
    id: string;
    source: string;
    amount: number;
    remainingAmount: number;
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
