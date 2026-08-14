/**
 * Physical database schema mapping interface for payment records.
 */
export interface PaymentTable {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  transactionHash: string;
  createdAt: Date;
  updatedAt: Date;
}
