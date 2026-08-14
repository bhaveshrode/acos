import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { CustomerApi } from "../api/CustomerApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * CustomerState representing Customer feature state values.
 */
export interface CustomerState {
  customers: any[];
  activeCustomer: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * CustomerStore coordinating state transitions and customer management REST APIs.
 */
export class CustomerStore implements IFeatureStore<CustomerState> {
  constructor(
    private readonly store: IStateStore<CustomerState>,
    private readonly api: CustomerApi
  ) {}

  public getState(): CustomerState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<CustomerState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: CustomerState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchCustomer(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getCustomer(id);
      this.store.update((s) => {
        s.activeCustomer = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch customer";
        s.loading = false;
      });
    }
  }

  public async createCustomer(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.createCustomer(payload);
      this.store.update((s) => {
        s.customers.push(response.data);
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to create customer";
        s.loading = false;
      });
    }
  }
}
