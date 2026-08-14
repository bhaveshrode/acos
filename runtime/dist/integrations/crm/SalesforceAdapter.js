"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesforceAdapter = void 0;
/**
 * SalesforceAdapter adapting external Salesforce CRM APIs.
 */
class SalesforceAdapter {
    async syncContact(contactId, details) {
        return `sf_contact_${contactId}`;
    }
    async syncOpportunity(oppId, details) {
        return `sf_opp_${oppId}`;
    }
}
exports.SalesforceAdapter = SalesforceAdapter;
