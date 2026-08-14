/**
 * TaxReport detailing totals.
 */
export class TaxReport {
    reportId;
    jurisdictionCode;
    totalBaseAmount;
    totalTaxAmount;
    transactions;
    constructor(reportId, jurisdictionCode, totalBaseAmount, totalTaxAmount, transactions) {
        this.reportId = reportId;
        this.jurisdictionCode = jurisdictionCode;
        this.totalBaseAmount = totalBaseAmount;
        this.totalTaxAmount = totalTaxAmount;
        this.transactions = Object.freeze([...transactions]);
        Object.freeze(this);
    }
}
