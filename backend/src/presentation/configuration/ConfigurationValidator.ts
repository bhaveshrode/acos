import { PresentationConfiguration } from "./PresentationConfiguration.js";

/**
 * ConfigurationValidator validating server configurations rules and constraints.
 */
export class ConfigurationValidator {
  public validate(config: PresentationConfiguration): void {
    if (!config.server.port || isNaN(config.server.port)) {
      throw new Error("Invalid configuration: server port is required and must be a number");
    }
    if (!config.security.jwtSecret) {
      throw new Error("Invalid configuration: security JWT secret is required");
    }
  }
}
