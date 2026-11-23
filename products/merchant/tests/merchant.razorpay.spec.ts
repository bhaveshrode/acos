import crypto from "node:crypto";
import { describe, it, expect, beforeEach } from "vitest";
import { Logger, PaymentMethodType } from "acos-backend";
import type { LogWriter } from "acos-backend";
import { Mediator } from "acos-backend/application";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import type { IPaymentProvider, PaymentCompletion, PaymentResponse, RefundRequestInput, RefundResponse } from "../src/integration/PaymentProvider.js";
import { RefundOutcomeUnknownError } from "../src/integration/PaymentProvider.js";
import {
  RazorpayClient,
  RazorpayPaymentEntity,
  RazorpayPaymentLink,
  RazorpayPaymentLinkRequest,
  RazorpayPaymentProvider,
  RazorpayRefundEntity,
  RazorpayRefundRequest
} from "../src/integration/RazorpayPaymentProvider.js";
import { normalizeRazorpayEvent, verifyRazorpaySignature } from "../src/integration/RazorpayWebhook.js";
import { PaymentController } from "../src/backend/controllers/PaymentController.js";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";

const WEBHOOK_SECRET = "whsec_razorpay_unit_test_secret";

class StubRazorpayClient implements RazorpayClient {
  public readonly linkRequests: RazorpayPaymentLinkRequest[] = [];
  public readonly paymentLookups: string[] = [];
  public readonly refundRequests: RazorpayRefundRequest[] = [];
  private readonly payments = new Map<string, RazorpayPaymentEntity>();
  private refundResponse: RazorpayRefundEntity | null = null;
  private refundError: any = null;

  public stubPayment(payment: RazorpayPaymentEntity): void {
    this.payments.set(payment.id, payment);
  }

  public stubRefund(response: RazorpayRefundEntity): void {
    this.refundResponse = response;
  }

  public stubRefundError(error: any): void {
    this.refundError = error;
  }

  public async createPaymentLink(request: RazorpayPaymentLinkRequest): Promise<RazorpayPaymentLink> {
    this.linkRequests.push(request);
    return { id: "plink_test_1", short_url: "https://rzp.io/i/test-link", status: "created" };
  }

  public async fetchPayment(paymentId: string): Promise<RazorpayPaymentEntity> {
    this.paymentLookups.push(paymentId);
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error(`No stubbed Razorpay payment named ${paymentId}`);
    return payment;
  }

  public async createRefund(request: RazorpayRefundRequest): Promise<RazorpayRefundEntity> {
    this.refundRequests.push(request);
    if (this.refundError) throw this.refundError;
    if (!this.refundResponse) throw new Error("No stubbed Razorpay refund");
    return this.refundResponse;
  }
}

describe("ACOS Merchant — Razorpay Configuration", () => {
  const base = {
    port: 9009,
    env: "test",
    acosEndpoint: "http://localhost:3000",
    dbUrl: "postgresql://localhost:5432/merchant_test",
    enableAcosFeatures: true
  };

  it("refuses to start in razorpay mode without gateway credentials", () => {
    expect(() => new MerchantConfig({ ...base, paymentProvider: "razorpay" })).toThrow(/Razorpay key id/);
    expect(() =>
      new MerchantConfig({ ...base, paymentProvider: "razorpay", razorpayKeyId: "rzp_test_1" })
    ).toThrow(/Razorpay key secret/);
    expect(() =>
      new MerchantConfig({
        ...base,
        paymentProvider: "razorpay",
        razorpayKeyId: "rzp_test_1",
        razorpayKeySecret: "secret",
        razorpayWebhookSecret: ""
      })
    ).toThrow(/webhook secret/);
  });

  it("accepts a complete razorpay configuration", () => {
    const config = new MerchantConfig({
      ...base,
      paymentProvider: "razorpay",
      razorpayKeyId: "rzp_test_1",
      razorpayKeySecret: "secret",
      razorpayWebhookSecret: WEBHOOK_SECRET
    });

    expect(config.paymentProvider).toBe("razorpay");
  });
});

