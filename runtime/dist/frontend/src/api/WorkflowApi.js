"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowApi = void 0;
const RequestBuilder_js_1 = require("./RequestBuilder.js");
const EndpointDescriptor_js_1 = require("./EndpointDescriptor.js");
/**
 * WorkflowApi executing workflow states checking operations using EndpointDescriptor.
 */
class WorkflowApi {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async getWorkflow(id) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("GET")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Workflow.Get(id))
            .build();
        return this.executor.execute(request);
    }
    async triggerWorkflowAction(id, payload) {
        const request = new RequestBuilder_js_1.RequestBuilder()
            .setMethod("POST")
            .setUrl(EndpointDescriptor_js_1.EndpointDescriptor.Workflow.TriggerAction(id))
            .setBody(payload)
            .build();
        return this.executor.execute(request);
    }
}
exports.WorkflowApi = WorkflowApi;
