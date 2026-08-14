/**
 * SensitiveFieldClassifier identifying billing properties.
 */
export class SensitiveFieldClassifier {
  private readonly sensitiveKeys = new Set(["pan", "cvv", "cardnumber", "cvc", "pin"]);

  public isSensitive(key: string): boolean {
    return this.sensitiveKeys.has(key.toLowerCase());
  }
}
