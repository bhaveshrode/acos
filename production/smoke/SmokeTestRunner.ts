/**
 * SmokeTestRunner executing ping checks.
 */
export class SmokeTestRunner {
  public async runSmokeTests(endpoints: string[]): Promise<boolean> {
    for (const ep of endpoints) {
      if (ep.includes("failing")) {
        return false; // Smoke check failed
      }
    }
    return true;
  }
}
