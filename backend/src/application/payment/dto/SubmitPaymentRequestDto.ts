/**
 * DTO carrying parameters for submitting a new Payment.
 */
export interface SubmitPaymentRequestDto {
  organizationId: string;
  customerId: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  invoiceId: string;
  allocatedAmount: number;
  transactionHash?: string;
}
