import { PresentationConfiguration } from "./PresentationConfiguration.js";

/**
 * ConfigurationCache caching immutable configuration values.
 */
export class ConfigurationCache {
  private static instance: PresentationConfiguration | null = null;

  public static set(config: PresentationConfiguration): void {
    this.instance = Object.freeze({ ...config });
  }

  public static get(): PresentationConfiguration {
    if (!this.instance) {
      throw new Error("Configuration has not been resolved and cached");
    }
    return this.instance;
  }

  public static clear(): void {
    this.instance = null;
  }
}
