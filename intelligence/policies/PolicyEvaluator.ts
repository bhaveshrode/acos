import { SpendingLimitPolicy } from "./SpendingLimitPolicy.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class PolicyEvaluator {
  private readonly spendingLimitPolicy = new SpendingLimitPolicy();

  public evaluate(decision: IntelligenceDecision): "ALLOW" | "DENY" | "HUMAN_APPROVAL_REQUIRED" {
    const action = decision.props.selectedAction;
    const payload = decision.props.actionPayload;

    if (action === "SEND_REMINDER") {
      const reminders = decision.props.contextSnapshot.props.previousReminders || [];
      if (reminders.length >= 5) {
        return "DENY";
      }
    }

    if (action === "REFUND") {
      const amount = payload.amount || 0.0;
      return this.spendingLimitPolicy.check(amount);
    }

    if (action === "DELETE_ACCOUNT") {
      return "DENY";
    }

    return "ALLOW";
  }
}
