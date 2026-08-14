"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateFactory = void 0;
const StateContext_js_1 = require("./StateContext.js");
const StateRegistry_js_1 = require("./StateRegistry.js");
const StateStore_js_1 = require("./StateStore.js");
const StateProvider_js_1 = require("./StateProvider.js");
const StateDispatcher_js_1 = require("./StateDispatcher.js");
const StateObserver_js_1 = require("./StateObserver.js");
const LocalStorageStatePersistence_js_1 = require("./LocalStorageStatePersistence.js");
const SessionStorageStatePersistence_js_1 = require("./SessionStorageStatePersistence.js");
const StateHydrator_js_1 = require("./StateHydrator.js");
const HistoryManager_js_1 = require("./HistoryManager.js");
const CustomerStore_js_1 = require("./CustomerStore.js");
const IdentityStore_js_1 = require("./IdentityStore.js");
const OrganizationStore_js_1 = require("./OrganizationStore.js");
const InvoiceStore_js_1 = require("./InvoiceStore.js");
const PaymentStore_js_1 = require("./PaymentStore.js");
const SettlementStore_js_1 = require("./SettlementStore.js");
const AccountsReceivableStore_js_1 = require("./AccountsReceivableStore.js");
const NotificationStore_js_1 = require("./NotificationStore.js");
const WorkflowStore_js_1 = require("./WorkflowStore.js");
/**
 * StateFactory constructing registries, stores, persistence adapters, and history managers.
 */
class StateFactory {
    static createRegistry() {
        return new StateRegistry_js_1.StateRegistry();
    }
    static createContext(options, registry) {
        return new StateContext_js_1.StateContext(options, registry);
    }
    static createStore(initialState) {
        return new StateStore_js_1.StateStore(initialState);
    }
    static createProvider(registry) {
        return new StateProvider_js_1.StateProvider(registry);
    }
    static createDispatcher(store) {
        return new StateDispatcher_js_1.StateDispatcher(store);
    }
    static createObserver(store) {
        return new StateObserver_js_1.StateObserver(store);
    }
    static createLocalStoragePersistence() {
        return new LocalStorageStatePersistence_js_1.LocalStorageStatePersistence();
    }
    static createSessionStoragePersistence() {
        return new SessionStorageStatePersistence_js_1.SessionStorageStatePersistence();
    }
    static createHydrator(persistence) {
        return new StateHydrator_js_1.StateHydrator(persistence);
    }
    static createHistoryManager(store, limit) {
        return new HistoryManager_js_1.HistoryManager(store, limit);
    }
    static createCustomerStore(store, api) {
        return new CustomerStore_js_1.CustomerStore(store, api);
    }
    static createIdentityStore(store, api) {
        return new IdentityStore_js_1.IdentityStore(store, api);
    }
    static createOrganizationStore(store, api) {
        return new OrganizationStore_js_1.OrganizationStore(store, api);
    }
    static createInvoiceStore(store, api) {
        return new InvoiceStore_js_1.InvoiceStore(store, api);
    }
    static createPaymentStore(store, api) {
        return new PaymentStore_js_1.PaymentStore(store, api);
    }
    static createSettlementStore(store, api) {
        return new SettlementStore_js_1.SettlementStore(store, api);
    }
    static createAccountsReceivableStore(store, api) {
        return new AccountsReceivableStore_js_1.AccountsReceivableStore(store, api);
    }
    static createNotificationStore(store, api) {
        return new NotificationStore_js_1.NotificationStore(store, api);
    }
    static createWorkflowStore(store, api) {
        return new WorkflowStore_js_1.WorkflowStore(store, api);
    }
}
exports.StateFactory = StateFactory;
