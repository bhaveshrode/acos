import { InfrastructureConfiguration } from "./InfrastructureConfiguration.js";

/**
 * InfrastructureConfigurationValidator verifying connection protocols.
 */
export class InfrastructureConfigurationValidator {
  public validate(config: InfrastructureConfiguration): void {
    if (!config.postgresUrl.startsWith("postgresql://") && !config.postgresUrl.startsWith("mock://")) {
      throw new Error(`Infrastructure validation failed: Invalid postgresUrl '${config.postgresUrl}'`);
    }
    if (!config.redisUrl.startsWith("redis://") && !config.redisUrl.startsWith("mock://")) {
      throw new Error(`Infrastructure validation failed: Invalid redisUrl '${config.redisUrl}'`);
    }
    if (!config.messageBrokerUrl.startsWith("amqp://") && !config.messageBrokerUrl.startsWith("mock://")) {
      throw new Error(`Infrastructure validation failed: Invalid messageBrokerUrl '${config.messageBrokerUrl}'`);
    }
  }
}
