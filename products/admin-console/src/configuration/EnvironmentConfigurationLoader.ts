import { IConfigurationLoader } from "./IConfigurationLoader.js";
import { RuntimeEnvironmentProvider } from "./RuntimeEnvironmentProvider.js";

/**
 * EnvironmentConfigurationLoader loading config fields via injected RuntimeEnvironmentProvider.
 */
export class EnvironmentConfigurationLoader implements IConfigurationLoader {
  constructor(
    private readonly envProvider: RuntimeEnvironmentProvider = new RuntimeEnvironmentProvider()
  ) {}

  public load(): Record<string, any> {
    const config: Record<string, any> = {};
    const envSource = this.envProvider.getEnvironmentVariables();

    if (envSource.API_BASE_URL) {
      config.api = config.api || {};
      config.api.baseUrl = envSource.API_BASE_URL;
    }
    if (envSource.WS_URL) {
      config.ws = config.ws || {};
      config.ws.url = envSource.WS_URL;
    }

    return config;
  }
}
