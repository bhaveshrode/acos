import { RuntimeConfiguration } from "./RuntimeConfiguration.js";

/**
 * ConfigurationValidator verifying parameters are correctly resolved.
 */
export class ConfigurationValidator {
  public validate(config: RuntimeConfiguration): void {
    if (!config.databaseUrl.startsWith("postgresql://") && !config.databaseUrl.startsWith("mock://")) {
      throw new Error(`Configuration validation failed: Invalid databaseUrl protocol '${config.databaseUrl}'`);
    }
    if (!config.apiUrl.startsWith("http://") && !config.apiUrl.startsWith("https://")) {
      throw new Error(`Configuration validation failed: Invalid apiUrl protocol '${config.apiUrl}'`);
    }
    if (!config.websocketUrl.startsWith("ws://") && !config.websocketUrl.startsWith("wss://")) {
      throw new Error(`Configuration validation failed: Invalid websocketUrl protocol '${config.websocketUrl}'`);
    }
  }
}
