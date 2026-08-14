/**
 * DataMasker utility masking PAN digits.
 */
export class DataMasker {
    maskPAN(pan) {
        const clean = pan.replace(/\s+/g, "");
        if (clean.length < 4) {
            return "****";
        }
        const last4 = clean.slice(-4);
        return "*".repeat(clean.length - 4) + last4;
    }
}
