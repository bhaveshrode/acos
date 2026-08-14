import { RetentionRule } from "./RetentionRule.js";
import { RetentionDecision } from "./RetentionDecision.js";

/**
 * RetentionManager assessing expiration rules on resources.
 */
export class RetentionManager {
  private readonly rules = new Map<string, RetentionRule>();

  public addRule(resource: string, rule: RetentionRule): void {
    this.rules.set(resource.toLowerCase(), rule);
  }

  public evaluate(resource: string, createdAt: Date): RetentionDecision {
    const rule = this.rules.get(resource.toLowerCase());
    if (!rule) {
      return new RetentionDecision(false, "No active retention rules configured");
    }

    const expired = rule.hasExpired(createdAt);
    return new RetentionDecision(expired, expired ? "Record lifespan expired" : "Record still within retention period");
  }
}
