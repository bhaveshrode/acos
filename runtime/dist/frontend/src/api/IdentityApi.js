"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * IdentityApi executing user registers/logins actions using EndpointDescriptor.
 */
class IdentityApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async register(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Identity.Register)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
    async login(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Identity.Login)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.IdentityApi = IdentityApi;
