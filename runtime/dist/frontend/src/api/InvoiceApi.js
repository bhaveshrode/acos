"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * InvoiceApi executing invoicing operations using EndpointDescriptor.
 */
class InvoiceApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getInvoice(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Invoice.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async issueInvoice(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Invoice.Issue)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.InvoiceApi = InvoiceApi;
