import crypto from "crypto";

export class WebhookSimulator {
  public generateSignature(payload: any, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  public async triggerWebhook(
    targetUrl: string,
    eventType: string,
    payload: any,
    secret: string
  ): Promise<{ delivered: boolean; statusCode: number; signature: string }> {
    const signature = this.generateSignature(payload, secret);
    const delivered = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");
    const statusCode = delivered ? 200 : 500;
    return {
      delivered,
      statusCode,
      signature
    };
  }
}
