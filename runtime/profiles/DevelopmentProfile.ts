/**
 * DevelopmentProfile selecting local development options.
 */
export class DevelopmentProfile {
  public getLogLevel(): string {
    return "debug";
  }

  public isSandboxMode(): boolean {
    return true;
  }

  public getIntelligenceThreshold(): number {
    return 0.5; // High tolerance for sandbox agent testing
  }
}
