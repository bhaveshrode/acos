import os from "node:os";

export type PaymentProviderName = "sandbox" | "razorpay";

export interface IMerchantConfig {
  port: number;
  env: string;
  acosEndpoint: string;
  dbUrl: string;
  enableAcosFeatures: boolean;
  stripeWebhookSecret?: string;
  brokerUrl?: string | null;
  replicaId?: string;
  paymentProvider?: PaymentProviderName;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
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
  public readonly paymentProvider: PaymentProviderName;
  public readonly razorpayKeyId: string | null;
  public readonly razorpayKeySecret: string | null;
  public readonly razorpayWebhookSecret: string | null;

  constructor(props: IMerchantConfig) {
    this.port = props.port;
    this.env = props.env;
    this.acosEndpoint = props.acosEndpoint;
    this.dbUrl = props.dbUrl;
    this.enableAcosFeatures = props.enableAcosFeatures;
    this.stripeWebhookSecret = props.stripeWebhookSecret ?? "whsec_stripe_test_secret_123456789";
    this.brokerUrl = props.brokerUrl ?? null;
    this.replicaId = props.replicaId ?? os.hostname();
    this.paymentProvider = props.paymentProvider ?? "sandbox";
    this.razorpayKeyId = props.razorpayKeyId ?? null;
    this.razorpayKeySecret = props.razorpayKeySecret ?? null;
    this.razorpayWebhookSecret = props.razorpayWebhookSecret ?? null;
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
    if (this.paymentProvider !== "sandbox" && this.paymentProvider !== "razorpay") {
      throw new Error(
        `MerchantConfig Validation Error: Payment provider '${this.paymentProvider}' is not supported. Use 'sandbox' or 'razorpay'.`
      );
    }
    if (this.paymentProvider === "razorpay") {
      if (!this.razorpayKeyId || !this.razorpayKeyId.startsWith("rzp_")) {
        throw new Error("MerchantConfig Validation Error: Razorpay key id must be defined and start with 'rzp_'.");
      }
      if (!this.razorpayKeySecret || this.razorpayKeySecret.trim() === "") {
        throw new Error("MerchantConfig Validation Error: Razorpay key secret must be defined.");
      }
      if (!this.razorpayWebhookSecret || this.razorpayWebhookSecret.trim() === "") {
        throw new Error("MerchantConfig Validation Error: Razorpay webhook secret must be defined.");
      }
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
      replicaId: overrides.replicaId ?? (process.env.MERCHANT_REPLICA_ID ?? os.hostname()),
      paymentProvider: overrides.paymentProvider ?? ((process.env.PAYMENT_PROVIDER as PaymentProviderName) ?? "sandbox"),
      razorpayKeyId: overrides.razorpayKeyId ?? process.env.RAZORPAY_KEY_ID,
      razorpayKeySecret: overrides.razorpayKeySecret ?? process.env.RAZORPAY_KEY_SECRET,
      razorpayWebhookSecret: overrides.razorpayWebhookSecret ?? process.env.RAZORPAY_WEBHOOK_SECRET
    });
  }
}
