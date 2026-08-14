import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";
export class ModelBasedReasoner {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async reason(context, agentId) {
        const prompt = `System Prompt: Assess customer account and trigger matching billing commands. Event: ${context.props.eventType}. Context: ${JSON.stringify(context.props)}`;
        // Call isolated provider
        const responseText = await this.provider.generate(prompt, context.props);
        let modelResult = {};
        try {
            modelResult = JSON.parse(responseText);
        }
        catch {
            modelResult = { selectedAction: "NONE", actionPayload: {}, confidence: 0.0, alternatives: [] };
        }
        const selectedAction = modelResult.selectedAction || "NONE";
        const actionPayload = modelResult.actionPayload || {};
        const confidence = modelResult.confidence || 0.5;
        const alternatives = modelResult.alternatives || [];
        // Ensure decision rules state explicitly that confidence does NOT equal authorization
        return new IntelligenceDecision({
            decisionId: `dec_model_${Math.floor(Math.random() * 100000)}`,
            agentId,
            contextSnapshot: context,
            reasoningSummary: `[Provider: ${this.provider.providerName}] Evaluated logic successfully. Action chosen: ${selectedAction}.`,
            selectedAction,
            actionPayload,
            confidence,
            alternatives,
            policyResult: "ALLOW", // Always evaluated separately by Policy layer
            createdAt: new Date()
        });
    }
}
