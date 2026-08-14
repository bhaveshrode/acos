"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * NotificationApi executing delivery notification status actions using EndpointDescriptor.
 */
class NotificationApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getNotification(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Notification.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async sendNotification(payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Notification.Send)
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.NotificationApi = NotificationApi;
