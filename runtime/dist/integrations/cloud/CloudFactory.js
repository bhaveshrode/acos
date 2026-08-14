"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudFactory = void 0;
const AWSAdapter_js_1 = require("./AWSAdapter.js");
const AzureAdapter_js_1 = require("./AzureAdapter.js");
/**
 * CloudFactory constructing cloud provider integrations.
 */
class CloudFactory {
    static createAWSAdapter() {
        return new AWSAdapter_js_1.AWSAdapter();
    }
    static createAzureAdapter() {
        return new AzureAdapter_js_1.AzureAdapter();
    }
    createAWSAdapter() {
        return CloudFactory.createAWSAdapter();
    }
    createAzureAdapter() {
        return CloudFactory.createAzureAdapter();
    }
}
exports.CloudFactory = CloudFactory;
