import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Logger } from "acos-backend";
import type { LogEntry, LogWriter } from "acos-backend";
import { Mediator } from "acos-backend/application";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { RazorpayPaymentProvider, RazorpayRestClient } from "../src/integration/RazorpayPaymentProvider.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";

const ENABLED = process.env.RAZORPAY_E2E === "1";
const REQUIRE_TUNNEL = process.env.RAZORPAY_E2E_REQUIRE_TUNNEL === "1";
const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
const DB_URL = process.env.MERCHANT_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/acos?schema=public";
const PORT = 8090;
const TUNNEL_METRICS_URL = process.env.RAZORPAY_E2E_TUNNEL_METRICS || "http://127.0.0.1:20241/quicktunnel";
const PAYMENT_WAIT_MS = 15 * 60 * 1000;
const STATE_PATH = process.env.RAZORPAY_E2E_STATE || path.join(os.tmpdir(), "razorpay-e2e-state.json");

/**
 * "create" and "wait" run as separate test processes so the URLs are published
 * before the job starts waiting. Unset runs both in one process, which is the
 * one-shot form for local runs.
 */
const PHASE = process.env.RAZORPAY_E2E_PHASE ?? "combined";

interface E2EState {
  email: string;
  invoiceId: string;
  paymentId: string;
  paymentUrl: string;
  webhookUrl: string;
  createdAt: string;
}

function writeState(state: E2EState): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function readState(): E2EState {
  if (!fs.existsSync(STATE_PATH)) {
    throw new Error(
      `No E2E state at ${STATE_PATH}. Run the create phase first (RAZORPAY_E2E_PHASE=create) or unset RAZORPAY_E2E_PHASE for a combined run.`
    );
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as E2EState;
}

function publishStepSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, markdown);
  }
}

/**
 * Opt-in inbound round trip: a human pays a real test-mode Payment Link and
 * Razorpay's webhook must reach this process through a public tunnel, confirm
 * the payment and reconcile the invoice. Skipped everywhere else.
 */
async function resolveTunnelHostname(waitMs = 60_000): Promise<string | null> {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(TUNNEL_METRICS_URL);
      if (response.ok) {
        const body: any = await response.json();
        if (typeof body?.hostname === "string" && body.hostname.includes(".")) {
          return body.hostname;
        }
      }
    } catch {
      // The tunnel has not started yet; retried below.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return null;
}

