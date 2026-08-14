/**
 * StagingProfile selecting staging options.
 */
export class StagingProfile {
  public getLogLevel(): string {
    return "info";
  }

  public isSandboxMode(): boolean {
    return true;
  }

  public getIntelligenceThreshold(): number {
    return 0.8;
  }
}
