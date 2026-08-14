"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookReceiver = void 0;
/**
 * WebhookReceiver extracting payload and signature headers.
 */
class WebhookReceiver {
    receive(rawBody, headers) {
        return {
            payload: rawBody,
            signature: headers["x-webhook-signature"] || ""
        };
    }
}
exports.WebhookReceiver = WebhookReceiver;
