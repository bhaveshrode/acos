/**
 * TestProfile selecting test options.
 */
export class TestProfile {
    getLogLevel() {
        return "warn";
    }
    isSandboxMode() {
        return true;
    }
    getIntelligenceThreshold() {
        return 0.1;
    }
}