describe("ACOS Merchant — Razorpay Payment Provider", () => {
  let client: StubRazorpayClient;
  let provider: RazorpayPaymentProvider;

  beforeEach(() => {
    client = new StubRazorpayClient();
    provider = new RazorpayPaymentProvider(client);
  });

  it("creates a payment link with the amount converted to minor units", async () => {
    const response = await provider.initiatePayment("payment-1", 19.99, "INR");

    expect(provider.getMethodType()).toBe("RAZORPAY");
    expect(client.linkRequests).toHaveLength(1);
    expect(client.linkRequests[0]).toEqual({
      amountMinor: 1999,
      currency: "INR",
      paymentId: "payment-1"
    });
    expect(response).toEqual({
      gatewayReference: "plink_test_1",
      status: "PROCESSING",
      paymentUrl: "https://rzp.io/i/test-link"
    });
  });

  it("refuses currencies the account cannot collect", async () => {
    await expect(provider.initiatePayment("payment-1", 25, "USD")).rejects.toThrow(/INR only/);
    expect(client.linkRequests).toHaveLength(0);
  });

  it("confirms only when the gateway reports the payment as captured", async () => {
    client.stubPayment({ id: "pay_captured", status: "captured" });

    const response = await provider.completePayment({
      gatewayReference: "plink_test_1",
      gatewayPaymentId: "pay_captured",
      success: true
    });

    expect(client.paymentLookups).toEqual(["pay_captured"]);
    expect(response).toEqual({
      gatewayReference: "plink_test_1",
      status: "SUCCEEDED",
      transactionHash: "pay_captured"
    });
  });

  it("treats an authorized but uncaptured payment as still processing", async () => {
    client.stubPayment({ id: "pay_authorized", status: "authorized" });

    const response = await provider.completePayment({
      gatewayReference: "plink_test_1",
      gatewayPaymentId: "pay_authorized",
      success: true
    });

    expect(response.status).toBe("PROCESSING");
    expect(response.transactionHash).toBeUndefined();
  });

  it("reports the gateway's decline reason when the payment failed", async () => {
    client.stubPayment({
      id: "pay_failed",
      status: "failed",
      error_code: "BAD_REQUEST_ERROR",
      error_description: "Payment declined by the issuing bank"
    });

    const response = await provider.completePayment({
      gatewayReference: "plink_test_1",
      gatewayPaymentId: "pay_failed",
      success: false
    });

    expect(response).toEqual({
      gatewayReference: "plink_test_1",
      status: "FAILED",
      errorCode: "BAD_REQUEST_ERROR",
      errorMessage: "Payment declined by the issuing bank"
    });
  });

  it("does not contact the gateway when the callback carries no payment id", async () => {
    const response = await provider.completePayment({
      gatewayReference: "plink_test_1",
      success: true
    });

    expect(client.paymentLookups).toHaveLength(0);
    expect(response.status).toBe("PROCESSING");
  });

  it("creates a refund in minor units echoing the internal ids in notes", async () => {
    client.stubRefund({ id: "rfnd_test_1", amount: 4000, status: "processed", payment_id: "pay_captured" });

    const response = await provider.refundPayment({
      paymentId: "payment-1",
      gatewayPaymentId: "pay_captured",
      refundRequestId: "req-1",
      amount: 40,
      currency: "INR",
      reason: "Defective item"
    });

    expect(client.refundRequests).toEqual([
      {
        paymentId: "pay_captured",
        amountMinor: 4000,
        notes: { paymentId: "payment-1", refundRequestId: "req-1" }
      }
    ]);
    expect(response).toEqual({ gatewayRefundReference: "rfnd_test_1", status: "SUCCEEDED" });
  });

  it("reports a pending refund as PROCESSING so the webhook completes it", async () => {
    client.stubRefund({ id: "rfnd_test_2", amount: 4000, status: "pending", payment_id: "pay_captured" });

    const response = await provider.refundPayment({
      paymentId: "payment-1",
      gatewayPaymentId: "pay_captured",
      refundRequestId: "req-1",
      amount: 40,
      currency: "INR",
      reason: "Defective item"
    });

    expect(response).toEqual({ gatewayRefundReference: "rfnd_test_2", status: "PROCESSING" });
  });

  it("reports the gateway reason when the refund fails", async () => {
    client.stubRefund({
      id: "rfnd_test_3",
      amount: 4000,
      status: "failed",
      payment_id: "pay_captured",
      error_code: "BAD_REQUEST_ERROR",
      error_description: "Refund declined by the issuing bank"
    });

    const response = await provider.refundPayment({
      paymentId: "payment-1",
      gatewayPaymentId: "pay_captured",
      refundRequestId: "req-1",
      amount: 40,
      currency: "INR",
      reason: "Defective item"
    });

    expect(response).toEqual({
      gatewayRefundReference: "rfnd_test_3",
      status: "FAILED",
      errorCode: "BAD_REQUEST_ERROR",
      errorMessage: "Refund declined by the issuing bank"
    });
  });

  it("refuses to refund without the gateway payment id captured at collection", async () => {
    await expect(
      provider.refundPayment({
        paymentId: "payment-1",
        amount: 40,
        currency: "INR",
        reason: "Defective item"
      })
    ).rejects.toThrow(/gateway payment id/);
    expect(client.refundRequests).toHaveLength(0);
  });

  it("surfaces a 4xx refund rejection as a definitive failure", async () => {
    const error: any = new Error("Razorpay POST /payments/pay_captured/refund failed with 400: bad request");
    error.statusCode = 400;
    client.stubRefundError(error);

    const rejection = provider.refundPayment({
      paymentId: "payment-1",
      gatewayPaymentId: "pay_captured",
      refundRequestId: "req-1",
      amount: 40,
      currency: "INR",
      reason: "Defective item"
    });

    await expect(rejection).rejects.toThrow(/400/);
    await expect(rejection).rejects.not.toBeInstanceOf(RefundOutcomeUnknownError);
  });

  it("classifies a transport failure as an unknown refund outcome", async () => {
    client.stubRefundError(new TypeError("fetch failed"));

    await expect(
      provider.refundPayment({
        paymentId: "payment-1",
        gatewayPaymentId: "pay_captured",
        refundRequestId: "req-1",
        amount: 40,
        currency: "INR",
        reason: "Defective item"
      })
    ).rejects.toBeInstanceOf(RefundOutcomeUnknownError);
  });

  it("classifies a success response without a refund id as an unknown outcome", async () => {
    client.stubRefund({ id: "", amount: 4000, status: "pending", payment_id: "pay_captured" });

    await expect(
      provider.refundPayment({
        paymentId: "payment-1",
        gatewayPaymentId: "pay_captured",
        refundRequestId: "req-1",
        amount: 40,
        currency: "INR",
        reason: "Defective item"
      })
    ).rejects.toBeInstanceOf(RefundOutcomeUnknownError);
  });
});

