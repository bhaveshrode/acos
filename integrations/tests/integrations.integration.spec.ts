import { describe, it, expect } from "vitest";
import { IntegrationFactory } from "../factories/IntegrationFactory.js";
import { SyncState } from "../synchronization/SyncState.js";
import { ResiliencePolicy } from "../resilience/ResiliencePolicy.js";
import { IntegrationPipeline } from "../pipeline/IntegrationPipeline.js";

describe("ACOS Integrations Layer Master Refinements Test Suite (Task 83.8)", () => {
  const factory = new IntegrationFactory();

  it("should register and resolve payment and blockchain gateways dynamically through provider registries", () => {
    const paymentRegistry = factory.payments.createRegistry();
    const stripe = factory.payments.createStripeAdapter();
    const paypal = factory.payments.createPayPalAdapter();

    paymentRegistry.register("Stripe", stripe);
    paymentRegistry.register("PayPal", paypal);

    expect(paymentRegistry.resolve("stripe")).toBe(stripe);
    expect(paymentRegistry.resolve("Paypal")).toBe(paypal);
    expect(() => paymentRegistry.resolve("Razorpay")).toThrow("Payment gateway provider not found");

    const blockchainRegistry = factory.blockchain.createRegistry();
    const circle = factory.blockchain.createCircleAdapter();
    blockchainRegistry.register("Circle", circle);
    expect(blockchainRegistry.resolve("circle")).toBe(circle);
  });

  it("should enforce retries, timeouts, and circuit breaker triggers in ResiliencePolicy", async () => {
    // Retry policy: max 2 retries, 50ms timeout, failure threshold 2
    const policy = new ResiliencePolicy(2, 50, 2);
    let attempts = 0;

    const action = async () => {
      attempts++;
      throw new Error("Failed call");
    };

    await expect(policy.execute(action)).rejects.toThrow("Failed call");
    expect(attempts).toBe(2);

    // Let's test timeout limit
    const slowAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return "done";
    };
    await expect(policy.execute(slowAction)).rejects.toThrow("Timeout");

    // Enforce circuit opener
    expect(policy.circuitOpen).toBe(true);
    await expect(policy.execute(slowAction)).rejects.toThrow("Circuit breaker is OPEN");

    // Reset circuit breaker
    policy.reset();
    expect(policy.circuitOpen).toBe(false);
  });

  it("should route serialized payloads through ResiliencePolicy inside IntegrationPipeline", async () => {
    const policy = new ResiliencePolicy(2, 500, 2);
    const pipeline = new IntegrationPipeline(policy);

    interface In {
      val: number;
    }
    interface Out {
      result: string;
    }

    const payload: In = { val: 42 };
    const serialize = (input: In) => JSON.stringify(input);
    const call = async (raw: string) => `echo:${raw}`;
    const deserialize = (rawOut: string): Out => ({ result: rawOut });

    const output = await pipeline.sendRequest(payload, serialize, call, deserialize);
    expect(output.result).toBe('echo:{"val":42}');
  });

  it("should process webhook payloads sequentially through receiver, validator, parser, router, dispatcher", async () => {
    const receiver = factory.webhooks.createReceiver();
    const validator = factory.webhooks.createValidator();
    const parser = factory.webhooks.createParser();
    const registry = factory.webhooks.createRegistry();
    const router = factory.webhooks.createRouter(registry);
    const dispatcher = factory.webhooks.createDispatcher();

    let eventRouted = false;
    registry.registerCallback("/stripe/charge", async (payload) => {
      if (payload.id === "charge_10") {
        eventRouted = true;
      }
    });

    const headers = { "x-webhook-signature": "sig_18_secr" };
    const rawBody = `{"id":"charge_10"}`; // Length 18 chars

    // 1. Receive
    const received = receiver.receive(rawBody, headers);
    expect(received.payload).toBe(rawBody);
    expect(received.signature).toBe("sig_18_secr");

    // 2. Validate Signature
    const valid = validator.validate(received.payload, received.signature, "secret");
    expect(valid).toBe(true);

    // 3. Parse Event
    const parsed = parser.parse(received.payload);
    expect(parsed.id).toBe("charge_10");

    // 4. Route Callbacks
    const callbackFn = router.route("/stripe/charge");
    expect(callbackFn).toBeDefined();

    // 5. Dispatch Event
    const success = await dispatcher.dispatch(callbackFn!, parsed);
    expect(success).toBe(true);
    expect(eventRouted).toBe(true);
  });

  it("should execute increment sync planners, executors, and checkpoints cursors", async () => {
    const planner = factory.synchronization.createPlanner();
    const store = factory.synchronization.createStore();
    const executor = factory.synchronization.createExecutor(store);
    const resolver = factory.synchronization.createResolver();
    const pipeline = factory.synchronization.createPipeline(planner, executor, resolver, store);

    const plan = planner.plan("Shopify", "ACOS");
    expect(plan).toContain("plan_sync_from_Shopify_to_ACOS_");

    const syncSuccess = await pipeline.executeSync("Shopify", "ACOS", async () => true);
    expect(syncSuccess).toBe(true);
    expect(pipeline.state).toBe(SyncState.Completed);

    const checkpoint = store.getCheckpoint(pipeline.activePlanId!);
    expect(checkpoint).toBeDefined();

    const resolvedVal = resolver.resolve("local_data", "remote_data", "KeepRemote");
    expect(resolvedVal).toBe("remote_data");
  });

  it("should limit requests tokens availability in TokenBucketLimiter", () => {
    const limiter = factory.security.createRateLimiter(2, 0); // Max 2 tokens, 0 refill rate for testing
    expect(limiter.allowRequest()).toBe(true);
    expect(limiter.allowRequest()).toBe(true);
    expect(limiter.allowRequest()).toBe(false); // Throttled
  });

  it("should parse discrete auth, endpoint, and retry configurations", () => {
    const authConfig = factory.configuration.createAuthConfig("ApiKey", { key: "secret_api_key" });
    const endpointConfig = factory.configuration.createEndpointConfig("https://api.stripe.com", "v3");
    const retryConfig = factory.configuration.createRetryConfig(5, 1000);

    expect(authConfig.authType).toBe("ApiKey");
    expect(authConfig.credentials.key).toBe("secret_api_key");
    expect(endpointConfig.baseUrl).toBe("https://api.stripe.com");
    expect(endpointConfig.version).toBe("v3");
    expect(retryConfig.maxRetries).toBe(5);
    expect(retryConfig.backoffMs).toBe(1000);
  });

  it("should track integration provider status logs in IntegrationHealthManager", async () => {
    const health = factory.monitoring.createHealthManager();
    expect(health.getStatus("Stripe")).toBe("Unknown");

    health.setStatus("Stripe", "Healthy");
    expect(health.getStatus("Stripe")).toBe("Healthy");

    const status = await health.checkConnectivity("Circle", async () => true);
    expect(status).toBe("Healthy");
    expect(health.getStatus("Circle")).toBe("Healthy");

    const failedStatus = await health.checkConnectivity("Twilio", async () => {
      throw new Error("Down");
    });
    expect(failedStatus).toBe("Unhealthy");
    expect(health.getStatus("Twilio")).toBe("Unhealthy");
  });
});
