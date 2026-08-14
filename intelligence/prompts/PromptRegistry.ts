export interface PromptTemplate {
  name: string;
  version: string;
  systemTemplate: string;
  userTemplate: string;
}

export class PromptRegistry {
  private readonly prompts = new Map<string, PromptTemplate>();

  constructor() {
    this.register({
      name: "InvoiceRiskAssessmentPrompt",
      version: "v1",
      systemTemplate: "You are an AI billing auditor assessing payment failure risks.",
      userTemplate: "Analyze customer history: {{customerHistory}}. Invoice due date: {{dueDate}}. Predict fail likelihood."
    });

    this.register({
      name: "PaymentReconciliationPrompt",
      version: "v1",
      systemTemplate: "You are an AI ledger reconciliation matching incoming transactions.",
      userTemplate: "Match transaction amount {{amount}} currency {{currency}} against outstanding invoices: {{invoices}}."
    });

    this.register({
      name: "InvoiceReminderPrompt",
      version: "v1",
      systemTemplate: "You are a polite billing notifier generating payment reminders.",
      userTemplate: "Generate a custom message for customer {{customerId}} regarding overdue invoice {{invoiceId}}."
    });
  }

  public register(prompt: PromptTemplate): void {
    const key = `${prompt.name}:${prompt.version}`;
    this.prompts.set(key, prompt);
  }

  public getPrompt(name: string, version: string): PromptTemplate {
    const key = `${name}:${version}`;
    const p = this.prompts.get(key);
    if (!p) {
      throw new Error(`Prompt template '${key}' is not registered.`);
    }
    return p;
  }
}
