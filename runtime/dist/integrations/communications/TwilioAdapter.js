"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioAdapter = void 0;
/**
 * TwilioAdapter adapting Twilio SMS API.
 */
class TwilioAdapter {
    async sendEmail(to, subject, body) {
        return false;
    }
    async sendSms(to, message) {
        return to.length > 0 && message.length > 0;
    }
}
exports.TwilioAdapter = TwilioAdapter;
