import { IConfigurationLoader } from "./IConfigurationLoader.js";

/**
 * EnvironmentConfigurationLoader loading properties from process environment variables.
 */
export class EnvironmentConfigurationLoader implements IConfigurationLoader {
  public load(): Record<string, any> {
    const config: Record<string, any> = {};

    if (process.env.PORT) {
      config.server = config.server || {};
      config.server.port = parseInt(process.env.PORT, 10);
    }
    if (process.env.HOST) {
      config.server = config.server || {};
      config.server.host = process.env.HOST;
    }
    if (process.env.JWT_SECRET) {
      config.security = config.security || {};
      config.security.jwtSecret = process.env.JWT_SECRET;
    }

    return config;
  }
}
