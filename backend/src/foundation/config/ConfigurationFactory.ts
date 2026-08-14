import { IConfigurationProvider } from "../contracts/system/IConfigurationProvider.js";
import { ConfigurationSnapshot } from "./ConfigurationSnapshot.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";

/**
 * Factory class responsible for building and validating ConfigurationSnapshots using configuration providers.
 */
export class ConfigurationFactory {
  /**
   * Builds and validates a ConfigurationSnapshot by mapping keys from a configuration provider.
   * Throws ConfigurationException if validation fails.
   * @param provider The configuration provider instance.
   */
  public static create(provider: IConfigurationProvider): ConfigurationSnapshot {
    if (!provider) {
      throw new Error("ConfigurationProvider must be provided to ConfigurationFactory.");
    }

    // Local helpers to resolve values with default fallbacks
    const getVal = (key: string, def: string): string => {
      const res = provider.get(key);
      return res.isSuccess ? res.value : def;
    };
    const getNum = (key: string, def: number): number => {
      const res = provider.getNumber(key);
      return res.isSuccess ? res.value : def;
    };
    const getBool = (key: string, def: boolean): boolean => {
      const res = provider.getBoolean(key);
      return res.isSuccess ? res.value : def;
    };

    // 1. AppConfig Section
    const app = {
      name: getVal("app.name", "ACOS"),
      version: getVal("app.version", "1.0.0"),
      environment: getVal("app.environment", "development") as any,
      debug: getBool("app.debug", false)
    };

    // 2. DatabaseConfig Section
    const database = {
      connectionString: getVal("database.connectionString", ""),
      poolSize: getNum("database.poolSize", 10),
      timeoutSeconds: getNum("database.timeoutSeconds", 30)
    };

    // 3. EventConfig Section
    const event = {
      provider: getVal("event.provider", "in-memory"),
      retryCount: getNum("event.retryCount", 3),
      batchSize: getNum("event.batchSize", 100),
      deadLetterEnabled: getBool("event.deadLetterEnabled", false)
    };

    // 4. LoggingConfig Section
    const logging = {
      minLevel: getVal("logging.minLevel", "INFO"),
      structuredLoggingEnabled: getBool("logging.structuredLoggingEnabled", true)
    };

    // 5. SecurityConfig Section
    const security = {
      jwtSecret: getVal("security.jwtSecret", ""),
      jwtExpirationSeconds: getNum("security.jwtExpirationSeconds", 3600),
      issuer: getVal("security.issuer", "acos.internal"),
      passwordMinLength: getNum("security.passwordMinLength", 8)
    };

    // 6. PaymentConfig Section
    const currenciesStr = getVal("payment.supportedCurrencies", "USD,EUR");
    const supportedCurrencies = currenciesStr
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    const payment = {
      settlementTimeoutSeconds: getNum("payment.settlementTimeoutSeconds", 3600),
      defaultNetwork: getVal("payment.defaultNetwork", "localhost"),
      supportedCurrencies
    };

    // 7. AiConfig Section
    const ai = {
      defaultModel: getVal("ai.defaultModel", "gemini-2.5-flash"),
      temperature: getNum("ai.temperature", 0.7),
      maxTokens: getNum("ai.maxTokens", 2048),
      timeoutMs: getNum("ai.timeoutMs", 30000)
    };

    const snapshot = new ConfigurationSnapshot({
      app,
      database,
      event,
      logging,
      security,
      payment,
      ai
    });

    // Enforce defensive startup validation (throws ConfigurationException on rule violations)
    ConfigurationValidator.validate(snapshot);

    return snapshot;
  }
}
