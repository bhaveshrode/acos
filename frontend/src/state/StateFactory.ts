import { StateOptions } from "./StateOptions.js";
import { StateContext } from "./StateContext.js";
import { StateRegistry } from "./StateRegistry.js";
import { IStateStore } from "./IStateStore.js";
import { StateStore } from "./StateStore.js";
import { StateProvider } from "./StateProvider.js";
import { StateDispatcher } from "./StateDispatcher.js";
import { StateObserver } from "./StateObserver.js";
import { LocalStorageStatePersistence } from "./LocalStorageStatePersistence.js";
import { SessionStorageStatePersistence } from "./SessionStorageStatePersistence.js";
import { StateHydrator } from "./StateHydrator.js";
import { HistoryManager } from "./HistoryManager.js";
import { CustomerStore } from "./CustomerStore.js";
import { CustomerApi } from "../api/CustomerApi.js";
import { IdentityStore } from "./IdentityStore.js";
import { IdentityApi } from "../api/IdentityApi.js";
import { OrganizationStore } from "./OrganizationStore.js";
import { OrganizationApi } from "../api/OrganizationApi.js";
import { InvoiceStore } from "./InvoiceStore.js";
import { InvoiceApi } from "../api/InvoiceApi.js";
import { PaymentStore } from "./PaymentStore.js";
import { PaymentApi } from "../api/PaymentApi.js";
import { SettlementStore } from "./SettlementStore.js";
import { SettlementApi } from "../api/SettlementApi.js";
import { AccountsReceivableStore } from "./AccountsReceivableStore.js";
import { AccountsReceivableApi } from "../api/AccountsReceivableApi.js";
import { NotificationStore } from "./NotificationStore.js";
import { NotificationApi } from "../api/NotificationApi.js";
import { WorkflowStore } from "./WorkflowStore.js";
import { WorkflowApi } from "../api/WorkflowApi.js";

/**
 * StateFactory constructing registries, stores, persistence adapters, and history managers.
 */
export class StateFactory {
  public static createRegistry(): StateRegistry {
    return new StateRegistry();
  }

  public static createContext(options: StateOptions, registry: StateRegistry): StateContext {
    return new StateContext(options, registry);
  }

  public static createStore<S>(initialState: S): IStateStore<S> {
    return new StateStore<S>(initialState);
  }

  public static createProvider(registry: StateRegistry): StateProvider {
    return new StateProvider(registry);
  }

  public static createDispatcher(store: IStateStore): StateDispatcher {
    return new StateDispatcher(store);
  }

  public static createObserver<S>(store: IStateStore<S>): StateObserver<S> {
    return new StateObserver<S>(store);
  }

  public static createLocalStoragePersistence(): LocalStorageStatePersistence {
    return new LocalStorageStatePersistence();
  }

  public static createSessionStoragePersistence(): SessionStorageStatePersistence {
    return new SessionStorageStatePersistence();
  }

  public static createHydrator(persistence: any): StateHydrator {
    return new StateHydrator(persistence);
  }

  public static createHistoryManager(store: IStateStore, limit?: number): HistoryManager {
    return new HistoryManager(store, limit);
  }

  public static createCustomerStore(store: IStateStore, api: CustomerApi): CustomerStore {
    return new CustomerStore(store as any, api);
  }

  public static createIdentityStore(store: IStateStore, api: IdentityApi): IdentityStore {
    return new IdentityStore(store as any, api);
  }

  public static createOrganizationStore(store: IStateStore, api: OrganizationApi): OrganizationStore {
    return new OrganizationStore(store as any, api);
  }

  public static createInvoiceStore(store: IStateStore, api: InvoiceApi): InvoiceStore {
    return new InvoiceStore(store as any, api);
  }

  public static createPaymentStore(store: IStateStore, api: PaymentApi): PaymentStore {
    return new PaymentStore(store as any, api);
  }

  public static createSettlementStore(store: IStateStore, api: SettlementApi): SettlementStore {
    return new SettlementStore(store as any, api);
  }

  public static createAccountsReceivableStore(store: IStateStore, api: AccountsReceivableApi): AccountsReceivableStore {
    return new AccountsReceivableStore(store as any, api);
  }

  public static createNotificationStore(store: IStateStore, api: NotificationApi): NotificationStore {
    return new NotificationStore(store as any, api);
  }

  public static createWorkflowStore(store: IStateStore, api: WorkflowApi): WorkflowStore {
    return new WorkflowStore(store as any, api);
  }
}
