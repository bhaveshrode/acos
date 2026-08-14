import { IntegrationConfiguration } from "./IntegrationConfiguration.js";
import { AuthenticationConfiguration } from "./AuthenticationConfiguration.js";
import { EndpointConfiguration } from "./EndpointConfiguration.js";
import { RetryConfiguration } from "./RetryConfiguration.js";

/**
 * ConfigurationFactory building provider, authentication, endpoint, and retry configurations.
 */
export class ConfigurationFactory {
  public static createConfig(
    providerName: string,
    configData?: Record<string, any>
  ): IntegrationConfiguration {
    return new IntegrationConfiguration(providerName, configData);
  }

  public static createAuthConfig(
    authType: "OAuth" | "ApiKey" | "Basic",
    credentials?: Record<string, string>
  ): AuthenticationConfiguration {
    return new AuthenticationConfiguration(authType, credentials);
  }

  public static createEndpointConfig(
    baseUrl: string,
    version?: string
  ): EndpointConfiguration {
    return new EndpointConfiguration(baseUrl, version);
  }

  public static createRetryConfig(
    maxRetries?: number,
    backoffMs?: number
  ): RetryConfiguration {
    return new RetryConfiguration(maxRetries, backoffMs);
  }

  public createConfig(
    providerName: string,
    configData?: Record<string, any>
  ): IntegrationConfiguration {
    return ConfigurationFactory.createConfig(providerName, configData);
  }

  public createAuthConfig(
    authType: "OAuth" | "ApiKey" | "Basic",
    credentials?: Record<string, string>
  ): AuthenticationConfiguration {
    return ConfigurationFactory.createAuthConfig(authType, credentials);
  }

  public createEndpointConfig(
    baseUrl: string,
    version?: string
  ): EndpointConfiguration {
    return ConfigurationFactory.createEndpointConfig(baseUrl, version);
  }

  public createRetryConfig(
    maxRetries?: number,
    backoffMs?: number
  ): RetryConfiguration {
    return ConfigurationFactory.createRetryConfig(maxRetries, backoffMs);
  }
}
