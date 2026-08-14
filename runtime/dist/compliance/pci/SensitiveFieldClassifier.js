/**
 * SensitiveFieldClassifier identifying billing properties.
 */
export class SensitiveFieldClassifier {
    sensitiveKeys = new Set(["pan", "cvv", "cardnumber", "cvc", "pin"]);
    isSensitive(key) {
        return this.sensitiveKeys.has(key.toLowerCase());
    }
}
