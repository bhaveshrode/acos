"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * SettlementApi executing settlements operations using EndpointDescriptor.
 */
class SettlementApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getSettlement(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Settlement.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async initiateSettlement(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Settlement.Initiate)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.SettlementApi = SettlementApi;
