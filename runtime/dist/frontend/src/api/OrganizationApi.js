"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * OrganizationApi executing settings updates and member additions using EndpointDescriptor.
 */
class OrganizationApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getOrganization(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Organization.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async addMember(id, payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Organization.AddMember(id))
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.OrganizationApi = OrganizationApi;
