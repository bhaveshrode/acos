import { RetentionDecision } from "./RetentionDecision.js";
/**
 * RetentionManager assessing expiration rules on resources.
 */
export class RetentionManager {
    rules = new Map();
    addRule(resource, rule) {
        this.rules.set(resource.toLowerCase(), rule);
    }
    evaluate(resource, createdAt) {
        const rule = this.rules.get(resource.toLowerCase());
        if (!rule) {
            return new RetentionDecision(false, "No active retention rules configured");
        }
        const expired = rule.hasExpired(createdAt);
        return new RetentionDecision(expired, expired ? "Record lifespan expired" : "Record still within retention period");
    }
}
