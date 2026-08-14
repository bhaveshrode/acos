import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { AccountsReceivableApi } from "../api/AccountsReceivableApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * AccountsReceivableState representing receivables statuses.
 */
export interface AccountsReceivableState {
  receivables: any[];
  activeReceivable: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * AccountsReceivableStore coordinating write offs actions.
 */
export class AccountsReceivableStore implements IFeatureStore<AccountsReceivableState> {
  constructor(
    private readonly store: IStateStore<AccountsReceivableState>,
    private readonly api: AccountsReceivableApi
  ) {}

  public getState(): AccountsReceivableState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<AccountsReceivableState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: AccountsReceivableState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchReceivable(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getReceivable(id);
      this.store.update((s) => {
        s.activeReceivable = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch receivable";
        s.loading = false;
      });
    }
  }

  public async writeOffReceivable(id: string, payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.writeOffReceivable(id, payload);
      this.store.update((s) => {
        const index = s.receivables.findIndex((r) => r.id === id);
        if (index !== -1) {
          s.receivables[index] = response.data;
        } else {
          s.receivables.push(response.data);
        }
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to write off receivable";
        s.loading = false;
      });
    }
  }
}
