import { describe, it, expect } from "vitest";
import {
  RazorpayPaymentLink,
  RazorpayPaymentLinkRequest,
  RazorpayPaymentProvider,
  RazorpayRestClient
} from "../src/integration/RazorpayPaymentProvider.js";

const ENABLED = process.env.RAZORPAY_SMOKE === "1";
const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

/**
 * Opt-in smoke test against the real Razorpay test-mode API. Stubbed specs can
 * prove the adapter's logic but not that Razorpay accepts the request, so this
 * suite is dispatched manually with test-mode keys and skipped everywhere else.
 *
 * It creates one abandoned ₹1 Payment Link per run and never moves money.
 */
class RecordingRazorpayClient extends RazorpayRestClient {
  public lastRequest: RazorpayPaymentLinkRequest | undefined;
  public lastLink: RazorpayPaymentLink | undefined;

  public override async createPaymentLink(request: RazorpayPaymentLinkRequest): Promise<RazorpayPaymentLink> {
    this.lastRequest = request;
    const link = await super.createPaymentLink(request);
    this.lastLink = link;
    return link;
  }
}

describe.skipIf(!ENABLED)("ACOS Merchant — Razorpay Live Smoke", () => {
  const client = new RecordingRazorpayClient(KEY_ID, KEY_SECRET);
  const provider = new RazorpayPaymentProvider(client);

  it("is configured with test-mode credentials", () => {
    // A live key here would collect real money, so the run stops before any call.
    expect(
      KEY_ID.startsWith("rzp_test_"),
      `RAZORPAY_KEY_ID must be a test-mode key (rzp_test_...), got '${KEY_ID.slice(0, 8)}'`
    ).toBe(true);
    expect(KEY_SECRET.trim(), "RAZORPAY_KEY_SECRET must be set").not.toBe("");
  });

  it("opens an INR payment link with the charge sent in paise", async () => {
    const paymentId = `smoke-${Date.now()}`;
    const response = await provider.initiatePayment(paymentId, 1, "INR");
    const link = client.lastLink;
    const request = client.lastRequest;
    if (!link || !request) {
      throw new Error("Razorpay did not return a payment link.");
    }

    console.log(`Razorpay smoke link created: ${link.id} (${link.short_url})`);

    expect(response.gatewayReference).toBe(link.id);
    expect(response.gatewayReference).toMatch(/^plink_/);
    expect(response.paymentUrl).toBe(link.short_url);
    expect(response.paymentUrl).toMatch(/^https:\/\//);
    expect(response.status).toBe("PROCESSING");

    expect(request.amountMinor).toBe(100);
    expect(request.currency).toBe("INR");
    expect(request.paymentId).toBe(paymentId);

    // The amount Razorpay echoes back proves the charge arrived in paise.
    expect(link.amount).toBe(100);
    expect(link.currency).toBe("INR");
    expect(link.status).toBe("created");
  }, 30_000);

  it("rejects a non-INR charge before reaching the gateway", async () => {
    const client = new RecordingRazorpayClient(KEY_ID, KEY_SECRET);
    const nonInrProvider = new RazorpayPaymentProvider(client);

    await expect(nonInrProvider.initiatePayment(`smoke-usd-${Date.now()}`, 1, "USD")).rejects.toThrow(
      /collects INR only/
    );
    expect(client.lastRequest).toBeUndefined();
  });
});
