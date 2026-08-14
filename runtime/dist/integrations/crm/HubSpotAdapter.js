"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubSpotAdapter = void 0;
/**
 * HubSpotAdapter adapting external HubSpot CRM APIs.
 */
class HubSpotAdapter {
    async syncContact(contactId, details) {
        return `hs_contact_${contactId}`;
    }
    async syncOpportunity(oppId, details) {
        return `hs_opp_${oppId}`;
    }
}
exports.HubSpotAdapter = HubSpotAdapter;
