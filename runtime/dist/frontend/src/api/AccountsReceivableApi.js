"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsReceivableApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * AccountsReceivableApi executing receivables write-offs using EndpointDescriptor.
 */
class AccountsReceivableApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getReceivable(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.AccountsReceivable.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async writeOffReceivable(id, payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.AccountsReceivable.WriteOff(id))
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.AccountsReceivableApi = AccountsReceivableApi;