describe("ACOS Merchant — Razorpay Webhook Verification", () => {
  const sign = (rawBody: string, secret: string = WEBHOOK_SECRET) =>
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  it("accepts a signature computed over the raw body", () => {
    const rawBody = JSON.stringify({ event: "payment_link.paid" });
    expect(verifyRazorpaySignature(rawBody, sign(rawBody), WEBHOOK_SECRET)).toBe(true);
  });

  it("rejects a signature computed over different bytes", () => {
    const rawBody = JSON.stringify({ event: "payment_link.paid" });
    const signature = sign(rawBody);
    expect(verifyRazorpaySignature(`${rawBody} `, signature, WEBHOOK_SECRET)).toBe(false);
  });

  it("rejects signatures signed with another secret, malformed, or missing", () => {
    const rawBody = JSON.stringify({ event: "payment_link.paid" });
    expect(verifyRazorpaySignature(rawBody, sign(rawBody, "other-secret"), WEBHOOK_SECRET)).toBe(false);
    expect(verifyRazorpaySignature(rawBody, "not-hex", WEBHOOK_SECRET)).toBe(false);
    expect(verifyRazorpaySignature(rawBody, undefined, WEBHOOK_SECRET)).toBe(false);
    expect(verifyRazorpaySignature(rawBody, sign(rawBody), null)).toBe(false);
  });

  it("maps payment_link.paid to the link reference and payment id", () => {
    const normalized = normalizeRazorpayEvent({
      event: "payment_link.paid",
      payload: {
        payment_link: { entity: { id: "plink_test_1" } },
        payment: { entity: { id: "pay_captured", status: "captured" } }
      }
    });

    expect(normalized).toEqual({
      type: "payment",
      handled: true,
      gatewayReference: "plink_test_1",
      gatewayPaymentId: "pay_captured",
      success: true
    });
  });

  it("maps refund.processed to the internal ids echoed in the refund notes", () => {
    const normalized = normalizeRazorpayEvent({
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_test_1",
            payment_id: "pay_captured",
            notes: { paymentId: "payment-1", refundRequestId: "req-1" }
          }
        }
      }
    });

    expect(normalized).toEqual({
      type: "refund",
      handled: true,
      paymentId: "payment-1",
      refundRequestId: "req-1",
      gatewayRefundReference: "rfnd_test_1",
      success: true,
      errorCode: undefined,
      errorMessage: undefined
    });
  });

  it("maps refund.failed to a declined outcome with the gateway reason", () => {
    const normalized = normalizeRazorpayEvent({
      event: "refund.failed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_test_2",
            payment_id: "pay_captured",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Refund declined by the issuing bank",
            notes: { paymentId: "payment-1", refundRequestId: "req-2" }
          }
        }
      }
    });

    expect(normalized).toEqual({
      type: "refund",
      handled: true,
      paymentId: "payment-1",
      refundRequestId: "req-2",
      gatewayRefundReference: "rfnd_test_2",
      success: false,
      errorCode: "BAD_REQUEST_ERROR",
      errorMessage: "Refund declined by the issuing bank"
    });
  });

  it("acknowledges a refund event without an entity or notes as unmatchable", () => {
    const normalized = normalizeRazorpayEvent({
      event: "refund.processed",
      payload: { refund: { entity: { id: "rfnd_test_3" } } }
    });

    expect(normalized.type).toBe("refund");
    expect(normalized.handled).toBe(true);
    if (normalized.type === "refund") {
      expect(normalized.paymentId).toBeUndefined();
      expect(normalized.refundRequestId).toBeUndefined();
    }
  });

  it("acknowledges events that are not a paid link without handling them", () => {
    expect(normalizeRazorpayEvent({ event: "payment.failed", payload: {} })).toEqual({ type: "payment", handled: false });
    expect(normalizeRazorpayEvent({ event: "payment_link.cancelled", payload: {} })).toEqual({ type: "payment", handled: false });
    expect(normalizeRazorpayEvent({ event: "payment_link.expired", payload: {} })).toEqual({ type: "payment", handled: false });
    expect(normalizeRazorpayEvent({})).toEqual({ type: "payment", handled: false });
    expect(normalizeRazorpayEvent({ event: "payment_link.paid", payload: {} })).toEqual({ type: "payment", handled: false });
  });
});

