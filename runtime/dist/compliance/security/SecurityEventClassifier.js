/**
 * SecurityEventClassifier determining security severity.
 */
export class SecurityEventClassifier {
    classify(category) {
        switch (category) {
            case "WEBHOOK_FORGERY":
            case "CROSS_TENANT":
                return "CRITICAL";
            case "PRIVILEGE_ESCALATION":
            case "UNAUTHORIZED_AGENT_TOOL":
                return "HIGH";
            case "POLICY_VIOLATION":
                return "MEDIUM";
            default:
                return "LOW";
        }
    }
}
