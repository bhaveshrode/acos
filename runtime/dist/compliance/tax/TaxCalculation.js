/**
 * TaxCalculation carrying computed tax results.
 */
export class TaxCalculation {
    baseAmount;
    taxRate;
    taxAmount;
    breakdownDescription;
    constructor(baseAmount, taxRate, taxAmount, breakdownDescription) {
        this.baseAmount = baseAmount;
        this.taxRate = taxRate;
        this.taxAmount = taxAmount;
        this.breakdownDescription = breakdownDescription;
        Object.freeze(this);
    }
}
