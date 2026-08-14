/**
 * IAccountingProvider interface declaring invoice sync and financial reports hooks.
 */
export interface IAccountingProvider {
  syncInvoice(
    invoiceId: string,
    payload: Record<string, any>
  ): Promise<string>;
  getFinancialReport(reportId: string): Promise<Record<string, any>>;
}
