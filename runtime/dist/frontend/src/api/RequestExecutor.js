"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestExecutor = void 0;
const ApiErrorMapper_js_1 = require("./ApiErrorMapper.js");
/**
 * RequestExecutor implementing IRequestExecutor, managing complete request filter pipelines.
 */
class RequestExecutor {
    client;
    requestPipeline;
    responsePipeline;
    constructor(client, requestPipeline, responsePipeline) {
        this.client = client;
        this.requestPipeline = requestPipeline;
        this.responsePipeline = responsePipeline;
    }
    async execute(request) {
        try {
            const interceptedRequest = await this.requestPipeline.execute(request);
            const response = await this.client.execute(interceptedRequest);
            const interceptedResponse = await this.responsePipeline.execute(response);
            if (interceptedResponse.status >= 400) {
                throw ApiErrorMapper_js_1.ApiErrorMapper.map(interceptedResponse);
            }
            return interceptedResponse;
        }
        catch (err) {
            if (err.name === "ApiException") {
                throw err;
            }
            throw ApiErrorMapper_js_1.ApiErrorMapper.mapTransportError(err, request);
        }
    }
}
exports.RequestExecutor = RequestExecutor;