describe("ACOS Merchant — Razorpay Webhook Controller", () => {
  const webhookBody = {
    event: "payment_link.paid",
    payload: {
      payment_link: { entity: { id: "plink_test_1" } },
      payment: { entity: { id: "pay_captured", status: "captured" } }
    }
  };
  const rawBody = JSON.stringify(webhookBody);
  const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

  let paymentCalls: any[][];
  let refundCalls: any[][];
  let controller: PaymentController;

  beforeEach(() => {
    paymentCalls = [];
    refundCalls = [];
    const boundary = {
      processPaymentWebhook: async (...args: any[]) => {
        paymentCalls.push(args);
        return { id: "payment-1", status: "CONFIRMED" };
      },
      processRefundWebhook: async (...args: any[]) => {
        refundCalls.push(args);
        return { id: "payment-1", status: "REFUNDED" };
      }
    };
    const config = {
      paymentProvider: "razorpay",
      razorpayWebhookSecret: WEBHOOK_SECRET
    };
    const logger = { info: () => undefined, warn: () => undefined, error: () => undefined };
    controller = new PaymentController(boundary as any, config, logger);
  });

  it("settles the payment when the signature is valid", async () => {
    const response = await controller.handle(
      "POST",
      "/payments/webhook",
      webhookBody,
      { "x-razorpay-signature": signature },
      rawBody
    );

    expect(response?.status).toBe(200);
    expect(paymentCalls[0]).toEqual(["plink_test_1", true, undefined, undefined, "pay_captured"]);
    expect(refundCalls).toHaveLength(0);
  });

  it("settles an asynchronous refund through the notes echoed by the gateway", async () => {
    const body = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: "rfnd_test_1",
            payment_id: "pay_captured",
            notes: { paymentId: "payment-1", refundRequestId: "req-1" }
          }
        }
      }
    };
    const raw = JSON.stringify(body);
    const sig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");

    const response = await controller.handle("POST", "/payments/webhook", body, { "x-razorpay-signature": sig }, raw);

    expect(response?.status).toBe(200);
    expect(refundCalls[0]).toEqual(["payment-1", "req-1", true, undefined, undefined]);
    expect(paymentCalls).toHaveLength(0);
  });

  it("acknowledges a refund webhook whose notes cannot be matched, without touching the boundary", async () => {
    const body = {
      event: "refund.processed",
      payload: { refund: { entity: { id: "rfnd_test_9", payment_id: "pay_captured" } } }
    };
    const raw = JSON.stringify(body);
    const sig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");

    const response = await controller.handle("POST", "/payments/webhook", body, { "x-razorpay-signature": sig }, raw);

    expect(response).toEqual({ status: 200, body: { status: "ignored" } });
    expect(refundCalls).toHaveLength(0);
    expect(paymentCalls).toHaveLength(0);
  });

  it("rejects an invalid signature without touching the boundary", async () => {
    const tampered = `${signature.slice(0, -1)}${signature.endsWith("0") ? "1" : "0"}`;

    const response = await controller.handle(
      "POST",
      "/payments/webhook",
      webhookBody,
      { "x-razorpay-signature": tampered },
      rawBody
    );

    expect(response?.status).toBe(401);
    expect(paymentCalls).toHaveLength(0);
  });

  it("acknowledges other event types with 200 so Razorpay stops retrying", async () => {
    const body = { event: "payment.failed", payload: { payment: { entity: { id: "pay_x" } } } };
    const raw = JSON.stringify(body);
    const sig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");

    const response = await controller.handle(
      "POST",
      "/payments/webhook",
      body,
      { "x-razorpay-signature": sig },
      raw
    );

    expect(response).toEqual({ status: 200, body: { status: "ignored" } });
    expect(paymentCalls).toHaveLength(0);
  });
});

