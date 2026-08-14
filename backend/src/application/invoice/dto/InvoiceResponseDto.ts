/**
 * DTO representing detailed Invoice details for presentation layers.
 */
export interface InvoiceResponseDto {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  status: string;
  type: string;
  currency: string;
  paymentTerms: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    subtotal: number;
    total: number;
  }>;
  createdAt: string;
}
