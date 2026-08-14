import { FrontendConfiguration } from "./FrontendConfiguration.js";

/**
 * ConfigurationStore holding the immutable resolved frontend configuration snapshot.
 */
export class ConfigurationStore {
  private static instance: FrontendConfiguration | null = null;

  public static set(config: FrontendConfiguration): void {
    this.instance = Object.freeze({ ...config });
  }

  public static get(): FrontendConfiguration {
    if (!this.instance) {
      throw new Error("Frontend Configuration has not been resolved and stored");
    }
    return this.instance;
  }

  public static clear(): void {
    this.instance = null;
  }
}
