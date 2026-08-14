/**
 * DTO carrying parameters for processing a new Settlement.
 */
export interface ProcessSettlementRequestDto {
  organizationId: string;
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  confirmationThreshold?: number;
}
