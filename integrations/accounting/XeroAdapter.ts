import { IAccountingProvider } from "./IAccountingProvider.js";

/**
 * XeroAdapter adapting external Xero APIs.
 */
export class XeroAdapter implements IAccountingProvider {
  public async syncInvoice(
    invoiceId: string,
    payload: Record<string, any>
  ): Promise<string> {
    return `xero_inv_${invoiceId}`;
  }

  public async getFinancialReport(reportId: string): Promise<Record<string, any>> {
    return { reportId, source: "xero" };
  }
}
