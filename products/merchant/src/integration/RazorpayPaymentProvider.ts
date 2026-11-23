import { Money, PaymentMethodType } from "acos-backend";
import {
  IPaymentProvider,
  PaymentCompletion,
  PaymentResponse,
  RefundOutcomeUnknownError,
  RefundRequestInput,
  RefundResponse
} from "./PaymentProvider.js";

export const RAZORPAY_CURRENCY = "INR";
const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export interface RazorpayPaymentLinkRequest {
  amountMinor: number;
  currency: string;
  paymentId: string;
}

export interface RazorpayPaymentLink {
  id: string;
  short_url: string;
  status: string;
  amount?: number;
  currency?: string;
}

export interface RazorpayPaymentEntity {
  id: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  error_code?: string | null;
  error_description?: string | null;
}

export interface RazorpayRefundRequest {
  /** The gateway payment id (`pay_…`) to refund against. */
  paymentId: string;
  amountMinor: number;
  /** Echoed back verbatim on the refund entity and its webhooks. */
  notes: Record<string, string>;
}

export interface RazorpayRefundEntity {
  id: string;
  amount: number;
  status: "pending" | "processed" | "failed";
  payment_id: string;
  notes?: Record<string, string> | null;
  error_code?: string | null;
  error_description?: string | null;
}

/**
 * The handful of Razorpay API calls this adapter makes. Injecting the client
 * keeps the provider testable without network access or credentials.
 */
export interface RazorpayClient {
  createPaymentLink(request: RazorpayPaymentLinkRequest): Promise<RazorpayPaymentLink>;
  fetchPayment(paymentId: string): Promise<RazorpayPaymentEntity>;
  createRefund(request: RazorpayRefundRequest): Promise<RazorpayRefundEntity>;
}

export class RazorpayRestClient implements RazorpayClient {
  private readonly authorization: string;

  constructor(
    keyId: string,
    keySecret: string,
    private readonly baseUrl: string = RAZORPAY_API_BASE
  ) {
    this.authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  }

  public async createPaymentLink(request: RazorpayPaymentLinkRequest): Promise<RazorpayPaymentLink> {
    return this.request<RazorpayPaymentLink>("POST", "/payment_links", {
      amount: request.amountMinor,
      currency: request.currency,
      accept_partial: false,
      reference_id: request.paymentId,
      description: `Payment ${request.paymentId}`,
      notes: { paymentId: request.paymentId },
      reminder_enable: false
    });
  }

  public async fetchPayment(paymentId: string): Promise<RazorpayPaymentEntity> {
    return this.request<RazorpayPaymentEntity>("GET", `/payments/${encodeURIComponent(paymentId)}`);
  }

  public async createRefund(request: RazorpayRefundRequest): Promise<RazorpayRefundEntity> {
    return this.request<RazorpayRefundEntity>("POST", `/payments/${encodeURIComponent(request.paymentId)}/refunds`, {
      amount: request.amountMinor,
      notes: request.notes
    });
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.authorization,
        "Content-Type": "application/json"
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    if (!response.ok) {
      const error: any = new Error(`Razorpay ${method} ${path} failed with ${response.status}: ${this.describeError(text)}`);
      error.statusCode = response.status;
      throw error;
    }
    return (text ? JSON.parse(text) : {}) as T;
  }

  private describeError(text: string): string {
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.error?.description ?? parsed?.error?.code;
      if (typeof detail === "string" && detail.trim() !== "") return detail;
    } catch {
      // Falls through to the raw body below.
    }
    return text.slice(0, 200) || "empty response";
  }
}

export class RazorpayPaymentProvider implements IPaymentProvider {
  constructor(private readonly client: RazorpayClient) {}

  public getName(): string {
    return "RAZORPAY";
  }

  public getMethodType(): PaymentMethodType {
    return PaymentMethodType.RAZORPAY;
  }

  public async initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse> {
    const money = Money.create(amount, currency);
    if (money.isFailure) {
      throw new Error(`RazorpayPaymentProvider rejected the amount: ${money.error.message}`);
    }
    if (money.value.currency !== RAZORPAY_CURRENCY) {
      throw new Error(
        `RazorpayPaymentProvider collects ${RAZORPAY_CURRENCY} only; ${money.value.currency} requires international payments to be enabled on the Razorpay account.`
      );
    }

    const link = await this.client.createPaymentLink({
      amountMinor: money.value.minorUnits,
      currency: money.value.currency,
      paymentId
    });
    if (!link?.id || !link?.short_url) {
      throw new Error("Razorpay did not return a payment link id and hosted URL.");
    }

    return {
      gatewayReference: link.id,
      status: "PROCESSING",
      paymentUrl: link.short_url
    };
  }

  /**
   * Confirmation always asks Razorpay for the payment's current state. A
   * callback claiming success never confirms anything the gateway has not
   * captured itself.
   */
  public async completePayment(input: PaymentCompletion): Promise<PaymentResponse> {
    if (!input.gatewayPaymentId) {
      return {
        gatewayReference: input.gatewayReference,
        status: "PROCESSING"
      };
    }

    const payment = await this.client.fetchPayment(input.gatewayPaymentId);
    if (payment.status === "captured") {
      return {
        gatewayReference: input.gatewayReference,
        status: "SUCCEEDED",
        transactionHash: payment.id
      };
    }
    if (payment.status === "failed") {
      return {
        gatewayReference: input.gatewayReference,
        status: "FAILED",
        errorCode: payment.error_code ?? "DECLINED",
        errorMessage: payment.error_description ?? "Declined by gateway"
      };
    }

    return {
      gatewayReference: input.gatewayReference,
      status: "PROCESSING"
    };
  }

  /**
   * Returns money through the Razorpay refund API. The gateway processes most
   * refunds asynchronously, so `pending` maps to PROCESSING and the refund is
   * only completed when the `refund.processed` webhook arrives.
   */
  public async refundPayment(input: RefundRequestInput): Promise<RefundResponse> {
    if (!input.gatewayPaymentId) {
      throw new Error(
        "Razorpay refunds require the gateway payment id captured at collection; this payment has none."
      );
    }

    const money = Money.create(input.amount, input.currency);
    if (money.isFailure) {
      throw new Error(`RazorpayPaymentProvider rejected the refund amount: ${money.error.message}`);
    }

    let refund: RazorpayRefundEntity;
    try {
      refund = await this.client.createRefund({
        paymentId: input.gatewayPaymentId,
        amountMinor: money.value.minorUnits,
        notes: {
          paymentId: input.paymentId,
          refundRequestId: input.refundRequestId ?? ""
        }
      });
    } catch (err: any) {
      // A 4xx is a definitive refusal (the request never created a refund).
      // Anything else — transport failure, 5xx, unparseable body — leaves the
      // outcome unknown, and the caller must not release the reservation.
      if (typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
        throw err;
      }
      throw new RefundOutcomeUnknownError(`Razorpay refund outcome is unknown: ${err?.message ?? String(err)}`);
    }
    if (!refund?.id) {
      throw new RefundOutcomeUnknownError("Razorpay did not return a refund id.");
    }

    if (refund.status === "failed") {
      return {
        gatewayRefundReference: refund.id,
        status: "FAILED",
        errorCode: refund.error_code ?? "REFUND_DECLINED",
        errorMessage: refund.error_description ?? "Refund declined by gateway"
      };
    }

    return {
      gatewayRefundReference: refund.id,
      status: refund.status === "processed" ? "SUCCEEDED" : "PROCESSING"
    };
  }
}