describe.skipIf(!ENABLED)("ACOS Merchant — Razorpay Inbound E2E", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  let boundary: AcosIntegrationBoundary;
  let backend: MerchantBackend;
  let frontend: MerchantFrontend;

  beforeAll(async () => {
    if (!KEY_ID.startsWith("rzp_test_")) {
      throw new Error(`RAZORPAY_KEY_ID must be a test-mode key (rzp_test_...), got '${KEY_ID.slice(0, 8)}'`);
    }
    if (!KEY_SECRET.trim() || !WEBHOOK_SECRET.trim()) {
      throw new Error("RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET must be set.");
    }

    const runtimeFactory = new RuntimeFactory();
    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    runtimeFactory.health.registerCheck("backend", async () => ({ name: "backend", healthy: true } as any));

    const config = MerchantConfig.loadFromEnv({
      port: PORT,
      env: "e2e",
      acosEndpoint: "http://localhost:3000",
      dbUrl: DB_URL,
      enableAcosFeatures: true,
      paymentProvider: "razorpay",
      razorpayKeyId: KEY_ID,
      razorpayKeySecret: KEY_SECRET,
      razorpayWebhookSecret: WEBHOOK_SECRET
    });

    boundary = new AcosIntegrationBoundary(new Logger("RazorpayE2EBoundary", writer), runtimeFactory, {
      paymentProvider: new RazorpayPaymentProvider(new RazorpayRestClient(KEY_ID, KEY_SECRET))
    });
    backend = new MerchantBackend(config, boundary, writer);
    frontend = new MerchantFrontend(backend, writer);

    await boundary.connect("e2e", DB_URL, { allowInProcessBus: true });
    await backend.start();
  }, 120_000);

  afterAll(async () => {
    if (backend) {
      await backend.stop();
    }
    if (boundary) {
      await boundary.disconnect();
    }
  }, 30_000);

  it.skipIf(PHASE === "wait")(
    "creates the payment link and publishes the webhook URL",
    async () => {
      const stamp = Date.now();
      const email = `rzp-e2e-${stamp}@example.com`;
      await frontend.signUp(email, "password123", "Razorpay E2E");
      await frontend.login(email, "password123");

      await frontend.onboardBusiness(`Razorpay E2E ${stamp}`, `rzp-e2e-${stamp}`, "INR", "Retail", "India", "e2e@example.com");

      const customer = await frontend.createCustomer({
        name: "Inbound E2E Customer",
        customerNumber: `CUST-RZP-${stamp}`,
        primaryContact: {
          name: "Inbound E2E Customer",
          email: "customer@example.com",
          phone: "+91-9000000000"
        },
        billingAddress: {
          line1: "1 Test Street",
          city: "Pune",
          state: "MH",
          country: "India",
          postalCode: "411001"
        }
      });

      const invoice = await frontend.createInvoice({
        customerId: customer.id,
        invoiceNumber: `INV-RZP-${stamp}`,
        currency: "INR",
        paymentTerms: "NET_30",
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86_400_000).toISOString(),
        lines: [{ description: "Inbound webhook verification", quantity: 1, unitPrice: 1, taxRate: 0 }]
      });
      await frontend.issueInvoice(invoice.id);
      await frontend.sendInvoice(invoice.id);

      const payment = await frontend.collectPayment(invoice.id);
      expect(payment.paymentUrl, "Razorpay must return a hosted checkout URL").toMatch(/^https:\/\//);

      const tunnelHost = await resolveTunnelHostname();
      let webhookUrl = "";
      if (tunnelHost) {
        webhookUrl = `https://${tunnelHost}/payments/webhook`;
      } else if (REQUIRE_TUNNEL) {
        throw new Error(
          `No tunnel answered at ${TUNNEL_METRICS_URL}; Razorpay cannot deliver the webhook. Start cloudflared with --metrics 127.0.0.1:20241 and rerun.`
        );
      } else {
        console.warn("No tunnel detected. The webhook cannot reach this process, so the wait phase will time out.");
        webhookUrl = "(no tunnel detected)";
      }

      writeState({
        email,
        invoiceId: invoice.id,
        paymentId: payment.id,
        paymentUrl: payment.paymentUrl,
        webhookUrl,
        createdAt: new Date().toISOString()
      });

      console.log(`WEBHOOK URL: ${webhookUrl}`);
      console.log(`PAY THIS LINK: ${payment.paymentUrl}`);
      console.log(`Invoice ${invoice.id} waits for payment_link.paid.`);

      publishStepSummary(
        [
          "### Razorpay inbound E2E — waiting for a payment",
          "",
          "1. In the Razorpay dashboard (test mode), point the `payment_link.paid` webhook at:",
          "",
          "```",
          webhookUrl,
          "```",
          "",
          "2. Pay this ₹1 link with a test card:",
          "",
          payment.paymentUrl,
          "",
          "3. The wait phase polls the invoice until Razorpay's callback confirms it.",
          "",
          `State: ${STATE_PATH} (invoice \`${invoice.id}\`, payment \`${payment.id}\`)`,
          ""
        ].join("\n")
      );
    },
    5 * 60 * 1000
  );

  it.skipIf(PHASE === "create")(
    "confirms and reconciles a payment Razorpay collected",
    async () => {
      const state = readState();
      // The wait phase usually runs in a fresh process, so it needs its own session.
      await frontend.login(state.email, "password123");
      console.log(`Waiting on invoice ${state.invoiceId} and payment ${state.paymentId}.`);

      const prisma = (boundary as any).prismaClient;
      const deadline = Date.now() + PAYMENT_WAIT_MS;
      let invoiceStatus = "SENT";
      let lastNotice = Date.now();

      while (Date.now() < deadline) {
        const current = await frontend.getInvoice(state.invoiceId);
        if (current.status !== invoiceStatus || Date.now() - lastNotice > 30_000) {
          console.log(`Waiting for the gateway callback; invoice is ${current.status}.`);
          invoiceStatus = current.status;
          lastNotice = Date.now();
        }
        if (current.status === "PAID") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (invoiceStatus !== "PAID") {
        const row = await prisma.payment.findUnique({ where: { id: state.paymentId } });
        const invoiceRow = await prisma.invoice.findUnique({ where: { id: state.invoiceId } });
        const paidEvent = await prisma.outboxEvent.findFirst({
          where: { eventType: "InvoicePaid", aggregateId: state.invoiceId }
        });
        console.error(`Diagnostics after ${PAYMENT_WAIT_MS / 60_000} minutes:`);
        console.error(`- payment ${state.paymentId}: ${row?.status ?? "missing"} (gateway reference ${row?.gatewayReference ?? "none"})`);
        console.error(
          `- invoice row: ${invoiceRow?.status ?? "missing"}; InvoicePaid event: ${paidEvent ? `processed=${paidEvent.processed}` : "absent"}`
        );
        for (const entry of logs.filter((e) => /webhook|signature|razorpay/i.test(e.message)).slice(-15)) {
          console.error(`- ${entry.level}: ${entry.message}`);
        }
        throw new Error("Invoice did not reach PAID. Read the diagnostics above: no webhook (delivery or URL), a rejected signature, or a rejected payload.");
      }

      const finalInvoice = await frontend.getInvoice(state.invoiceId);
      expect(finalInvoice.status).toBe("PAID");

      const confirmedPayment = await frontend.getPayment(state.paymentId);
      expect(confirmedPayment.status).toBe("CONFIRMED");
      expect(confirmedPayment.method).toBe("RAZORPAY");

      const paymentRow = await prisma.payment.findUnique({ where: { id: state.paymentId } });
      expect(paymentRow?.gatewayReference, "payments resolve from the persisted link id").toMatch(/^plink_/);
      expect(paymentRow?.method).toBe("RAZORPAY");

      const arAccount = await prisma.receivableAccount.findFirst({
        where: { organizationId: finalInvoice.organizationId, customerId: finalInvoice.customerId }
      });
      if (!arAccount) {
        throw new Error("Reconciliation did not open a receivable account.");
      }
      const arEntry = await prisma.receivableEntry.findFirst({
        where: { accountId: arAccount.id, invoiceId: state.invoiceId }
      });
      expect(arEntry?.remainingAmount.toNumber()).toBe(0);

      const paidEvent = await prisma.outboxEvent.findFirst({
        where: { eventType: "InvoicePaid", aggregateId: state.invoiceId }
      });
      expect(paidEvent?.processed).toBe(true);

      console.log("Inbound E2E verified: signature accepted, payment CONFIRMED, invoice PAID, receivable settled.");
    },
    20 * 60 * 1000
  );
});
