export class UpgradeAssistant {
  public upgradeInvoicePayload(v1Payload: any): { v2Payload: any; upgradesApplied: string[] } {
    const upgradesApplied: string[] = [];
    const v2Payload = { ...v1Payload };

    if (!v2Payload.currency) {
      v2Payload.currency = "USD";
      upgradesApplied.push("Injected default currency: USD");
    }

    if (v2Payload.currency) {
      v2Payload.currency = v2Payload.currency.toUpperCase();
    }

    return { v2Payload, upgradesApplied };
  }

  public upgradeRefundPayload(v1Payload: any): { v2Payload: any; upgradesApplied: string[] } {
    const upgradesApplied: string[] = [];
    const v2Payload = { ...v1Payload };

    if (!v2Payload.reason) {
      v2Payload.reason = "Unspecified customer refund request";
      upgradesApplied.push("Injected default reason parameter");
    }

    return { v2Payload, upgradesApplied };
  }
}
