/**
 * DataMasker utility masking PAN digits.
 */
export class DataMasker {
  public maskPAN(pan: string): string {
    const clean = pan.replace(/\s+/g, "");
    if (clean.length < 4) {
      return "****";
    }
    const last4 = clean.slice(-4);
    return "*".repeat(clean.length - 4) + last4;
  }
}
