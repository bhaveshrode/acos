import { SalesforceAdapter } from "./SalesforceAdapter.js";
import { HubSpotAdapter } from "./HubSpotAdapter.js";
import { ICrmProvider } from "./ICrmProvider.js";

/**
 * CrmFactory constructing CRM adapters.
 */
export class CrmFactory {
  public static createSalesforceAdapter(): ICrmProvider {
    return new SalesforceAdapter();
  }

  public static createHubSpotAdapter(): ICrmProvider {
    return new HubSpotAdapter();
  }

  public createSalesforceAdapter(): ICrmProvider {
    return CrmFactory.createSalesforceAdapter();
  }

  public createHubSpotAdapter(): ICrmProvider {
    return CrmFactory.createHubSpotAdapter();
  }
}
