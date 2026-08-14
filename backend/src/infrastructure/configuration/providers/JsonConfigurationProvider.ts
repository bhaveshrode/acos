import { BaseConfigurationProvider } from "./BaseConfigurationProvider.js";

/**
 * Configuration provider retrieving and parsing configuration from flattened JSON files.
 */
export class JsonConfigurationProvider extends BaseConfigurationProvider {
  private readonly values: Record<string, string>;

  constructor(values: Record<string, string>) {
    super();
    this.values = {};
    for (const k in values) {
      if (Object.prototype.hasOwnProperty.call(values, k)) {
        this.values[k.toLowerCase()] = values[k];
      }
    }
  }

  protected getRaw(key: string): string | undefined {
    return this.values[key.toLowerCase()];
  }
}
