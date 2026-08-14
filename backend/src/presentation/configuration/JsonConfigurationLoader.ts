import { IConfigurationLoader } from "./IConfigurationLoader.js";

/**
 * JsonConfigurationLoader flattening values from raw json contents strings.
 */
export class JsonConfigurationLoader implements IConfigurationLoader {
  constructor(private readonly jsonContent: string) {}

  public load(): Record<string, any> {
    try {
      return JSON.parse(this.jsonContent);
    } catch {
      return {};
    }
  }
}
