/**
 * DTO representing detailed Accounts Receivable profile details.
 */
export interface ReceivableResponseDto {
  id: string;
  organizationId: string;
  customerId: string;
  status: string;
  collectionStatus: string;
  entries: Array<{
    invoiceId: string;
    originalAmount: number;
    remainingBalance: number;
    currency: string;
    dueDate: string;
    isPaid: boolean;
  }>;
  createdAt: string;
}
