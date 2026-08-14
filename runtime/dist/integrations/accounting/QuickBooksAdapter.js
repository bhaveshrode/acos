"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickBooksAdapter = void 0;
/**
 * QuickBooksAdapter adapting QuickBooks online APIs.
 */
class QuickBooksAdapter {
    async syncInvoice(invoiceId, payload) {
        return `qbo_inv_${invoiceId}`;
    }
    async getFinancialReport(reportId) {
        return { reportId, source: "quickbooks" };
    }
}
exports.QuickBooksAdapter = QuickBooksAdapter;
