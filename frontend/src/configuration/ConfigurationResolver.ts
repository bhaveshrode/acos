import { FrontendConfiguration } from "./FrontendConfiguration.js";
import { IConfigurationLoader } from "./IConfigurationLoader.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";
import { ConfigurationStore } from "./ConfigurationStore.js";

/**
 * ConfigurationResolver applying defaults to configuration properties, running validations, and saving the immutable snapshot.
 */
export class ConfigurationResolver {
  private readonly defaultValues: FrontendConfiguration = {
    api: {
      baseUrl: "http://localhost:3000/api",
      timeoutMs: 5000
    },
    ws: {
      url: "ws://localhost:3000/ws",
      reconnectIntervalMs: 3000
    },
    features: {
      enableNotifications: true,
      enableAnalytics: true
    },
    theme: {
      defaultMode: "dark"
    }
  };

  constructor(
    private readonly loader: IConfigurationLoader,
    private readonly validator: ConfigurationValidator
  ) {}

  public resolve(): FrontendConfiguration {
    const rawData = this.loader.load();
    const resolved = this.deepMerge(this.defaultValues, rawData);
    this.validator.validate(resolved);
    ConfigurationStore.set(resolved);
    return resolved;
  }

  private deepMerge(target: any, source: any): any {
    const output = Object.assign({}, target);
    if (target && typeof target === "object" && source && typeof source === "object") {
      Object.keys(source).forEach((key) => {
        if (source[key] && typeof source[key] === "object") {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
}
