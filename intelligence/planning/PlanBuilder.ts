import { Plan, PlanStep } from "./Plan.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class PlanBuilder {
  public buildPlan(decision: IntelligenceDecision): Plan {
    const rawSteps: Omit<PlanStep, "status" | "idempotencyKey">[] = [];
    const action = decision.props.selectedAction;
    const payload = decision.props.actionPayload;
    const decisionId = decision.props.decisionId;

    if (action === "SEND_REMINDER") {
      rawSteps.push({
        stepId: `step_${decisionId}_1`,
        description: `Dispatch invoice reminder to customer ${payload.customerId}`,
        toolName: "SendNotificationTool",
        payload: {
          invoiceId: payload.invoiceId,
          type: payload.type || "email",
          userId: payload.customerId,
          subject: "ACOS Billing Notice: Invoice Overdue",
          body: `Please note that invoice ${payload.invoiceId} is overdue. Please arrange payment as soon as possible.`
        }
      });
    } else if (action === "RECONCILE_PAYMENT") {
      rawSteps.push({
        stepId: `step_${decisionId}_1`,
        description: `Submit received payment reference ${payload.paymentId} against invoice ${payload.invoiceId}`,
        toolName: "ReconcilePaymentTool",
        payload: {
          invoiceId: payload.invoiceId,
          paymentId: payload.paymentId,
          amount: payload.amount,
          currency: "USD"
        }
      });
      rawSteps.push({
        stepId: `step_${decisionId}_2`,
        description: "Send payment confirmation notification",
        toolName: "SendNotificationTool",
        payload: {
          reference: `confirm_${payload.paymentId}`,
          subject: "ACOS Billing: Payment Reconciled",
          body: `Thank you. We have successfully reconciled your payment of $${payload.amount} against invoice ${payload.invoiceId}.`,
          recipients: [{ email: "customer@example.com" }]
        }
      });
    } else if (action === "REFUND") {
      rawSteps.push({
        stepId: `step_${decisionId}_1`,
        description: `Refund payment ${payload.paymentId} with amount ${payload.amount}`,
        toolName: "RefundPaymentTool",
        payload: {
          paymentId: payload.paymentId,
          amount: payload.amount
        }
      });
    } else if (action === "ESCALATE") {
      rawSteps.push({
        stepId: `step_${decisionId}_1`,
        description: `Escalate overdue invoice ${payload.invoiceId} to collections`,
        toolName: "SendNotificationTool",
        payload: {
          subject: "ACOS Warning: Invoice Escalated to Recovery",
          body: `Invoice ${payload.invoiceId} has been escalated due to non-payment.`,
          priority: "CRITICAL"
        }
      });
    }

    const planId = `plan_${decisionId}_${Math.floor(Math.random() * 1000)}`;
    const steps: PlanStep[] = rawSteps.map((s) => ({
      ...s,
      status: "PENDING",
      idempotencyKey: `idem_${planId}_${s.stepId}`
    }));

    return new Plan(planId, decisionId, steps, new Date());
  }
}
