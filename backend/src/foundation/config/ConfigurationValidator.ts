import { ConfigurationSnapshot } from "./ConfigurationSnapshot.js";
import { ConfigurationException } from "../exceptions/ConfigurationException.js";
import { Validator } from "../validation/Validator.js";
import { RequiredRule, RangeRule } from "../validation/ValidationRule.js";

/**
 * Validator utility responsible for checking configuration snapshot schemas.
 * Throws ConfigurationException at boot time to abort application startup on bad settings.
 */
export class ConfigurationValidator {
  /**
   * Validates a ConfigurationSnapshot.
   * Throws a ConfigurationException if any configuration section is invalid.
   */
  public static validate(config: ConfigurationSnapshot): void {
    if (!config) {
      throw new ConfigurationException("Configuration snapshot cannot be null.");
    }

    // 1. AppConfig Validation
    const appValidator = new Validator<any>()
      .rule("name", new RequiredRule())
      .rule("version", new RequiredRule())
      .rule("environment", new RequiredRule());
    
    const appResult = appValidator.validate(config.app);
    if (appResult.isFailure) {
      throw new ConfigurationException("Invalid Application Configuration.", { failures: appResult.error.metadata?.failures });
    }

    const validEnvironments = ["development", "testing", "staging", "production"];
    if (!validEnvironments.includes(config.app.environment)) {
      throw new ConfigurationException(`Invalid environment setting: '${config.app.environment}'. Must be one of: ${validEnvironments.join(", ")}`);
    }

    // 2. DatabaseConfig Validation
    const dbValidator = new Validator<any>()
      .rule("connectionString", new RequiredRule())
      .rule("poolSize", new RangeRule(1, 1000))
      .rule("timeoutSeconds", new RangeRule(1, 300));
    
    const dbResult = dbValidator.validate(config.database);
    if (dbResult.isFailure) {
      throw new ConfigurationException("Invalid Database Configuration.", { failures: dbResult.error.metadata?.failures });
    }

    // 3. EventConfig Validation
    const eventValidator = new Validator<any>()
      .rule("provider", new RequiredRule())
      .rule("retryCount", new RangeRule(0, 100))
      .rule("batchSize", new RangeRule(1, 10000));
    
    const eventResult = eventValidator.validate(config.event);
    if (eventResult.isFailure) {
      throw new ConfigurationException("Invalid Event Configuration.", { failures: eventResult.error.metadata?.failures });
    }

    // 4. LoggingConfig Validation
    const loggingValidator = new Validator<any>()
      .rule("minLevel", new RequiredRule());
    
    const loggingResult = loggingValidator.validate(config.logging);
    if (loggingResult.isFailure) {
      throw new ConfigurationException("Invalid Logging Configuration.", { failures: loggingResult.error.metadata?.failures });
    }

    // 5. SecurityConfig Validation
    const securityValidator = new Validator<any>()
      .rule("jwtSecret", new RequiredRule())
      .rule("jwtExpirationSeconds", new RangeRule(60, 31536000))
      .rule("issuer", new RequiredRule())
      .rule("passwordMinLength", new RangeRule(4, 128));
    
    const securityResult = securityValidator.validate(config.security);
    if (securityResult.isFailure) {
      throw new ConfigurationException("Invalid Security Configuration.", { failures: securityResult.error.metadata?.failures });
    }

    // 6. PaymentConfig Validation
    const paymentValidator = new Validator<any>()
      .rule("defaultNetwork", new RequiredRule())
      .rule("settlementTimeoutSeconds", new RangeRule(0, 86400));
    
    const paymentResult = paymentValidator.validate(config.payment);
    if (paymentResult.isFailure) {
      throw new ConfigurationException("Invalid Payment Configuration.", { failures: paymentResult.error.metadata?.failures });
    }

    if (!config.payment.supportedCurrencies || config.payment.supportedCurrencies.length === 0) {
      throw new ConfigurationException("Invalid Payment Configuration: supportedCurrencies cannot be empty.");
    }

    // 7. AiConfig Validation
    const aiValidator = new Validator<any>()
      .rule("defaultModel", new RequiredRule())
      .rule("temperature", new RangeRule(0, 2))
      .rule("maxTokens", new RangeRule(1, 100000))
      .rule("timeoutMs", new RangeRule(0, 300000));
    
    const aiResult = aiValidator.validate(config.ai);
    if (aiResult.isFailure) {
      throw new ConfigurationException("Invalid AI Configuration.", { failures: aiResult.error.metadata?.failures });
    }
  }
}
