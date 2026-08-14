/**
 * StagingProfile selecting staging options.
 */
export class StagingProfile {
    getLogLevel() {
        return "info";
    }
    isSandboxMode() {
        return true;
    }
    getIntelligenceThreshold() {
        return 0.8;
    }
}
