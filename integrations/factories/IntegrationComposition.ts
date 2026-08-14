import { PaymentsFactory } from "../payments/PaymentsFactory.js";
import { BlockchainFactory } from "../blockchain/BlockchainFactory.js";
import { CommunicationsFactory } from "../communications/CommunicationsFactory.js";
import { IdentityIntegrationFactory } from "../identity/IdentityIntegrationFactory.js";
import { CloudFactory } from "../cloud/CloudFactory.js";
import { AccountingFactory } from "../accounting/AccountingFactory.js";
import { CrmFactory } from "../crm/CrmFactory.js";
import { EcommerceFactory } from "../ecommerce/EcommerceFactory.js";
import { StorageFactory } from "../storage/StorageFactory.js";
import { WebhooksFactory } from "../webhooks/WebhooksFactory.js";
import { SynchronizationFactory } from "../synchronization/SynchronizationFactory.js";
import { SecurityFactory } from "../security/SecurityFactory.js";
import { ConfigurationFactory } from "../configuration/ConfigurationFactory.js";
import { IntegrationMonitoringFactory } from "../monitoring/IntegrationMonitoringFactory.js";

/**
 * IntegrationComposition bundling integration sub-factories to keep constructor lists clean.
 */
export class IntegrationComposition {
  constructor(
    public readonly payments: PaymentsFactory = new PaymentsFactory(),
    public readonly blockchain: BlockchainFactory = new BlockchainFactory(),
    public readonly communications: CommunicationsFactory = new CommunicationsFactory(),
    public readonly identity: IdentityIntegrationFactory = new IdentityIntegrationFactory(),
    public readonly cloud: CloudFactory = new CloudFactory(),
    public readonly accounting: AccountingFactory = new AccountingFactory(),
    public readonly crm: CrmFactory = new CrmFactory(),
    public readonly ecommerce: EcommerceFactory = new EcommerceFactory(),
    public readonly storage: StorageFactory = new StorageFactory(),
    public readonly webhooks: WebhooksFactory = new WebhooksFactory(),
    public readonly synchronization: SynchronizationFactory = new SynchronizationFactory(),
    public readonly security: SecurityFactory = new SecurityFactory(),
    public readonly configuration: ConfigurationFactory = new ConfigurationFactory(),
    public readonly monitoring: IntegrationMonitoringFactory = new IntegrationMonitoringFactory()
  ) {
    Object.freeze(this);
  }
}
