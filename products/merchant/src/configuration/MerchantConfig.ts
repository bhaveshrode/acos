import os from "node:os";

export interface IMerchantConfig {
  port: number;
  env: string;
  acosEndpoint: string;
  dbUrl: string;
  enableAcosFeatures: boolean;
  stripeWebhookSecret?: string;
  brokerUrl?: string | null;
  replicaId?: string;
}

export class MerchantConfig implements IMerchantConfig {
  public readonly port: number;
  public readonly env: string;
  public readonly acosEndpoint: string;
  public readonly dbUrl: string;
  public readonly enableAcosFeatures: boolean;
  public readonly stripeWebhookSecret: string;
  public readonly brokerUrl: string | null;
  public readonly replicaId: string;

  constructor(props: IMerchantConfig) {
    this.port = props.port;
    this.env = props.env;
    this.acosEndpoint = props.acosEndpoint;
    this.dbUrl = props.dbUrl;
    this.enableAcosFeatures = props.enableAcosFeatures;
    this.stripeWebhookSecret = props.stripeWebhookSecret ?? "whsec_stripe_test_secret_123456789";
    this.brokerUrl = props.brokerUrl ?? null;
    this.replicaId = props.replicaId ?? os.hostname();
    this.validate();
  }

  /**
   * Performs basic validation on config properties. Throws Error on failure.
   */
  public validate(): void {
    if (!this.env || this.env.trim() === "") {
      throw new Error("MerchantConfig Validation Error: Environment must be defined.");
    }
    if (this.port <= 0 || this.port > 65535) {
      throw new Error(`MerchantConfig Validation Error: Port '${this.port}' is out of range.`);
    }
    if (!this.acosEndpoint || !this.acosEndpoint.startsWith("http")) {
      throw new Error(`MerchantConfig Validation Error: Invalid acosEndpoint '${this.acosEndpoint}'.`);
    }
    if (!this.dbUrl || !this.dbUrl.startsWith("postgresql://")) {
      throw new Error("MerchantConfig Validation Error: Database URL must start with 'postgresql://'.");
    }
    if (!this.stripeWebhookSecret || this.stripeWebhookSecret.trim() === "") {
      throw new Error("MerchantConfig Validation Error: Webhook secret must be defined.");
    }
    if (this.brokerUrl && !/^rediss?:\/\//.test(this.brokerUrl)) {
      throw new Error("MerchantConfig Validation Error: Broker URL must start with 'redis://' or 'rediss://'.");
    }
    if (!this.replicaId || this.replicaId.trim() === "") {
      throw new Error("MerchantConfig Validation Error: Replica id must be defined.");
    }
  }

  /**
   * Factory method to load configuration from environment or defaults.
   */
  public static loadFromEnv(overrides: Partial<IMerchantConfig> = {}): MerchantConfig {
    return new MerchantConfig({
      port: overrides.port ?? Number(process.env.MERCHANT_PORT ?? "8080"),
      env: overrides.env ?? (process.env.MERCHANT_ENV ?? "development"),
      acosEndpoint: overrides.acosEndpoint ?? (process.env.ACOS_ENDPOINT ?? "http://localhost:3000"),
      dbUrl: overrides.dbUrl ?? (process.env.MERCHANT_DATABASE_URL ?? "postgresql://localhost:5432/merchant_dev"),
      enableAcosFeatures: overrides.enableAcosFeatures ?? (process.env.ENABLE_ACOS_FEATURES === "true" || true),
      stripeWebhookSecret: overrides.stripeWebhookSecret ?? (process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_stripe_test_secret_123456789"),
      brokerUrl: overrides.brokerUrl ?? (process.env.MERCHANT_BROKER_URL ?? null),
      replicaId: overrides.replicaId ?? (process.env.MERCHANT_REPLICA_ID ?? os.hostname())
    });
  }
}
