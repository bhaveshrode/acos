"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationComposition = void 0;
const PaymentsFactory_js_1 = require("../payments/PaymentsFactory.js");
const BlockchainFactory_js_1 = require("../blockchain/BlockchainFactory.js");
const CommunicationsFactory_js_1 = require("../communications/CommunicationsFactory.js");
const IdentityIntegrationFactory_js_1 = require("../identity/IdentityIntegrationFactory.js");
const CloudFactory_js_1 = require("../cloud/CloudFactory.js");
const AccountingFactory_js_1 = require("../accounting/AccountingFactory.js");
const CrmFactory_js_1 = require("../crm/CrmFactory.js");
const EcommerceFactory_js_1 = require("../ecommerce/EcommerceFactory.js");
const StorageFactory_js_1 = require("../storage/StorageFactory.js");
const WebhooksFactory_js_1 = require("../webhooks/WebhooksFactory.js");
const SynchronizationFactory_js_1 = require("../synchronization/SynchronizationFactory.js");
const SecurityFactory_js_1 = require("../security/SecurityFactory.js");
const ConfigurationFactory_js_1 = require("../configuration/ConfigurationFactory.js");
const IntegrationMonitoringFactory_js_1 = require("../monitoring/IntegrationMonitoringFactory.js");
/**
 * IntegrationComposition bundling integration sub-factories to keep constructor lists clean.
 */
class IntegrationComposition {
    payments;
    blockchain;
    communications;
    identity;
    cloud;
    accounting;
    crm;
    ecommerce;
    storage;
    webhooks;
    synchronization;
    security;
    configuration;
    monitoring;
    constructor(payments = new PaymentsFactory_js_1.PaymentsFactory(), blockchain = new BlockchainFactory_js_1.BlockchainFactory(), communications = new CommunicationsFactory_js_1.CommunicationsFactory(), identity = new IdentityIntegrationFactory_js_1.IdentityIntegrationFactory(), cloud = new CloudFactory_js_1.CloudFactory(), accounting = new AccountingFactory_js_1.AccountingFactory(), crm = new CrmFactory_js_1.CrmFactory(), ecommerce = new EcommerceFactory_js_1.EcommerceFactory(), storage = new StorageFactory_js_1.StorageFactory(), webhooks = new WebhooksFactory_js_1.WebhooksFactory(), synchronization = new SynchronizationFactory_js_1.SynchronizationFactory(), security = new SecurityFactory_js_1.SecurityFactory(), configuration = new ConfigurationFactory_js_1.ConfigurationFactory(), monitoring = new IntegrationMonitoringFactory_js_1.IntegrationMonitoringFactory()) {
        this.payments = payments;
        this.blockchain = blockchain;
        this.communications = communications;
        this.identity = identity;
        this.cloud = cloud;
        this.accounting = accounting;
        this.crm = crm;
        this.ecommerce = ecommerce;
        this.storage = storage;
        this.webhooks = webhooks;
        this.synchronization = synchronization;
        this.security = security;
        this.configuration = configuration;
        this.monitoring = monitoring;
        Object.freeze(this);
    }
}
exports.IntegrationComposition = IntegrationComposition;
