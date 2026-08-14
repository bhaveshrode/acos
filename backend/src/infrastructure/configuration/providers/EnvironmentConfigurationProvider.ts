import { BaseConfigurationProvider } from "./BaseConfigurationProvider.js";
import { EnvironmentLoader } from "../loaders/EnvironmentLoader.js";

/**
 * Configuration provider retrieving and parsing configuration from environment variables.
 */
export class EnvironmentConfigurationProvider extends BaseConfigurationProvider {
  private readonly values: Record<string, string>;

  constructor() {
    super();
    this.values = EnvironmentLoader.load();
  }

  protected getRaw(key: string): string | undefined {
    return this.values[key.toLowerCase()];
  }
}
