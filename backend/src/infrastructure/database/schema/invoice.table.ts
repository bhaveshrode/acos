/**
 * Physical database schema mapping interface for invoice records.
 */
export interface InvoiceTable {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  currency: string;
  dueDate: Date;
  issuedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Physical database schema mapping interface for invoice line item records.
 */
export interface InvoiceLineItemTable {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}
