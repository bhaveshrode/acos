import { ICrmProvider } from "./ICrmProvider.js";

/**
 * SalesforceAdapter adapting external Salesforce CRM APIs.
 */
export class SalesforceAdapter implements ICrmProvider {
  public async syncContact(
    contactId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `sf_contact_${contactId}`;
  }

  public async syncOpportunity(
    oppId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `sf_opp_${oppId}`;
  }
}