class FailingInitiationProvider implements IPaymentProvider {
  public getName(): string {
    return "razorpay";
  }

  public getMethodType(): PaymentMethodType {
    return PaymentMethodType.RAZORPAY;
  }

  public async initiatePayment(): Promise<PaymentResponse> {
    throw new Error("Razorpay payment link request failed (401): Authentication failed");
  }

  public async completePayment(input: PaymentCompletion): Promise<PaymentResponse> {
    return { gatewayReference: input.gatewayReference, status: "PROCESSING" };
  }

  public async refundPayment(input: RefundRequestInput): Promise<RefundResponse> {
    return { gatewayRefundReference: input.paymentId, status: "SUCCEEDED" };
  }
}

describe("ACOS Merchant — Gateway Initiation Failure", () => {
  it("terminal-fails the payment when the gateway refuses to open a link", async () => {
    const runtimeFactory = new RuntimeFactory();
    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    runtimeFactory.health.registerCheck("backend", async () => ({ name: "backend", healthy: true } as any));

    const writer: LogWriter = () => undefined;
    const boundary = new AcosIntegrationBoundary(new Logger("AcosInitiationFailure", writer), runtimeFactory, {
      paymentProvider: new FailingInitiationProvider()
    });

    await boundary.connect("test", undefined, { allowInMemory: true, allowInProcessBus: true });

    try {
      const user = await boundary.signUp("gateway-failure@example.com", "PasswordPlaintext123!", "Gateway Failure");
      const org = await boundary.onboardBusiness(
        user.id,
        "Failure Store",
        "failure-store",
        "INR",
        "SaaS",
        "India",
        "ops@failure-store.test"
      );
      const customer = await boundary.createCustomer(user.id, {
        organizationId: org.id,
        customerNumber: "CUST-001",
        name: "Acme Buyer",
        email: "buyer@acme.test",
        primaryContact: { name: "Acme Buyer", email: "buyer@acme.test" },
        billingAddress: { line1: "1 MG Road", city: "Pune", state: "MH", postalCode: "411001", country: "India" }
      });
      const invoice = await boundary.createInvoice(user.id, {
        organizationId: org.id,
        customerId: customer.id,
        invoiceNumber: "INV-001",
        currency: "INR",
        paymentTerms: "NET_30",
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lines: [{ description: "Advisory", quantity: 1, unitPrice: 500, taxRate: 0 }]
      });
      await boundary.issueInvoice(user.id, invoice.id);
      await boundary.sendInvoice(user.id, invoice.id);

      await expect(boundary.createPaymentRequest(user.id, invoice.id)).rejects.toThrow(/payment link request failed/);

      const payments = await boundary.getPayments(user.id, org.id);
      expect(payments).toHaveLength(1);
      expect(payments[0].status).toBe("FAILED");
      expect(payments[0].method).toBe("RAZORPAY");

      const stillSent = await boundary.getInvoiceById(user.id, invoice.id);
      expect(stillSent.status).toBe("SENT");
    } finally {
      await boundary.disconnect();
    }
  });
});
