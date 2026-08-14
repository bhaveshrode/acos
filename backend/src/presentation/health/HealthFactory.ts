import { HealthCheckRegistry } from "./HealthCheckRegistry.js";
import { HealthCheckRunner } from "./HealthCheckRunner.js";
import { HealthAggregator } from "./HealthAggregator.js";
import { HealthResponseBuilder } from "./HealthResponseBuilder.js";
import { HealthController } from "./HealthController.js";
import { DatabaseHealthCheck } from "./DatabaseHealthCheck.js";
import { StorageHealthCheck } from "./StorageHealthCheck.js";
import { BlockchainHealthCheck } from "./BlockchainHealthCheck.js";
import { NotificationHealthCheck } from "./NotificationHealthCheck.js";
import { ConfigurationHealthCheck } from "./ConfigurationHealthCheck.js";

/**
 * HealthFactory instantiating runners, controllers, and default probe checkers.
 */
export class HealthFactory {
  public static createRunner(): HealthCheckRunner {
    const checks = HealthCheckRegistry.getChecks();
    return new HealthCheckRunner(checks);
  }

  public static createController(runner: HealthCheckRunner): HealthController {
    return new HealthController(
      runner,
      new HealthAggregator(),
      new HealthResponseBuilder()
    );
  }

  public static registerDefaultChecks(dbHealthMonitor?: { ping(): Promise<any> }): void {
    HealthCheckRegistry.register(new DatabaseHealthCheck(dbHealthMonitor));
    HealthCheckRegistry.register(new StorageHealthCheck());
    HealthCheckRegistry.register(new BlockchainHealthCheck());
    HealthCheckRegistry.register(new NotificationHealthCheck());
    HealthCheckRegistry.register(new ConfigurationHealthCheck());
  }
}
