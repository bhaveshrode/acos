/**
 * DTO carrying parameters for creating a new Invoice.
 */
export interface CreateInvoiceRequestDto {
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  currency: string;
  paymentTerms: string;
  issueDate: string;
  dueDate: string;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}
