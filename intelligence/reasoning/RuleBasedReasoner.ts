import { IReasoningEngine } from "./IReasoningEngine.js";
import { IntelligenceContext } from "../context/IntelligenceContext.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class RuleBasedReasoner implements IReasoningEngine {
  public async reason(context: IntelligenceContext, agentId: string): Promise<IntelligenceDecision> {
    const eventType = context.props.eventType;
    let selectedAction = "NONE";
    let actionPayload: any = {};
    let reasoningSummary = "No actionable rules triggered.";
    const confidence = 1.0;
    const alternatives: string[] = [];

    if (eventType === "invoice.overdue") {
      const invoiceId = context.props.invoiceId;
      const reminders = context.props.previousReminders || [];
      if (reminders.length < 3) {
        selectedAction = "SEND_REMINDER";
        actionPayload = { invoiceId, type: "email", customerId: context.props.customerId };
        reasoningSummary = `Invoice ${invoiceId} is overdue. Reminders sent so far: ${reminders.length}. Triggering another reminder.`;
        alternatives.push("ESCALATE_TO_RECOVERY");
      } else {
        selectedAction = "ESCALATE";
        actionPayload = { invoiceId, customerId: context.props.customerId, reason: "Max overdue reminders reached" };
        reasoningSummary = `Invoice ${invoiceId} has reached max reminder threshold (${reminders.length}). Escalating.`;
        alternatives.push("SEND_FINAL_WARNING");
      }
    } else if (eventType === "payment.received") {
      const paymentId = context.props.paymentId;
      const openInvoices = context.props.relatedInvoices || [];
      const paymentAmount = context.props.relatedPayments?.[0]?.amount || 0.0;
      
      if (openInvoices.length > 0) {
        const targetInvoice = openInvoices[0];
        selectedAction = "RECONCILE_PAYMENT";
        actionPayload = { invoiceId: targetInvoice.id, paymentId, amount: paymentAmount };
        reasoningSummary = `Settle invoice ${targetInvoice.id} using received payment ${paymentId} of amount ${paymentAmount}.`;
        alternatives.push("CREDIT_CUSTOMER_ACCOUNT");
      } else {
        reasoningSummary = "No outstanding invoices found for this customer. Payment left unallocated.";
      }
    }

    return new IntelligenceDecision({
      decisionId: `dec_rule_${Math.floor(Math.random() * 100000)}`,
      agentId,
      contextSnapshot: context,
      reasoningSummary,
      selectedAction,
      actionPayload,
      confidence,
      alternatives,
      policyResult: "ALLOW",
      createdAt: new Date()
    });
  }
}
