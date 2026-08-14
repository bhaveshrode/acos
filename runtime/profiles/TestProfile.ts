/**
 * TestProfile selecting test options.
 */
export class TestProfile {
  public getLogLevel(): string {
    return "warn";
  }

  public isSandboxMode(): boolean {
    return true;
  }

  public getIntelligenceThreshold(): number {
    return 0.1;
  }
}
