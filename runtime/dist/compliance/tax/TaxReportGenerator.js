import { TaxReport } from "./TaxReport.js";
/**
 * TaxReportGenerator compiling reports.
 */
export class TaxReportGenerator {
    generate(reportId, jurisdictionCode, transactions) {
        const filtered = transactions.filter((t) => t.jurisdictionCode === jurisdictionCode);
        const totalBase = filtered.reduce((acc, t) => acc + t.calculation.baseAmount, 0);
        const totalTax = filtered.reduce((acc, t) => acc + t.calculation.taxAmount, 0);
        return new TaxReport(reportId, jurisdictionCode, totalBase, totalTax, filtered);
    }
}
