import { Plan } from "./Plan.js";

export class PlanValidator {
  public validate(plan: Plan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (plan.steps.length === 0) {
      errors.push("Plan contains no execution steps.");
    }

    plan.steps.forEach((step, idx) => {
      if (!step.stepId) {
        errors.push(`Step at index ${idx} lacks a unique stepId.`);
      }
      if (!step.toolName) {
        errors.push(`Step ${step.stepId || idx} is missing a toolName.`);
      }
      if (!step.payload) {
        errors.push(`Step ${step.stepId || idx} has no payload parameters.`);
      }
      if (!step.idempotencyKey) {
        errors.push(`Step ${step.stepId || idx} is missing an idempotencyKey.`);
      }
      if (!step.status) {
        errors.push(`Step ${step.stepId || idx} is missing status.`);
      }

      if (step.toolName === "ReconcilePaymentTool") {
        if (!step.payload.invoiceId || !step.payload.paymentId) {
          errors.push(`Step ${step.stepId} (ReconcilePaymentTool) is missing invoiceId or paymentId.`);
        }
      }
      if (step.toolName === "RefundPaymentTool") {
        if (!step.payload.paymentId || !step.payload.amount) {
          errors.push(`Step ${step.stepId} (RefundPaymentTool) is missing paymentId or amount.`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
