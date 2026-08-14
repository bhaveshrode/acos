/**
 * DTO representing detailed Settlement properties.
 */
export interface SettlementResponseDto {
  id: string;
  organizationId: string;
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  confirmationThreshold: number;
  createdAt: string;
}
