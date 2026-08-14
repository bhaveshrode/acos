import { IModelProvider } from "./IModelProvider.js";

export class MockModelProvider implements IModelProvider {
  public readonly providerName = "MockModelProvider";

  public async generate(prompt: string, context?: any): Promise<string> {
    const cleanPrompt = prompt.toLowerCase();
    
    if (cleanPrompt.includes("invoice overdue") || cleanPrompt.includes("invoice")) {
      return JSON.stringify({
        selectedAction: "SEND_REMINDER",
        actionPayload: { type: "sms", reason: "Overdue reminder recommendation" },
        confidence: 0.95,
        alternatives: ["SEND_EMAIL_REMINDER"]
      });
    }

    if (cleanPrompt.includes("payment received") || cleanPrompt.includes("payment")) {
      return JSON.stringify({
        selectedAction: "RECONCILE_PAYMENT",
        actionPayload: { paymentId: context?.paymentId || "pay_999", amount: context?.amount || 1500.0 },
        confidence: 0.99,
        alternatives: ["NONE"]
      });
    }

    return JSON.stringify({
      selectedAction: "NONE",
      actionPayload: {},
      confidence: 1.0,
      alternatives: []
    });
  }
}
