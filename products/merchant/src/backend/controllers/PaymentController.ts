import crypto from "crypto";
import { BaseController } from "./BaseController.js";

export class PaymentController extends BaseController {
  public async handle(
    method: string,
    path: string,
    payload?: any,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: any } | null> {
    if (method === "POST" && path.startsWith("/business/invoices/") && path.endsWith("/collect-payment")) {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const invoiceId = path.substring("/business/invoices/".length, path.length - "/collect-payment".length);
      try {
        const payment = await this.acosBoundary.createPaymentRequest(userProfile.id, invoiceId, payload?.amount);
        return {
          status: 201,
          body: payment
        };
      } catch (err: any) {
        this.logger.warn("Collect payment rejected by boundary", { invoiceId, error: err.message });
        const isAccessDenied = err.message.includes("Access Denied");
        const isNotFound = err.message.includes("not found");
        return {
          status: isAccessDenied ? 403 : (isNotFound ? 404 : 400),
          body: { error: isAccessDenied ? "Forbidden" : "Payment Request Failed", message: err.message }
        };
      }
    }

    if (method === "POST" && path === "/payments/webhook") {
      const signatureHeader = headers?.["stripe-signature"] || headers?.["Stripe-Signature"];
      if (!signatureHeader) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing Stripe-Signature header." }
        };
      }

      // Parse signature header
      const parts = signatureHeader.split(",");
      let t = "";
      let v1 = "";
      for (const part of parts) {
        const [k, v] = part.split("=");
        if (k.trim() === "t") t = v.trim();
        if (k.trim() === "v1") v1 = v.trim();
      }

      if (!t || !v1) {
        return {
          status: 400,
          body: { error: "Bad Request: Malformed Stripe-Signature header format." }
        };
      }

      // Verify signature
      const secret = this.config.stripeWebhookSecret;
      const computed = crypto
        .createHmac("sha256", secret)
        .update(`${t}.${JSON.stringify(payload)}`)
        .digest("hex");

      const bufComputed = Buffer.from(computed, "hex");
      const bufActual = Buffer.from(v1, "hex");

      if (bufComputed.length !== bufActual.length || !crypto.timingSafeEqual(bufComputed, bufActual)) {
        return {
          status: 401,
          body: { error: "Unauthorized: Webhook signature verification failed." }
        };
      }

      // Verify timestamp drift (max 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(t)) > 300) {
        return {
          status: 400,
          body: { error: "Bad Request: Webhook timestamp drift too large (possible replay attack)." }
        };
      }

      if (!payload || !payload.gatewayReference || payload.success === undefined) {
        return {
          status: 400,
          body: { error: "Bad Request: gatewayReference and success are required webhook parameters." }
        };
      }

      try {
        const payment = await this.acosBoundary.processPaymentWebhook(
          payload.gatewayReference,
          payload.success,
          payload.errorCode,
          payload.errorMessage
        );
        return {
          status: 200,
          body: payment
        };
      } catch (err: any) {
        this.logger.error("Asynchronous webhook failed to process", err);
        const isNotFound = err.message.includes("No payment aggregate") || err.message.includes("not found");
        const isAccessDenied = err.message.includes("Access Denied");
        return {
          status: isAccessDenied ? 403 : (isNotFound ? 404 : 400),
          body: {
            error: isAccessDenied
              ? "Forbidden"
              : isNotFound
              ? "Not Found"
              : "Webhook Processing Failed",
            message: err.message
          }
        };
      }
    }

    if (method === "GET" && path.startsWith("/business/payments/")) {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const paymentId = path.substring("/business/payments/".length);
      try {
        const payment = await this.acosBoundary.getPaymentById(userProfile.id, paymentId);
        return {
          status: 200,
          body: payment
        };
      } catch (err: any) {
        this.logger.warn("Fetch payment by ID rejected", { paymentId, error: err.message });
        const isAccessDenied = err.message.includes("Access Denied");
        return {
          status: isAccessDenied ? 403 : 404,
          body: { error: isAccessDenied ? "Forbidden" : "Not Found", message: err.message }
        };
      }
    }

    if (method === "GET" && path === "/business/payments") {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const business = await this.acosBoundary.getBusinessForUser(userProfile.id);
      if (!business) {
        return {
          status: 400,
          body: { error: "Bad Request: Business onboarding required." }
        };
      }

      try {
        const list = await this.acosBoundary.getPayments(userProfile.id, business.id);
        return {
          status: 200,
          body: list
        };
      } catch (err: any) {
        return {
          status: 400,
          body: { error: "Fetch Payments Failed", message: err.message }
        };
      }
    }

    return null;
  }
}
