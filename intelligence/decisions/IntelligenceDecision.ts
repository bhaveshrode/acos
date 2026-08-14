import { IntelligenceContext } from "../context/IntelligenceContext.js";

export interface IntelligenceDecisionProps {
  decisionId: string;
  agentId: string;
  contextSnapshot: IntelligenceContext;
  reasoningSummary: string;
  selectedAction: string; // e.g. "SEND_REMINDER", "RECONCILE_PAYMENT", "ESCALATE", "REFUND", "NONE"
  actionPayload: any;
  confidence: number;
  alternatives: string[];
  policyResult: "ALLOW" | "DENY" | "HUMAN_APPROVAL_REQUIRED";
  createdAt: Date;
}

/**
 * Immutable decision value object representing reasoning outcomes.
 */
export class IntelligenceDecision {
  constructor(public readonly props: IntelligenceDecisionProps) {
    Object.freeze(this.props);
    Object.freeze(this);
  }
}
