/**
 * DTO carrying parameters for recording an obligation under Accounts Receivable.
 */
export interface RecordReceivableRequestDto {
  organizationId: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  dueDate: string;
}
