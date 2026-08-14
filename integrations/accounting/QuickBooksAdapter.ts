import { IAccountingProvider } from "./IAccountingProvider.js";

/**
 * QuickBooksAdapter adapting QuickBooks online APIs.
 */
export class QuickBooksAdapter implements IAccountingProvider {
  public async syncInvoice(
    invoiceId: string,
    payload: Record<string, any>
  ): Promise<string> {
    return `qbo_inv_${invoiceId}`;
  }

  public async getFinancialReport(reportId: string): Promise<Record<string, any>> {
    return { reportId, source: "quickbooks" };
  }
}
