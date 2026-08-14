import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { InvoiceApi } from "../api/InvoiceApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * InvoiceState representing Billing Invoice data structures.
 */
export interface InvoiceState {
  invoices: any[];
  activeInvoice: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * InvoiceStore coordinating invoicing.
 */
export class InvoiceStore implements IFeatureStore<InvoiceState> {
  constructor(
    private readonly store: IStateStore<InvoiceState>,
    private readonly api: InvoiceApi
  ) {}

  public getState(): InvoiceState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<InvoiceState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: InvoiceState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchInvoice(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getInvoice(id);
      this.store.update((s) => {
        s.activeInvoice = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch invoice";
        s.loading = false;
      });
    }
  }

  public async issueInvoice(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.issueInvoice(payload);
      this.store.update((s) => {
        s.invoices.push(response.data);
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to issue invoice";
        s.loading = false;
      });
    }
  }
}
