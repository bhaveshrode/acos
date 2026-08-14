export interface CompatibilityReport {
  isCompatible: boolean;
  warnings: string[];
  errors: string[];
}

export class CompatibilityChecker {
  public checkPayload(payload: any, type: "invoice" | "refund"): CompatibilityReport {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (type === "invoice") {
      if (!payload.currency) {
        errors.push("Error: 'currency' field is required in ACOS v2.");
      } else if (payload.currency.length < 3 || payload.currency.length > 6) {
        errors.push("Error: 'currency' field must be between 3 and 6 letters in ACOS v2.");
      }

      if (!payload.organizationId) {
        errors.push("Error: 'organizationId' is missing.");
      }
    } else if (type === "refund") {
      if (!payload.paymentId) {
        errors.push("Error: 'paymentId' is required.");
      }
      if (!payload.amount || payload.amount <= 0) {
        errors.push("Error: Refund 'amount' must be positive.");
      }
      if (!payload.reason) {
        warnings.push("Warning: Providing a 'reason' for refunds is highly recommended in ACOS v2.");
      }
    }

    return {
      isCompatible: errors.length === 0,
      warnings,
      errors
    };
  }
}
