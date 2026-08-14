export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly environment: "development" | "testing" | "staging" | "production";
  readonly debug: boolean;
}

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly poolSize: number;
  readonly timeoutSeconds: number;
}

export interface EventConfig {
  readonly provider: string;
  readonly retryCount: number;
  readonly batchSize: number;
  readonly deadLetterEnabled: boolean;
}

export interface LoggingConfig {
  readonly minLevel: string;
  readonly structuredLoggingEnabled: boolean;
}

export interface SecurityConfig {
  readonly jwtSecret: string;
  readonly jwtExpirationSeconds: number;
  readonly issuer: string;
  readonly passwordMinLength: number;
}

export interface PaymentConfig {
  readonly settlementTimeoutSeconds: number;
  readonly defaultNetwork: string;
  readonly supportedCurrencies: string[];
}

export interface AiConfig {
  readonly defaultModel: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly timeoutMs: number;
}
