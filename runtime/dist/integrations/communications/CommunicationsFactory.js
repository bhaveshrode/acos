"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsFactory = void 0;
const SendGridAdapter_js_1 = require("./SendGridAdapter.js");
const TwilioAdapter_js_1 = require("./TwilioAdapter.js");
/**
 * CommunicationsFactory constructing email/SMS providers.
 */
class CommunicationsFactory {
    static createSendGridAdapter() {
        return new SendGridAdapter_js_1.SendGridAdapter();
    }
    static createTwilioAdapter() {
        return new TwilioAdapter_js_1.TwilioAdapter();
    }
    createSendGridAdapter() {
        return CommunicationsFactory.createSendGridAdapter();
    }
    createTwilioAdapter() {
        return CommunicationsFactory.createTwilioAdapter();
    }
}
exports.CommunicationsFactory = CommunicationsFactory;
