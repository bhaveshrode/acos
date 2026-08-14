import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { PaymentApi } from "../api/PaymentApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * PaymentState representing payment execution statuses.
 */
export interface PaymentState {
  payments: any[];
  activePayment: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * PaymentStore coordinating transactions.
 */
export class PaymentStore implements IFeatureStore<PaymentState> {
  constructor(
    private readonly store: IStateStore<PaymentState>,
    private readonly api: PaymentApi
  ) {}

  public getState(): PaymentState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<PaymentState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: PaymentState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchPayment(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getPayment(id);
      this.store.update((s) => {
        s.activePayment = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch payment";
        s.loading = false;
      });
    }
  }

  public async processPayment(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.processPayment(payload);
      this.store.update((s) => {
        s.payments.push(response.data);
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to process payment";
        s.loading = false;
      });
    }
  }
}
