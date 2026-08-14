import { IntegrationHealthManager } from "./IntegrationHealthManager.js";

/**
 * IntegrationMonitoringFactory constructing health monitoring managers.
 */
export class IntegrationMonitoringFactory {
  public static createHealthManager(): IntegrationHealthManager {
    return new IntegrationHealthManager();
  }

  public createHealthManager(): IntegrationHealthManager {
    return IntegrationMonitoringFactory.createHealthManager();
  }
}
