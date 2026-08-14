"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XeroAdapter = void 0;
/**
 * XeroAdapter adapting external Xero APIs.
 */
class XeroAdapter {
    async syncInvoice(invoiceId, payload) {
        return `xero_inv_${invoiceId}`;
    }
    async getFinancialReport(reportId) {
        return { reportId, source: "xero" };
    }
}
exports.XeroAdapter = XeroAdapter;
