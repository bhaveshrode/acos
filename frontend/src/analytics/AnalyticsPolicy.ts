import { ConsentManager } from "./ConsentManager.js";

/**
 * AnalyticsPolicy checking consent manager permissions.
 */
export class AnalyticsPolicy {
  constructor(private readonly consentManager: ConsentManager) {}

  public shouldCollectEvent(category: string): boolean {
    if (category === "performance") {
      return true;
    }
    return this.consentManager.isConsentGranted();
  }
}
