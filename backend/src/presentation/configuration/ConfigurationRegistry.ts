import { IConfigurationLoader } from "./IConfigurationLoader.js";

/**
 * ConfigurationRegistry tracking presentation configuration loaders.
 */
export class ConfigurationRegistry {
  private static providers: IConfigurationLoader[] = [];

  public static register(provider: IConfigurationLoader): void {
    this.providers.push(provider);
  }

  public static getProviders(): IConfigurationLoader[] {
    return [...this.providers];
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.providers = [];
  }
}
