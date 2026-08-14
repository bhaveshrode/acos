/**
 * DTO representing detailed Payment details.
 */
export interface PaymentResponseDto {
  id: string;
  organizationId: string;
  customerId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionHash: string | null;
  allocations: Array<{
    id: string;
    invoiceId: string;
    allocatedAmount: number;
    currency: string;
    status: string;
  }>;
  createdAt: string;
}
