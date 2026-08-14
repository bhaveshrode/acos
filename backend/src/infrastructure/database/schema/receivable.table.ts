/**
 * Physical database schema mapping interface for Accounts Receivable account records.
 */
export interface ReceivableTable {
  id: string;
  organizationId: string;
  customerId: string;
  status: string;
  collectionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Physical database schema mapping interface for Accounts Receivable entry records.
 */
export interface ReceivableEntryTable {
  id: string;
  receivableId: string;
  invoiceId: string;
  originalAmount: number;
  remainingBalance: number;
  currency: string;
  dueDate: Date;
  isPaid: boolean;
}
