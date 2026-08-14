"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBuilder = void 0;
const ApiRequest_js_1 = require("./ApiRequest.js");
/**
 * RequestBuilder supplying a fluent builder API for assembling HTTP ApiRequests.
 */
class RequestBuilder {
    method = "GET";
    url = "";
    headers = {};
    query = {};
    body;
    timeoutMs;
    setMethod(method) {
        this.method = method;
        return this;
    }
    setUrl(url) {
        this.url = url;
        return this;
    }
    addHeader(name, value) {
        this.headers[name] = value;
        return this;
    }
    addQuery(name, value) {
        this.query[name] = value;
        return this;
    }
    setBody(body) {
        this.body = body;
        return this;
    }
    setTimeout(timeoutMs) {
        this.timeoutMs = timeoutMs;
        return this;
    }
    build() {
        return new ApiRequest_js_1.ApiRequest(this.method, this.url, { ...this.headers }, { ...this.query }, this.body, this.timeoutMs);
    }
}
exports.RequestBuilder = RequestBuilder;
