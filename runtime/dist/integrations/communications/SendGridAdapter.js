"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridAdapter = void 0;
/**
 * SendGridAdapter adapting external SendGrid APIs.
 */
class SendGridAdapter {
    async sendEmail(to, subject, body) {
        return to.includes("@") && subject.length > 0;
    }
    async sendSms(to, message) {
        return false;
    }
}
exports.SendGridAdapter = SendGridAdapter;
