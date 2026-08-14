import { PresentationConfiguration } from "./PresentationConfiguration.js";

/**
 * ConfigurationResolver applying defaults to configuration properties.
 */
export class ConfigurationResolver {
  private readonly defaultValues: PresentationConfiguration = {
    server: {
      port: 3000,
      host: "localhost",
      bodyLimit: "10mb"
    },
    routing: {
      prefix: "/api",
      enableVersionRouting: true
    },
    middleware: {
      enableCors: true,
      enableCompression: true,
      rateLimitMax: 100
    },
    security: {
      jwtSecret: "default-secret",
      tokenLifetimeSeconds: 3600
    },
    serialization: {
      prettyPrint: false
    }
  };

  public resolve(loadedData: Record<string, any>): PresentationConfiguration {
    return this.deepMerge(this.defaultValues, loadedData);
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
