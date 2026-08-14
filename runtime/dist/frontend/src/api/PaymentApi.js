"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * PaymentApi executing payments checking operations using EndpointDescriptor.
 */
class PaymentApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getPayment(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Payment.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async processPayment(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Payment.Process)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.PaymentApi = PaymentApi;
