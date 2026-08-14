/**
 * Physical database schema mapping interface for settlement records.
 */
export interface SettlementTable {
  id: string;
  organizationId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
