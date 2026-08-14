/**
 * WebhookReceiver extracting payload and signature headers.
 */
export class WebhookReceiver {
  public receive(
    rawBody: string,
    headers: Record<string, string>
  ): { payload: string; signature: string } {
    return {
      payload: rawBody,
      signature: headers["x-webhook-signature"] || ""
    };
  }
}
