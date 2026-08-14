"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * CustomerApi executing customer actions via centralized endpoint descriptors.
 */
class CustomerApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getCustomer(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Customer.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async createCustomer(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Customer.Create)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.CustomerApi = CustomerApi;
