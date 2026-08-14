"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmFactory = void 0;
const SalesforceAdapter_js_1 = require("./SalesforceAdapter.js");
const HubSpotAdapter_js_1 = require("./HubSpotAdapter.js");
/**
 * CrmFactory constructing CRM adapters.
 */
class CrmFactory {
    static createSalesforceAdapter() {
        return new SalesforceAdapter_js_1.SalesforceAdapter();
    }
    static createHubSpotAdapter() {
        return new HubSpotAdapter_js_1.HubSpotAdapter();
    }
    createSalesforceAdapter() {
        return CrmFactory.createSalesforceAdapter();
    }
    createHubSpotAdapter() {
        return CrmFactory.createHubSpotAdapter();
    }
}
exports.CrmFactory = CrmFactory;
