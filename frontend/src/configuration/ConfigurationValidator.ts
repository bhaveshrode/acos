import { FrontendConfiguration } from "./FrontendConfiguration.js";

/**
 * ConfigurationValidator validating configuration fields rules and constraints.
 */
export class ConfigurationValidator {
  public validate(config: FrontendConfiguration): void {
    if (!config.api.baseUrl) {
      throw new Error("Invalid configuration: API base URL is required");
    }
    if (!config.ws.url) {
      throw new Error("Invalid configuration: WebSocket URL is required");
    }
  }
}
