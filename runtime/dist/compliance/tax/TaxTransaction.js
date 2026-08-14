/**
 * TaxTransaction documenting tax values computed for business transactions.
 */
export class TaxTransaction {
    transactionId;
    invoiceId;
    jurisdictionCode;
    calculation;
    timestamp;
    constructor(transactionId, invoiceId, jurisdictionCode, calculation, timestamp = new Date()) {
        this.transactionId = transactionId;
        this.invoiceId = invoiceId;
        this.jurisdictionCode = jurisdictionCode;
        this.calculation = calculation;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
