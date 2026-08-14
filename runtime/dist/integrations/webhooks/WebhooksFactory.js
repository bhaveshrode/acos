"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksFactory = void 0;
const WebhookRegistry_js_1 = require("./WebhookRegistry.js");
const WebhookReceiver_js_1 = require("./WebhookReceiver.js");
const SignatureValidator_js_1 = require("./SignatureValidator.js");
const EventParser_js_1 = require("./EventParser.js");
const EventRouter_js_1 = require("./EventRouter.js");
const EventDispatcher_js_1 = require("./EventDispatcher.js");
/**
 * WebhooksFactory composing receiver, validator, router, and dispatcher pipelines.
 */
class WebhooksFactory {
    static createRegistry() {
        return new WebhookRegistry_js_1.WebhookRegistry();
    }
    static createReceiver() {
        return new WebhookReceiver_js_1.WebhookReceiver();
    }
    static createValidator() {
        return new SignatureValidator_js_1.SignatureValidator();
    }
    static createParser() {
        return new EventParser_js_1.EventParser();
    }
    static createRouter(registry) {
        return new EventRouter_js_1.EventRouter(registry);
    }
    static createDispatcher() {
        return new EventDispatcher_js_1.EventDispatcher();
    }
    createRegistry() {
        return WebhooksFactory.createRegistry();
    }
    createReceiver() {
        return WebhooksFactory.createReceiver();
    }
    createValidator() {
        return WebhooksFactory.createValidator();
    }
    createParser() {
        return WebhooksFactory.createParser();
    }
    createRouter(registry) {
        return WebhooksFactory.createRouter(registry);
    }
    createDispatcher() {
        return WebhooksFactory.createDispatcher();
    }
}
exports.WebhooksFactory = WebhooksFactory;
