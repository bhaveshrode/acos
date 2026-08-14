import { ICrmProvider } from "./ICrmProvider.js";

/**
 * HubSpotAdapter adapting external HubSpot CRM APIs.
 */
export class HubSpotAdapter implements ICrmProvider {
  public async syncContact(
    contactId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `hs_contact_${contactId}`;
  }

  public async syncOpportunity(
    oppId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `hs_opp_${oppId}`;
  }
}
