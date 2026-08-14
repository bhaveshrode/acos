/**
 * Infrastructure snapshot model for the Invoice aggregate.
 */
export interface InvoiceSnapshot {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  status: string;
  type: string;
  currency: string;
  paymentTerms: string;
  issueDate: Date;
  dueDate: Date;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
    taxRate: number;
    amount: number;
  }>;
  notes: Array<{
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  }>;
  discount: {
    type: string;
    value: number;
  } | null;
  period: {
    startDate: Date;
    endDate: Date;
  } | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}
