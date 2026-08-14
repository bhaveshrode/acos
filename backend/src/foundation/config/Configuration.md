# Configuration Submodule Guide — ACOS Foundation Layer

This guide outlines the purpose, sections, startup validation rules, and structural guidelines for the `foundation/config` package of the Autonomous Commerce OS (ACOS).

---

## 1. Architectural Philosophy: Decoupled Variables

In ACOS, configuration is accessed through strongly-typed, immutable objects rather than direct lookups like `process.env.JWT_SECRET` or `dotenv` file parsing:
- **Consumer** (e.g. `PaymentService`) queries a typed, frozen configuration snapshot (`ConfigurationSnapshot.security.jwtSecret`).
- **Infrastructure Layer** (configured at application boot) loads variables from external suppliers (AWS Secrets Manager, `.env`, Kubernetes ConfigMaps) and maps them to the `IConfigurationProvider` contract.
- Business and domain modules have **zero direct dependencies** on `.env` files, shell environments, or cloud configuration APIs.

---

## 2. Structured Configuration Schema

Configuration is organized into logically isolated sections to avoid a single bloated object:

1. **`AppConfig`**: General platform info (e.g., `name`, `version`, `environment`, `debug`).
2. **`DatabaseConfig`**: Connectivity descriptors (e.g., `connectionString`, `poolSize`, `timeoutSeconds`).
3. **`EventConfig`**: Broker configurations (e.g., `provider`, `retryCount`, `batchSize`, `deadLetterEnabled`).
4. **`LoggingConfig`**: Observing outputs (e.g., `minLevel`, `structuredLoggingEnabled`, `format`).
5. **`SecurityConfig`**: Crypto variables (e.g., `jwtSecret`, `jwtExpirationSeconds`, `issuer`, `passwordMinLength`).
6. **`PaymentConfig`**: Core commerce variables (e.g., `settlementTimeoutSeconds`, `defaultNetwork`, `supportedCurrencies`).
7. **`AiConfig`**: Autonomous agent settings (e.g., `defaultModel`, `temperature`, `maxTokens`, `timeoutMs`).

---

## 3. Immutability & Validation at Startup

### Strict Immutability
All configurations inside `ConfigurationSnapshot` are deep-frozen upon construction. No component can mutate configuration options during runtime, guaranteeing deterministic behavior.

### Defensive Startup Validation
If mandatory settings are missing or misconfigured, ACOS must halt immediately during boot.
- We validate configuration shapes using the `Validation` submodule (e.g. `RequiredRule`, `RangeRule`, `PatternRule`).
- If validation fails, the system throws a `ConfigurationException` detailing the missing keys, rather than crashing later with obscure runtime errors (e.g., database connection timeout).
