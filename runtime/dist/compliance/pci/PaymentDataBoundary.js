import { DataMasker } from "./DataMasker.js";
import { SensitiveFieldClassifier } from "./SensitiveFieldClassifier.js";
/**
 * PaymentDataBoundary filtering out CVVs and masking PANs.
 */
export class PaymentDataBoundary {
    classifier = new SensitiveFieldClassifier();
    masker = new DataMasker();
    enforce(payload) {
        const sanitized = {};
        for (const [key, val] of Object.entries(payload)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey === "cvv" || lowerKey === "cvc" || lowerKey === "pin") {
                // Strip completely (prohibited)
                continue;
            }
            else if (lowerKey === "pan" || lowerKey === "cardnumber") {
                sanitized[key] = this.masker.maskPAN(String(val));
            }
            else {
                sanitized[key] = val;
            }
        }
        return sanitized;
    }
}
