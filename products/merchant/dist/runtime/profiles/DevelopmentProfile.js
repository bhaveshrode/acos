/**
 * DevelopmentProfile selecting local development options.
 */
export class DevelopmentProfile {
    getLogLevel() {
        return "debug";
    }
    isSandboxMode() {
        return true;
    }
    getIntelligenceThreshold() {
        return 0.5; // High tolerance for sandbox agent testing
    }
}
